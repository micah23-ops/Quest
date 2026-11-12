/* v29: tap a category to change it, move hotels to Trip details, Tentative when scheduling an idea */
(function(){
const Q=()=>window.__q28||{};
const CATS=['Food','Cafes','Experience','Sights','Shopping','Nightlife','Other'];
const save=()=>{A.dirty=true;clearTimeout(A.deb);A.deb=setTimeout(push,350)};
const stayish=t=>{const q=Q();return !!(q.STAYRX&&q.STAYRX.test(String(t||'')))};
const grpOf=id=>{try{const f=findOpt(id);return f?f.g:null}catch(e){return null}};

/* a visible "Essentials" button on hotel-like options and ideas */
{const _o=window.optRow;if(typeof _o==='function')window.optRow=function(o){
 let h=_o.apply(this,arguments);if(typeof h!=='string'||!o)return h;
 const g=grpOf(o.id);if(!(stayish(o.name)||(g&&stayish(g.name))))return h;
 const b=`<button type="button" class="pill q29-stay" data-act="q29-stay" data-kind="opt" data-id="${o.id}">→ Essentials</button>`;
 return h.replace('</div><div class="vote"',b+'</div><div class="vote"')}}
{const _s=window.shortRow;if(typeof _s==='function')window.shortRow=function(i){
 let h=_s.apply(this,arguments);if(typeof h!=='string'||!i)return h;
 if(!(i.category==='Stay'||stayish(i.name)))return h;
 return h.replace('→ Itinerary</button></div>','→ Itinerary</button><button type="button" class="mv q29-stay" data-act="q29-stay" data-kind="short" data-id="'+i.id+'">→ Essentials</button></div>')}}

/* Tentative when scheduling an idea or option */
{const _f=window.schedForm;if(typeof _f==='function')window.schedForm=function(k,o){
 const h=_f.apply(this,arguments);
 return h.replace('<button type="button" class="primary" data-act="sched-save">',`<label class="q23-qs"><input type="checkbox" id="s_${o.id}_tent" data-keep><span>Tentative</span></label><button type="button" class="primary" data-act="sched-save">`)}}
{const _s=window.saveSched;if(typeof _s==='function')window.saveSched=function(){
 const s=U.sched,cb=s&&document.getElementById('s_'+s.id+'_tent'),on=!!(cb&&cb.checked),n=D().plans.length;
 const r=_s.apply(this,arguments);
 const pl=D().plans;if(on&&pl.length>n){pl[pl.length-1].tent=true;save();render()}
 return r}}


/* ideas created from other places get a sensible category from their name */
const LEG={Restaurant:'Food',Cafe:'Cafes',Class:'Experience',Activity:'Other'};
function fixNew(name){const f=window[name];if(typeof f!=='function')return;window[name]=function(){
 const before=new Set((D().shortlist||[]).map(x=>x.id));const r=f.apply(this,arguments);
 try{const q=Q();(D().shortlist||[]).forEach(it=>{if(before.has(it.id))return;const g=q.catOf?q.catOf(it.name):'Other';
  const nc=g!=='Other'?g:(LEG[it.category]||it.category||'Other');if(nc!==it.category){it.category=nc;save()}});render()}catch(e){}
 return r}}
fixNew('optToShort');fixNew('shortQuick');

/* clicks */
function closeCats(){document.querySelectorAll('.q29-cats').forEach(n=>n.remove())}
window.addEventListener('click',e=>{
 const t=e.target;if(!t||!t.closest)return;
 const chip=t.closest('.q29-cat');
 if(chip){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const id=chip.dataset.id,v=chip.dataset.v,it=D().shortlist.find(x=>x.id===id);closeCats();if(!it||it.category===v)return;
  const prev=it.category;mut(()=>{it.category=v});toastUndo('Category: '+v,()=>mut(()=>{it.category=prev}));return}
 const tag=t.closest('.short-wrap .sl-tags .tag:not(.area):not(.q27-n)');
 if(tag){const w=tag.closest('.short-wrap'),el=w&&w.querySelector('[data-id]'),id=el&&el.getAttribute('data-id'),it=id&&D().shortlist.find(x=>x.id===id);
  if(it){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
   const had=w.querySelector('.q29-cats');closeCats();if(had)return;
   const box=document.createElement('div');box.className='q29-cats';
   box.innerHTML=CATS.map(c=>`<button type="button" class="q29-cat${(it.category||'')===c?' on':''}" data-id="${id}" data-v="${c}">${c}</button>`).join('');
   tag.closest('.sl-tags').insertAdjacentElement('afterend',box);return}}
 if(!t.closest('.q29-cats'))closeCats();
 const b=t.closest('[data-act="q29-stay"]');if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const q=Q();if(!q.putStay)return;const kind=b.dataset.kind,id=b.dataset.id;
 if(kind==='opt'){let f=null;try{f=findOpt(id)}catch(x){}if(!f)return;const o=f.o,prevSt=o.status;let r;
  mut(()=>{r=q.putStay({name:o.name,link:o.link,addr:'',area:o.area});o.status='Booked'});
  toastUndo('Saved to Essentials',()=>mut(()=>{q.restoreStay(r.prev);o.status=prevSt}));return}
 const d=D(),i=d.shortlist.findIndex(x=>x.id===id);if(i<0)return;const it=d.shortlist[i];let r;
 mut(()=>{r=q.putStay({name:it.name,link:it.link,addr:it.place,area:it.area});d.shortlist.splice(i,1)});
 toastUndo('Moved to Essentials',()=>mut(()=>{q.restoreStay(r.prev);D().shortlist.splice(Math.min(i,D().shortlist.length),0,it)}))
},true);
})();
