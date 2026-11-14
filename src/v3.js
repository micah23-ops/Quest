/* v3: smart quick-add, action menus, move-with-undo, link styling, colours */
const ext='<svg class="ext" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M7 1h4v4M11 1 5.5 6.5M9 7.5V10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const lnk=(u,t)=>`<a class="lk" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)}${ext}</a>`;
/* times: bare 1-11 = pm, 12 = noon, explicit am/pm always wins */
function parseTime(s){s=String(s||'').trim().toLowerCase();if(!s)return '';if(/^(noon|12\s*nn|12\s*noon)$/.test(s))return '12:00';if(/^(midnight|12\s*mn)$/.test(s))return '00:00';
const m=s.match(/^(\d{1,2})(?:[:.]?(\d{2}))?\s*(a|p|am|pm|a\.m\.|p\.m\.)?$/);if(!m)return null;let h=+m[1];const mi=+(m[2]||0),ap=m[3]?m[3][0]:'';if(mi>59||h>24)return null;
if(ap){if(h<1||h>12)return null;h=h%12+(ap==='p'?12:0)}else if(h>=1&&h<=11)h+=12;if(h===24)h=0;return minutes(h*60+mi)}
function parseQuick(s){s=String(s||'').trim();if(!s)return null;const u=s.match(/https?:\/\/\S+/);const link=u?u[0]:'';if(u)s=s.replace(u[0],' ').replace(/\s+/g,' ').trim();if(!s&&!link)return null;
const T='(?:noon|midnight|\\d{1,2}(?::\\d{2})?\\s*(?:am|pm|nn|mn)?)',re=new RegExp(`(^|\\s)(?:(?:at|@)\\s*)?(${T})(?:\\s*(?:-|–|—|to|until)\\s*(${T}))?(?=\\s|$|[,.])`,'gi');
const mk=x=>/(am|pm|nn|mn|noon|midnight|:)/i.test(x||''),hasAp=x=>/(am|pm|nn|mn|noon|midnight)/i.test(x||''),apOf=x=>((x||'').match(/am|pm/i)||[''])[0].toLowerCase();
let start='',end='',name=s,m;
while((m=re.exec(s))){const a=m[2].trim(),b=(m[3]||'').trim();if(!(mk(a)||mk(b)||(b&&m.index===0)))continue;
let st=parseTime(a),en=b?parseTime(b):'';if(st===null||en===null)continue;
if(b&&!hasAp(a)&&apOf(b)){const alt=parseTime(a+apOf(b));if(alt)st=alt}
if(b&&st&&en&&stamp(en)<=stamp(st)){if(!hasAp(a)&&stamp(st)>=720){st=minutes(stamp(st)-720)}if(stamp(en)<=stamp(st))en=minutes(stamp(en)+720)}
start=st;end=en||minutes(stamp(st)+60);name=(s.slice(0,m.index)+' '+s.slice(m.index+m[0].length)).replace(/\s+/g,' ').trim().replace(/^(at|@|-|,)\s+/i,'').replace(/\s+(at|@|-|,)$/i,'').trim();break}
const x=readLocation(name);return {...x,name:x.name||name||'New activity',start,end,link}}

/* undo toast */
let undoFn=null;const _toast=window.toast;
window.toast=s=>{undoFn=null;toastEl.classList.remove('act');_toast(s)};
function toastUndo(msg,fn){undoFn=fn;toastEl.innerHTML=`${esc(msg)} <button type="button" class="toast-undo">Undo</button>`;toastEl.classList.remove('hidden');toastEl.classList.add('act');clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.classList.add('hidden');toastEl.classList.remove('act');undoFn=null},7000)}
toastEl.addEventListener('click',e=>{if(e.target.closest('.toast-undo')&&undoFn){const f=undoFn;undoFn=null;f();toast('Undone')}});

