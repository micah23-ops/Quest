/* v25: Card view (option in settings), People toggles, side-by-side columns, "Show free times" */
(function(){
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null};
const layout=()=>LS('quest_layout')==='cards'?'cards':'calendar';
const freeOn=()=>LS('quest_free')==='1';
const selKey=()=>'quest_ppl_'+A.tripId;
function sel(){
 let s=null;try{s=JSON.parse(LS(selKey())||'null')}catch(e){}
 const ids=A.people.map(p=>p.id);
 s=Array.isArray(s)?s.filter(id=>ids.includes(id)):[];
 if(!s.length)s=[A.me||ids[0]].filter(Boolean);
 return ids.filter(id=>s.includes(id))}
const isAllP=p=>!p.who.length||p.who.length>=A.people.length;
const coversAll=(p,S)=>isAllP(p)||S.every(id=>p.who.includes(id));
const visible=(p,S)=>isAllP(p)||p.who.some(id=>S.includes(id))||reqOf(p).some(id=>S.includes(id));
const st=p=>stamp(p.start);
const ranged=p=>{const s=st(p),e=stamp(p.end);return s!=null&&e!=null&&e>s};
const busy=p=>!p.note||ranged(p);
const en=p=>{const s=st(p);if(s==null)return null;const e=stamp(p.end);return e!=null&&e>s?e:(p.note?s:s+60)};
const whoNames=p=>{if(isAllP(p))return '';const n=p.who.map(id=>first(pName(id)));return n.length<=3?n.join(' + '):n.slice(0,2).join(' + ')+' +'+(n.length-2)};
const share=(a,b)=>isAllP(a)||isAllP(b)||a.who.some(x=>b.who.includes(x));
const fmt=m=>prettyTime(minutes(m));

/* ---- one plan, compact ---- */
function joinStrip(p){
 if(isAllP(p)||!A.me)return '';
 const reqs=reqOf(p);let h='';
 if(!p.who.includes(A.me)){
  if(reqs.includes(A.me))h=`<span class="cv-j">Waiting for ${esc(p.who.map(id=>first(pName(id))).join(' + '))}</span><button type="button" class="mv" data-act="req-cancel" data-id="${p.id}" data-m="${A.me}">Cancel request</button>`;
  else h=`<button type="button" class="mv" data-act="do-join" data-id="${p.id}">Ask to join</button>`}
 else reqs.filter(m=>m!==A.me).forEach(m=>{h+=`<span class="cv-j">${esc(first(pName(m)))} wants to join</span><button type="button" class="mv acc" data-act="req-accept" data-id="${p.id}" data-m="${m}">Accept</button><button type="button" class="mv" data-act="req-decline" data-id="${p.id}" data-m="${m}">Decline</button>`});
 return h?`<div class="cv-join">${h}</div>`:''}
function row(p,o){
 o=o||{};
 if((U.edit&&U.edit.kind==='plan'&&U.edit.id===p.id)||(U.open&&U.open[p.id]))return evCard(p);
 if(p.note)return evCard(p);
 const t=p.start?prettyTime(p.start):'Anytime',e=p.start&&p.end?prettyTime(p.end):'';
 const sub=[p.area,p.place,whoNames(p)].filter(Boolean).join(' · ');
 const warn=o.clash&&o.clash.length?`<span class="cv-w">⚠ overlaps ${o.clash.map(q=>esc(q.name)).join(', ')}</span>`:'';
 return `<div class="cv-row${p.tent?' tent':''}${o.shared?' shared':''}"><div class="cv-main" data-act="toggle-ev" data-id="${p.id}" role="button" tabindex="0"><span class="cv-t"><b class="${p.start?'':'any'}">${esc(t)}</b>${e?`<small>${esc(e)}</small>`:''}</span><span class="cv-m"><span class="cv-n">${esc(p.name)}</span>${sub?`<span class="cv-s">${esc(sub)}</span>`:''}${warn}${p.tent?`<button type="button" class="sure-q" data-act="make-sure" data-id="${p.id}" title="Tentative. Tap to confirm" aria-label="Tentative. Tap to confirm">Tentative</button>`:''}</span></div><button type="button" class="dots" data-act="edit" data-kind="plan" data-id="${p.id}" aria-label="Edit or delete">⋯</button>${joinStrip(p)}</div>`}

/* ---- the day ---- */
function clashesIn(list){
 const m={};
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const a=list[i],b=list[j];
  if(a.note||b.note||st(a)==null||st(b)==null||!share(a,b))continue;
  if(st(a)<en(b)&&st(b)<en(a)){(m[a.id]=m[a.id]||[]).push(b);(m[b.id]=m[b.id]||[]).push(a)}}
 return m}
