import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scrypt = promisify(scryptCallback);
const ROOT = dirname(fileURLToPath(import.meta.url));
const PROVINCES = ['aceh', 'sumatera-utara', 'sumatera-barat', 'riau', 'kepulauan-riau', 'jambi', 'sumatera-selatan', 'bangka-belitung', 'bengkulu', 'lampung'];
const CATEGORIES = ['tari', 'musik', 'kerajinan', 'wisata', 'kuliner', 'permainan'];
const ACTIVE = ['open', 'responded'];
const CANCELLABLE = ['pending', 'open', 'responded', 'connected'];
const SESSION_AGE = 24 * 60 * 60 * 1000;
const BODY_LIMIT = 24 * 1024;

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function fail(status, message) { throw new HttpError(status, message); }
function timestamp() { return new Date().toISOString(); }
function id(prefix) { return `${prefix}-${randomBytes(8).toString('hex')}`; }
function digest(value) { return createHash('sha256').update(value).digest('hex'); }

function plainUser(row) {
  return row ? { id: row.id, name: row.name, email: row.email, role: row.role, isDemo: !!row.is_demo } : null;
}

function field(value, label, min, max, optional = false) {
  if (optional && (value === undefined || value === null || value === '')) return '';
  if (typeof value !== 'string') fail(400, `${label} perlu diisi.`);
  const result = value.trim();
  if (result.length < min || result.length > max) fail(400, `${label} harus ${min}–${max} karakter.`);
  if (/\u0000/.test(result)) fail(400, `${label} memuat karakter yang tidak didukung.`);
  return result;
}

async function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

async function passwordMatches(password, stored) {
  const [salt, hash] = stored.split(':');
  const derived = await scrypt(password, salt, 64);
  return timingSafeEqual(derived, Buffer.from(hash, 'hex'));
}

async function body(req) {
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) fail(415, 'Kirim data dalam format JSON.');
  if (Number(req.headers['content-length']) > BODY_LIMIT) fail(413, 'Isian terlalu panjang.');
  let length = 0;
  const chunks = [];
  for await (const chunk of req) {
    length += chunk.length;
    if (length > BODY_LIMIT) fail(413, 'Isian terlalu panjang.');
    chunks.push(chunk);
  }
  let value;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { fail(400, 'Data tidak terbaca. Periksa isian lalu coba lagi.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Data harus berupa objek JSON.');
  return value;
}

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

