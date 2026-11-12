/* v31: Itinerary = Mine | Group, name chips (Group), compact single-column day list,
   free gaps (with who else is free) that you tap to fill from Ideas or by typing, Replace with… */
(function(){
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null};
const scope=()=>(A.me&&LS('quest_scope')==='mine')?'mine':'group';
const chipKey=()=>'quest_chips_'+A.tripId;
function chips(){let s=null;try{s=JSON.parse(LS(chipKey())||'null')}catch(e){}
 const ids=A.people.map(p=>p.id);return ids.filter(id=>Array.isArray(s)&&s.includes(id))}
const isAllP=p=>!p.who.length||p.who.length>=A.people.length;
const involves=(p,id)=>isAllP(p)||p.who.includes(id);
function visible(p){
 if(scope()==='mine')return involves(p,A.me)||reqOf(p).includes(A.me);
 const C=chips();if(!C.length)return true;
 return isAllP(p)||p.who.some(id=>C.includes(id))||reqOf(p).some(id=>C.includes(id))}
/* who the current view is "about" (empty = everyone) */
const subject=()=>scope()==='mine'?[A.me]:chips();
const st=p=>stamp(p.start);
const en=p=>{const s=st(p);if(s==null)return null;const e=stamp(p.end);return e!=null&&e>s?e:(p.note?s:s+60)};
const timed=p=>!p.note&&st(p)!=null;
const fmt=m=>prettyTime(minutes(m));
const dur=m=>{const h=Math.floor(m/60),r=m%60;return h?(r?h+'h '+r+'m':h+'h'):r+'m'};
const W0=480,W1=1320,MINGAP=60;
const view=()=>LS('quest_view')==='cal'?'cal':'cards';
const gapsOn=()=>true;/* v40: free time always shows; the toggle only sets compact vs true size */
const compactOn=()=>LS('quest_gc')==='1';

/* ---------- free gaps ---------- */
function gapsFor(day){
 const S=subject(),all=D().plans.filter(p=>p.date===day);
 const mine=all.filter(p=>timed(p)&&(S.length?(S.some(id=>involves(p,id))):true)).sort(sortTime);
 const out=[];let cur=W0;
 const push=(a,b)=>{if(b-a>=MINGAP)out.push({a,b})};
 mine.forEach(p=>{const s=st(p);if(s>cur)push(cur,Math.min(s,W1));cur=Math.max(cur,en(p))});
 if(cur<W1)push(cur,W1);
 const others=S.length?A.people.map(p=>p.id).filter(id=>!S.includes(id)):[];
 return out.map(g=>{
  const free=others.filter(id=>!all.some(p=>timed(p)&&involves(p,id)&&st(p)<g.b&&en(p)>g.a));
  let who='';
  if(!S.length)who='';
  else if(others.length&&free.length===others.length)who=others.length===1?first(pName(free[0]))+' free too':'everyone else free';
  else if(free.length)who=free.map(id=>first(pName(id))).join(' + ')+' free too';
  return Object.assign(g,{who,day})})}
function gapBtn(g,compact){
 const label=(g.b-g.a>=W1-W0-30)?'Free all day':dur(g.b-g.a)+' free';
 return `<button type="button" class="q31-gap${compact?' sm':''}" data-act="q31-slot" data-date="${g.day}" data-a="${g.a}" data-b="${g.b}"><span class="q31-gt">${esc(compact?((g.b-g.a>=W1-W0-30)?'All day free':fmt(g.a)+'–'+fmt(g.b)):label)}</span>${g.who?`<span class="q31-gw">${esc(g.who)}</span>`:''}<b>+ add</b></button>`}
function weekGaps(day){const g=gapsFor(day);return g.length?`<div class="q31-wg">${g.map(x=>gapBtn(x,true)).join('')}</div>`:''}

/* ---------- the day ---------- */
function clashMap(list){
 const m={};
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const a=list[i],b=list[j];
  if(!timed(a)||!timed(b))continue;
  if(!(isAllP(a)||isAllP(b)||a.who.some(x=>b.who.includes(x))))continue;
  if(st(a)<en(b)&&st(b)<en(a)){(m[a.id]=m[a.id]||[]).push(b);(m[b.id]=m[b.id]||[]).push(a)}}
 return m}
function dots(p){
 if(isAllP(p))return '<span class="q31-who all">All</span>';
 return `<span class="q31-who">${esc(p.who.map(id=>first(pName(id))).join(' + '))}</span>`}
