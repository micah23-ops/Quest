/* v23: "Not sure yet" plans, note lines, X instead of Cancel, Move to shortlist */
(function(){
const gp=id=>D().plans.find(p=>p.id===id);
const save=()=>{A.dirty=true;clearTimeout(A.deb);A.deb=setTimeout(push,350)};

/* 1) how a plan shows: tentative = lighter + dashed + a "?" that makes it sure; note = slim line */
function noteLine(p){
 const t=p.start?prettyTime(p.start)+(p.end?'–'+prettyTime(p.end):''):'';
 const who=!isAll(p)?p.who.map(id=>first(pName(id))).join(' + '):'';
 return `<div class="event note-line"><span class="nl-time">${esc(t)}</span><span class="nl-text">${esc(p.name)}${p.notes?` <span class="nl-sub">${esc(p.notes)}</span>`:''}${who?` <span class="nl-sub">· ${esc(who)}</span>`:''}</span><button type="button" class="dots" data-act="edit" data-kind="plan" data-id="${p.id}" aria-label="Edit or delete">⋯</button></div>`}
{const _ev=window.evCard;if(typeof _ev==='function')window.evCard=function(p){
 let h=_ev.apply(this,arguments);
 if(typeof h!=='string'||!p||h.includes('class="event editing')||h.includes('class="event ghost'))return h;
 if(p.note)return noteLine(p);
 if(p.tent)h=h.replace('class="event ','class="event tent ').replace('<div class="ev-main"',`<button type="button" class="sure-q" data-act="make-sure" data-id="${p.id}" title="Tentative. Tap to confirm" aria-label="Tentative. Tap to confirm">Tentative</button><div class="ev-main"`);
 return h}}

/* 2) edit form: toggles near the top, X in the corner, Save on the right, quiet Delete and Move to shortlist */
{const _pf=window.planForm;if(typeof _pf==='function')window.planForm=function(p){
 let h=_pf.apply(this,arguments);if(typeof h!=='string')return h;
 const m=h.match(new RegExp('id="e_'+p.id+'_time"[^>]*value="([^"]*)"'));window.__q23init={id:p.id,time:m?m[1]:null};
 const tog=`<div class="q23-tg"><label class="q23-sw"><input type="checkbox" id="e_${p.id}_tent" data-keep ${p.tent?'checked':''}><span class="knob"></span><span class="lbl">Tentative<small>Shows lighter with a dotted outline. Everyone can see it.</small></span></label><label class="q23-sw"><input type="checkbox" id="e_${p.id}_note" data-keep ${p.note?'checked':''}><span class="knob"></span><span class="lbl">Just a note<small>A reminder in your day. Notes don't block time unless you add an end time.</small></span></label></div>`;
 h=h.replace('<div class="ef">',`<div class="ef"><button type="button" class="ef-x" data-act="cancel-edit" data-pid="${p.id}" aria-label="Close">✕</button>`);
 h=h.replace(/(<label class="inl"><span>Activity<\/span>[\s\S]*?<\/label>)/,(m0)=>m0+tog);
 h=h.replace(/<div class="ef-actions">[\s\S]*?<\/div>/,`<div class="ef-actions"><button type="button" class="q23-link danger" data-act="del-plan" data-id="${p.id}">Delete</button><button type="button" class="q23-link" data-act="plan-to-short" data-id="${p.id}">Move to Ideas</button><button type="button" class="primary" data-act="save-edit">Save</button></div>`);
 return h}}

/* 3) saving keeps the two toggles */
{const _se=window.saveEdit;if(typeof _se==='function')window.saveEdit=function(){
 const e=U.edit,id=e&&e.kind==='plan'?e.id:null;let t=false,n=false,en='';
 if(id){const a=document.getElementById('e_'+id+'_tent'),b=document.getElementById('e_'+id+'_note'),c=document.getElementById('e_'+id+'_end');t=!!(a&&a.checked);n=!!(b&&b.checked);en=c?c.value.trim():''}
 const r=_se.apply(this,arguments);
 if(id&&!U.edit){const p=gp(id);if(p){p.tent=t;p.note=n;if(n&&!en)p.end='';save();render()}}
 return r}}

/* 4) X asks first only if something was typed */
function changed(p){
 const el=f=>document.getElementById('e_'+p.id+'_'+f),v=f=>{const e=el(f);return e?e.value.trim():null},eq=(a,b)=>String(a||'')===String(b||'');
 for(const f of ['name','area','place','notes','link','date']){const x=v(f);if(x!==null&&!eq(x,p[f==='date'?'date':f]))return true}
 const ti=window.__q23init,tv=v('time');if(tv!==null&&ti&&ti.id===p.id&&ti.time!==null&&!eq(tv,ti.time))return true;
 const a=el('tent'),b=el('note');if(a&&a.checked!==!!p.tent)return true;if(b&&b.checked!==!!p.note)return true;
 let w=[...(U.ew||[])];if(w.length>=A.people.length)w=[];if(w.slice().sort().join()!==[...p.who].sort().join())return true;
 return false}

/* 5) clicks: make sure / move to shortlist / X */
window.addEventListener('click',e=>{
 const t=e.target&&e.target.closest?e.target.closest('[data-act="make-sure"],[data-act="plan-to-short"],.ef-x'):null;if(!t)return;
 if(t.matches('[data-act="make-sure"]')){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const id=t.dataset.id,p=gp(id);if(!p)return;mut(()=>{p.tent=false});
  toastUndo('Now a sure plan',()=>mut(()=>{const q=gp(id);if(q)q.tent=true}));return}
 if(t.matches('[data-act="plan-to-short"]')){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const id=t.dataset.id,d=D(),i=d.plans.findIndex(x=>x.id===id);if(i<0)return;
  const p=d.plans[i],item={id:uuid(),name:p.name,area:p.area||'',category:(window.__q28&&window.__q28.catOf?window.__q28.catOf(p.name):'Other'),place:p.place||'',link:p.link||'',notes:p.notes||'',done:false,favorite:false,interest:[]};
  U.edit=null;U.menu=null;
  mut(()=>{d.plans.splice(i,1);d.shortlist.unshift(item)});
  toastUndo('Moved to Ideas',()=>mut(()=>{const d2=D(),k=d2.shortlist.findIndex(x=>x.id===item.id);if(k>=0)d2.shortlist.splice(k,1);d2.plans.splice(Math.min(i,d2.plans.length),0,p)}));return}
 if(t.classList.contains('ef-x')){
  const p=gp(t.dataset.pid);
  if(p&&changed(p)&&!window.confirm('Close without saving your changes?')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
 }
},true);

/* 6) quick add: a "Not sure yet" switch next to Add */
{const _qb=window.quickBar;if(typeof _qb==='function')window.quickBar=function(){
 const h=_qb.apply(this,arguments);
 return h.replace('<button class="primary" data-act="quick-add">',`<label class="q23-qs"><input type="checkbox" id="q23_tent" data-keep ${U.q23t?'checked':''}><span>Not sure yet</span></label><button class="primary" data-act="quick-add">`)}}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='q23_tent')U.q23t=e.target.checked});
{const _aq=window.addQuick;if(typeof _aq==='function')window.addQuick=function(){
 const cb=document.getElementById('q23_tent'),on=!!(cb&&cb.checked),n=D().plans.length;
 const r=_aq.apply(this,arguments);
 const pl=D().plans;
 if(on&&pl.length>n){U.q23t=false;pl.slice(n).forEach(p=>{p.tent=true});save();render()}
 return r}}
})();