/** Local preview only: the public listener is deliberately restricted to loopback. */
export async function createApp({ databasePath = process.env.SWARANUSA_DB || resolve(ROOT, '.data/swaranusa.sqlite'), publicDir = resolve(ROOT, 'public'), allowDemo = true } = {}) {
  if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(databasePath);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('user','expert','admin')),
      is_demo INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
      purpose TEXT NOT NULL, province_id TEXT NOT NULL, category TEXT NOT NULL,
      topic TEXT NOT NULL, description TEXT NOT NULL, city TEXT NOT NULL DEFAULT '',
      format TEXT NOT NULL DEFAULT '', time_preference TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      selected_response_id TEXT
    );
    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY, request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      expert_id TEXT NOT NULL REFERENCES users(id), message TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      status TEXT NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      message TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS request_owner ON requests(user_id);
    CREATE INDEX IF NOT EXISTS response_request ON responses(request_id);
    CREATE INDEX IF NOT EXISTS notification_owner ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires_at);
  `);

  if (allowDemo) {
    for (const [role, name] of [['user', 'Pengunjung Contoh'], ['expert', 'Pendamping Contoh'], ['admin', 'Pengelola Contoh']]) {
      if (!db.prepare('SELECT id FROM users WHERE id = ?').get(`demo-${role}`)) {
        // These random passwords are never exposed; localhost demo login uses a dedicated endpoint.
        const hash = await passwordHash(randomBytes(32).toString('hex'));
        db.prepare('INSERT INTO users (id,name,email,password_hash,role,is_demo,created_at) VALUES (?,?,?,?,?,1,?)')
          .run(`demo-${role}`, name, `${role}@demo.swaranusa.invalid`, hash, role, timestamp());
      }
    }
  }
  const dummyHash = await passwordHash(randomBytes(24).toString('hex'));
  const authAttempts = new Map();

  function transaction(fn) {
    db.exec('BEGIN IMMEDIATE');
    try { const result = fn(); db.exec('COMMIT'); return result; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  }

  function notify(userId, requestId, message) {
    db.prepare('INSERT INTO notifications (id,user_id,request_id,message,created_at) VALUES (?,?,?,?,?)')
      .run(id('NT'), userId, requestId, message, timestamp());
  }

  function notifyRole(role, requestId, message) {
    for (const account of db.prepare('SELECT id FROM users WHERE role = ?').all(role)) notify(account.id, requestId, message);
  }

  function addHistory(requestId, status, note) {
    db.prepare('INSERT INTO history (request_id,status,note,created_at) VALUES (?,?,?,?)').run(requestId, status, note, timestamp());
  }

  function serializeRequest(row, viewer) {
    const responses = db.prepare('SELECT r.*,u.name,u.is_demo FROM responses r JOIN users u ON u.id=r.expert_id WHERE request_id=? ORDER BY r.created_at,r.rowid').all(row.id)
      .map(r => ({ id: r.id, expertId: r.expert_id, expertName: r.name, message: r.message, createdAt: r.created_at, isDemo: !!r.is_demo }));
    // An expert sees approved summaries, their own response, and the chosen response's ID.
    // Email, phone and private account data are never included in a request payload.
    const visibleResponses = viewer.role === 'expert' ? responses.filter(r => r.expertId === viewer.id) : responses;
    return {
      id: row.id, userId: row.user_id, userName: row.user_name,
      purpose: row.purpose, provinceId: row.province_id, category: row.category,
      topic: row.topic, description: row.description, city: row.city, format: row.format,
      timePreference: row.time_preference, status: row.status, createdAt: row.created_at,
      updatedAt: row.updated_at, selectedResponseId: row.selected_response_id,
      responses: visibleResponses,
      history: db.prepare('SELECT status,note,created_at AS createdAt FROM history WHERE request_id=? ORDER BY id').all(row.id)
    };
  }

  function requestById(requestId) {
    const row = db.prepare('SELECT r.*,u.name AS user_name FROM requests r JOIN users u ON u.id=r.user_id WHERE r.id=?').get(requestId);
    if (!row) fail(404, 'Request tidak ditemukan.');
    return row;
  }

  function canReadRequest(user, request) {
    return user.role === 'admin' || request.user_id === user.id || (
      user.role === 'expert' && request.purpose === 'pendamping' && (
        ACTIVE.includes(request.status) || !!db.prepare('SELECT id FROM responses WHERE request_id=? AND expert_id=?').get(request.id, user.id)
      )
    );
  }

  function getUser(req) {
    const rawCookie = String(req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith('sw_session='))?.slice(11);
    if (!rawCookie || !/^[a-f0-9]{64}$/.test(rawCookie)) return null;
    return db.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').get(digest(rawCookie), Date.now()) || null;
  }

  function requireUser(req) {
    const user = getUser(req);
    if (!user) fail(401, 'Masuk ke akun untuk melanjutkan.');
    return user;
  }

  function setSession(req, res, userId) {
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
    const oldToken = String(req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith('sw_session='))?.slice(11);
    if (oldToken && /^[a-f0-9]{64}$/.test(oldToken)) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(oldToken));
    const token = randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token), userId, Date.now() + SESSION_AGE);
    res.setHeader('Set-Cookie', `sw_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_AGE / 1000}`);
  }

  function rateLimit(req) {
    const key = req.socket.remoteAddress || 'local';
    const now = Date.now();
    const record = authAttempts.get(key);
    if (!record || record.expiresAt <= now) { authAttempts.set(key, { count: 1, expiresAt: now + 15 * 60 * 1000 }); return; }
    record.count += 1;
    if (record.count > 50) fail(429, 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.');
  }

  function validateOrigin(req) {
    const host = req.headers.host;
    const port = req.socket.localPort;
    if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) fail(403, 'Pratinjau hanya tersedia melalui alamat lokal.');
    if (!['GET', 'HEAD'].includes(req.method) && req.headers.origin !== `http://${host}`) fail(403, 'Permintaan harus berasal dari halaman SwaraNusa yang sama.');
  }

  async function api(req, res, path) {
    if (req.method === 'GET' && path === '/api/session') return json(res, 200, { user: plainUser(getUser(req)) });

    if (req.method === 'POST' && ['/api/auth/register', '/api/auth/login', '/api/auth/demo', '/api/auth/logout'].includes(path)) {
      const data = await body(req);
      if (path === '/api/auth/logout') {
        const token = String(req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith('sw_session='))?.slice(11);
        if (token && /^[a-f0-9]{64}$/.test(token)) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(token));
        res.setHeader('Set-Cookie', 'sw_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
        return json(res, 200, { user: null });
      }
      rateLimit(req);
      if (path === '/api/auth/demo') {
        if (!allowDemo || !['127.0.0.1', '::ffff:127.0.0.1', '::1'].includes(req.socket.remoteAddress)) fail(403, 'Akun contoh hanya tersedia dalam pratinjau lokal.');
        if (!['user', 'expert', 'admin'].includes(data.role)) fail(400, 'Pilih peran akun contoh.');
        const user = db.prepare('SELECT * FROM users WHERE id=? AND is_demo=1').get(`demo-${data.role}`);
        setSession(req, res, user.id);
        return json(res, 200, { user: plainUser(user) });
      }
      const email = field(data.email, 'Email', 3, 254).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Tulis alamat email yang sesuai.');
      if (typeof data.password !== 'string' || data.password.length < 8 || data.password.length > 128 || data.password.includes('\0')) fail(400, 'Kata sandi harus 8–128 karakter.');
      const password = data.password;
      if (path === '/api/auth/register') {
        const name = field(data.name, 'Nama', 2, 80);
        if (email.endsWith('@demo.swaranusa.invalid')) fail(400, 'Gunakan alamat email pribadi untuk mendaftar.');
        if (db.prepare('SELECT id FROM users WHERE email=?').get(email)) fail(409, 'Email sudah terdaftar. Silakan masuk.');
        const hash = await passwordHash(password);
        const userId = id('US');
        try {
          db.prepare('INSERT INTO users (id,name,email,password_hash,role,is_demo,created_at) VALUES (?,?,?,?,?,0,?)').run(userId, name, email, hash, 'user', timestamp());
        } catch (error) {
          if (String(error.message).includes('UNIQUE')) fail(409, 'Email sudah terdaftar. Silakan masuk.');
          throw error;
        }
        const user = db.prepare('SELECT * FROM users WHERE id=?').get(userId);
        setSession(req, res, user.id);
        return json(res, 201, { user: plainUser(user) });
      }
      const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
      const matches = await passwordMatches(password, user?.password_hash || dummyHash);
      if (!user || !matches || user.is_demo) fail(401, 'Email atau kata sandi belum sesuai.');
      setSession(req, res, user.id);
      return json(res, 200, { user: plainUser(user) });
    }

    if (req.method === 'GET' && path === '/api/experts') {
      const experts = db.prepare("SELECT id,name FROM users WHERE role='expert' AND is_demo=1").all().map(user => ({
        id: user.id, name: user.name,
        description: 'Profil simulasi untuk mencoba alur request. Cakupan contoh meliputi semua kategori dan 10 provinsi. Belum ada layanan, jadwal, atau kontak pendamping nyata.',
        categories: CATEGORIES, provinces: PROVINCES, isDemo: true
      }));
      return json(res, 200, { experts });
    }

    if (path === '/api/notifications' && req.method === 'GET') {
      const user = requireUser(req);
      const notifications = db.prepare('SELECT id,message,request_id AS requestId,is_read AS read,created_at AS createdAt FROM notifications WHERE user_id=? ORDER BY created_at DESC,rowid DESC LIMIT 100').all(user.id).map(n => ({ ...n, read: !!n.read }));
      return json(res, 200, { notifications });
    }
    if (path === '/api/notifications/read' && req.method === 'POST') {
      const user = requireUser(req);
      await body(req);
      db.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(user.id);
      return json(res, 200, { ok: true });
    }

    if (path === '/api/requests' && req.method === 'GET') {
      const user = requireUser(req);
      let rows;
      if (user.role === 'admin') rows = db.prepare('SELECT r.*,u.name AS user_name FROM requests r JOIN users u ON u.id=r.user_id ORDER BY r.created_at DESC,r.rowid DESC').all();
      else if (user.role === 'expert') rows = db.prepare("SELECT r.*,u.name AS user_name FROM requests r JOIN users u ON u.id=r.user_id WHERE r.purpose='pendamping' AND (r.status IN ('open','responded') OR EXISTS(SELECT 1 FROM responses a WHERE a.request_id=r.id AND a.expert_id=?)) ORDER BY r.updated_at DESC,r.rowid DESC").all(user.id);
      else rows = db.prepare('SELECT r.*,u.name AS user_name FROM requests r JOIN users u ON u.id=r.user_id WHERE r.user_id=? ORDER BY r.created_at DESC,r.rowid DESC').all(user.id);
      return json(res, 200, { requests: rows.map(row => serializeRequest(row, user)) });
    }

    if (path === '/api/requests' && req.method === 'POST') {
      const user = requireUser(req);
      if (user.role !== 'user') fail(403, 'Gunakan akun pengunjung untuk mengirim request.');
      const data = await body(req);
      if (!['informasi', 'pendamping'].includes(data.purpose)) fail(400, 'Pilih tujuan request.');
      if (!PROVINCES.includes(data.provinceId)) fail(400, 'Pilih salah satu dari 10 provinsi.');
      if (!CATEGORIES.includes(data.category)) fail(400, 'Pilih kategori yang tersedia.');
      if (data.consent !== true) fail(400, 'Setujui pembagian ringkasan kebutuhan sebelum mengirim.');
      const topic = field(data.topic, 'Topik', 3, 140);
      const description = field(data.description, 'Penjelasan kebutuhan', 10, 3000);
      const city = field(data.city, 'Kota', 2, 120, data.purpose === 'informasi');
      const format = data.purpose === 'pendamping' ? data.format : '';
      if (data.purpose === 'pendamping' && !['daring', 'tatap-muka', 'fleksibel', 'luring'].includes(format)) fail(400, 'Pilih bentuk pendampingan.');
      const timePreference = field(data.timePreference, 'Preferensi waktu', 0, 200, true);
      const requestId = id('SN');
      const now = timestamp();
      transaction(() => {
        db.prepare('INSERT INTO requests (id,user_id,purpose,province_id,category,topic,description,city,format,time_preference,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
          .run(requestId, user.id, data.purpose, data.provinceId, data.category, topic, description, city, format, timePreference, 'pending', now, now);
        addHistory(requestId, 'pending', 'Request tersimpan dan menunggu tinjauan pengelola.');
        notifyRole('admin', requestId, `Request baru: ${topic}. Periksa sebelum membagikannya.`);
        notify(user.id, requestId, `Request “${topic}” menunggu tinjauan.`);
      });
      return json(res, 201, { request: serializeRequest(requestById(requestId), user) });
    }

    const match = /^\/api\/requests\/([A-Za-z0-9-]+)(?:\/(action|responses))?$/.exec(path);
    if (match) {
      const user = requireUser(req);
      // Finish asynchronous body parsing before reading state. Every subsequent
      // transition check and write runs together, so a slow request cannot apply
      // an action to a state that changed while its body was still arriving.
      const mutationData = req.method === 'POST' && match[2] ? await body(req) : null;
      const request = requestById(match[1]);
      // Conceal request existence from unrelated accounts.
      if (!canReadRequest(user, request)) fail(404, 'Request tidak ditemukan.');
      if (req.method === 'GET' && !match[2]) return json(res, 200, { request: serializeRequest(request, user) });
      if (req.method === 'POST' && match[2] === 'responses') {
        const data = mutationData;
        if (!ACTIVE.includes(request.status)) fail(409, 'Request ini sudah berhenti menerima tanggapan.');
        if (!((user.role === 'expert' && request.purpose === 'pendamping') || (user.role === 'admin' && request.purpose === 'informasi'))) fail(403, 'Peran akun ini tidak dapat menanggapi request tersebut.');
        const message = field(data.message, 'Tanggapan', 10, 3000);
        transaction(() => {
          db.prepare('INSERT INTO responses (id,request_id,expert_id,message,created_at) VALUES (?,?,?,?,?)').run(id('RS'), request.id, user.id, message, timestamp());
          db.prepare("UPDATE requests SET status='responded',updated_at=? WHERE id=?").run(timestamp(), request.id);
          addHistory(request.id, 'responded', `${user.is_demo ? 'Akun contoh memberi' : 'Ada'} tanggapan ${user.is_demo ? 'simulasi' : 'baru'}.`);
          notify(request.user_id, request.id, `Ada ${user.is_demo ? 'tanggapan contoh' : 'tanggapan'} untuk “${request.topic}”.`);
        });
        return json(res, 201, { request: serializeRequest(requestById(request.id), user) });
      }
      if (req.method === 'POST' && match[2] === 'action') {
        const data = mutationData;
        const owner = request.user_id === user.id;
        const admin = user.role === 'admin';
        const note = field(data.note, 'Catatan', 0, 1000, true);
        let nextStatus;
        let defaultNote;
        let selectedResponseId = request.selected_response_id;
        let selectedExpertId;
        switch (data.action) {
          case 'approve':
            if (!admin) fail(403, 'Hanya pengelola dapat meninjau request.');
            if (request.status !== 'pending') fail(409, 'Request ini sudah ditinjau.');
            nextStatus = 'open'; defaultNote = 'Pengelola menyetujui request.'; break;
          case 'reject':
            if (!admin) fail(403, 'Hanya pengelola dapat meninjau request.');
            if (request.status !== 'pending') fail(409, 'Request ini sudah ditinjau.');
            if (!note) fail(400, 'Sertakan alasan penolakan.');
            nextStatus = 'rejected'; defaultNote = 'Pengelola menolak request.'; break;
          case 'cancel':
            if (!owner) fail(403, 'Hanya pemilik dapat membatalkan request.');
            if (!CANCELLABLE.includes(request.status)) fail(409, 'Request ini sudah ditutup.');
            nextStatus = 'cancelled'; defaultNote = 'Pemilik membatalkan request.'; break;
          case 'select': {
            if (!owner) fail(403, 'Hanya pemilik dapat memilih pendamping.');
            if (request.purpose !== 'pendamping' || !ACTIVE.includes(request.status)) fail(409, 'Pilih pendamping dari tanggapan pada request yang masih terbuka.');
            if (typeof data.responseId !== 'string') fail(400, 'Pilih tanggapan pendamping.');
            const response = db.prepare("SELECT r.* FROM responses r JOIN users u ON u.id=r.expert_id WHERE r.id=? AND r.request_id=? AND u.role='expert'").get(data.responseId, request.id);
            if (!response) fail(400, 'Tanggapan tidak sesuai dengan request ini.');
            selectedResponseId = response.id; selectedExpertId = response.expert_id;
            nextStatus = 'connected'; defaultNote = 'Pemilik memilih tanggapan pendamping. Biaya dan jadwal belum disepakati.'; break;
          }
          case 'reopen':
            if (!owner) fail(403, 'Hanya pemilik dapat mencari pendamping lain.');
            if (request.purpose !== 'pendamping' || request.status !== 'connected') fail(409, 'Request belum terhubung ke pendamping.');
            selectedResponseId = null;
            nextStatus = 'open'; defaultNote = 'Pemilik mencari pendamping lain. Riwayat dan tanggapan sebelumnya tetap tersimpan.'; break;
          case 'complete':
            if (request.purpose === 'pendamping') {
              if (!owner) fail(403, 'Hanya pemilik dapat menyelesaikan request pendamping.');
              if (request.status !== 'connected') fail(409, 'Hubungkan request ke pendamping terlebih dahulu.');
            } else {
              if (!admin) fail(403, 'Pengelola menyelesaikan request informasi.');
              const savedAnswer = db.prepare("SELECT r.id FROM responses r JOIN users u ON u.id=r.expert_id WHERE r.request_id=? AND u.role='admin' LIMIT 1").get(request.id);
              if (request.status !== 'responded' || !savedAnswer) fail(409, 'Simpan jawaban pengelola sebelum menyelesaikan request informasi.');
            }
            nextStatus = 'completed'; defaultNote = request.purpose === 'pendamping' ? 'Pemilik menandai kebutuhan pendamping telah terpenuhi.' : 'Pengelola menyelesaikan request informasi.'; break;
          default: fail(400, 'Tindakan tidak dikenal.');
        }
        transaction(() => {
          db.prepare('UPDATE requests SET status=?,selected_response_id=?,updated_at=? WHERE id=?').run(nextStatus, selectedResponseId, timestamp(), request.id);
          addHistory(request.id, nextStatus, note || defaultNote);
          notify(request.user_id, request.id, `${note || defaultNote} (${request.topic})`);
          if (nextStatus === 'open' && request.purpose === 'pendamping') notifyRole('expert', request.id, `Request pendamping terbuka: ${request.topic}.`);
          if (selectedExpertId) notify(selectedExpertId, request.id, `Pengguna memilih tanggapan contoh Anda untuk “${request.topic}”. Ini simulasi pratinjau.`);
          if (['connected', 'cancelled', 'completed'].includes(nextStatus)) {
            const responders = db.prepare('SELECT DISTINCT expert_id FROM responses WHERE request_id=?').all(request.id);
            for (const responder of responders) {
              if (responder.expert_id !== selectedExpertId && responder.expert_id !== request.user_id) notify(responder.expert_id, request.id, `Status “${request.topic}” berubah. Request berhenti menerima tanggapan.`);
            }
          }
        });
        return json(res, 200, { request: serializeRequest(requestById(request.id), user) });
      }
    }
    fail(404, 'Alamat API tidak ditemukan.');
  }

  function staticFile(req, res, path) {
    if (!['GET', 'HEAD'].includes(req.method)) fail(405, 'Metode permintaan tidak tersedia.');
    let decoded;
    try { decoded = decodeURIComponent(path); } catch { fail(400, 'Alamat tidak valid.'); }
    if (decoded.includes('\0') || decoded.includes('\\') || decoded.split('/').some(part => part.startsWith('.'))) fail(404, 'Halaman tidak ditemukan.');
    let file = resolve(publicDir, `.${decoded}`);
    if (file !== resolve(publicDir) && !file.startsWith(`${resolve(publicDir)}${sep}`)) fail(404, 'Halaman tidak ditemukan.');
    try {
      if (statSync(file).isDirectory()) file = resolve(file, 'index.html');
      if (!statSync(file).isFile()) fail(404, 'Halaman tidak ditemukan.');
    } catch {
      if (extname(decoded) || decoded.startsWith('/assets/')) fail(404, 'Berkas tidak ditemukan.');
      file = resolve(publicDir, 'index.html');
    }
    let realFile;
    try {
      realFile = realpathSync(file);
      if (!realFile.startsWith(`${realpathSync(publicDir)}${sep}`)) fail(404, 'Berkas tidak ditemukan.');
    } catch { fail(404, 'Berkas tidak ditemukan.'); }
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp4': 'video/mp4' };
    const data = readFileSync(realFile);
    res.writeHead(200, { 'Content-Type': types[extname(realFile)] || 'application/octet-stream', 'Content-Length': data.length, 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : data);
  }

  const server = http.createServer({ maxHeaderSize: 16384 }, async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-src https://www.youtube-nocookie.com https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'");
    try {
      validateOrigin(req);
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname.startsWith('/api/') || url.pathname === '/api') await api(req, res, url.pathname);
      else staticFile(req, res, url.pathname);
    } catch (error) {
      if (res.headersSent || res.destroyed) return;
      if (!(error instanceof HttpError)) console.error('Request failed:', error);
      json(res, error.status || 500, { error: error instanceof HttpError ? error.message : 'Ada kendala saat menyimpan data. Coba lagi.' });
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  server.on('close', () => db.close());
  return { server, db };
}

export async function startServer({ port = Number(process.env.PORT || 4173), ...options } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT harus berupa nomor port yang valid.');
  const app = await createApp(options);
  await new Promise((resolveListen, reject) => {
    app.server.once('error', reject);
    app.server.listen(port, '127.0.0.1', resolveListen);
  });
  const address = `http://127.0.0.1:${app.server.address().port}`;
  console.log(`SwaraNusa siap: ${address}`);
  console.log('Pratinjau lokal. Akun contoh hanya menyimulasikan alur; tidak ada kontak atau transaksi nyata.');
  return { ...app, address };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().then(({ server }) => {
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close(() => process.exit(0)));
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