function row(p,clash){
 if((U.edit&&U.edit.kind==='plan'&&U.edit.id===p.id))return evCard(p);
 const open=U.open&&U.open[p.id];
 if(open){
  if(window.q41Open)return `<div class="q31-open q41-wrap" data-t0="${st(p)==null?'':st(p)}" data-t1="${en(p)==null?'':en(p)}">${window.q41Open(p)}</div>`;
  return `<div class="q31-open" data-t0="${st(p)==null?'':st(p)}" data-t1="${en(p)==null?'':en(p)}">${evCard(p)}${p.note?'':`<div class="q31-rep"><button type="button" class="q31-repb" data-act="q31-replace" data-id="${p.id}">⇄ Replace with…</button></div>`}</div>`}
 if(p.note)return evCard(p);
 if(window.q41Closed)return window.q41Closed(p,clash);
 const t=p.start?prettyTime(p.start):'Anytime',e=p.start&&p.end?prettyTime(p.end):'';
 const sub=[p.area,p.place].filter(Boolean).join(' · ');
 const warn=clash&&clash.length?`<span class="q31-clash" title="Overlaps ${esc(clash.map(q=>q.name).join(', '))}" aria-label="Overlaps ${esc(clash.map(q=>q.name).join(', '))}">!</span>`:'';
 return `<div class="q31-row${p.tent?' tent':''}${clash&&clash.length?' clash':''}" data-t0="${st(p)==null?'':st(p)}" data-t1="${en(p)==null?'':en(p)}" data-act="toggle-ev" data-id="${p.id}" role="button" tabindex="0"><span class="q31-t"><b class="${p.start?'':'any'}">${esc(t)}</b>${e?`<small>${esc(e)}</small>`:''}</span><span class="q31-m"><span class="q31-n">${esc(p.name)}${p.tent?'<em class="q31-q" title="Tentative">?</em>':''}</span>${sub?`<span class="q31-s">${esc(sub)}</span>`:''}</span>${dots(p)}${warn}</div>`}
function cell(p,clash){
 const t=p.start?prettyTime(p.start):'Anytime';
 return `<div class="q31-cr${p.tent?' tent':''}${clash&&clash.length?' clash':''}" data-act="toggle-ev" data-id="${p.id}" role="button" tabindex="0"><b>${esc(t)}</b><span>${esc(p.name)}${p.tent?'<em class="q31-q">?</em>':''}</span></div>`}
function colsBody(list,clash,gaps,C){
 const N=C.length,covers=p=>isAllP(p)||C.every(id=>p.who.includes(id));
 const wide=p=>covers(p)||p.note||(U.open&&U.open[p.id])||(U.edit&&U.edit.kind==='plan'&&U.edit.id===p.id);
 const seq=[];
 list.forEach(p=>seq.push({t:st(p)==null?(p.note?-2:-1):st(p),k:wide(p)?'w':'s',p}));
 gaps.forEach(g=>seq.push({t:g.a-.5,k:'g',g}));
 seq.sort((x,y)=>x.t-y.t);
 const head=`<div class="q31-grid q31-gh" style="--n:${N}">${C.map(id=>{const c=pCol(id);return `<div class="q31-gn" style="background:${c[0]};color:${c[2]}">${esc(first(pName(id)))}</div>`}).join('')}</div>`;
 let out=head,buf=[];
 const flush=()=>{if(!buf.length)return;out+=`<div class="q31-grid" style="--n:${N}">${C.map(id=>`<div class="q31-gc">${buf.filter(p=>p.who.includes(id)||reqOf(p).includes(id)||isAllP(p)).map(p=>cell(p,clash[p.id])).join('')}</div>`).join('')}</div>`;buf=[]};
 seq.forEach(x=>{if(x.k==='s'){buf.push(x.p);return}flush();out+=x.k==='g'?gapBtn(x.g):row(x.p,clash[x.p.id])});
 flush();
 return `<div class="q31-list">${out}</div>`}
