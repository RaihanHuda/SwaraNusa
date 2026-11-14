import {esc,icon,youtubeId,entryVideo} from './components.js?v=6c7671c459';

const textList=value=>Array.isArray(value)?value.filter(x=>typeof x==='string'):typeof value==='string'?[value]:[];
export function videoPanel(entry) {
 if(entry.category==='wisata')return '';
 const video=entryVideo(entry);
 if(!video)return '';
 const id=youtubeId(video.url);
 let externalVideo='';
 try { const url=new URL(video.url); if(url.protocol==='https:'&&['www.abc.net.au','abc.net.au'].includes(url.hostname))externalVideo=url.href; } catch {}
 if(!id&&!externalVideo)return '';
 const labels={tutorial:'Video tutorial',demonstrasi:'Video demonstrasi',pertunjukan:'Video pertunjukan',pengenalan:'Video pengenalan'};
 const heading=video.type==='tutorial'?'Tonton tutorialnya.':video.type==='pertunjukan'?'Amati pertunjukannya.':entry.category==='wisata'?'Lihat tempatnya lebih dekat.':'Simak video pendampingnya.';
 const caption=`<span class="video-kind">${esc(labels[video.type]||'Video rujukan')}</span><h3>${esc(video.title)}</h3>${video.channel?`<p>Kanal: ${esc(video.channel)}</p>`:''}`;
 return `<section class="material-video-section" aria-labelledby="video-heading-${esc(entry.id)}"><span class="eyebrow">VIDEO PENDAMPING</span><h2 id="video-heading-${esc(entry.id)}">${heading}</h2>${id?`<div class="learning-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${esc(video.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe><div class="video-caption">${caption}<a href="${esc(video.url)}" target="_blank" rel="noopener noreferrer">Buka di YouTube ${icon('upRight')}</a></div></div>`:`<div class="learning-external-video">${caption}<a class="btn btn-dark" href="${esc(externalVideo)}" target="_blank" rel="noopener noreferrer">Buka video dan panduan ${icon('upRight')}</a></div>`}${video.context?`<p class="video-context">${esc(video.context)}</p>`:''}</section>`;
}
export function learningPanel(entry) {
 const l=entry.learning;
 if(!l||entry.category==='wisata')return '';
 const headings={tari:'Latihan dasar dan konteksnya',musik:'Kenali bunyi dan alatnya',kerajinan:'Latihan bahan dan teknik',permainan:'Persiapan dan cara bermain',kuliner:'Kenali bahan dan prosesnya',wisata:'Siapkan kunjunganmu'};
 const steps=(entry.steps?.length?entry.steps:Array.isArray(l.steps)?l.steps:[]).filter(s=>s.title&&s.body);
 const details=[['Pemain',l.players],[entry.category==='kuliner'?'Bahan dan alat':entry.category==='kerajinan'?'Bahan dan alat latihan':'Perlengkapan',l.equipment]].filter(([,v])=>textList(v).length);
 const checks=textList(l.checks);
 const troubleshooting=Array.isArray(l.troubleshooting)?l.troubleshooting.filter(item=>item&&typeof item.problem==='string'&&typeof item.solution==='string'):[];
 const feedback=`${checks.length?`<div class="learning-checks"><h3>${entry.category==='kuliner'?'Periksa hasilnya':'Cek hasil latihanmu'}</h3><ul>${checks.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div>`:''}${troubleshooting.length?`<div class="learning-troubleshooting"><h3>Kalau hasilnya belum sesuai</h3><dl>${troubleshooting.map(item=>`<div><dt>${esc(item.problem)}</dt><dd>${esc(item.solution)}</dd></div>`).join('')}</dl></div>`:''}`;
 return `<section class="learning-section" aria-label="Belajar ${esc(entry.title)}"><div class="learning-heading"><span class="surface-icon">${icon(entry.category==='wisata'?'compass':entry.category==='permainan'?'game':'book')}</span><div><span class="eyebrow">${entry.category==='wisata'?'PANDUAN KUNJUNGAN':'RUANG BELAJAR'}</span><h2>${esc(headings[entry.category]||'Mulai belajar')}</h2></div></div>${l.overview?`<p>${esc(l.overview)}</p>`:''}${details.length?`<dl class="learning-details">${details.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${textList(value).map(esc).join(' · ')}</dd></div>`).join('')}</dl>`:''}${steps.length?`<ol class="learning-steps">${steps.map((s,i)=>`<li><span class="step-number">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div></li>`).join('')}</ol>`:''}${textList(l.rules).length?`<div class="learning-rules"><h3>Aturan yang perlu disepakati</h3><ul>${textList(l.rules).map(r=>`<li>${esc(r)}</li>`).join('')}</ul></div>`:''}${feedback}${textList(l.notes).length?`<div class="learning-notes">${icon('info')}<div>${textList(l.notes).map(n=>`<p>${esc(n)}</p>`).join('')}</div></div>`:''}</section>`;
}
export function locationPanel(entry) {
 if(entry.category!=='wisata')return '';
 const query=entry.mapQuery||[entry.title,entry.location].filter(Boolean).join(', ');
 const url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
 return `<section class="material-location" aria-label="Lokasi ${esc(entry.title)}"><span class="surface-icon">${icon('pin')}</span><div><span class="eyebrow">LOKASI</span><h2>${esc(entry.title)}</h2><p>${esc(entry.location)}</p><a class="btn btn-dark" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Buka lokasi di Google Maps ${icon('upRight')}</a></div></section>`;
}
export {youtubeId} from './components.js?v=6c7671c459';
