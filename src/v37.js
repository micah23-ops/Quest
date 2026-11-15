/* v37 - Ideas as a decision list: stars first, tight rows, votes + Add-to-day always visible, tap a row to edit link/location/area, planned ideas tucked away, area notes */
(function(){
try{localStorage.setItem('quest_ideas_plan','0')}catch(e){}
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9ㄱ-힝]+/g,' ').trim();
const dd=d=>{try{return displayDate(d)}catch(e){return d}};
const tt=t=>{try{return prettyTime(t)}catch(e){return t}};
const when=p=>dd(p.date)+(p.start?' · '+tt(p.start):'');
const addMin=(t,m)=>{const x=/^(\d{1,2}):(\d{2})/.exec(t||'');if(!x)return '';let v=(+x[1])*60+(+x[2])+m;if(v>=1440)v=1439;return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')};
const planOf=it=>{const n=norm(it.name),l=String(it.link||'').trim();return (D().plans||[]).filter(p=>!p.note&&((l&&p.link&&p.link===l)||(n&&norm(p.name)===n))).sort((a,b)=>(a.date+(a.start||'')).localeCompare(b.date+(b.start||'')))};
const starred=n=>!!(n.querySelector&&n.querySelector('.star.on'));
const isWrap=n=>n.classList&&n.classList.contains('short-wrap');
const isBox=n=>n.classList&&n.classList.contains('q27-cg');

{const _sl=window.shortlist;if(typeof _sl==='function')window.shortlist=function(){
 const html=_sl.apply(this,arguments);if(typeof html!=='string')return html;
 const t=document.createElement('template');t.innerHTML=html;const c=t.content;
 const items=D().shortlist||[],byId=id=>items.find(x=>x.id===id);
 const idOf=w=>{const e=w.querySelector('.check-done');return e?e.dataset.id:''};
 const pb=c.querySelector('[data-act="q27-plan"]');if(pb)pb.remove();
 const sub=c.querySelector('.section-kicker');if(sub)sub.textContent='Collect here, then add to a day. ★ = must-do.';
 c.querySelectorAll('.short-wrap').forEach(w=>{const it=byId(idOf(w));if(!it)return;
  const pl=planOf(it);const ab=w.querySelector('.o3-acts [data-act="sched"]');if(ab)ab.textContent='+ Add to day';
  if(pl.length){w.dataset.q37p='1';if(ab){const nb=document.createElement('button');nb.type='button';nb.className=ab.className;nb.setAttribute('data-q37day',pl[0].date);nb.setAttribute('aria-label','Show on the itinerary');nb.innerHTML='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17M9 15l2 2 4-4"/></svg><span>On '+esc(when(pl[0]))+'</span>';ab.replaceWith(nb)}}
  const ed=document.createElement('div');ed.className='q37-edit';
  const f=(k,l,ph,v)=>`<label>${l}<input data-q37="${k}" data-id="${esc(it.id)}" value="${esc(v||'')}" placeholder="${ph}" autocomplete="off" autocapitalize="off"/></label>`;
  ed.innerHTML=f('link','Link','Paste a link',it.link)+`<div class="q37-two">`+f('place','Address','Address or place',it.place)+f('area','Area','Seongsu',it.area)+`</div><label>Notes<textarea data-q37="notes" data-id="${esc(it.id)}" rows="2" placeholder="Anything to remember">${esc(it.notes||'')}</textarea></label>`;
  const row=w.querySelector('.sl-row');if(row)row.appendChild(ed)});
 if(!U.q37known){U.q37known=new Set(items.map(x=>x.id))}else{const fresh=items.filter(x=>!U.q37known.has(x.id));if(fresh.length)U.q37new=fresh[fresh.length-1].id;items.forEach(x=>U.q37known.add(x.id))}
 const nw=U.q37new&&items.some(x=>x.id===U.q37new)?U.q37new:'';
 if(nw)c.querySelectorAll('.short-wrap').forEach(w=>{if(idOf(w)===nw)w.dataset.q37n='1'});
 const list=c.querySelector('.short-list');
 if(list){
  const planned=[];
  const conts=[list].concat([...list.querySelectorAll('.area-group')]);
  conts.forEach(cont=>{
   const kids=[...cont.children].filter(n=>isWrap(n)||isBox(n));
   const keep=[];
   kids.forEach(n=>{if(isWrap(n)&&n.dataset.q37p==='1'){planned.push(n)}else keep.push(n)});
   const top=keep.filter(starred),rest=keep.filter(n=>!starred(n));
   top.concat(rest).forEach(n=>cont.appendChild(n));
   const nn=keep.find(n=>n.dataset&&n.dataset.q37n==='1');if(nn)cont.insertBefore(nn,keep.length?[...cont.children].find(x=>isWrap(x)||isBox(x)):null);
   if(cont!==list){
    const cnt=cont.querySelector('.area-n');if(cnt)cnt.textContent=String(keep.length);
    const nm=(cont.querySelector('.area-name')||{}).textContent||'';
    if(!keep.length){cont.remove();return}
    if(!/^(no area|other|unsorted|none)$/i.test(nm.trim())){
     const ps=(D().plans||[]).filter(p=>!p.note&&norm(p.area)&&norm(p.area)===norm(nm)).sort((a,b)=>(a.date+(a.start||'')).localeCompare(b.date+(b.start||'')));
     const an=document.createElement('div');an.className='q37-an';
     an.innerHTML=ps.length?`<span>Already planned here:</span> `+ps.map(p=>`<button type="button" data-q37day="${esc(p.date)}">${esc(when(p))} ${esc(p.name)}</button>`).join(''):`<span>Nothing planned here yet</span>`;
     const head=cont.querySelector('.area-head');if(head)head.after(an)}}});
  if(planned.length){
   const d=document.createElement('details');d.className='q37-planned';if(U.q37po)d.setAttribute('open','');
   d.innerHTML=`<summary>Already on itinerary · ${planned.length}</summary>`;planned.forEach(n=>d.appendChild(n));list.after(d)}
 }
 return t.innerHTML}}

/* ---- tap-to-edit fields ---- */
window.addEventListener('change',e=>{const t=e.target,k=t&&t.dataset&&t.dataset.q37;if(!k)return;
 const it=(D().shortlist||[]).find(x=>x.id===t.dataset.id);if(!it)return;
 const v=t.value.trim();if((it[k]||'')===v)return;mut(()=>{it[k]=v});
 if(k==='place'&&v&&!(it.area||'').trim()){const a=areaFrom(v);if(a)mut(()=>{it.area=a})}},true);
function areaFrom(addr){const low=addr.toLowerCase();
 const known=[...new Set((D().shortlist||[]).concat(D().plans||[]).map(x=>String(x.area||'').trim()).filter(Boolean))];
 const k=known.sort((a,b)=>b.length-a.length).find(a=>low.includes(a.toLowerCase()));if(k)return k;
 let m=/([A-Za-z]{3,})[- ](?:dong|gu)\b/i.exec(addr);if(m)return m[1][0].toUpperCase()+m[1].slice(1).toLowerCase();
 m=/([가-힣]{1,6}(?:동|구))/.exec(addr);if(m)return m[1];return ''}
window.addEventListener('keydown',e=>{const t=e.target;if(e.key!=='Enter'||!t||t.tagName!=='INPUT'||!t.dataset||!t.dataset.q37)return;e.preventDefault();
 const all=[...t.closest('.q37-edit').querySelectorAll('input,textarea')],i=all.indexOf(t);if(i<all.length-1)all[i+1].focus();else t.blur()},true);
window.addEventListener('toggle',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('q37-planned'))U.q37po=e.target.open},true);