function dayBody(day){
 const list=D().plans.filter(p=>p.date===day&&visible(p)).sort(sortTime);
 const clash=clashMap(list),gaps=gapsOn()?gapsFor(day):[];
 {const C=scope()==='group'?chips():[];if(C.length>=2&&C.length<=4)return colsBody(list,clash,gaps,C)}
 const seq=[];
 list.forEach(p=>seq.push({t:st(p)==null?(p.note?-2:-1):st(p),k:'p',p}));
 gaps.forEach(g=>seq.push({t:g.a-.5,k:'g',g}));
 seq.sort((x,y)=>x.t-y.t);
 const body=seq.map(x=>x.k==='g'?gapBtn(x.g):row(x.p,clash[x.p.id])).join('');
 return `<div class="q31-list">${body||''}</div>`}
{const _g=window.groupedEvents;window.groupedEvents=function(day){
 if(view()!=='cal'||typeof _g!=='function')return dayBody(day);
 /* calendar = the time grid showing the people picked above */
 const ids=A.people.map(p=>p.id),C=scope()==='mine'?[A.me]:(chips().length?chips():ids);
 LS('quest_ppl_'+A.tripId,JSON.stringify(C));LS('quest_layout','calendar');
 return _g.apply(this,arguments)}}

/* ---------- Mine | Group + chips ---------- */
function bar(){
 const sc=scope(),multi=sc==='group'&&A.people.length>1;
 let h=`<div class="q31-bar2">`;
 if(A.me)h+=`<div class="q31-seg" role="group" aria-label="Whose plans"><button type="button" class="${sc==='mine'?'on':''}" data-act="q31-scope" data-v="mine" aria-pressed="${sc==='mine'}">Mine</button><button type="button" class="${sc==='group'?'on':''}" data-act="q31-scope" data-v="group" aria-pressed="${sc==='group'}">Group</button></div>`;
 if(multi){const C=chips();
  h+=`<div class="q31-chips" role="group" aria-label="Filter by person"><span class="q31-eye" title="Viewing" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg></span>${A.people.map(p=>{const on=C.includes(p.id),c=pCol(p.id);return `<button type="button" class="q31-chip${on?' on':''}" data-act="q31-chip" data-m="${p.id}" aria-pressed="${on}" style="${on?`background:${c[0]};color:${c[2]};border-color:${c[2]}`:''}">${esc(first(p.name))}${p.id===A.me?' (you)':''}</button>`}).join('')}</div>`}
 h+='</div>';
 h+=`<div class="q31-opts"><div class="q31-seg sm" role="group" aria-label="Layout"><button type="button" class="${view()==='cards'?'on':''}" data-act="q31-view" data-v="cards" aria-pressed="${view()==='cards'}">Cards</button><button type="button" class="${view()==='cal'?'on':''}" data-act="q31-view" data-v="cal" aria-pressed="${view()==='cal'}">Calendar</button></div><button type="button" class="q31-gt2${compactOn()?' on':''}" data-act="q31-gaps" aria-pressed="${compactOn()}" title="Show every free gap as one card tall">${compactOn()?'✓ ':''}Compact free time</button></div>`;
 return h}
{const _t=window.trip;window.trip=function(){
 const h=_t.apply(this,arguments);
 if(typeof h!=='string'||U.view!=='day')return h;
 const re=/(<div class="agenda-head">[\s\S]*?<span class="agenda-caption">[^<]*<\/span><\/div>)/;
 if(re.test(h))return h.replace(re,m=>m+bar());
 return h.replace('<div class="agenda-head">',()=>bar()+'<div class="agenda-head">')}}

/* ---------- slot / replace sheet ---------- */
const S={open:false,mode:'add',date:null,a:0,b:0,planId:null,text:'',st:'',en:'',enTouched:false,who:[]};
let host=null;
const ideas=()=>(D().shortlist||[]).filter(i=>!i.done);
function areaNear(){
 const pl=D().plans.filter(p=>p.date===S.date&&p.area&&timed(p)).sort(sortTime);
 let prev=null,next=null;pl.forEach(p=>{if(en(p)<=S.a)prev=p;else if(!next&&st(p)>=S.b)next=p});
 return [prev&&prev.area,next&&next.area].filter(Boolean).map(x=>x.toLowerCase())}
