/* v15: brand assets, auth/trips screens, idea-lab cards, owner-set votes, macro categories, shortlist top bar */
(()=>{
/* quest-wordmark-forest.svg (auto-traced from the brand board) is missing the counter-hole
   for "e", so it renders as a solid blob. The .png in the same official asset drop is a
   flat render of the real artwork (not an auto-trace), so it doesn't have that problem —
   use that instead of either the broken SVG or a stand-in text treatment. */
const WM='brand/quest-wordmark-forest.png';
const wm=c=>`<img class="${c} q-wm" src="${WM}" alt="Quest" width="2400" height="885">`;
const hills=c=>`<svg class="${c}" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 70C60 30 110 40 170 62S300 50 400 20V140H0Z" fill="#dce8d5"/><path d="M0 95C70 60 130 80 200 88S330 70 400 52V140H0Z" fill="#c8dcc0"/><path d="M0 120C80 98 150 110 230 114S340 100 400 92V140H0Z" fill="#b3cfa9"/></svg>`;
const ini=n=>String(n||'?').trim().charAt(0).toUpperCase();
/* header logo */
{const _h=window.header;window.header=()=>_h().replace(/<img class="mlogo"[^>]*>/,wm('mlogo'))}
/* auth + trips */
{const _a=window.authScreen;window.authScreen=()=>{const hero=`<div class="auth-hero">${wm('q-word big')}<div class="q-tag">Plan · Explore · Together</div><img class="q-owl" src="art/qt_suitcase.webp" alt="" width="240" height="232"></div>`;return _a().replace('<div class="shell narrow">','<div class="shell narrow auth-page">'+hero).replace('<div class="brand">QUEST</div>','')+hills('page-hills')}}
{const _t=window.tripsScreen;window.tripsScreen=()=>_t().replace('<div class="brand">QUEST</div>',wm('q-word'))+hills('page-hills')}
/* macro categories for the shortlist */
const CATS=['Food','Cafes','Sights','Shopping','Experience','Nightlife','Other'];if(typeof categories!=='undefined')categories.splice(0,categories.length,...CATS);
const NIGHT=/night ?life|\bclubs?\b|karaoke|cocktail|speakeasy|lounge|\bpubs?\b|\bbars?\b|soju|live music/i,CAFE=/cafe|café|coffee|bakery|dessert|bingsu|\btea\b|tteok|patisserie|roastery/i,FOOD=/restaurant|food|drink|\beat|dinner|lunch|brunch|breakfast|bbq|barbecue|ramen|noodle|sushi|pizza|burger|kimchi|galbi|samgyeopsal|izakaya|buffet|steak|snack/i,SHOP=/shop|mall|boutique|thrift|vintage|store|outlet|olive young|daiso|dongdaemun|myeongdong|souvenir/i,EXP=/class|lesson|workshop|course|salon|nails?|makeup|skincare|facial|\bspa\b|massage|color analysis|hanbok|photo ?shoot|tour|experience|beauty|concert|\bshow\b|pottery|cooking/i,SIGHT=/sight|palace|temple|tower|museum|gallery|\bpark\b|garden|village|viewpoint|\bview\b|mountain|hike|trail|river|bridge|cathedral|landmark|\bwalk\b|namsan|gyeongbok|changdeok|hanok|beach|island|monument|shrine|fortress/i;
const macro=(c,n)=>{c=String(c||'');if(CATS.includes(c))return c;const t=c+' '+(n||'');return NIGHT.test(t)?'Nightlife':CAFE.test(t)?'Cafes':FOOD.test(t)?'Food':SHOP.test(t)?'Shopping':EXP.test(t)?'Experience':SIGHT.test(t)?'Sights':'Other'};
const norm=()=>{try{const d=A.data;if(d&&d.shortlist)d.shortlist.forEach(i=>{const m=macro(i.category,i.name);if(i.category!==m)i.category=m})}catch(e){}};
{const _r=window.render;window.render=function(){norm();return _r.apply(this,arguments)}}
const tagCls=t=>/Cafes/.test(t)?'c-cafe':/Food/.test(t)?'c-food':/Experience/.test(t)?'c-exp':/Sights/.test(t)?'c-sight':/Shopping/.test(t)?'c-shop':/Nightlife/.test(t)?'c-night':'c-other';
{const _o=window.optToShort;window.optToShort=id=>{const f=findOpt(id),gc=f?macro(f.g.name,''):'Other',before=new Set(D().shortlist.map(x=>x.id));_o(id);if(gc!=='Other'){const it=D().shortlist.find(x=>!before.has(x.id));if(it&&it.category!==gc)mut(()=>{it.category=gc})}}}
/* shortlist: search + Add on top, filters tucked away */
{const _sl=window.shortlist;window.shortlist=()=>{const pf=U.fOpen;U.fOpen=true;let h;try{h=_sl()}finally{U.fOpen=pf}
const tb=/<div class="short-toolbar"[^>]*>([\s\S]*?)<\/div>(?=<div class="short-(?:legend|list)")/.exec(h),qa=/<div class="compact-add">[\s\S]*?<\/div>/.exec(h);
if(tb&&qa){const t=tb[1],search=(/<input id="shortSearch"[^>]*>/.exec(t)||[''])[0],sels=(t.match(/<select[\s\S]*?<\/select>/g)||[]).join(''),act=U.shortArea!=='All areas'||U.shortCat!=='All types'||U.shortWho!=='Anyone';
const mag='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
const top=`<div class="short-top"><input id="shortquick" data-keep placeholder="Type a place or idea to add" aria-label="Add to your shortlist"/><button type="button" class="primary" data-act="short-add">Add</button><button type="button" class="ghost sq-btn ${U.shortFind||U.shortSearch?'on':''}" data-act="short-find-toggle" aria-label="Search your list" aria-expanded="${!!(U.shortFind||U.shortSearch)}">${mag}</button></div>${U.shortFind||U.shortSearch?`<div class="short-find">${search}</div>`:''}<div class="short-chips"><button type="button" class="chip ${act?'on':''}" data-act="toggle-filters" aria-expanded="${!!U.fOpen}">Filters${act?' •':''} ${U.fOpen?'▴':'▾'}</button></div>${U.fOpen?`<div class="short-filters">${sels}</div>`:''}`;
h=h.replace(qa[0],'').replace(tb[0],top)}
return h.replace(/<span class="tag">([^<]*)<\/span>/g,(m,t)=>`<span class="tag ${tagCls(t)}">${t}</span>`)}}
/* idea lab */
const GK=[['night',NIGHT],['cafe',CAFE],['food',FOOD],['shop',SHOP],['exp',EXP],['sight',SIGHT]];
const GN={night:/night/i,cafe:/cafe|café|coffee/i,food:/food|drink|cafe|café|restaurant|eat|dining/i,shop:/shop/i,exp:/experience|class|lesson/i,sight:/sight|place|landmark/i,other:/other|misc|activit|things/i};
const GD={night:'Nightlife',cafe:'Cafes',food:'Food',shop:'Shopping',exp:'Experiences',sight:'Sights',other:'Other'};
function guessKind(t){const h=GK.filter(([,re])=>re.test(t)).map(([k])=>k);return h.length?h[0]:'other'}
function pickGroup(kind){const gs=D().groups;
let g=gs.find(x=>GN[kind].test(x.name));if(!g){g={id:uuid(),name:GD[kind],options:[]};gs.push(g)}return g}
function addIdea(){const inp=document.getElementById('ideaquick');if(!inp)return;const o=parseOpt(inp.value);if(!o){toast('Paste a link or type a name');return}inp.value='';let g;
mut(()=>{g=pickGroup(guessKind(o.name+' '+(o.link||'')));g.options.push({id:uuid(),status:'Considering',votes:{},area:o.area||'',price:'',...o});U.groupOpen[g.id]=false});toast('Added to '+g.name+' · drag or edit to change')}
{const _p=window.planning;window.planning=()=>{let h=_p();
h=h.replace(/<div class="seed">[\s\S]*?<\/div>(?=<div class="addgroup">)/,'');
const add=`<div class="idea-add"><input id="ideaquick" data-keep placeholder="Paste a link or type an idea" aria-label="Add an idea"/><button type="button" class="primary" data-act="idea-add">Add</button></div>`;
return h.replace('<div class="idea-stack">',add+'<div class="idea-stack">')}}
{const _g=window.grp;window.grp=g=>{let h=_g(g);h=h.replace(/<div class="addrow"><input id="opt_[\s\S]*?<\/div>/,'').replace('<section class="linecard">',`<section class="linecard" data-gdrop="${g.id}">`);return h.replace('Nothing here yet. Paste a link or type a name below.','Nothing here yet. Add an idea above or drag one in.')}}
window.optRow=o=>{const ed=U.edit&&U.edit.kind==='opt'&&U.edit.id===o.id,u=o.link&&url(o.link),votes=o.votes||{},mine=votes[A.me]||'',booked=o.status==='Booked',owner=!!(A.data&&A.data.trip&&A.data.trip.owner),
allYes=A.people.length>1&&A.people.every(p=>votes[p.id]==='yes'),nm=u?lnk(u,o.name):esc(o.name),meta=[o.area&&'📍 '+o.area,o.price&&'₩'+o.price].filter(Boolean).join(' · ');
const chips=A.people.map(p=>{const v=votes[p.id]||'',t=`${esc(p.name)}: ${v||'not voted yet'}`;return owner&&p.id!==A.me?`<button type="button" class="pv ${v||'none'} settable" data-act="vote-other" data-id="${o.id}" data-person="${p.id}" title="${t} (tap to set)" aria-label="Set ${esc(p.name)}’s vote">${esc(ini(p.name))}</button>`:`<span class="pv ${v||'none'}" title="${t}">${esc(ini(p.name))}</span>`}).join('');
const f=findOpt(o.id),gid=f?f.g.id:'';
const edit=ed?`<div class="ef full idea-edit">${fld(o.id,'name','Name',o.name)}${fld(o.id,'link','Link',o.link,{type:'url',ph:'https://'})}<div class="two">${fld(o.id,'area','Area',o.area)}${fld(o.id,'price','Price per person',o.price)}</div>${fld(o.id,'notes','Notes',o.notes,{area:1})}<div class="two"><label class="inl"><span>Category</span><select id="e_${o.id}_group" data-keep>${D().groups.map(x=>`<option value="${x.id}" ${x.id===gid?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><label class="inl"><span>Status</span><select id="e_${o.id}_status" data-keep>${['Considering','To book','Booked'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}</select></label></div><div class="ef-actions"><button type="button" class="primary" data-act="idea-save" data-id="${o.id}">Save changes</button><button type="button" class="ghost" data-act="cancel-edit">Cancel</button></div><div class="ef-actions idea-danger"><button type="button" class="small-btn" data-act="del-opt" data-id="${o.id}">Archive</button><button type="button" class="small-btn danger" data-act="idea-del" data-id="${o.id}">Delete</button></div></div>`:'';
return `<div class="idea ${booked?'booked':''}" ${ed?'':'draggable="true"'} data-oid="${o.id}"><div class="idea-top"><div class="idea-name">${nm}${allYes?'<span class="two-yes">✓ all yes</span>':''}${booked?'<span class="badge">Booked</span>':''}</div><div class="pvs">${chips}</div><button type="button" class="dots static idea-dots" data-act="edit" data-kind="opt" data-id="${o.id}" aria-label="Edit idea">⋯</button></div>${meta||o.notes?`<div class="idea-meta">${esc(meta)}${meta&&o.notes?' · ':''}${esc(o.notes||'')}</div>`:''}<div class="idea-bot"><div class="idea-pills"><button type="button" class="pill" data-act="to-short" data-id="${o.id}">→ Shortlist</button><button type="button" class="pill" data-act="sched" data-kind="opt" data-id="${o.id}">→ Itinerary</button></div><div class="vote" aria-label="Your vote">${[['yes','✓'],['maybe','?'],['no','×']].map(([val,l])=>`<button type="button" title="${val}" class="${mine===val?'on-'+val:''}" data-act="vote" data-id="${o.id}" data-value="${val}">${l}</button>`).join('')}</div></div>${isSched(o)?schedForm('opt',o):''}${edit}</div>`};
/* owner sets someone else's vote (with confirmation) */
const closeSheet=()=>{const s=document.getElementById('ovsheet');if(s)s.remove()};
async function setVote(oid,pid,val){const f=findOpt(oid);if(!f)return;const row={option_id:oid,member_id:pid,trip_id:A.tripId,vote:val};
const r=val?await A.client.from('quest_votes').upsert(row):await A.client.from('quest_votes').delete().eq('option_id',oid).eq('member_id',pid);
if(r.error){toast('Couldn’t set that vote: '+r.error.message);return}
f.o.votes=f.o.votes||{};if(val)f.o.votes[pid]=val;else delete f.o.votes[pid];
if(A.snap&&A.snap.votes){const k=oid+'|'+pid;if(val)A.snap.votes[k]=row;else delete A.snap.votes[k]}
render();toast('Vote updated')}
function voteSheet(oid,pid){const f=findOpt(oid),p=A.people.find(x=>x.id===pid);if(!f||!p)return;closeSheet();
const d=document.createElement('div');d.id='ovsheet';d.className='ovs';
const L={yes:'Yes',maybe:'Maybe',no:'No','':'no vote'};
d.innerHTML=`<div class="ovs-card" role="dialog" aria-label="Set ${esc(p.name)}’s vote"><b>Set ${esc(p.name)}’s vote</b><span class="ovs-sub">${esc(f.o.name)}</span><div class="ovs-btns">${[['yes','✓ Yes'],['maybe','? Maybe'],['no','× No'],['','Clear']].map(([v,l])=>`<button type="button" data-ov="${v}" class="ov-${v||'clear'}">${l}</button>`).join('')}</div><button type="button" class="ghost" data-ovx>Cancel</button></div>`;
document.body.appendChild(d);
d.addEventListener('click',ev=>{const card=d.querySelector('.ovs-card');if(ev.target===d||ev.target.closest('[data-ovx]')){closeSheet();return}
const b=ev.target.closest('[data-ov]');if(b){const val=b.dataset.ov;card.innerHTML=`<b>Set ${esc(p.name)}’s vote to ${L[val]}?</b><span class="ovs-sub">${esc(f.o.name)}. This changes it for everyone.</span><div class="ovs-btns two"><button type="button" class="primary" data-go="${val}">Confirm</button><button type="button" class="ghost" data-back>Back</button></div>`;return}
const go=ev.target.closest('[data-go]');if(go){closeSheet();setVote(oid,pid,go.dataset.go);return}
if(ev.target.closest('[data-back]')){voteSheet(oid,pid)}})}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
/* handlers */
root.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;
if(a==='idea-add')addIdea();
else if(a==='short-find-toggle'){U.shortFind=!U.shortFind;if(!U.shortFind)U.shortSearch='';render();if(U.shortFind){const q=document.getElementById('shortSearch');if(q)q.focus()}}
else if(a==='vote-other'){if(A.data.trip.owner)voteSheet(id,b.dataset.person)}
else if(a==='idea-save'){const f=findOpt(id);if(!f)return;const v=k=>{const x=document.getElementById(`e_${id}_${k}`);return x?x.value.trim():''};if(!v('name')){toast('Give it a name');return}
const gid=v('group'),st=v('status')||f.o.status;U.edit=null;
mut(()=>{Object.assign(f.o,{name:v('name'),link:v('link'),area:v('area'),price:v('price'),notes:v('notes'),status:st});if(gid&&gid!==f.g.id){const ng=D().groups.find(x=>x.id===gid);if(ng){f.g.options.splice(f.i,1);ng.options.push(f.o)}}});toast('Saved')}
else if(a==='idea-del'){const f=findOpt(id);if(!f||!confirm('Delete “'+f.o.name+'” for good? Archive keeps a copy instead.'))return;const {g,i,o}=f,gid=g.id;U.edit=null;mut(()=>{g.options.splice(i,1)});toastUndo('Deleted',()=>mut(()=>restoreOpt(gid,o,i)))}});
root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='ideaquick'){e.preventDefault();addIdea()}});
/* drag an idea onto another category (desktop) */
let dragId=null;
root.addEventListener('dragstart',e=>{const c=e.target.closest&&e.target.closest('.idea[data-oid]');if(!c)return;dragId=c.dataset.oid;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',dragId)}catch(_){}c.classList.add('dragging')});
root.addEventListener('dragend',()=>{dragId=null;root.querySelectorAll('.dragging,.drop-on').forEach(x=>x.classList.remove('dragging','drop-on'))});
root.addEventListener('dragover',e=>{const s=e.target.closest&&e.target.closest('[data-gdrop]');if(!s||!dragId)return;e.preventDefault();s.classList.add('drop-on')});
root.addEventListener('dragleave',e=>{const s=e.target.closest&&e.target.closest('[data-gdrop]');if(s&&!s.contains(e.relatedTarget))s.classList.remove('drop-on')});
root.addEventListener('drop',e=>{const s=e.target.closest&&e.target.closest('[data-gdrop]');if(!s||!dragId)return;e.preventDefault();const f=findOpt(dragId),ng=D().groups.find(x=>x.id===s.dataset.gdrop);dragId=null;if(!f||!ng||ng.id===f.g.id)return;const {g,i,o}=f;
mut(()=>{g.options.splice(i,1);ng.options.push(o);U.groupOpen[ng.id]=false});toastUndo('Moved to '+ng.name,()=>mut(()=>{const c=findOpt(o.id);if(c)c.g.options.splice(c.i,1);restoreOpt(g.id,o,i)}))});
})();
