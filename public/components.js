import {site} from './site-config.js';
export const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths = {
 compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/>',
 chat:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2v-9.5A8.5 8.5 0 0 1 10.5 4h2A8.5 8.5 0 0 1 21 11.5Z"/><path d="M7 10h9M7 14h6"/>',
 pause:'<path d="M9 5v14M15 5v14"/>',play:'<path d="m9 5 10 7-10 7Z"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',upRight:'<path d="M6 18 18 6M6 6h12v12"/>',
 pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 book:'<path d="M12 5v15M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1Z"/>',
 music:'<path d="M9 18V5l12-2v13M9 8l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',back:'<path d="M19 12H5m6-6-6 6 6 6"/>',check:'<path d="m5 12 4 4L19 6"/>',
 bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 leaf:'<path d="M20 3C9 3 3 6 3 13a7 7 0 0 0 7 7c7 0 10-6 10-17Z"/><path d="m5 19 10-10"/>',
 bowl:'<path d="M3 10h18c0 7-4 10-9 10S3 17 3 10ZM9 4v2m6-3v3M6 21h12"/>',
 game:'<path d="M6 7h12a4 4 0 0 1 4 4v6a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2v-6a4 4 0 0 1 4-4Z"/><path d="M7 10v5m-2.5-2.5h5M17 11h.1M19 14h.1"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
 logout:'<path d="M9 4H4v16h5m5-12 4 4-4 4m-6-4h14"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 list:'<path d="M9 6h12M9 12h12M9 18h12M3 6h.1M3 12h.1M3 18h.1"/>',
 spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>'
};
export const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.arrow}</svg>`;
export const cats={tari:'Tari',musik:'Musik Tradisional',kerajinan:'Kerajinan',wisata:'Wisata & Ikon',kuliner:'Kuliner',permainan:'Permainan Tradisional'};
export const statusLabels={pending:'Menunggu tinjauan',open:'Terbuka',responded:'Ada tanggapan',connected:'Dihubungkan',completed:'Selesai',rejected:'Ditolak',cancelled:'Dibatalkan'};
export const statusBadge=s=>`<span class="status status-${esc(s)}"><i></i>${esc(statusLabels[s]||s)}</span>`;
export const date=s=>s?new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date(s)):'';
export const photo=(item,cls='',eager=false)=>`<img class="${cls}" src="${esc(item.image||'/assets/hero-sumbar.jpg')}" alt="${esc(item.imageAlt||item.title||item.name)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
export const entryCard=(e,provinces,large=false)=>`<a class="entry-card ${large?'entry-card-large':''}" href="/materi/${esc(e.id)}"><div class="entry-photo">${photo(e)}<span class="photo-tag">${icon(({tari:'book',musik:'music',kerajinan:'leaf',wisata:'pin',kuliner:'bowl',permainan:'game'})[e.category])}${esc(cats[e.category])}</span><span class="entry-arrow">${icon('upRight')}</span></div><div class="entry-card-copy"><div class="entry-meta">${esc(provinces.find(p=>p.id===e.provinceId)?.name)}<span>${esc(e.kind||'Pengenalan')}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p></div></a>`;
export async function api(path,options={}) {
 if(site.publicPreview)throw new Error('Akun dan request belum dibuka pada situs publik ini.');
 const r=await fetch('/api'+path,{...options,headers:{'Content-Type':'application/json',...options.headers},credentials:'same-origin'});
 let d;try{d=await r.json()}catch{throw new Error('Server belum dapat memuat data. Coba muat ulang halaman.')}
 if(!r.ok)throw new Error(d.error||'Permintaan belum berhasil. Coba lagi.');return d;
}
export const post=(path,data={})=>api(path,{method:'POST',body:JSON.stringify(data)});
