/* v24: compact Whole trip list + Copy itinerary (whole trip, plain text) */
(function(){
const days=()=>tripDates();
const planList=day=>D().plans.filter(p=>p.date===day&&(!window.__q31||window.__q31.visible(p))).sort(sortTime);
const whoNames=p=>{if(isAll(p))return '';const n=p.who.map(id=>first(pName(id)));return n.length<=3?n.join(' + '):n.slice(0,2).join(' + ')+' +'+(n.length-2)};
const dayLabel=(day,i)=>`Day ${i+1} · ${displayDate(day).replace(',','')}`;
const endTxt=p=>p.end&&!p.note||p.note&&p.end?prettyTime(p.end):'';

function row(p,day){const r0=row0(p,day);return `<div class="q31-wk">${r0}<button type="button" class="q31-sw" data-act="q31-replace" data-id="${p.id}" aria-label="Replace ${esc(p.name)}" title="Replace with…">⇄</button></div>`}
function row0(p,day){
 const t=p.start?prettyTime(p.start):'Anytime',e=p.start&&p.end?prettyTime(p.end):'';
 const sub=[p.area,p.place,whoNames(p),p.notes].filter(Boolean).join(' · ');
 return `<button type="button" class="cl-row${p.tent?' tent':''}${p.note?' note':''}" data-act="open-day" data-date="${day}" data-id="${p.id}"><span class="cl-t"><span class="cl-t1${p.start?'':' any'}">${esc(t)}</span>${e?`<span class="cl-t2">${esc(e)}</span>`:''}</span><span class="cl-m"><span class="cl-n">${esc(p.name)}${p.tent?' <span class="cl-q" title="Tentative">Tentative</span>':''}</span>${sub?`<span class="cl-s">${esc(sub)}</span>`:''}</span></button>`}

function list(){
 const ds=days();
 return (window.__q31?window.__q31.bar():'')+`<div class="cl-tools"><button type="button" class="small-btn" data-act="copy-itin">Copy itinerary</button></div>`+ds.map((day,i)=>{
  const pl=planList(day);
  return `<section class="cl-day"><div class="cl-head"><strong>${esc(dayLabel(day,i))}</strong><button type="button" class="edit-link" data-act="new-plan" data-date="${day}">+ add</button></div>${pl.length?`<div class="cl-rows">${pl.map(p=>row(p,day)).join('')}</div>`:(window.__q31?'':`<div class="cl-empty">Nothing planned yet</div>`)}${window.__q31?window.__q31.weekGaps(day):''}</section>`}).join('')}

{const _t=window.trip;if(typeof _t==='function')window.trip=function(){
 let h=_t.apply(this,arguments);
 if(U.view!=='week'||typeof h!=='string')return h;
 let first1=true;
 return h.replace(/<section class="week-day">[\s\S]*?<\/section>/g,()=>{if(first1){first1=false;return list()}return ''})}}

/* plain text for the whole trip */
function itineraryText(){
 const t=D().trip,ds=days(),title=t.name||t.city||'Trip',range=ds.length?`${displayDate(ds[0])} to ${displayDate(ds[ds.length-1])}`:'';
 const out=[title+(range?'\n'+range:''),''];
 ds.forEach((day,i)=>{
  out.push(dayLabel(day,i));
  const pl=D().plans.filter(p=>p.date===day).sort(sortTime);
  if(!pl.length){out.push('Nothing planned yet')}
  pl.forEach(p=>{
   const time=p.start?prettyTime(p.start)+(p.end&&!p.note?'–'+prettyTime(p.end):p.end&&p.note?'–'+prettyTime(p.end):''):'Anytime';
   const bits=[p.area,p.place,whoNames(p)].filter(Boolean).join(', ');
   let line=`${time} - ${p.name}`;
   if(p.note)line+=' (note)';
   if(p.tent)line+=' (tentative)';
   if(bits)line+=` (${bits})`;
   out.push(line);
   if(p.notes)out.push('   '+p.notes);
  });
  out.push('');
 });
 return out.join('\n').replace(/\n+$/,'\n')}
window.__itineraryText=itineraryText;

async function copyText(s){
 try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(s);return true}}catch(e){}
 try{const ta=document.createElement('textarea');ta.value=s;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok}catch(e){return false}}

window.addEventListener('click',async e=>{
 const b=e.target&&e.target.closest?e.target.closest('[data-act="copy-itin"],[data-act="open-day"]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(b.dataset.act==='copy-itin'){const ok=await copyText(itineraryText());toast(ok?'Itinerary copied':'Couldn’t copy. Select and copy it manually.');return}
 U.view='day';U.date=b.dataset.date;if(b.dataset.id){U.open=U.open||{};U.open[b.dataset.id]=true}render();
 setTimeout(()=>{const el=document.querySelector('.event.open')||document.querySelector('.agenda-head');if(el&&el.scrollIntoView)el.scrollIntoView({block:'center'})},60)
},true);
})();
