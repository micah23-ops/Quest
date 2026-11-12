/* v44: card tidy-up (one open at a time, tap to close, rename pencil, notes preview) + link existing ideas to map places */
(function(){
if(window.__q44)return;window.__q44=1;
const D_=()=>{try{return D()}catch(e){return null}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const kindOf=id=>{const L=D_();if(!L)return '';return L.plans.some(p=>p.id===id)?'p':L.shortlist.some(p=>p.id===id)?'s':''};
const fire=el=>el&&el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
/* plans: only one open card; tap anywhere on an open card closes it */
document.addEventListener('click',e=>{
 const t=e.target;if(!t||!t.closest)return;
 const h=t.closest('[data-act="toggle-ev"]');
 if(h){const id=h.dataset.id;if(id&&!U.open[id]&&kindOf(id)==='p')Object.keys(U.open).forEach(k=>{if(k!==id&&U.open[k]&&kindOf(k)==='p')delete U.open[k]});return}
 const c=t.closest('.q41-card');
 if(c&&!t.closest('a,button,input,textarea,select,label,img,[data-q41view],[data-attview],.q41-head')){const hd=c.querySelector('.q41-head');if(hd)hd.click()}
},true);
/* ideas: only one open card; tap anywhere on an open card closes it */
document.addEventListener('click',e=>{
 const t=e.target;if(!t||!t.closest)return;
 const w=t.closest('.short-wrap');if(!w)return;
 const body=t.closest('.sl-body');
 if(body&&!t.closest('a,button,input')){
  if(!w.classList.contains('q32-open'))document.querySelectorAll('.short-wrap.q32-open').forEach(o=>{if(o!==w)fire(o.querySelector('.sl-body'))});
  return}
 if(w.classList.contains('q32-open')&&!t.closest('a,button,input,textarea,select,label,.q37-edit,.ef,.q44cand')){fire(w.querySelector('.sl-body'))}
},true);
/* leaving a page / day closes open cards */
let lastKey='';
function pageKey(){return [U.tab,U.date,U.view].join('|')}
/* rename pencil on ideas */
function rename(id,title){
 const L=D_(),it=L&&L.shortlist.find(x=>x.id===id);if(!it||!title)return;
 title.innerHTML=`<input class="q44rn" value="${esc(it.name)}" maxlength="120" aria-label="Idea name"/>`;
 const i=title.querySelector('input');i.focus();i.select();let done=false;
 const fin=ok=>{if(done)return;done=true;const v=i.value.trim();if(ok&&v&&v!==it.name)mut(()=>{const x=D().shortlist.find(y=>y.id===id);if(x)x.name=v});else render()};
 i.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();fin(true)}if(ev.key==='Escape'){ev.preventDefault();fin(false)}});
 i.addEventListener('blur',()=>fin(true));
}
/* link existing ideas to map places, one at a time, in the background */
const LK={};let queue=[],running=false;
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9À-￿\s]/g,' ').replace(/\s+/g,' ').trim();
function good(name,p){const a=norm(name),b=norm(p.name);if(!a||!b)return false;if(a===b||b.includes(a)||a.includes(b))return true;const at=a.split(' ');return at.length>1&&at.every(t=>b.includes(t))}
function apply(id,p){mut(()=>{const x=D().shortlist.find(y=>y.id===id);if(!x)return;x.place_id=p.placeId||null;x.lat=p.lat==null?null:p.lat;x.lng=p.lng==null?null:p.lng;x.address=p.address||null;x.maps_url=p.mapsUrl||null;if(!x.place)x.place=p.address||''});delete LK[id]}
function repaint(){try{render()}catch(e){}}
async function run(){
 if(running)return;running=true;const Q=window.__q43;
 while(queue.length){
  const id=queue.shift(),L=D_(),it=L&&L.shortlist.find(x=>x.id===id);
  if(!it||it.lat!=null){delete LK[id];continue}
  if(!Q){LK[id]={st:'err'};continue}
  const r=await Q.call(Object.assign({action:'import',query:it.name},Q.ctx()));
  if(r.error==='limit'){LK[id]={st:'limit'};queue.forEach(q=>LK[q]={st:'limit'});queue=[];repaint();break}
  if(r.error==='not_allowed'){LK[id]={st:'err'};queue.forEach(q=>LK[q]={st:'err'});queue=[];repaint();break}
  if(r.error){LK[id]={st:'err'};repaint();continue}
  const ps=r.places||[];
  if(!ps.length){LK[id]={st:'none'};repaint()}
  else if(good(it.name,ps[0])){apply(id,ps[0])}
  else{LK[id]={st:'check',c:ps.slice(0,4)};repaint()}
  await new Promise(z=>setTimeout(z,r.cached?150:1200));
 }
 running=false}
