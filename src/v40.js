/* v40: itinerary upgrades.
   - true time-grid Calendar (blocks as long as their duration, Mine = one column)
   - compact vs true-size free time (the free-time toggle)
   - "now" line that follows the phone's clock (card view marker, calendar line)
   - edit details sheet: name, date, time, who, address, area (auto), price, notes
   - Add as expense on the card (prefills Settle), price shown on cards
   - expanded cards close when you change tab or day */
(function(){
'use strict';
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null};
const Q=()=>window.__q31||{};
const view=()=>LS('quest_view')==='cal'?'cal':'cards';
const compact=()=>LS('quest_gc')==='1';
const st=p=>stamp(p.start);
const isAllP=p=>!p.who.length||p.who.length>=A.people.length;
const involves=(p,id)=>isAllP(p)||p.who.includes(id);
const en=p=>{const s=st(p);if(s==null)return null;const e=stamp(p.end);return e!=null&&e>s?e:(p.note?s:s+60)};
const timed=p=>!p.note&&st(p)!=null;
const fmt=m=>prettyTime(minutes(m));
const dur=m=>{const h=Math.floor(m/60),r=m%60;return h?(r?h+'h '+r+'m':h+'h'):r+'m'};
const allIds=()=>A.people.map(p=>p.id);
const money=(m,c)=>{try{return window.__qst.money(m,c)}catch(e){return String(m/100)+' '+c}};
const curOf=p=>p.cost_cur||(window.__qst?window.__qst.cfg().cur:'PHP');
const priceTxt=p=>p.cost_minor>0?money(p.cost_minor,curOf(p)):'';window.__q40price=priceTxt;
const W0=480,W1=1320,MING=60,PX=60;
let E=null,PK=null;

/* ---------- 1. expanded cards close when you leave the tab or change day ---------- */
{let lt=null,ld=null;const _r=window.render;window.render=function(){
 const k=U.screen+'|'+U.tab;if(lt!==null&&(k!==lt||(ld!==null&&U.date!==ld))&&U.open)U.open={};lt=k;ld=U.date;
 const r=_r.apply(this,arguments);try{nowMarks()}catch(e){}try{if(E&&window.__att){const w=document.querySelector('#q40 .q40-attwrap');if(w)w.innerHTML=window.__att.editor('plan',E.id)}}catch(e){}return r}}

/* ---------- 2. cards: price + Add as expense + one edit sheet ---------- */
{const _ev=window.evCard;window.evCard=function(p){let h=_ev.apply(this,arguments);if(typeof h!=='string'||!p||p.note)return h;
 const pr=priceTxt(p);
 if(pr&&h.includes('class="event-sub"'))h=h.replace(/(class="event-sub">[\s\S]*?)(<\/div>)/,(m,a,b)=>a+`<span class="q40-price">${esc(pr)}</span>`+b);
 if(h.includes('class="ev-actions"')||h.includes('class="ev-detail"')){
  const logged=p.logged&&window.__qst&&window.__qst.ST.rows.some(r=>r.id===p.logged);
  const blk=`<div class="q40-xrow">${pr?`<span class="q40-xp">${esc(pr)}</span>`:'<span class="q40-xp none">No price yet</span>'}${logged?`<button type="button" class="small-btn q40-logged" data-q40="exp" data-id="${p.id}">✓ Expense logged · view</button>`:`<button type="button" class="small-btn q40-exp" data-q40="exp" data-id="${p.id}">＋ Add as expense</button>`}</div>`;
  if(h.includes('class="ev-actions"'))h=h.replace('<div class="ev-actions">',blk+'<div class="ev-actions">').replace(/>Time and people</,'>Edit details<');
  else h=h.replace('<div class="ev-detail">','<div class="ev-detail">'+blk)}
 return h}}

/* ---------- 3. overlays ---------- */
function host(){let h=document.getElementById('q40');if(!h){h=document.createElement('div');h.id='q40';document.body.appendChild(h);wire(h)}return h}
function closeAll(){E=null;PK=null;const h=document.getElementById('q40');if(h)h.remove()}
const planOf=id=>D().plans.find(p=>p.id===id);
function whenTxt(p){const d=(function(){try{return displayDate(p.date)}catch(e){return p.date}})();const t=p.start?(p.end?fmt(st(p))+'–'+fmt(stamp(p.end)):fmt(st(p))):'Anytime';return d+' · '+t}
function whoTxt(p){return isAllP(p)?'Everyone':p.who.map(id=>first(pName(id))).join(' + ')}

function openPeek(id){const p=planOf(id);if(!p)return;PK=id;E=null;paintPeek()}
function paintPeek(){const p=planOf(PK);if(!p){closeAll();return}
 const pr=priceTxt(p),logged=p.logged&&window.__qst&&window.__qst.ST.rows.some(r=>r.id===p.logged);
 const lk=p.link&&url(p.link)?`<a href="${esc(url(p.link))}" target="_blank" rel="noopener noreferrer">↗ Link</a>`:'';
 const h=host();h.className='on';
 h.innerHTML=`<div class="q40-back" data-q40="close"></div><div class="q40-sheet" role="dialog" aria-label="${esc(p.name)}"><div class="q40-top"><strong>${esc(p.name)}</strong><button type="button" class="q40-x" data-q40="close" aria-label="Close">✕</button></div>
 <div class="q40-meta"><span>${esc(whenTxt(p))}</span><span>${esc(whoTxt(p))}</span>${p.place||p.area?`<span>⌌ ${esc([p.place,p.area].filter(Boolean).join(' · '))}</span>`:''}${pr?`<span><b>${esc(pr)}</b></span>`:''}${lk}</div>
 ${p.notes?`<p class="q40-notes">${esc(p.notes)}</p>`:''}
 <div class="q40-foot">${logged?`<button type="button" class="q40-sec" data-q40="exp" data-id="${p.id}">✓ Expense logged · view</button>`:`<button type="button" class="q40-pri" data-q40="exp" data-id="${p.id}">＋ Add as expense</button>`}<button type="button" class="q40-sec" data-q40="edit" data-id="${p.id}">Edit details</button><button type="button" class="q40-sec warn" data-q40="del" data-id="${p.id}">Delete</button></div></div>`}

function openEdit(id){const p=planOf(id);if(!p)return;PK=null;
 const cur=curOf(p),all=isAllP(p);
 E={id,name:p.name,date:p.date,start:p.start||'',end:p.end||'',who:all?allIds():p.who.slice(),all,place:p.place||'',area:p.area||'',areaManual:!!(p.area&&p.area.trim()),cost:p.cost_minor>0?(window.__qst?String(window.__qst.cfg&&p.cost_minor/(['KRW','JPY'].includes(cur)?1:100)):''):'',cur,notes:p.notes||'',link:p.link||'',tent:!!p.tent,err:'',more:!!(p.place||p.area||p.cost_minor>0||p.notes||p.link)};
 if(p.cost_minor>0)E.cost=(['KRW','JPY'].includes(cur)?String(p.cost_minor):(p.cost_minor/100).toFixed(2).replace(/\.00$/,''));
 paintEdit()}
function chipsHtml(){return `<div class="q40-chips"><button type="button" class="q40-chip${E.all?' on':''}" data-q40="who" data-id="*">All</button>${A.people.map(p=>`<button type="button" class="q40-chip${!E.all&&E.who.includes(p.id)?' on':''}" data-q40="who" data-id="${p.id}">${esc(p.id===A.me?'You':first(p.name))}</button>`).join('')}</div>`}
function paintEdit(){const h=host(),keep=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.k:null;h.className='on';
 const days=tripDates(),dl=d=>{try{return displayDate(d)}catch(e){return d}};
 const dopts=(days.includes(E.date)?days:[E.date].concat(days)).map(d=>`<option value="${d}"${d===E.date?' selected':''}>${esc(dl(d))}</option>`).join('');
 const curs=['PHP','USD','KRW','JPY','EUR','CAD','SGD','THB','GBP','AUD'].map(c=>`<option${c===E.cur?' selected':''}>${c}</option>`).join('');
 const f=(k,l,inner)=>`<label class="q40-f"><span>${l}</span>${inner}</label>`;
 h.innerHTML=`<div class="q40-back" data-q40="close"></div><div class="q40-sheet tall" role="dialog" aria-label="Edit details"><div class="q40-top"><strong>Edit details</strong><button type="button" class="q40-x" data-q40="close" aria-label="Close">✕</button></div>
 ${f('name','Name',`<input class="q40-in" data-k="name" value="${esc(E.name)}" autocomplete="off">`)}
 <div class="q40-two">${f('date','Date',`<select class="q40-in" data-k="date">${dopts}</select>`)}<div class="q40-f"><span>Time</span><div class="q40-tt"><input class="q40-in" type="time" data-k="start" value="${esc(E.start)}" aria-label="Start time"><i>–</i><input class="q40-in" type="time" data-k="end" value="${esc(E.end)}" aria-label="End time"></div></div></div>
 <div class="q40-f"><span>Who’s going</span>${chipsHtml()}</div>
 <button type="button" class="q40-more" data-q40="more">${E.more?'▾ Hide more details':'▸ More details (address, price, notes, link)'}</button>
 ${E.more?`${f('place','Address',`<input class="q40-in" data-k="place" value="${esc(E.place)}" placeholder="Street, building or place" autocomplete="off">`)}
 ${f('area','Area',`<input class="q40-in" data-k="area" value="${esc(E.area)}" placeholder="Auto-fills from the address" autocomplete="off">`)}
 <div class="q40-f"><span>Price</span><div class="q40-tt"><select class="q40-in q40-cs" data-k="cur" aria-label="Currency">${curs}</select><input class="q40-in" data-k="cost" inputmode="decimal" placeholder="0" value="${esc(E.cost)}" aria-label="Price" autocomplete="off"></div></div>
 ${f('notes','Notes',`<textarea class="q40-in" data-k="notes" rows="3">${esc(E.notes)}</textarea>`)}
 ${f('link','Link',`<input class="q40-in" data-k="link" value="${esc(E.link)}" placeholder="https://" autocomplete="off">`)}
 <div class="q40-attwrap">${window.__att?window.__att.editor('plan',E.id):''}</div>`:''}
 <div class="q40-err">${esc(E.err)}</div>
 <div class="q40-foot"><button type="button" class="q40-pri" data-q40="save">Save</button><button type="button" class="q40-sec" data-q40="close">Cancel</button><button type="button" class="q40-sec warn" data-q40="del" data-id="${E.id}">Delete</button></div></div>`;
 if(keep){const e=h.querySelector('[data-k="'+keep+'"]');if(e&&e.tagName!=='SELECT')e.focus({preventScroll:true})}}
function saveEdit(){const p=planOf(E.id);if(!p){closeAll();return}
 if(!E.name.trim()){E.err='Add a name';paintEdit();return}
 const s=stamp(E.start),e=stamp(E.end);if(E.start&&E.end&&s!=null&&e!=null&&e<=s){E.err='End time must be after the start';paintEdit();return}
 if(E.end&&!E.start){E.err='Add a start time first';paintEdit();return}
 const minor=E.cost.trim()?(window.__qst?window.__qst.toMinor(E.cost,E.cur):0):0;
 mut(()=>{p.name=E.name.trim();p.date=E.date;p.start=E.start;p.end=E.end;p.who=E.all?allIds():(E.who.length?E.who.slice():allIds());p.place=E.place.trim();p.area=E.area.trim();p.notes=E.notes;p.link=E.link.trim();p.cost_minor=minor>0?minor:null;p.cost_cur=minor>0?E.cur:null});
 closeAll();toast('Saved')}
function setWho(id){const N=allIds().length;if(id==='*'){E.all=true;E.who=allIds();return}
 if(E.all){E.all=false;E.who=[id];return}
 const i=E.who.indexOf(id);if(i>=0)E.who.splice(i,1);else E.who.push(id);
 if(!E.who.length||E.who.length>=N){E.all=true;E.who=allIds()}}
function wire(h){
 h.addEventListener('input',e=>{const el=e.target,k=el.dataset&&el.dataset.k;if(!k||!E)return;
  if(k==='cost'){const v=el.value.replace(/[^\d.,]/g,'');if(v!==el.value)el.value=v;E.cost=v;return}
  if(k==='cur'||k==='date')return;E[k]=el.value;
  if(k==='area')E.areaManual=!!el.value.trim();
  if(k==='place'&&!E.areaManual){const a=(window.__q37&&window.__q37.areaFrom)?window.__q37.areaFrom(el.value):'';E.area=a;const ae=h.querySelector('[data-k="area"]');if(ae)ae.value=a}});
 h.addEventListener('change',e=>{const el=e.target,k=el.dataset&&el.dataset.k;if(!k||!E)return;if(k==='cur'||k==='date'){E[k]=el.value}});
 h.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-q40]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.q40;
 if(a==='close'){closeAll();return}
 if(a==='peek'){openPeek(b.dataset.id);return}
 if(a==='edit'){openEdit(b.dataset.id);return}
 if(a==='save'){saveEdit();return}
 if(a==='who'&&E){setWho(b.dataset.id);paintEdit();return}
 if(a==='more'&&E){E.more=!E.more;paintEdit();return}
 if(a==='del'){const id=b.dataset.id;closeAll();doDelete('plan',id);return}
 if(a==='exp'){const p=planOf(b.dataset.id);closeAll();if(p&&window.questLogExpense)window.questLogExpense(p);return}
},true);
/* the old "Time and people" / ⋯ edit for plans now opens the one edit sheet */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-act="edit-plan"],[data-act="edit"][data-kind="plan"]');if(!b)return;
 const id=b.dataset.id;if(!planOf(id))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openEdit(id)},true);

