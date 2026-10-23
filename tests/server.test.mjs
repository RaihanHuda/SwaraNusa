import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server.mjs';
import { request as httpRequest } from 'node:http';

test('local API protects accounts, request ownership and durable transitions', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'swaranusa-test-'));
  const publicDir = join(directory, 'public');
  mkdirSync(publicDir);
  writeFileSync(join(publicDir, 'index.html'), '<html><body>SwaraNusa test</body></html>');
  writeFileSync(join(directory, 'private.txt'), 'private database-like data');
  symlinkSync(join(directory, 'private.txt'), join(publicDir, 'escape.txt'));
  const databasePath = join(directory, 'test.sqlite');
  let app;
  let base;
  async function start() {
    app = await createApp({ databasePath, publicDir });
    await new Promise((resolve, reject) => {
      app.server.once('error', reject);
      app.server.listen(0, '127.0.0.1', resolve);
    });
    base = `http://127.0.0.1:${app.server.address().port}`;
  }
  await start();
  t.after(async () => {
    await new Promise(resolve => app.server.close(resolve));
    rmSync(directory, { recursive: true, force: true });
  });

  const client = () => ({ cookie: '' });
  const owner = client();
  const other = client();
  const expert = client();
  const admin = client();
  async function call(who, path, data, expected = 200, origin = base) {
    const response = await fetch(`${base}${path}`, {
      method: data === undefined ? 'GET' : 'POST',
      headers: { ...(data !== undefined ? { 'Content-Type': 'application/json', Origin: origin } : {}), ...(who.cookie ? { Cookie: who.cookie } : {}) },
      ...(data !== undefined ? { body: JSON.stringify(data) } : {})
    });
    const result = await response.json();
    assert.equal(response.status, expected, `${path}: ${JSON.stringify(result)}`);
    const cookie = response.headers.get('set-cookie');
    if (cookie) who.cookie = cookie.split(';')[0];
    return result;
  }
  const requestData = {
    purpose: 'pendamping', provinceId: 'aceh', category: 'tari', topic: 'Pengenalan tari Saman',
    description: 'Saya ingin memahami konteks dan batas pembelajaran Saman.', city: 'Banda Aceh',
    format: 'daring', timePreference: 'Akhir pekan', consent: true
  };
  let request;
  let responseId;

  await t.test('new accounts have a real password and cannot grant themselves privileges', async () => {
    const registered = await call(owner, '/api/auth/register', { name: 'Pemohon A', email: 'a@example.test', password: 'some correct password', role: 'admin', isDemo: true }, 201);
    assert.equal(registered.user.role, 'user');
    assert.equal(registered.user.isDemo, false);
    assert.equal((await call(owner, '/api/session')).user.email, 'a@example.test');
    const stored = app.db.prepare('SELECT password_hash FROM users WHERE email=?').get('a@example.test').password_hash;
    assert.match(stored, /^[a-f0-9]{32}:[a-f0-9]{128}$/);
    assert.ok(!stored.includes('some correct password'));
    await call(client(), '/api/auth/login', { email: 'a@example.test', password: 'incorrect password' }, 401);
    await call(other, '/api/auth/register', { name: 'Pemohon B', email: 'b@example.test', password: 'other correct password' }, 201);
    await call(admin, '/api/auth/demo', { role: 'admin' });
    await call(expert, '/api/auth/demo', { role: 'expert' });
    assert.equal((await call(expert, '/api/session')).user.isDemo, true);
  });

  await t.test('requests require authenticated consent and remain private before review', async () => {
    await call(client(), '/api/requests', requestData, 401);
    await call(owner, '/api/requests', { ...requestData, consent: false }, 400);
    request = (await call(owner, '/api/requests', requestData, 201)).request;
    assert.equal(request.status, 'pending');
    assert.equal(request.history.length, 1);
    await call(owner, `/api/requests/${request.id}/action`, { action: 'select', responseId: 'RS-unrelated' }, 409);
    assert.equal((await call(other, '/api/requests')).requests.length, 0);
    await call(other, `/api/requests/${request.id}`, undefined, 404);
    await call(other, `/api/requests/${request.id}/action`, { action: 'cancel' }, 404);
    await call(expert, `/api/requests/${request.id}`, undefined, 404);
    assert.equal((await call(expert, '/api/requests')).requests.length, 0);
    await call(owner, `/api/requests/${request.id}/action`, { action: 'approve' }, 403);
    assert.ok((await call(admin, '/api/notifications')).notifications.some(n => n.requestId === request.id));
  });

  await t.test('only approved requests receive the right role of response', async () => {
    await call(admin, `/api/requests/${request.id}/responses`, { message: 'Contoh tanggapan pengelola sebelum tinjauan.' }, 409);
    request = (await call(admin, `/api/requests/${request.id}/action`, { action: 'approve' })).request;
    assert.equal(request.status, 'open');
    assert.equal((await call(expert, '/api/requests')).requests.length, 1);
    await call(owner, `/api/requests/${request.id}/responses`, { message: 'Tidak boleh menanggapi sebagai pengguna.' }, 403);
    await call(admin, `/api/requests/${request.id}/responses`, { message: 'Admin bukan pendamping untuk request ini.' }, 403);
    request = (await call(expert, `/api/requests/${request.id}/responses`, { message: 'Ini tanggapan simulasi, bukan penawaran kelas atau jadwal nyata.' }, 201)).request;
    assert.equal(request.status, 'responded');
    assert.equal(request.responses[0].isDemo, true);
    responseId = request.responses[0].id;
    assert.equal('email' in request, false);
    assert.ok((await call(owner, '/api/notifications')).notifications.some(n => n.message.includes('tanggapan contoh')));
    await call(owner, '/api/notifications/read', {});
    assert.ok((await call(owner, '/api/notifications')).notifications.every(n => n.read === true));
  });

  await t.test('selection, reopening and completion preserve the full response history', async () => {
    request = (await call(expert, `/api/requests/${request.id}/responses`, { message: 'Pilihan tanggapan simulasi kedua sudah tersedia sebelum pemilik memilih.' }, 201)).request;
    const secondResponseId = request.responses[1].id;
    assert.notEqual(secondResponseId, responseId);
    await call(owner, `/api/requests/${request.id}/action`, { action: 'select', responseId: 'RS-unrelated' }, 400);
    request = (await call(owner, `/api/requests/${request.id}/action`, { action: 'select', responseId })).request;
    assert.equal(request.status, 'connected');
    assert.equal(request.selectedResponseId, responseId);
    await call(expert, `/api/requests/${request.id}/responses`, { message: 'Tidak boleh menambah tanggapan setelah dipilih.' }, 409);
    await call(admin, `/api/requests/${request.id}/action`, { action: 'complete' }, 403);
    const historyCount = request.history.length;
    request = (await call(owner, `/api/requests/${request.id}/action`, { action: 'reopen' })).request;
    assert.equal(request.status, 'open');
    assert.equal(request.selectedResponseId, null);
    assert.equal(request.responses.length, 2);
    assert.equal(request.history.length, historyCount + 1);
    assert.equal(request.responses[0].id, responseId);
    await call(owner, `/api/requests/${request.id}/action`, { action: 'complete' }, 409);
    // A preserved response can be selected immediately; no new response is needed.
    request = (await call(owner, `/api/requests/${request.id}/action`, { action: 'select', responseId: secondResponseId })).request;
    assert.equal(request.status, 'connected');
    assert.equal(request.selectedResponseId, secondResponseId);
    assert.equal(request.responses.length, 2);
    request = (await call(owner, `/api/requests/${request.id}/action`, { action: 'complete' })).request;
    assert.equal(request.status, 'completed');
    assert.equal(request.responses.length, 2);
    await call(owner, `/api/requests/${request.id}/action`, { action: 'cancel' }, 409);
    await call(owner, `/api/requests/${request.id}/action`, { action: 'reopen' }, 409);
  });

  await t.test('information requests use admin responses and cannot select a practitioner', async () => {
    let information = (await call(owner, '/api/requests', { ...requestData, purpose: 'informasi', topic: 'Sumber sejarah Saman', city: '', format: '' }, 201)).request;
    await call(admin, `/api/requests/${information.id}/action`, { action: 'approve' });
    const unanswered = await call(admin, `/api/requests/${information.id}/action`, { action: 'complete' }, 409);
    assert.match(unanswered.error, /Simpan jawaban pengelola/);
    const stillOpen = (await call(owner, `/api/requests/${information.id}`)).request;
    assert.equal(stillOpen.status, 'open');
    assert.equal(stillOpen.responses.length, 0);
    await call(expert, `/api/requests/${information.id}/responses`, { message: 'Ahli tidak melihat request informasi.' }, 404);
    information = (await call(admin, `/api/requests/${information.id}/responses`, { message: 'Pengelola menyediakan tautan sumber setelah pemeriksaan materi.' }, 201)).request;
    await call(owner, `/api/requests/${information.id}/action`, { action: 'select', responseId: information.responses[0].id }, 409);
    await call(owner, `/api/requests/${information.id}/action`, { action: 'complete' }, 403);
    assert.equal((await call(admin, `/api/requests/${information.id}/action`, { action: 'complete' })).request.status, 'completed');
  });

  await t.test('rejection requires a reason and cancellation stops responses', async () => {
    const rejected = (await call(owner, '/api/requests', requestData, 201)).request;
    await call(admin, `/api/requests/${rejected.id}/action`, { action: 'reject' }, 400);
    const result = await call(admin, `/api/requests/${rejected.id}/action`, { action: 'reject', note: 'Perjelas kebutuhan dan sumber materi yang ingin dipelajari.' });
    assert.equal(result.request.status, 'rejected');
    assert.equal(result.request.history.at(-1).note, 'Perjelas kebutuhan dan sumber materi yang ingin dipelajari.');
    await call(owner, `/api/requests/${rejected.id}/action`, { action: 'cancel' }, 409);
    const cancelled = (await call(owner, '/api/requests', requestData, 201)).request;
    await call(admin, `/api/requests/${cancelled.id}/action`, { action: 'approve' });
    await call(expert, `/api/requests/${cancelled.id}/responses`, { message: 'Tanggapan contoh sebelum pemilik membatalkan.' }, 201);
    await call(owner, `/api/requests/${cancelled.id}/action`, { action: 'cancel' });
    await call(expert, `/api/requests/${cancelled.id}/responses`, { message: 'Tidak boleh menanggapi request yang dibatalkan.' }, 409);
  });

  await t.test('session and state survive a server restart, logout revokes the session', async () => {
    const previousHistory = (await call(owner, `/api/requests/${request.id}`)).request.history;
    await new Promise(resolve => app.server.close(resolve));
    await start();
    assert.equal((await call(owner, '/api/session')).user.email, 'a@example.test');
    assert.deepEqual((await call(owner, `/api/requests/${request.id}`)).request.history, previousHistory);
    const oldCookie = owner.cookie;
    await call(owner, '/api/auth/logout', {});
    assert.equal((await call({ cookie: oldCookie }, '/api/session')).user, null);
    await call(owner, '/api/auth/login', { email: 'a@example.test', password: 'some correct password' });
    assert.equal((await call(owner, '/api/session')).user.role, 'user');
  });

  await t.test('host and origin checks reject cross-site mutations; private files stay private', async () => {
    await call(owner, '/api/requests', requestData, 403, 'https://other.example');
    const rebindingStatus = await new Promise((resolve, reject) => {
      const req = httpRequest(`${base}/api/session`, { headers: { Host: 'attacker.example' } }, response => { response.resume(); resolve(response.statusCode); });
      req.on('error', reject);
      req.end();
    });
    assert.equal(rebindingStatus, 403);
    const missingOrigin = await fetch(`${base}/api/auth/demo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'admin' }) });
    assert.equal(missingOrigin.status, 403);
    const deepLink = await fetch(`${base}/provinsi/aceh?tab=wisata`);
    assert.equal(deepLink.status, 200);
    assert.match(await deepLink.text(), /SwaraNusa test/);
    assert.equal((await fetch(`${base}/api/unknown`)).status, 404);
    for (const path of ['/server.mjs', '/.data/test.sqlite', '/escape.txt', '/assets/missing.webp', '/%2e%2e%2fprivate.txt']) {
      const response = await fetch(`${base}${path}`);
      assert.equal(response.status, 404, path);
      assert.ok(!(await response.text()).includes('private database-like data'));
    }
  });
});

test('demo route is disabled when allowDemo is false', async () => {
  const app = await createApp({ databasePath: ':memory:', allowDemo: false });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  try {
    const address = `http://127.0.0.1:${app.server.address().port}`;
    const response = await fetch(`${address}/api/auth/demo`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: address }, body: JSON.stringify({ role: 'admin' }) });
    assert.equal(response.status, 403);
    assert.equal(app.db.prepare('SELECT count(*) AS n FROM users WHERE is_demo=1').get().n, 0);
  } finally { await new Promise(resolve => app.server.close(resolve)); }
});