function cardsDay(day){
 const S=sel(),all=D().plans.filter(p=>p.date===day&&visible(p,S)).sort(sortTime);
 if(!all.length)return `<div class="day-empty">Nothing planned yet. Type something above to add it.</div>`;
 const clash=clashesIn(all);
 if(S.length<2)return `<div class="cv-list">${all.map(p=>row(p,{clash:clash[p.id]})).join('')}</div>`;
 /* several people: blocks of overlapping plans, shared plans span, the rest sit in columns */
 const N=S.length,wide=N>3?' wide':'';
 const bus=all.filter(p=>busy(p)&&st(p)!=null),any=all.filter(p=>busy(p)&&st(p)==null),notes=all.filter(p=>!busy(p));
 const blocks=[];
 for(const p of bus){const s=st(p),e=en(p),last=blocks[blocks.length-1];
  if(last&&s<last.end){last.items.push(p);last.end=Math.max(last.end,e)}else blocks.push({kind:'block',t:s,end:e,items:[p]})}
 const seq=[];
 if(any.length)seq.push({kind:'block',t:-2,end:-2,items:any,anytime:true});
 blocks.forEach(b=>seq.push(b));
 notes.forEach(p=>seq.push({kind:'note',t:st(p)==null?-1:st(p),p}));
 if(freeOn()){
  let cur=480;const W1=1320;
  blocks.forEach(b=>{if(b.t>cur+24&&cur<W1)seq.push({kind:'band',t:cur,a:cur,b:Math.min(b.t,W1)});cur=Math.max(cur,b.end)});
  if(cur<W1-24)seq.push({kind:'band',t:cur,a:cur,b:W1})}
 const pr={band:0,note:1,block:2};
 seq.sort((x,y)=>x.t-y.t||pr[x.kind]-pr[y.kind]);
 const head=`<div class="cv-cols${wide}" style="--n:${N}"><div class="cv-colhead">${S.map(id=>`<div class="col-name" style="background:${pCol(id)[0]};color:${pCol(id)[2]}">${esc(first(pName(id)))}</div>`).join('')}</div></div>`;
 const free=(S.length===2?'Both':'All '+N)+' free';
 const out=seq.map(x=>{
  if(x.kind==='band')return `<div class="cv-band">${free} ${esc(fmt(x.a))}–${esc(fmt(x.b))}</div>`;
  if(x.kind==='note')return row(x.p);
  const shared=x.items.filter(p=>coversAll(p,S)),solo=x.items.filter(p=>!coversAll(p,S));
  let h=shared.map(p=>row(p,{shared:true,clash:clash[p.id]})).join('');
  if(solo.length)h+=`<div class="cv-cols${wide}" style="--n:${N}"><div class="cv-grid">${S.map(id=>`<div class="cv-cell">${solo.filter(p=>p.who.includes(id)||(isAllP(p))||reqOf(p).includes(id)).map(p=>row(p,{clash:clash[p.id]})).join('')}</div>`).join('')}</div></div>`;
  return h}).join('');
 const hint=freeOn()&&all.some(p=>busy(p)&&st(p)==null)?`<div class="cv-hint">Some plans have no time, so free times may be off.</div>`:'';
 return `<div class="cv-list multi">${head}${hint}${out}</div>`}

{const _g=window.groupedEvents;if(typeof _g==='function')window.groupedEvents=function(day){return _g.apply(this,arguments)}}

