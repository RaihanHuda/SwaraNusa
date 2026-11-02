import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { esc, cats } from '../public/components.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'public/data.json'), 'utf8'));
const reviewedAt = data.contentNotes.reviewedAt;
const guides = data.entries.filter(e => e.kind === 'Panduan').length;
const md = value => String(value).replace(/[\[\]|]/g, '\\$&');
const mdUrl = value => String(value).replaceAll(' ', '%20');
const categoryIds = Object.keys(cats);
const sourceLink = source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a>`;

const lines = ['# Sumber materi dan foto SwaraNusa', '',
  `Ditinjau ${reviewedAt}. Koleksi berisi ${data.entries.length} materi pada ${data.provinces.length} provinsi, termasuk ${guides} panduan. Artikel memakai parafrasa. Pengelompokan provinsi membantu penelusuran dan tidak menyatakan kepemilikan eksklusif suatu tradisi.`, '',
  '## Materi budaya', ''];
for (const province of data.provinces) {
  lines.push(`### ${province.name}`, '');
  for (const category of categoryIds) {
    lines.push(`**${cats[category]}**`, '');
    for (const entry of data.entries.filter(e => e.provinceId === province.id && e.category === category)) {
      lines.push(`- **${md(entry.title)}**: [${md(entry.sourceLabel)}](${mdUrl(entry.sourceUrl)}). Jenis: ${entry.kind}.`);
      for (const source of entry.sources || []) {
        if (source.url !== entry.sourceUrl) lines.push(`  - Pendukung: [${md(source.label)}](${mdUrl(source.url)}).`);
      }
    }
    lines.push('');
  }
}
lines.push('## Pemakaian gambar', '',
  'Kartu bertanda Foto daerah memakai foto pengantar wilayah asal. Alt dan keterangan gambar menyebut objek foto tersebut. Foto pengantar tidak dipakai sebagai petunjuk gerak tari, bentuk alat musik, atau teknik membuat kerajinan.', '',
  'Foto bersumber dari Wikimedia Commons. Ukuran diperkecil untuk web; tampilan dapat memotong bidang foto. Hak dan lisensi tetap mengikuti pemilik foto.', '');
for (const photo of data.photos) {
  lines.push(`- **${md(photo.file)}**: [${md(photo.title)}](${mdUrl(photo.sourceUrl)}) oleh **${md(photo.author)}**. [${md(photo.license)}](${mdUrl(photo.licenseUrl || photo.sourceUrl)}).`);
}
lines.push('', '## Diagram dan identitas', '',
  '`main-dore.svg`, `cak-ingkling.svg`, dan `galah-panjang.svg` merupakan diagram pengenalan proyek, bukan rekonstruksi lapangan baku.',
  'Siluet Sumatra diadaptasi dari [Natural Earth 1:50m](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), [domain publik](https://www.naturalearthdata.com/about/terms-of-use/).',
  '`logo.jpg` berasal dari lampiran pemilik proyek. Lisensi foto Wikimedia tidak berlaku untuk logo tersebut.', '',
  '## Batas materi', '',
  'Materi bertanda Pengenalan tidak menyediakan tutorial praktik. Panduan Congkak memakai satu variasi latihan yang merujuk sumbernya; aturan komunitas lain dapat berbeda. Tidak ada profil ahli, kontak, harga, jadwal kunjungan, rating, atau video tutorial rekaan.', '');
await writeFile(path.join(root, 'docs/sources.md'), lines.join('\n'));

const photoCredits = data.photos.map(photo => `<article class="credit-item"><img src="${esc(photo.path)}" alt="${esc(photo.title)}" loading="lazy"><div><h2>${esc(photo.title)}</h2><p>Foto: ${esc(photo.author)}</p><p>${sourceLink({ url: photo.sourceUrl, label: 'Sumber asli' })} · ${sourceLink({ url: photo.licenseUrl || photo.sourceUrl, label: photo.license })}</p><p>Penyesuaian: ukuran untuk web dan pemotongan tampilan sesuai tata letak.</p></div></article>`).join('');
const materialCredits = data.provinces.map(province => `<section class="credit-province"><h2>${esc(province.name)}</h2><ol class="credit-sources-list">${data.entries.filter(e => e.provinceId === province.id).map(entry => `<li><a class="credit-entry-title" href="/materi/${esc(entry.id)}">${esc(entry.title)}</a><span>${esc(cats[entry.category])} · ${esc(entry.kind)}</span><div>${sourceLink({ url: entry.sourceUrl, label: entry.sourceLabel })}${(entry.sources || []).filter(s => s.url !== entry.sourceUrl).map(s => sourceLink(s)).join('')}</div></li>`).join('')}</ol></section>`).join('');
const html = `<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sumber & kredit foto | SwaraNusa</title><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/polish.css"><link rel="stylesheet" href="/atmosphere.css"><link rel="icon" href="/assets/favicon.svg"></head><body class="credits-document"><header class="site-header"><div class="nav-inner"><a class="brand" href="/">SwaraNusa</a><a class="text-link" href="/tentang#sumber">Kembali ke tentang SwaraNusa →</a></div></header><main class="wrap credits-page"><span class="eyebrow">SUMBER & ATRIBUSI</span><h1>Kredit foto<br>dan rujukan materi.</h1><p class="credits-intro">${data.entries.length} materi dengan rujukan, ditinjau ${esc(reviewedAt)}. Kartu bertanda Foto daerah memakai foto pengantar wilayah asal. Pemilik foto memberi izin melalui lisensi yang tercantum.</p><h2 class="credits-heading">Foto daerah dan dokumentasi budaya</h2>${photoCredits}<section class="sources-section"><h2>Ilustrasi Pulau Sumatra</h2><p>Siluet disederhanakan dari data garis pantai Natural Earth skala 1:50m, domain publik. ${sourceLink({ url: 'https://www.naturalearthdata.com/about/terms-of-use/', label: 'Ketentuan penggunaan' })}.</p></section><h2 class="credits-heading">Rujukan materi per provinsi</h2>${materialCredits}<section class="sources-section"><h2>Diagram dan logo</h2><p>Diagram permainan merupakan ilustrasi pengenalan yang dibuat untuk proyek. Bentuknya tidak menetapkan pola lapangan baku. Logo SwaraNusa berasal dari pemilik proyek.</p></section></main></body></html>`;
await writeFile(path.join(root, 'public/credits.html'), html);

const coverage = ['# Cakupan koleksi SwaraNusa', '', `Ditinjau ${reviewedAt}. Target: lima materi per kategori di setiap provinsi.`, '',
  '| Provinsi | Tari | Musik | Kerajinan | Wisata | Kuliner | Permainan |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
for (const province of data.provinces) {
  coverage.push(`| ${province.name} | ${categoryIds.map(category => data.entries.filter(e => e.provinceId === province.id && e.category === category).length).join(' | ')} |`);
}
coverage.push('', `Total: **${data.entries.length} materi**, terdiri atas ${data.entries.length - guides} pengenalan dan ${guides} panduan.`, '',
  'Rincian rujukan tersedia pada [Sumber materi dan foto](sources.md).', '');
await writeFile(path.join(root, 'docs/content-coverage.md'), coverage.join('\n'));
console.log(`Updated credits and coverage for ${data.entries.length} entries.`);