/* ---- add to a day: day + time + who in one sheet ---- */
let S=null;
const pad2=n=>String(n).padStart(2,'0');
function parseT(s){s=String(s||'').trim().toLowerCase().replace(/\./g,'');if(!s)return '';const m=/^(\d{1,2})(?::?(\d{2}))?\s*(am|pm|a|p)?$/.exec(s);if(!m)return null;let h=+m[1];const mi=m[2]?+m[2]:0,ap=m[3];if(mi>59)return null;if(ap){if(h<1||h>12)return null;if(ap[0]==='p'&&h<12)h+=12;if(ap[0]==='a'&&h===12)h=0}else if(h>23)return null;return pad2(h)+':'+pad2(mi)}
function timeOpts(){let h='';for(let m=360;m<=1410;m+=30){const v=pad2(Math.floor(m/60))+':'+pad2(m%60);h+=`<option value="${v}"${S&&S.start===v?' selected':''}>${esc(tt(v))}</option>`}return h}
function closeDay(){const el=document.getElementById('q37d');if(el)el.remove();S=null}
function paintDay(){const el=document.getElementById('q37d');if(!el||!S)return;
 const it=(D().shortlist||[]).find(x=>x.id===S.id);if(!it){closeDay();return}
 const dates=tripDates(),P=A.people||[];
 el.innerHTML=`<div class="q37d-card" role="dialog" aria-label="Add to a day"><div class="q37d-top"><div><strong class="q37d-date">${esc(dd(S.date))}</strong><div class="q37d-sub">${S.pick?'Pick “'+esc(S.pick.name)+'”. The others go to the archive.':esc(it.name)}</div></div><button type="button" class="q37d-x" data-q37d="x" aria-label="Close">✕</button></div>
 <div class="q37d-l">Day</div><div class="q37d-days">${dates.map(d=>`<button type="button" class="${d===S.date?'on':''}" data-q37d="day" data-v="${esc(d)}">${esc(dd(d))}</button>`).join('')}</div>
 <div class="q37d-l">Time <small>(optional)</small></div><div class="q37d-row"><select id="q37t" aria-label="Time"><option value="">No time</option>${timeOpts()}</select><button type="button" class="${S.tent?'on':''}" data-q37d="tent">Tentative</button></div>
 ${P.length>1?`<div class="q37d-l">Who’s going</div><div class="q37d-days"><button type="button" class="${S.who.length===0?'on':''}" data-q37d="who" data-v="all">Everyone</button>${P.map(p=>`<button type="button" class="${S.who.includes(p.id)?'on':''}" data-q37d="who" data-v="${esc(p.id)}">${esc(first(p.name))}</button>`).join('')}</div>`:''}
 <button type="button" class="primary q37d-go" data-q37d="add">${S.pick?'Pick and add to ':'Add to '}${esc(dd(S.date))}</button></div>`}