/* menus */
const mItem=(act,label,attrs='',cls='')=>`<button type="button" role="menuitem" class="${cls}" data-act="${act}" ${attrs}>${label}</button>`;
const menuBtn=(kind,id,items)=>{const open=U.menu&&U.menu.kind===kind&&U.menu.id===id;return `<div class="o3-menu"><button type="button" class="dots static" data-act="menu" data-kind="${kind}" data-id="${id}" aria-haspopup="menu" aria-expanded="${!!open}" aria-label="More actions">⋯</button>${open?`<div class="menu" role="menu">${items}</div>`:''}</div>`};
const sfld=(id,f,label,ph)=>`<label class="inl"><span>${label}</span><input id="s_${id}_${f}" data-keep placeholder="${ph}" autocomplete="off"/></label>`;
function schedForm(kind,o){const w=U.sw||[],all=!w.length||w.length>=A.people.length,days=tripDates();
return `<div class="ef sched"><div class="ef-title">Add “${esc(o.name)}” to the itinerary</div><label class="inl"><span>Day</span><select id="s_${o.id}_date" data-keep>${days.map(d=>`<option value="${d}" ${d===U.date?'selected':''}>${esc(displayDate(d))}</option>`).join('')}</select></label><div class="two">${sfld(o.id,'start','Starts','1pm, 1:30pm, noon')}${sfld(o.id,'end','Ends','optional')}</div><div class="inl"><span>Who’s going</span><div class="who-select">${[['all','Everyone'],...A.people.map(q=>[q.id,first(q.name)])].map(([id,n])=>`<button type="button" class="${(id==='all'?all:(!all&&w.includes(id)))?'sel':''}" data-act="sched-who" data-w="${id}">${esc(n)}</button>`).join('')}</div></div><div class="ef-actions"><button type="button" class="primary" data-act="sched-save">Add to itinerary</button><button type="button" class="ghost" data-act="sched-cancel">Cancel</button></div></div>`}
const isSched=o=>U.sched&&U.sched.id===o.id;

/* planning option */
function optRow(o){const ed=U.edit&&U.edit.kind==='opt'&&U.edit.id===o.id,u=o.link&&url(o.link),votes=o.votes||{},mine=votes[A.me]||'';
const nm=u?lnk(u,o.name):esc(o.name),allYes=A.people.length>0&&A.people.every(p=>votes[p.id]==='yes'),booked=o.status==='Booked';
const meta=[o.area&&'📍 '+o.area,o.price&&'₩'+o.price].filter(Boolean).join(' · ');
const items=mItem('to-short','Move to Shortlist',`data-id="${o.id}"`)+mItem('sched','Add to itinerary',`data-kind="opt" data-id="${o.id}"`)+mItem('set-option-status',booked?'Unmark booked':'Mark as booked',`data-id="${o.id}" data-value="${booked?'Considering':'Booked'}"`)+mItem('edit','Edit',`data-kind="opt" data-id="${o.id}"`)+mItem('del-opt','Delete',`data-id="${o.id}"`,'danger');
return `<div class="option-wrap opt3"><div class="o3-main"><div class="o3-title">${nm}${booked?'<span class="badge">Booked</span>':''}</div>${meta?`<div class="o3-meta">${esc(meta)}</div>`:''}${o.notes?`<div class="o3-meta">${esc(o.notes)}</div>`:''}</div><div class="o3-side"><div class="pvs">${A.people.map(p=>pv(p,votes[p.id])).join('')}</div><div class="vote" aria-label="Your vote">${[['yes','✓'],['maybe','?'],['no','×']].map(([val,l])=>`<button type="button" title="${val}" class="${mine===val?'on-'+val:''}" data-act="vote" data-id="${o.id}" data-value="${val}">${l}</button>`).join('')}</div></div>${menuBtn('opt',o.id,items)}${allYes&&!isSched(o)&&!ed?`<div class="banner"><span>Everyone’s in.</span><button type="button" class="small-btn pri" data-act="to-short" data-id="${o.id}">Move to Shortlist</button><button type="button" class="small-btn" data-act="sched" data-kind="opt" data-id="${o.id}">Add to itinerary</button></div>`:''}${isSched(o)?schedForm('opt',o):''}${ed?`<div class="ef full">${fld(o.id,'name','Name',o.name)}${fld(o.id,'link','Link',o.link,{type:'url',ph:'https://'})}<div class="two">${fld(o.id,'area','Area',o.area)}${fld(o.id,'price','Price per person',o.price)}</div>${fld(o.id,'notes','Notes',o.notes,{area:1})}${editBar('opt',o.id)}</div>`:''}</div>`}

/* shortlist row */
function shortRow(i){const ed=U.edit&&U.edit.kind==='short'&&U.edit.id===i.id,u=i.link&&url(i.link),nm=u?lnk(u,i.name):esc(i.name);
const items=mItem('sched','Add to itinerary',`data-kind="short" data-id="${i.id}"`)+mItem('edit','Edit',`data-kind="short" data-id="${i.id}"`)+mItem('del-short','Delete',`data-id="${i.id}"`,'danger');
return `<div class="short-wrap ${i.done?'done':''}"><div class="sl-row"><input class="check-done" type="checkbox" data-act="done" data-id="${i.id}" ${i.done?'checked':''} aria-label="Mark ${esc(i.name)} done"/><div class="sl-body"><div class="sl-title">${nm}</div><div class="sl-meta">${esc([i.area,i.category].filter(Boolean).join(' · ')||'No area')}</div>${i.place?`<div class="sl-note">📍 ${esc(i.place)}</div>`:''}${i.notes?`<div class="sl-note">${esc(i.notes)}</div>`:''}</div><div class="person-pick">${A.people.map(p=>`<button type="button" data-act="short-interest" data-id="${i.id}" data-person="${p.id}" class="${i.interest.includes(p.id)?'on':''}" title="${esc(p.name)}${i.interest.includes(p.id)?' is keen':''}" aria-pressed="${i.interest.includes(p.id)}">${esc(initial(p.name))}</button>`).join('')}</div>${menuBtn('short',i.id,items)}</div>${isSched(i)?schedForm('short',i):''}${ed?`<div class="ef">${fld(i.id,'name','Name',i.name)}<div class="two">${fld(i.id,'area','Area',i.area)}<label class="inl"><span>Type</span><select id="e_${i.id}_category" data-keep>${categories.map(c=>`<option ${i.category===c?'selected':''}>${c}</option>`).join('')}</select></label></div>${fld(i.id,'place','Exact address',i.place)}${fld(i.id,'link','Link',i.link,{type:'url',ph:'https://'})}${fld(i.id,'notes','Notes',i.notes,{area:1})}${editBar('short',i.id)}</div>`:''}</div>`}

