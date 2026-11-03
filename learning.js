import {esc,icon,youtubeId} from './components.js?v=2f9c0f752e';

const textList=value=>Array.isArray(value)?value.filter(x=>typeof x==='string'):typeof value==='string'?[value]:[];
export function learningPanel(entry) {
 const l=entry.learning;
 if(!l)return '';
 const headings={tari:'Mulai belajar tari',musik:'Dengarkan dan pelajari',kerajinan:'Kenali proses pembuatannya',permainan:'Aturan dan cara bermain',kuliner:'Bahan dan cara mengolah',wisata:'Siapkan kunjunganmu'};
 const video=l.video,id=youtubeId(video?.url);
 let externalVideo='';
 try { const url=new URL(video?.url); if(url.protocol==='https:'&&['www.abc.net.au','abc.net.au'].includes(url.hostname))externalVideo=url.href; } catch {}
 const labels={tutorial:'Video tutorial',demonstrasi:'Video demonstrasi',pertunjukan:'Video pertunjukan'};
 const steps=Array.isArray(l.steps)?l.steps.filter(s=>s.title&&s.body):[];
 const details=[['Pemain',l.players],['Perlengkapan',l.equipment]].filter(([,v])=>textList(v).length);
 return `<section class="learning-section" aria-label="Belajar ${esc(entry.title)}"><div class="learning-heading"><span class="surface-icon">${icon(entry.category==='wisata'?'compass':entry.category==='permainan'?'game':'book')}</span><div><span class="eyebrow">${entry.category==='wisata'?'PANDUAN KUNJUNGAN':'RUANG BELAJAR'}</span><h2>${esc(headings[entry.category]||'Mulai belajar')}</h2></div></div>${l.overview?`<p>${esc(l.overview)}</p>`:''}${details.length?`<dl class="learning-details">${details.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${textList(value).map(esc).join(' · ')}</dd></div>`).join('')}</dl>`:''}${id?`<div class="learning-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${esc(video.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe><div class="video-caption"><span class="video-kind">${esc(labels[video.type]||'Video rujukan')}</span><h3>${esc(video.title)}</h3>${video.channel?`<p>Kanal: ${esc(video.channel)}</p>`:''}<a href="${esc(video.url)}" target="_blank" rel="noopener noreferrer">Buka di YouTube ${icon('upRight')}</a></div></div>`:externalVideo?`<div class="learning-external-video"><span class="video-kind">${esc(labels[video.type]||'Video rujukan')}</span><h3>${esc(video.title)}</h3><p>${esc(video.channel)}</p><a class="btn btn-dark" href="${esc(externalVideo)}" target="_blank" rel="noopener noreferrer">Buka video dan panduan ${icon('upRight')}</a></div>`:''}${steps.length?`<ol class="learning-steps">${steps.map((s,i)=>`<li><span class="step-number">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div></li>`).join('')}</ol>`:''}${textList(l.rules).length?`<div class="learning-rules"><h3>Aturan yang perlu disepakati</h3><ul>${textList(l.rules).map(r=>`<li>${esc(r)}</li>`).join('')}</ul></div>`:''}${textList(l.notes).length?`<div class="learning-notes">${icon('info')}<div>${textList(l.notes).map(n=>`<p>${esc(n)}</p>`).join('')}</div></div>`:''}</section>`;
}

export {youtubeId} from './components.js?v=2f9c0f752e';