function sheetHtml(){
 const near=areaNear(),L=ideas().slice().sort((x,y)=>{
  const sc=i=>(near.includes(String(i.area||'').toLowerCase())?2:0)+(i.favorite?1:0);return sc(y)-sc(x)});
 const tgt=S.mode==='replace'?(D().plans.find(p=>p.id===S.planId)||{}):null;
 const title=S.mode==='replace'?`Replace ${esc(tgt.name||'plan')}`:`Free ${esc(fmt(S.a))}–${esc(fmt(S.b))}`;
 const sub=S.mode==='replace'?'The current plan goes back to Ideas, so nothing is lost.':`${esc(displayDate(S.date))} · pick an idea or type your own`;
 const rows=L.length?L.slice(0,40).map(i=>{const here=near.includes(String(i.area||'').toLowerCase());
  return `<button type="button" class="q31-idea" data-q31="pick" data-id="${i.id}"><span class="q31-in">${i.favorite?'★ ':''}${esc(i.name)}</span><span class="q31-is">${esc([i.area,i.category].filter(Boolean).join(' · '))}${here?' · nearby':''}</span><b>${S.mode==='replace'?'Swap':'Add'}</b></button>`}).join(''):`<p class="q31-none">No ideas saved yet. Type one above.</p>`;
 return `<div class="q31-back" data-q31="close"></div><div class="q31-sheet" role="dialog" aria-label="${title}"><div class="q31-top"><div><strong>${title}</strong><small>${sub}</small></div><button type="button" class="q31-x" data-q31="close" aria-label="Close">✕</button></div>
${S.mode==='add'?`<div class="q31-time"><label>Starts<input type="time" id="q31_st" data-keep value="${S.st}"></label><label>Ends<input type="time" id="q31_en" data-keep value="${S.en}"></label><span class="q31-tn">Free ${esc(fmt(S.a))}–${esc(fmt(S.b))}</span></div>${A.people.length>1?`<div class="q31-who2"><span>Who’s going?</span>${A.people.map(p=>`<button type="button" class="q31-wc${S.who.includes(p.id)?' on':''}" data-q31="who" data-m="${p.id}">${esc(first(p.name))}</button>`).join('')}</div>`:''}`:''}<div class="q31-type"><input id="q31_text" data-keep autocomplete="off" placeholder="${S.mode==='replace'?'Or type what you’ll do instead':'Type it, e.g. bingsu at Sulbing'}"><button type="button" class="primary" data-q31="typed">${S.mode==='replace'?'Swap':'Add'}</button></div>
<div class="q31-ideas">${rows}</div></div>`}
function paint(){
 if(!host){host=document.createElement('div');host.id='q31';document.body.appendChild(host)}
 host.className=S.open?'on':'';if(!S.open){host.innerHTML='';return}
 host.innerHTML=sheetHtml()}
function whoForNew(){if(S.open&&S.mode==='add'&&S.whoSet)return S.who.length>=A.people.length?[]:S.who.slice();if(scope()==='mine')return [A.me];const C=chips();return C.length&&C.length<A.people.length?C.slice():[]}
function slotTimes(){const a=S.a,b=S.b,s=S.st||minutes(a);let e=S.en||minutes(Math.min(stamp(s)+60,1439));if(stamp(e)<=stamp(s))e=minutes(Math.min(stamp(s)+60,1439));return {start:s,end:e}}
function openSlot(o){S.whoSet=false;S.who=[];Object.assign(S,o,{open:true,st:minutes(o.a),en:minutes(Math.min(o.a+60,o.b)),enTouched:false})}
document.addEventListener('input',e=>{const t=e.target;if(!t||!S.open)return;
 if(t.id==='q31_st'){S.st=t.value;if(!S.enTouched&&t.value){const n=minutes(Math.min(stamp(t.value)+60,1439)),en=document.getElementById('q31_en');S.en=n;if(en)en.value=n}}
 if(t.id==='q31_en'){S.en=t.value;S.enTouched=true}});
function restoreFn(snap){return()=>{mut(()=>{D().plans=snap.plans;D().shortlist=snap.short})}}
const snapshot=()=>({plans:JSON.parse(JSON.stringify(D().plans)),short:JSON.parse(JSON.stringify(D().shortlist||[]))});
function newPlanFrom(src,t){return {id:uuid(),date:S.date,who:whoForNew(),name:src.name,start:t.start,end:t.end,area:src.area||'',place:src.place||'',link:src.link||'',notes:src.notes||'',tent:false,note:false}}
function oldToIdea(p){const cat=(window.__q28&&window.__q28.catOf)?window.__q28.catOf(p.name):'Other';
 return {id:uuid(),name:p.name,area:p.area||'',category:cat,place:p.place||'',link:p.link||'',notes:p.notes||'',done:false,favorite:false,interest:[]}}