function openPick(g,o){closeDay();const dates=tripDates();S={id:g.idea_id,date:dates.includes(U.date)?U.date:dates[0],start:'',tent:false,who:[],pick:{gid:g.id,oid:o.id,name:o.name,link:o.link||'',area:o.area||'',notes:o.notes||''}};const el=document.createElement('div');el.id='q37d';document.body.appendChild(el);paintDay()}
function openPickIdea(it){const g=D().groups.find(x=>x.idea_id===it.id);if(g)openPick(g,{id:'idea',name:it.name,link:it.link||'',area:it.area||'',notes:it.notes||''})}
function openDay(id){closeDay();const dates=tripDates();S={id,date:dates.includes(U.date)?U.date:dates[0],start:'',tent:false,who:[]};
 const el=document.createElement('div');el.id='q37d';document.body.appendChild(el);paintDay()}
function addIt(){const it=(D().shortlist||[]).find(x=>x.id===S.id);if(!it)return closeDay();
 const ti=document.getElementById('q37t'),raw=ti?ti.value:'',st=parseT(raw),date=S.date,src=S.pick||it;
 if(st===null){toast('Try a time like 2pm or 14:00');return}
 const lk=src.link||(S.pick?'':it.link)||'';
 if((D().plans||[]).some(p=>p.date===date&&((lk&&p.link===lk)||norm(p.name)===norm(src.name)))){toast('Already on that day');return}
 const id=uuid(),who=S.who.length&&S.who.length<(A.people||[]).length?S.who.slice():[];
 mut(()=>{D().plans.push({id,date,who,name:src.name,start:st,end:st?addMin(st,60):'',area:src.area||it.area||'',place:S.pick?'':(it.place||''),link:lk,notes:(S.pick&&S.pick.notes)||'',tent:!!S.tent&&!!st||!!S.tent,note:false})});
 const pk=S.pick;let undo=()=>mut(()=>{D().plans=D().plans.filter(p=>p.id!==id)});
 if(pk){const g=D().groups.find(x=>x.id===pk.gid),idea=it,others=g?g.options.filter(o=>o.id!==pk.oid):[],ids=[],selfPick=pk.oid==='idea';
  const arc=(kind,obj,note)=>{try{return archiveItem(kind,obj,note)}catch(e){return null}};
  if(!selfPick)ids.push(arc('short',idea,'Not picked'));others.forEach(o=>ids.push(arc('opt',o,'Not picked')));
  const orig=JSON.parse(JSON.stringify(idea)),gSave=g,gi=D().groups.indexOf(g);
  mut(()=>{D().groups=D().groups.filter(x=>x.id!==pk.gid);if(!selfPick){idea.name=pk.name;idea.link=pk.link||'';idea.area=pk.area||'';idea.notes=pk.notes||'';idea.place=''}});
  undo=()=>{ids.forEach(a=>{try{if(a)unarchive(a)}catch(e){}});mut(()=>{D().plans=D().plans.filter(p=>p.id!==id);Object.assign(idea,orig);D().groups.splice(Math.min(gi,D().groups.length),0,gSave)})}}
 closeDay();
 toastUndo(pk?'Picked and added to '+dd(date):'Added to '+dd(date),undo);render()}
