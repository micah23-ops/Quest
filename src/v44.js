/* v44: card tidy-up (one open at a time, tap to close, tap outside to close, rename pencil, notes preview)
   + always-visible "location" control on ideas (fixes: once a pin was set — even a wrong one — there was
   no way back into the map popup to fix it, because the old button only showed up when no pin existed yet) */
(function(){
if(window.__q44)return;window.__q44=1;
const D_=()=>{try{return D()}catch(e){return null}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const kindOf=id=>{const L=D_();if(!L)return '';return L.plans.some(p=>p.id===id)?'p':L.shortlist.some(p=>p.id===id)?'s':''};
const fire=el=>el&&el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
const okLatLng=it=>it&&it.lat!=null&&it.lng!=null&&it.lat!==''&&it.lng!==''&&isFinite(it.lat)&&isFinite(it.lng);
/* plans: only one open card; tap anywhere on an open card closes it; tap anywhere else closes it too */
document.addEventListener('click',e=>{
 const t=e.target;if(!t||!t.closest)return;
 const h=t.closest('[data-act="toggle-ev"]');
 if(h){const id=h.dataset.id;if(id&&!U.open[id]&&kindOf(id)==='p')Object.keys(U.open).forEach(k=>{if(k!==id&&U.open[k]&&kindOf(k)==='p')delete U.open[k]});return}
 const c=t.closest('.q41-card');
 if(c){
  if(!t.closest('a,button,input,textarea,select,label,img,[data-q41view],[data-attview],.q41-head')){const hd=c.querySelector('.q41-head');if(hd)hd.click()}
  return;
 }
 if(t.closest('#q40,#q49m,#q49p,#q50s,.q48bar'))return; /* these overlays handle their own close */
 let closed=false;
 Object.keys(U.open).forEach(k=>{if(U.open[k]&&kindOf(k)==='p'){delete U.open[k];closed=true}});
 if(closed)render();
},true);
/* ideas: only one open card; tap anywhere on an open card closes it */
document.addEventListener('click',e=>{
 const t=e.target;if(!t||!t.closest)return;
 const w=t.closest('.short-wrap');if(!w)return;
 const body=t.closest('.sl-body');
 if(body&&!t.closest('a,button,input')){
  if(!w.classList.contains('q32-open'))document.querySelectorAll('.short-wrap.q32-open').forEach(o=>{if(o!==w)fire(o.querySelector('.sl-body'))});
  return}
 if(w.classList.contains('q32-open')&&!t.closest('a,button,input,textarea,select,label,.q37-edit,.ef')){fire(w.querySelector('.sl-body'))}
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
/* the one always-there "location" control: "+ Add location" when unset, the place name (tappable) once set.
   Either way it's wired by v47/v50's deco() to open the same map popup (search + confirm, change, unlink). */
function decorate(){
 const L=D_();if(!L)return;
 const Q37=window.__q37;
 document.querySelectorAll('.short-wrap').forEach(w=>{
  const row=w.querySelector('.sl-row');if(!row)return;const ck=row.querySelector('.check-done');const id=ck&&ck.dataset.id;const it=id&&L.shortlist.find(x=>x.id===id);if(!it)return;
  const tags=row.querySelector('.sl-tags'),title=row.querySelector('.sl-title'),body=row.querySelector('.sl-body');
  if(title&&!title.querySelector('.q44pen')&&!title.querySelector('input')){const b=document.createElement('button');b.type='button';b.className='q44pen';b.dataset.q44='rename';b.dataset.id=id;b.setAttribute('aria-label','Rename');b.textContent='✎';title.appendChild(b)}
  if(tags){
   let ln=tags.querySelector('.q44ln');
   if(!ln){ln=document.createElement('button');ln.type='button';ln.className='q44ln';tags.appendChild(ln)}
   const set=okLatLng(it);
   const label=set?('📍 '+String(it.place||it.address||'Linked place').split(',')[0].slice(0,40)):'+ Add location';
   if(ln.textContent!==label)ln.textContent=label;
   ln.classList.toggle('set',set);
  }
  if(it.notes&&tags&&!row.querySelector('.q44nt')){const d=document.createElement('div');d.className='q44nt';d.textContent=String(it.notes).split('\n')[0].slice(0,90);tags.after(d)}
  /* always-visible "+ Add to day" (or "On <date>" once scheduled) — the only default action besides vote */
  if(body&&Q37){
   let db=w.querySelector('.q44day');
   if(!db){db=document.createElement('button');db.type='button';db.className='q44day small-btn';body.appendChild(db)}
   let pl=[];try{pl=Q37.planOf(it)||[]}catch(e){}
   if(pl.length){
    db.removeAttribute('data-act');db.removeAttribute('data-kind');db.removeAttribute('data-id');db.dataset.q37day=pl[0].date;
    let label='On ';try{label='On '+Q37.when(pl[0])}catch(e){label='On the itinerary'}
    if(db.textContent!==label)db.textContent=label;db.classList.add('on')
   }else{
    db.removeAttribute('data-q37day');db.dataset.act='sched';db.dataset.kind='short';db.dataset.id=id;db.classList.remove('on');
    if(db.textContent!=='+ Add to day')db.textContent='+ Add to day'
   }
  }
 })}
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('[data-q44]');if(!b)return;
 e.preventDefault();e.stopPropagation();const id=b.dataset.id,a=b.dataset.q44;
 if(a==='rename'){rename(id,b.closest('.sl-title'));return}
},true);
{const _r=window.render;if(typeof _r==='function')window.render=function(){
 try{const k=pageKey();if(lastKey&&k!==lastKey){Object.keys(U.open).forEach(x=>{if(kindOf(x)==='p')delete U.open[x]});if(lastKey.split('|')[0]==='shortlist'&&k.split('|')[0]!=='shortlist')document.querySelectorAll('.short-wrap.q32-open').forEach(o=>fire(o.querySelector('.sl-body')))}lastKey=k}catch(e){}
 const v=_r.apply(this,arguments);try{decorate()}catch(e){}return v}}
})();