function commit(src,fromIdea){
 const snap=snapshot();let msg;
 if(S.mode==='replace'){
  const p=D().plans.find(x=>x.id===S.planId);if(!p)return;
  const old=oldToIdea(p);
  mut(()=>{
   p.name=src.name;p.area=src.area||'';p.place=src.place||'';p.link=src.link||'';p.notes=src.notes||'';
   if(fromIdea)D().shortlist=D().shortlist.filter(i=>i.id!==fromIdea.id);
   D().shortlist.unshift(old)});
  msg=`Swapped in ${src.name}`}
 else{
  const t=slotTimes(),np=newPlanFrom(src,t);
  mut(()=>{D().plans.push(np);if(fromIdea)D().shortlist=D().shortlist.filter(i=>i.id!==fromIdea.id)});
  msg=`Added ${src.name} at ${fmt(S.a)}`}
 S.open=false;paint();render();toastUndo(msg,restoreFn(snap))}
function typed(){
 const v=(document.getElementById('q31_text')||{}).value||'';if(!v.trim()){toast('Type something first');return}
 const p=typeof parseQuick==='function'?parseQuick(v):null;
 const name=(p&&p.name)||v.trim();
 if(S.mode==='replace'){commit({name,area:p&&p.area,place:p&&p.place,link:p&&p.link,notes:p&&p.notes});return}
 const snap=snapshot(),t=slotTimes();
 if(p&&p.start){t.start=p.start;t.end=p.end||minutes(stamp(p.start)+60)}
 const np={id:uuid(),date:S.date,who:whoForNew(),name,start:t.start,end:t.end,area:(p&&p.area)||'',place:(p&&p.place)||'',link:(p&&p.link)||'',notes:'',tent:false,note:false};
 mut(()=>D().plans.push(np));S.open=false;paint();render();toastUndo(`Added ${name}`,restoreFn(snap))}

window.addEventListener('click',e=>{
 const b=e.target&&e.target.closest?e.target.closest('[data-act^="q31-"],[data-q31]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const a=b.dataset.act,k=b.dataset.q31;
 if(a==='q31-view'){LS('quest_view',b.dataset.v);render();return}
 if(a==='q31-gaps'){LS('quest_gc',compactOn()?'0':'1');render();return}
 if(a==='q31-scope'){LS('quest_scope',b.dataset.v);render();return}
 if(a==='q31-chip'){const id=b.dataset.m,C=chips(),n=C.includes(id)?C.filter(x=>x!==id):C.concat(id);LS(chipKey(),JSON.stringify(n));render();return}
 if(a==='q31-slot'){openSlot({mode:'add',date:b.dataset.date,a:+b.dataset.a,b:+b.dataset.b,planId:null});{const w=whoForNew();S.who=w.length?w.slice():A.people.map(p=>p.id);S.whoSet=true}paint();setTimeout(()=>{const i=document.getElementById('q31_text');if(i&&window.innerWidth>700)i.focus()},50);return}
 if(a==='q31-replace'){const p=D().plans.find(x=>x.id===b.dataset.id);if(!p)return;
  const s0=stamp(p.start),e0=stamp(p.end);
  Object.assign(S,{open:true,mode:'replace',date:p.date,a:s0==null?W0:s0,b:e0==null?(s0==null?W1:s0+60):e0,planId:p.id});paint();return}
 if(k==='close'){S.open=false;paint();return}
 if(k==='typed'){typed();return}
 if(k==='who'){const id=b.dataset.m;S.who=S.who.includes(id)?S.who.filter(x=>x!==id):S.who.concat(id);if(!S.who.length)S.who=[id];b.parentNode.querySelectorAll('.q31-wc').forEach(x=>x.classList.toggle('on',S.who.includes(x.dataset.m)));return}
 if(k==='pick'){const i=ideas().find(x=>x.id===b.dataset.id);if(i)commit(i,i)}
},true);
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='q31_text'&&e.key==='Enter'){e.preventDefault();typed()}});

/* round "+" that gets out of the way while scrolling */
let sT=null;window.addEventListener('scroll',()=>{const f=document.getElementById('q28fab');if(!f)return;f.classList.add('q31-fade');clearTimeout(sT);sT=setTimeout(()=>f.classList.remove('q31-fade'),350)},{passive:true,capture:true});

window.__q31={visible,bar,weekGaps,gapsFor,scope,chips};
})();