/* planning page */
function grp(g){const ren=U.renG===g.id,hidden=U.groupOpen[g.id];
const items=mItem('g-rename','Rename',`data-id="${g.id}"`)+mItem('g-delete','Delete category',`data-id="${g.id}"`,'danger');
return `<section class="linecard"><div class="group-head">${ren?`<div class="g-rename"><input id="rg_${g.id}" data-keep value="${esc(g.name)}" aria-label="Category name"/><button type="button" class="primary" data-act="g-rename-save" data-id="${g.id}">Save</button><button type="button" class="ghost" data-act="g-rename-cancel">Cancel</button></div>`:`<div><strong>${esc(g.name)}</strong> <span class="muted">· ${g.options.length} option${g.options.length===1?'':'s'}</span></div><div class="toolbar"><button type="button" class="light-button" data-act="toggle-group" data-id="${g.id}" aria-label="${hidden?'Show':'Hide'} options">${hidden?'▸':'▾'}</button>${menuBtn('grp',g.id,items)}</div>`}</div>${hidden?'':`<div class="group-rows">${g.options.length?g.options.map(optRow).join(''):`<p class="empty-hint">Nothing here yet. Paste a link or type a name below.</p>`}</div><div class="addrow"><input id="opt_${g.id}" data-keep data-addopt="${g.id}" placeholder="Paste a link or type a name. Notes after a |" aria-label="Add an option to ${esc(g.name)}"/><button class="primary" data-act="add-opt-inline" data-id="${g.id}">Add</button></div>`}</section>`}
function planning(){const gs=D().groups;return `<div class="topline"><div><h2 class="section-title">The idea lab</h2><p class="section-kicker">Drop ideas in, vote, then move the winners on.</p></div></div><div class="idea-stack">${gs.map(grp).join('')}<div class="addgroup"><div class="addrow" style="border:0"><input id="newgroup" data-keep placeholder="${gs.length?'Another category':'Start with a category'}, like Restaurants" aria-label="New category"/><button class="primary" data-act="add-group-inline">Add</button></div></div></div><div style="margin-top:18px" class="notice">Grey circle = hasn’t voted yet. When everyone’s in, a button appears to move it on. Everything else lives under ⋯.</div>`}

/* moves, all undoable */
const guessCat=n=>/restaurant|food|eat|dinner|lunch|bbq/i.test(n)?'Restaurant':/cafe|coffee/i.test(n)?'Cafe':/class|lesson|workshop/i.test(n)?'Class':'Activity';
function findOpt(id){for(const g of D().groups){const i=g.options.findIndex(o=>o.id===id);if(i>=0)return {g,i,o:g.options[i]}}return null}
function restoreOpt(gid,o,i){const g=D().groups.find(x=>x.id===gid);if(g)g.options.splice(Math.min(i,g.options.length),0,o)}
function optToShort(id){const f=findOpt(id);if(!f)return;const {g,i,o}=f,gid=g.id,item={id:uuid(),name:o.name,area:o.area||'',category:guessCat(g.name),done:false,link:o.link||'',notes:o.notes||'',place:'',interest:(o.votes||{})[A.me]==='yes'&&A.me?[A.me]:[]};
mut(()=>{g.options.splice(i,1);D().shortlist.unshift(item)});toastUndo('Moved to Shortlist',()=>mut(()=>{rm(D().shortlist,item.id);restoreOpt(gid,o,i)}))}
function saveSched(){const s=U.sched;if(!s)return;const d=D(),isOpt=s.kind==='opt',src=isOpt?(findOpt(s.id)||{}).o:d.shortlist.find(x=>x.id===s.id);if(!src)return;
const v=f=>{const e=document.getElementById(`s_${s.id}_${f}`);return e?e.value.trim():''};const st=parseTime(v('start')),en=parseTime(v('end'));if(st===null||en===null){toast('Couldn’t read that time. Try 1pm, 1:30pm or noon');return}
let who=[...(U.sw||[])];if(who.length>=A.people.length)who=[];let end=en;if(st&&(!end||stamp(end)<=stamp(st)))end=minutes(stamp(st)+60);
const date=v('date')||U.date,plan={id:uuid(),date,who,name:src.name,start:st,end:st?end:en,area:src.area||'',place:src.place||'',link:src.link||'',notes:src.notes||''};U.sched=null;
if(isOpt){const {g,i,o}=findOpt(s.id),gid=g.id;mut(()=>{g.options.splice(i,1);D().plans.push(plan)});U.date=date;render();toastUndo('Added to itinerary · '+displayDate(date),()=>mut(()=>{rm(D().plans,plan.id);restoreOpt(gid,o,i)}))}
else{mut(()=>{d.plans.push(plan)});U.date=date;toast('Added to itinerary · '+displayDate(date))}}
function delGroup(id){const gs=D().groups,i=gs.findIndex(g=>g.id===id);if(i<0)return;const g=gs[i];mut(()=>{gs.splice(i,1)});toastUndo(`Deleted “${g.name}”`,()=>mut(()=>{D().groups.splice(Math.min(i,D().groups.length),0,g)}))}

