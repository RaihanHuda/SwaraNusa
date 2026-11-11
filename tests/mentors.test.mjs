import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {teachersForEntry,teacherSidebar,teacherDirectory,teacherCard,whatsappUrl} from '../public/mentors.js';
const catalogue=JSON.parse(await readFile(new URL('../public/data.json',import.meta.url),'utf8'));
const {profiles}=JSON.parse(await readFile(new URL('../public/mentors.json',import.meta.url),'utf8'));

test('teaching links only appear for art materials and select the clicked material',()=>{
 for(const entry of catalogue.entries){
  const supported=['tari','musik','kerajinan'].includes(entry.category);
  assert.equal(Boolean(teacherSidebar(entry)),supported,entry.id);
  const matches=teachersForEntry(profiles,entry);
  if(supported)assert.ok(matches.length>=1&&matches.length<=2,entry.id);else assert.equal(matches.length,0,entry.id);
  for(const profile of matches){assert.ok(profile.entryIds.includes(entry.id));assert.equal(new URL(whatsappUrl(profile,entry)).pathname,'/6287731119997');}
  if(supported)assert.ok(teacherSidebar(entry).includes('materi='+entry.id),entry.id);
 }
 const saman=catalogue.entries.find(e=>e.id==='saman');
 const html=teacherDirectory(catalogue,profiles,new URLSearchParams('materi=saman'));
 assert.match(html,/Kak Rina/);assert.match(html,/teacher-selected-topic">Saman/);
 assert.ok(html.includes(encodeURIComponent('saya ingin belajar Saman')));
 assert.ok(!html.includes('/request?'));
 assert.ok(!teacherDirectory(catalogue,profiles,new URLSearchParams('kategori=permainan')).includes('teacher-contact" href='));
 assert.equal(teachersForEntry([{...profiles[0],entryIds:['tari-piring']}],saman).length,0);
});

test('WhatsApp uses a valid mobile number and encodes the chosen topic without sending it',()=>{
 const profile={name:'Kak Rina',whatsapp:'+62 877-3111-9997'};
 const url=new URL(whatsappUrl(profile,{title:'Saman & gerak "A"'}));
 assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/6287731119997');
 assert.equal(url.searchParams.get('text'),'Halo Kak Rina, saya ingin belajar Saman & gerak "A". Boleh tanya jadwal dan biaya belajarnya?');
 for(const whatsapp of ['', 'javascript:alert(1)', '628123?bad=1', 'nomor-contoh'])assert.equal(whatsappUrl({...profile,whatsapp}), '');
 const invalid=teacherCard({...profiles[0],whatsapp:'',name:'<script>bad</script>'});
 assert.ok(!invalid.includes('href="https://wa.me'));assert.match(invalid,/disabled/);assert.match(invalid,/&lt;script&gt;/);assert.ok(!invalid.includes('<script>'));
 assert.doesNotMatch(teacherCard(profiles[0]),/Profil contoh|kontak demonstrasi/);
 assert.doesNotMatch(teacherDirectory(catalogue,profiles,new URLSearchParams('materi=saman')),/teacher-demo|profil contoh/);
 assert.match(teacherCard({...profiles[0],image:'/assets/foto-pengajar.jpg'}),/src="\/assets\/foto-pengajar.jpg"/);
 assert.match(teacherCard({...profiles[0],image:'javascript:bad'}),/src="\/assets\/pengajar-rina.svg"/);
});