window.addEventListener('click',e=>{
 const sc=e.target.closest&&e.target.closest('[data-act="sched"][data-kind="short"]');
 if(sc){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openDay(sc.dataset.id);return}
 const dy=e.target.closest&&e.target.closest('[data-q37day]');
 if(dy){e.preventDefault();e.stopPropagation();U.date=dy.dataset.q37day;U.tab='trip';render();return}
 const b=e.target.closest&&e.target.closest('[data-q37d]');
 if(!b){const el=document.getElementById('q37d');if(el&&e.target===el)closeDay();return}
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const a=b.dataset.q37d;
 if(a==='x')return closeDay();
 if(!S)return;
 const ti=document.getElementById('q37t');if(ti)S.start=ti.value;
 if(a==='day'){S.date=b.dataset.v;paintDay();return}
 if(a==='tent'){S.tent=!S.tent;paintDay();return}
 if(a==='who'){const v=b.dataset.v;if(v==='all')S.who=[];else S.who=S.who.includes(v)?S.who.filter(x=>x!==v):S.who.concat(v);paintDay();return}
 if(a==='add')return addIt()},true);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('q37d'))closeDay()},true);
function polish(){
 document.querySelectorAll('.short-wrap .o3-acts [data-act="sched"]').forEach(b=>{if(!b.querySelector('svg')){b.innerHTML='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17M12 13v4M10 15h4"/></svg><span>Itinerary</span>';b.setAttribute('aria-label','Add to itinerary')}});
 document.querySelectorAll('.q31-gap').forEach(g=>{const a=+g.dataset.a,b=+g.dataset.b;if(g.classList.contains('sm')){if(b>a){const tx=(b-a>=780)?'All day free':tt(addMin('00:00',a))+' – '+tt(addMin('00:00',b))+' free',gt=g.querySelector('.q31-gt');if(gt&&gt.textContent!==tx)gt.textContent=tx}return}if(b>a){const r=document.querySelector('.q31-row'),u=Math.max(48,(r&&r.offsetHeight)||58),cp=(function(){try{return localStorage.getItem('quest_gc')==='1'}catch(e){return false}})();g.style.setProperty('min-height',Math.round(cp?u:Math.max(u,Math.min(u*10,(b-a)/60*u)))+'px','important')}});
 const q=document.getElementById('quick'),ql=q&&q.closest('.quickline');if(ql)ql.classList.toggle('q37-typing',!!q.value.trim());
 const dr=document.querySelector('.drawer');
 if(dr&&/People and sharing/.test(dr.innerText||'')&&!dr.querySelector('.q37-lay')){
  const cur=(function(){try{return localStorage.getItem('quest_view')==='cal'?'cal':'cards'}catch(e){return 'cards'}})();
  const box=document.createElement('div');box.className='q37-lay';
  box.innerHTML=`<div class="eyebrow">Itinerary layout</div><div class="q31-seg sm" role="group" aria-label="Layout"><button type="button" class="${cur==='cards'?'on':''}" data-act="q31-view" data-v="cards">Cards</button><button type="button" class="${cur==='cal'?'on':''}" data-act="q31-view" data-v="cal">Calendar</button></div>`;
  const first=dr.querySelector('.eyebrow');if(first)first.before(box);else dr.appendChild(box)}}
{const _r=window.render;if(typeof _r==='function')window.render=function(){const r=_r.apply(this,arguments);try{polish()}catch(e){}return r}}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='quick'){const ql=e.target.closest('.quickline');if(ql)ql.classList.toggle('q37-typing',!!e.target.value.trim())}},true);
try{new MutationObserver(()=>{const dr=document.querySelector('.drawer');if(dr&&!dr.querySelector('.q37-lay'))try{polish()}catch(e){}}).observe(document.body,{childList:true,subtree:true})}catch(e){}
{const _g=window.groupedEvents;if(typeof _g==='function'&&window.__q31&&window.__q31.visible)window.groupedEvents=function(day){const d=D(),keep=d.plans;d.plans=keep.filter(p=>window.__q31.visible(p));try{return _g.apply(this,arguments)}finally{d.plans=keep}}}
window.__q37={planOf,when,openPick,openPickIdea,parseT,areaFrom};
})();
