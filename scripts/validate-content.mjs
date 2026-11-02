import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'public/data.json'), 'utf8'));
const categories = ['tari', 'musik', 'kerajinan', 'wisata', 'kuliner', 'permainan'];
const provinces = new Set(data.provinces.map(p => p.id));
const ids = new Set(), titles = new Set(), errors = [];
const counts = Object.fromEntries([...provinces].map(id => [id, Object.fromEntries(categories.map(c => [c, 0]))]));
const licensedPhotos = new Set(data.photos.map(photo => photo.path));
const check = (condition, message) => { if (!condition) errors.push(message); };

function checkSource(url, label, id) {
  try {
    const parsed = new URL(url);
    check(parsed.protocol === 'https:', `${id}: sumber harus memakai HTTPS`);
    check(!/^(www\.)?(google|bing|duckduckgo)\./.test(parsed.hostname), `${id}: cantumkan sumber asli, bukan halaman pencarian`);
  } catch { errors.push(`${id}: URL sumber tidak sah`); }
  check(typeof label === 'string' && label.trim().length > 2, `${id}: label sumber kosong`);
}

for (const entry of data.entries) {
  const id = entry.id || '(tanpa id)';
  check(typeof entry.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id), `${id}: format id tidak sah`);
  check(!ids.has(id), `${id}: id berulang`); ids.add(id);
  check(provinces.has(entry.provinceId), `${id}: provinsi tidak dikenal`);
  check(categories.includes(entry.category), `${id}: kategori tidak dikenal`);
  if (counts[entry.provinceId]?.[entry.category] !== undefined) counts[entry.provinceId][entry.category]++;
  for (const field of ['title', 'summary', 'location', 'community', 'image', 'imageAlt']) {
    check(typeof entry[field] === 'string' && entry[field].trim().length > 1, `${id}: ${field} belum diisi`);
  }
  const titleKey = `${entry.provinceId}/${entry.category}/${entry.title?.toLocaleLowerCase('id-ID').trim()}`;
  check(!titles.has(titleKey), `${id}: judul berulang dalam kategori dan provinsi yang sama`); titles.add(titleKey);
  check(Array.isArray(entry.paragraphs) && entry.paragraphs.length >= 2 && entry.paragraphs.every(p => typeof p === 'string' && p.trim().length > 25), `${id}: isi pengenalan belum lengkap`);
  check(Array.isArray(entry.facts) && entry.facts.length >= 1 && entry.facts.every(f => f.label && f.value), `${id}: catatan singkat belum lengkap`);
  check(['Pengenalan', 'Panduan'].includes(entry.kind), `${id}: jenis materi tidak dikenal`);
  check(Array.isArray(entry.steps) && (entry.kind === 'Panduan' ? entry.steps.length > 0 : entry.steps.length === 0), `${id}: penanda panduan tidak sesuai langkahnya`);
  checkSource(entry.sourceUrl, entry.sourceLabel, id);
  for (const source of entry.sources || []) checkSource(source.url, source.label, id);
  check(entry.image?.startsWith('/assets/') && !entry.image?.includes('..'), `${id}: jalur gambar tidak sah`);
  if (entry.image?.startsWith('/assets/')) {
    try { await access(path.join(root, 'public', entry.image)); }
    catch { errors.push(`${id}: gambar tidak ditemukan`); }
  }
  if (/\.(jpe?g|png|webp)$/i.test(entry.image || '')) check(licensedPhotos.has(entry.image), `${id}: kredit foto belum tercatat`);
  if (entry.imageContext === 'regional') check(entry.imageAlt?.startsWith('Foto pengantar daerah:'), `${id}: foto pengantar daerah harus diberi keterangan`);
}

const gaps = [];
for (const [id, row] of Object.entries(counts)) {
  for (const [category, count] of Object.entries(row)) {
    if (count < 5) gaps.push(`${id}/${category}: ${count}/5`);
    check(count <= 5, `${id}/${category}: ${count} materi melebihi batas lima`);
  }
}
if (process.argv.includes('--complete')) check(gaps.length === 0, `Target belum lengkap: ${gaps.join(', ')}`);
console.table(counts);
console.log(`${data.entries.length} materi; ${gaps.length} kategori/provinsi belum mencapai lima.`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log('ID, isi, sumber, gambar, kredit, dan penanda panduan sesuai.');