/* ---------- 4. calendar view: a real time grid ---------- */
function columns(){const ids=allIds();if(!A.me&&Q().scope&&Q().scope()==='mine')return ids;if(Q().scope&&Q().scope()==='mine')return [A.me];const C=Q().chips?Q().chips():[];return C.length?C:ids}
function personFree(day,id){const l=D().plans.filter(p=>p.date===day&&timed(p)&&involves(p,id)).sort((a,b)=>st(a)-st(b));const out=[];let cur=W0;
 l.forEach(p=>{if(st(p)>cur&&Math.min(st(p),W1)-cur>=MING)out.push([cur,Math.min(st(p),W1)]);cur=Math.max(cur,en(p))});if(cur<W1&&W1-cur>=MING)out.push([cur,W1]);return out}
function calHtml(day){
 const C=columns(),all=D().plans.filter(p=>p.date===day);
 const mineOf=id=>all.filter(p=>involves(p,id)||(typeof reqOf==='function'&&reqOf(p).includes(id)&&!p.note&&false));
 const per=C.map(mineOf),seen=new Set(),tt=[];per.forEach(l=>l.forEach(p=>{if(!seen.has(p.id)){seen.add(p.id);if(timed(p))tt.push(p)}}));
 if(!seen.size)return `<div class="day-empty">Nothing planned yet. Type something above to add it.</div>`;
 let T0=W0,T1=W1;tt.forEach(p=>{T0=Math.min(T0,Math.floor(st(p)/60)*60);T1=Math.max(T1,Math.ceil(en(p)/60)*60)});
 /* common free spans (nobody shown has anything) are the ones the toggle can squeeze */
 const busy=tt.map(p=>[st(p),en(p)]).sort((a,b)=>a[0]-b[0]),free=[];let cur=W0;
 busy.forEach(b=>{if(b[0]>cur&&Math.min(b[0],W1)-cur>=MING)free.push([cur,Math.min(b[0],W1)]);cur=Math.max(cur,b[1])});if(cur<W1&&W1-cur>=MING)free.push([cur,W1]);
 const segs=[];let at=T0;free.forEach(f=>{if(f[0]>at)segs.push({a:at,b:f[0],free:false});segs.push({a:f[0],b:f[1],free:true});at=f[1]});if(at<T1)segs.push({a:at,b:T1,free:false});
 let acc=0;segs.forEach(s=>{s.y=acc;s.h=s.free&&compact()?PX:(s.b-s.a)/60*PX;acc+=s.h});const H=Math.max(acc,PX);
 const y=t=>{t=Math.max(T0,Math.min(T1,t));for(const s of segs)if(t<=s.b)return s.y+(t-s.a)/(s.b-s.a)*s.h;return H};
 /* hour lines + labels (skip the inside of squeezed spans) */
 let grid='';const inSq=t=>compact()&&segs.some(s=>s.free&&t>s.a&&t<s.b);
 for(let t=Math.ceil(T0/60)*60;t<=T1;t+=60)if(!inSq(t))grid+=`<div class="q40-hl" style="top:${y(t).toFixed(1)}px"><span>${esc(fmt(t))}</span></div>`;
 const multi=C.length>1;
 const cols=C.map((id,ci)=>{
  const evs=per[ci].filter(timed).sort((a,b)=>st(a)-st(b)||en(b)-en(a));
  /* side-by-side lanes for overlaps inside one column */
  const lane=new Map();let cluster=[],cend=0,lanes=[];const flush=()=>{const k=Math.max(1,lanes.length);cluster.forEach(p=>lane.set(p.id,{i:p._l,k}));cluster=[];lanes=[]};
  evs.forEach(p=>{if(cluster.length&&st(p)>=cend)flush();let l=lanes.findIndex(e=>e<=st(p));if(l<0){l=lanes.length;lanes.push(0)}lanes[l]=en(p);p._l=l;cluster.push(p);cend=Math.max(cend,en(p))});flush();
  const blocks=evs.map(p=>{const top=y(st(p)),hh=Math.max(26,y(en(p))-top-2),L=lane.get(p.id),c=isAllP(p)?null:pCol(p.who[0]),w=100/L.k;
   const t=`${fmt(st(p))}${stamp(p.end)!=null&&stamp(p.end)>st(p)?'–'+fmt(stamp(p.end)):''}`;
   return `<button type="button" class="q40-ev${p.tent?' tent':''}${isAllP(p)?' shared':''}" data-q40="peek" data-id="${p.id}" style="top:${top.toFixed(1)}px;height:${hh.toFixed(1)}px;left:calc(${(L.i*w).toFixed(2)}% + 1px);width:calc(${w.toFixed(2)}% - 3px);${c?`background:${c[0]};border-color:${c[1]}`:''}"><b>${esc(p.name)}</b>${hh>=40?`<small>${esc(t)}${priceTxt(p)?' · '+esc(priceTxt(p)):''}</small>`:''}</button>`}).join('');
  const bands=personFree(day,id).map(g=>{const top=y(g[0]),hh=y(g[1])-top-2;return `<button type="button" class="q40-fr" data-act="q31-slot" data-date="${day}" data-a="${g[0]}" data-b="${g[1]}" style="top:${top.toFixed(1)}px;height:${Math.max(24,hh).toFixed(1)}px"><span>${esc(dur(g[1]-g[0]))} free</span><b>+ add</b></button>`}).join('');
  return `<div class="q40-col" style="height:${H.toFixed(1)}px">${bands}${blocks}</div>`}).join('');
 const unt=C.map((id,ci)=>per[ci].filter(p=>!timed(p)));
 const strip=unt.some(l=>l.length)?`<div class="q40-un" style="--n:${C.length}">${unt.map(l=>`<div>${l.map(p=>`<button type="button" class="q40-uc${p.note?' note':''}" data-q40="peek" data-id="${p.id}">${p.note?'📝 ':''}${esc(p.name)}</button>`).join('')}</div>`).join('')}</div>`:'';
 const head=multi?`<div class="q40-ch" style="--n:${C.length}">${C.map(id=>{const c=pCol(id);return `<div style="background:${c[0]};color:${c[2]}">${esc(first(pName(id)))}${id===A.me?' (you)':''}</div>`}).join('')}</div>`:'';
 const todayIso=isoDay(new Date()),nm=new Date(),nowMin=nm.getHours()*60+nm.getMinutes();
 const nowL=(day===todayIso&&nowMin>=T0&&nowMin<=T1)?`<div class="q40-nowl" data-now="1" style="top:${y(nowMin).toFixed(1)}px"><span>${esc(fmt(nowMin))}</span></div>`:'';
 const out=`<div class="q40-cal">${head}${strip}<div class="q40-body" style="--n:${C.length}"><div class="q40-gut" style="height:${H.toFixed(1)}px">${grid}</div><div class="q40-cols" style="--n:${C.length}">${cols}${nowL}</div></div></div>`;
 return out}
{const _g=window.groupedEvents;window.groupedEvents=function(day){
 if(view()==='cal'&&U.view==='day'){try{return calHtml(day)}catch(e){console.error(e)}}
 return _g.apply(this,arguments)}}