function enqueue(id){if(queue.includes(id)||(LK[id]&&LK[id].st==='busy'))return;LK[id]={st:'busy'};queue.push(id);repaint();run()}
const LBL={busy:'Finding…',check:'Check match',none:'Not found · retry',err:'Retry',limit:'Limit reached today'};
function decorate(){
 const L=D_();if(!L)return;
 document.querySelectorAll('.short-wrap').forEach(w=>{
  const row=w.querySelector('.sl-row');if(!row)return;const ck=row.querySelector('.check-done');const id=ck&&ck.dataset.id;const it=id&&L.shortlist.find(x=>x.id===id);if(!it)return;
  const tags=row.querySelector('.sl-tags'),title=row.querySelector('.sl-title');
  if(title&&!title.querySelector('.q44pen')&&!title.querySelector('input')){const b=document.createElement('button');b.type='button';b.className='q44pen';b.dataset.q44='rename';b.dataset.id=id;b.setAttribute('aria-label','Rename');b.textContent='✎';title.appendChild(b)}
  if(tags&&it.lat==null&&!tags.querySelector('.q44ln')){const st=LK[id];const b=document.createElement('button');b.type='button';b.className='q44ln'+(st?' '+st.st:'');b.dataset.q44=st&&st.st==='check'?'check':'link';b.dataset.id=id;b.disabled=!!(st&&(st.st==='busy'||st.st==='limit'));b.textContent=st?LBL[st.st]:'📍 Link to map';tags.appendChild(b)}
  if(it.notes&&tags&&!row.querySelector('.q44nt')){const d=document.createElement('div');d.className='q44nt';d.textContent=String(it.notes).split('\n')[0].slice(0,90);tags.after(d)}
  const st=LK[id];w.querySelectorAll('.q44cand').forEach(x=>x.remove());
  if(st&&st.st==='check'&&st.open){const p=document.createElement('div');p.className='q44cand';
   p.innerHTML='<div class="q44h">Which one is it?</div>'+st.c.map((c,n)=>`<button type="button" data-q44="pick" data-id="${esc(id)}" data-n="${n}"><b>${esc(c.name)}</b><span>${esc(c.address||'')}</span></button>`).join('')+`<button type="button" class="q44skip" data-q44="skip" data-id="${esc(id)}">None of these</button>`;w.appendChild(p)}
 })}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-q44]');if(!b)return;
 e.preventDefault();e.stopPropagation();const id=b.dataset.id,a=b.dataset.q44;
 if(a==='rename'){rename(id,b.closest('.sl-title'));return}
 if(a==='link'){enqueue(id);return}
 if(a==='check'){const s=LK[id];if(s){s.open=!s.open;repaint()}return}
 if(a==='pick'){const s=LK[id],c=s&&s.c[+b.dataset.n];if(c)apply(id,c);return}
 if(a==='skip'){delete LK[id];repaint();return}
},true);
{const _r=window.render;if(typeof _r==='function')window.render=function(){
 try{const k=pageKey();if(lastKey&&k!==lastKey){Object.keys(U.open).forEach(x=>{if(kindOf(x)==='p')delete U.open[x]});if(lastKey.split('|')[0]==='shortlist'&&k.split('|')[0]!=='shortlist')document.querySelectorAll('.short-wrap.q32-open').forEach(o=>fire(o.querySelector('.sl-body')))}lastKey=k}catch(e){}
 const v=_r.apply(this,arguments);try{decorate()}catch(e){}return v}}
})();
