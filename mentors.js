import {esc, icon, cats} from './components.js?v=9992e7c43f';

export const teachingCategories=Object.freeze(['tari','musik','kerajinan']);
export const canHaveTeacher=entry=>teachingCategories.includes(entry?.category);
export const teacherLink=entry=>'/pendamping?materi='+encodeURIComponent(entry.id);
export function teachersForEntry(profiles,entry){
 if(!canHaveTeacher(entry))return [];
 return profiles.filter(p=>p.categories?.includes(entry.category)&&(!p.entryIds?.length||p.entryIds.includes(entry.id))).slice(0,2);
}
export function whatsappUrl(profile,entry){
 let number=String(profile.whatsapp||'').replace(/[+\s()-]/g,'');
 if(number.startsWith('0'))number='62'+number.slice(1);
 if(!/^628[1-9]\d{7,10}$/.test(number))return '';
 const topic=entry?.title||'materi seni di SwaraNusa';
 const message=`Halo ${profile.name}, saya ingin belajar ${topic}. Boleh tanya jadwal dan biaya belajarnya?`;
 return 'https://wa.me/'+number+'?text='+encodeURIComponent(message);
}
export function teacherSidebar(entry){
 if(!canHaveTeacher(entry))return '';
 return `<div class="mentor-note teacher-note">${icon('user')}<h3>Ingin belajar dengan pengajar?</h3><p>Lihat profil pengajar untuk materi ini, lalu hubungi lewat WhatsApp.</p><a class="btn btn-dark" href="${esc(teacherLink(entry))}">Lihat pengajar ${icon('arrow')}</a></div>`;
}
export function teacherCard(profile,entry){
 const url=whatsappUrl(profile,entry);
 const image=typeof profile.image==='string'&&/^\/assets\/[a-z0-9-]+\.svg$/.test(profile.image)?profile.image:'/assets/pengajar-rina.svg';
 const examples=[...new Set([entry?.title,...(profile.examples||[])].filter(Boolean))].slice(0,4);
 return `<article class="teacher-card"><div class="teacher-portrait"><img src="${esc(image)}" alt="${esc(profile.imageAlt||'Ilustrasi profil pengajar')}" width="600" height="600">${profile.isDemo?'<span class="teacher-demo-badge">Profil contoh</span>':''}</div><div class="teacher-card-body"><span class="eyebrow">${esc(profile.role||'Pengajar seni')}</span><h2>${esc(profile.name)}</h2><div class="teacher-fields">${(profile.categories||[]).filter(c=>teachingCategories.includes(c)).map(c=>`<span>${esc(cats[c])}</span>`).join('')}</div><p>${esc(profile.description)}</p><div class="teacher-topics"><h3>${entry?'Materi yang ingin kamu pelajari':'Contoh materi'}</h3>${entry?`<p class="teacher-selected-topic">${esc(entry.title)}</p>`:''}<p>${entry?'Materi lain: ':''}${esc(examples.filter(t=>!entry||t!==entry.title).join(' · '))}</p></div>${url?`<a class="btn btn-dark teacher-contact" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon('chat')}Hubungi via WhatsApp ${icon('upRight')}</a>`:'<button class="btn btn-outline teacher-contact" disabled>Nomor belum ditambahkan</button>'}${profile.isDemo?'<p class="teacher-contact-note">Ilustrasi dan nama untuk contoh tampilan. Tombol memakai nomor kontak demonstrasi yang diberikan pemilik proyek.</p>':''}</div></article>`;
}
export function teacherDirectory(data,profiles,params){
 const entry=data.entries.find(e=>e.id===params.get('materi'));
 const category=teachingCategories.includes(params.get('kategori'))?params.get('kategori'):'';
 const unsupported=entry&&!canHaveTeacher(entry)||params.has('kategori')&&!category&&!entry;
 const chosen=unsupported?[]:entry?teachersForEntry(profiles,entry):profiles.filter(p=>!category||p.categories?.includes(category));
 const back=entry?`/materi/${encodeURIComponent(entry.id)}`:'/';
 const demo=chosen.some(p=>p.isDemo);
 const empty=unsupported?'Pengajar tersedia untuk tari, alat musik, dan kerajinan.':'Belum ada profil pengajar untuk materi ini.';
 return `<section class="wrap teachers-page"><nav class="breadcrumbs" aria-label="Jejak halaman"><a href="/">Beranda</a>${icon('chevron')}${entry?`<a href="${esc(back)}">${esc(entry.title)}</a>${icon('chevron')}`:''}<span aria-current="page">Pengajar</span></nav><header class="teacher-page-heading"><span class="eyebrow">BELAJAR BERSAMA PENGAJAR</span><h1>${entry?`Mau belajar<br><em>${esc(entry.title)}?</em>`:'Temukan teman<br><em>belajarmu.</em>'}</h1><p>Pilih profil pengajar, lalu tanyakan jadwal dan biaya langsung lewat WhatsApp.</p></header>${demo?'<p class="teacher-demo-notice">Saat ini kamu melihat profil contoh. Nama dan ilustrasinya belum mewakili pengajar nyata.</p>':''}${entry?`<div class="teacher-context">${icon('book')}<span>${esc(cats[entry.category])} <span aria-hidden="true">/</span> ${esc(entry.title)}</span><a href="${esc(back)}">Kembali ke materi ${icon('back')}</a></div>`:`<nav class="teacher-category-nav" aria-label="Bidang pengajar"><a href="/pendamping" ${!category?'aria-current="page"':''}>Semua bidang</a>${teachingCategories.map(c=>`<a href="/pendamping?kategori=${c}" ${category===c?'aria-current="page"':''}>${esc(cats[c])}</a>`).join('')}</nav>`}${chosen.length?`<div class="teacher-grid">${chosen.map(p=>teacherCard(p,entry)).join('')}</div>`:`<div class="teacher-empty">${icon('user')}<h2>${empty}</h2><a class="text-link" href="/pendamping">Lihat bidang pengajar ${icon('arrow')}</a></div>`}<p class="teacher-page-note">Biaya, tempat, dan waktu belajar disepakati langsung dengan pengajar.</p></section>`;
}