/* ---- People bar + layout switch, under the day heading ---- */
function layoutSwitch(){
 const cur=layout();
 return `<span class="cv-lay mini" role="group" aria-label="Day layout"><button type="button" class="${cur==='calendar'?'on':''}" data-act="q25-layout" data-v="calendar" aria-pressed="${cur==='calendar'}">Calendar</button><button type="button" class="${cur==='cards'?'on':''}" data-act="q25-layout" data-v="cards" aria-pressed="${cur==='cards'}">Cards</button></span>`}
function peopleBar(){
 const S=sel(),open=U.q25open,N=A.people.length,compact=N>5;
 const names=S.map(id=>first(pName(id))).join(' + ');
 let h=`<div class="cv-bar"><button type="button" class="cv-pp" data-act="q25-people" aria-expanded="${!!open}"><span class="cv-pl">Showing</span> ${esc(names)} ${open?'▴':'▾'}</button>${layoutSwitch()}</div>`;
 if(open)h+=`<div class="cv-panel"><div class="cv-chips">${A.people.map(p=>`<button type="button" class="cv-chip${S.includes(p.id)?' on':''}" data-act="q25-tog" data-m="${p.id}" aria-pressed="${S.includes(p.id)}">${esc(compact?initial(p.name):first(p.name))}${p.id===A.me?' (you)':''}</button>`).join('')}</div><label class="q23-sw cv-free"><input type="checkbox" id="q25_free" data-keep ${freeOn()?'checked':''}><span class="knob"></span><span class="lbl">Show free times<small>Adds a line between plans when everyone you picked is free. Based on the times entered.</small></span></label></div>`;
 return h}
{const _t=window.trip;if(typeof _t==='function')window.trip=function(){
 const h=_t.apply(this,arguments);
 if(typeof h!=='string'||U.view!=='day')return h;
 const bar='';
 const re=/(<div class="agenda-head">[\s\S]*?<span class="agenda-caption">[^<]*<\/span><\/div>)/;
 if(re.test(h))return h.replace(re,m=>m+bar);
 return h.replace('<div class="agenda-head">',()=>bar+'<div class="agenda-head">')}}

/* ---- settings: layout choice ---- */
{const _d=window.drawer;if(typeof _d==='function')window.drawer=function(){
 const h=_d.apply(this,arguments);
 if(true)return h;
 const cur=layout(),f=`<div class="field"><label>Trip layout (this device)</label><div class="cv-lay"><button type="button" class="${cur==='calendar'?'on':''}" data-act="q25-layout" data-v="calendar" aria-pressed="${cur==='calendar'}">Calendar</button><button type="button" class="${cur==='cards'?'on':''}" data-act="q25-layout" data-v="cards" aria-pressed="${cur==='cards'}">Cards</button></div><p class="helper" style="margin:6px 0 0">Calendar is the time-grid day view. Cards is a simple list with People toggles.</p></div>`;
 const m='<div class="field"><label>App colour</label>';
 if(h.includes(m))return h.replace(m,f+m);
 const m2='<div style="display:grid;gap:10px;margin:18px 0">';
 return h.includes(m2)?h.replace(m2,f+m2):h}}

/* ---- clicks ---- */
window.addEventListener('click',e=>{
 const b=e.target&&e.target.closest?e.target.closest('[data-act="q25-people"],[data-act="q25-tog"],[data-act="q25-layout"]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const a=b.dataset.act;
 if(a==='q25-people'){U.q25open=!U.q25open;render();return}
 if(a==='q25-tog'){const id=b.dataset.m,S=sel(),next=S.includes(id)?S.filter(x=>x!==id):S.concat(id);LS(selKey(),JSON.stringify(next.length?next:[A.me||id]));render();return}
 if(a==='q25-layout'){LS('quest_layout',b.dataset.v);render();return}
},true);
document.addEventListener('change',e=>{if(e.target&&e.target.id==='q25_free'){LS('quest_free',e.target.checked?'1':'0');render()}});
})();
