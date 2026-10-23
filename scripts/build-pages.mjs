import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, '_site');
const basePath = '/SwaraNusa';
const publicRoot = path.join(root, 'public');
const data = JSON.parse(await readFile(path.join(publicRoot, 'data.json'), 'utf8'));

await rm(output, { recursive: true, force: true });
await cp(publicRoot, output, { recursive: true });
await writeFile(path.join(output, '.nojekyll'), '');
const configPath = path.join(output, 'site-config.js');
const config = await readFile(configPath, 'utf8');
await writeFile(configPath, config.replace(
  "{ basePath: '', publicPreview: false }",
  `{ basePath: '${basePath}', publicPreview: true }`
));

const withBase = html => html.replace(/\b(href|src)="\/(?!\/)/g, `$1="${basePath}/`);
const files = (await readdir(output)).filter(file => /\.(js|css|json)$/.test(file)).sort();
const revisionHash = createHash('sha256');
for (const file of files) revisionHash.update(file).update(await readFile(path.join(output, file)));
const revision = revisionHash.digest('hex').slice(0, 10);
// Version module imports together, so a fresh release also refreshes its dependencies.
for (const file of files.filter(file => file.endsWith('.js'))) {
  const module = await readFile(path.join(output, file), 'utf8');
  await writeFile(path.join(output, file), module.replace(/(from\s+['"])(\.[^'"]+\.js)(['"])/g, `$1$2?v=${revision}$3`));
}
let index = withBase(await readFile(path.join(publicRoot, 'index.html'), 'utf8'));
for (const file of ['styles.css', 'polish.css', 'atmosphere.css', 'app.js']) {
  index = index.replace(`/${file}"`, `/${file}?v=${revision}"`);
}
await writeFile(path.join(output, 'index.html'), index);
await writeFile(path.join(output, 'credits.html'), withBase(await readFile(path.join(publicRoot, 'credits.html'), 'utf8')));

// Each real route gets an index so links also work when opened or refreshed.
const routes = [
  ...data.provinces.map(p => `provinsi/${p.id}`),
  ...data.entries.map(e => `materi/${e.id}`),
  'request', 'akun', 'pendamping', 'tentang'
];
for (const route of routes) {
  const directory = path.join(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), index);
}
await writeFile(path.join(output, '404.html'), index);
await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: https://raihanhuda.github.io${basePath}/sitemap.xml\n`);
await writeFile(path.join(output, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  ['', ...routes].map(route => `  <url><loc>https://raihanhuda.github.io${basePath}/${route ? route + '/' : ''}</loc></url>`).join('\n') +
  '\n</urlset>\n');
console.log(`Public site ready: ${routes.length + 1} routes in ${output}`);