/* ---------- 5. the now line (follows each phone's clock) ---------- */
function nowMarks(){
 document.querySelectorAll('.q40-nowm,.q40-prog').forEach(n=>n.remove());document.querySelectorAll('.q40-nowin').forEach(n=>n.classList.remove('q40-nowin'));
 if(U.screen!=='trip'||U.view!=='day')return;
 const today=isoDay(new Date());if(U.date!==today)return;
 const d=new Date(),now=d.getHours()*60+d.getMinutes(),label=fmt(now);
 if(view()==='cal'){const l=document.querySelector('.q40-nowl');if(l&&!U.q40sc){U.q40sc=U.date;setTimeout(()=>{try{l.scrollIntoView({block:'center'})}catch(e){}},50)}return}
 const list=document.querySelector('.q31-list');if(!list)return;
 const kids=[...list.children].filter(k=>(k.dataset&&(k.dataset.t0!==undefined||k.dataset.a!==undefined)));
 let ins=null,inside=null;
 for(const k of kids){const a=k.dataset.t0!==undefined?+k.dataset.t0:+k.dataset.a,b=k.dataset.t0!==undefined?+k.dataset.t1:+k.dataset.b;if(k.dataset.t0==='')continue;
  if(a<=now&&now<b){inside=[k,(now-a)/Math.max(1,b-a)];break}if(a>now){ins=k;break}}
 const mk=()=>{const m=document.createElement('div');m.className='q40-nowm';m.innerHTML=`<i></i><span>${esc(label)}</span>`;return m};
 if(inside){const[k,f]=inside;k.classList.add('q40-nowin');const isGap=k.classList.contains('q31-gap');
  if(isGap){const m=mk();m.style.position='absolute';m.style.left='0';m.style.right='0';m.style.top=(f*100).toFixed(1)+'%';k.style.position='relative';k.appendChild(m)}
  else{const pb=document.createElement('div');pb.className='q40-prog';pb.style.width=(f*100).toFixed(1)+'%';k.style.position='relative';k.appendChild(pb)}}
 else if(ins)ins.before(mk());else if(kids.length)kids[kids.length-1].after(mk())}
setInterval(()=>{try{if(document.hidden)return;if(U.q40tick!==undefined&&U.screen==='trip'&&U.view==='day'&&!document.getElementById('q40')&&!document.getElementById('qst')&&!document.activeElement.matches('input,textarea,select'))render()}catch(e){}},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)try{nowMarks()}catch(e){}});
U.q40tick=0;
window.__q40={calHtml,openEdit,openPeek,nowMarks};
})();