/* colours in settings */
{const _d=window.drawer;window.drawer=()=>{let h=_d();if(U.modal==='settings'){const sw=`<div class="field"><label>Colours</label>${A.people.map(p=>{const cur=pCol(p.id);return `<div class="sw-row"><span>${esc(first(p.name))}</span>${PKEYS.map(k=>`<button type="button" class="sw ${cur===PAL[k]?'on':''}" style="background:${PAL[k][0]};border-color:${PAL[k][1]}" data-act="set-color" data-person="${p.id}" data-c="${k}" aria-label="${k}" aria-pressed="${cur===PAL[k]}"></button>`).join('')}</div>`}).join('')}</div>`;h=h.replace('<div style="display:grid;gap:10px;margin:18px 0">',sw+'<div style="display:grid;gap:10px;margin:18px 0">')}return h}}

/* handlers */
let prevMenu=null;
root.addEventListener('click',e=>{const b0=e.target.closest('[data-act]');if(b0&&b0.dataset.act==='edit')U.sched=null;prevMenu=U.menu||null;if(!U.menu)return;if(e.target.closest('.menu')){U.menu=null;return}U.menu=null;if(!e.target.closest('[data-act],[data-tab],[data-who],[data-date],[data-view],a[href]'))render()},true);
root.addEventListener('click',e=>{if(e.target.closest('a[href]'))return;const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;
if(a==='menu'){const k=b.dataset.kind;U.menu=(prevMenu&&prevMenu.kind===k&&prevMenu.id===id)?null:{kind:k,id};render()}
else if(a==='to-short')optToShort(id);
else if(a==='sched'){U.sched={kind:b.dataset.kind,id};U.sw=[];U.edit=null;render();const f=document.getElementById(`s_${id}_start`);if(f)f.focus()}
else if(a==='sched-who'){const w=b.dataset.w;if(w==='all')U.sw=[];else{const s=new Set(U.sw||[]);s.has(w)?s.delete(w):s.add(w);U.sw=[...s]}render()}
else if(a==='sched-cancel'){U.sched=null;render()}
else if(a==='sched-save')saveSched();
else if(a==='g-rename'){U.renG=id;render();const f=document.getElementById('rg_'+id);if(f){f.focus();f.select()}}
else if(a==='g-rename-cancel'){U.renG=null;render()}
else if(a==='g-rename-save'){const f=document.getElementById('rg_'+id),n=f?f.value.trim():'';if(!n){toast('Give it a name');return}const g=D().groups.find(x=>x.id===id);U.renG=null;if(g)mut(()=>{g.name=n});toast('Renamed')}
else if(a==='g-delete')delGroup(id);
else if(a==='set-color'){const p=A.people.find(x=>x.id===b.dataset.person);if(p)mut(()=>{p.color=b.dataset.c})}
});
root.addEventListener('keydown',e=>{const t=e.target;if(e.key==='Enter'&&t.id&&t.id.startsWith('rg_')){e.preventDefault();const b=document.querySelector('[data-act=g-rename-save]');if(b)b.click()}else if(e.key==='Enter'&&t.id&&/^s_/.test(t.id)&&t.tagName==='INPUT'){e.preventDefault();saveSched()}else if(e.key==='Escape'){U.menu=null;U.sched=null;U.renG=null;render()}});
{const _ev=window.evCard;window.evCard=(p,d)=>_ev(p,d).replace('Anytime–Anytime','Anytime')}
