/* v4: archive, favourites, tags, quieter always-there move buttons */
U.showDone=true;
const KW=[['Restaurant',/\b(restaurant|bbq|barbecue|ramen|noodles?|sushi|steak|pizza|burger|dinner|lunch|brunch|buffet|izakaya|tteokbokki|kimchi|galbi|samgyeopsal|food)\b/i],['Cafe',/\b(cafe|café|coffee|latte|bakery|dessert|bingsu|tea ?house)\b/i],['Class',/\b(class|lesson|workshop|course)\b/i],['Beauty',/\b(salon|nails?|makeup|skincare|facial|hair|spa|color analysis|massage)\b/i],['Shopping',/\b(shopping|mall|boutique|thrift|vintage|store|shop|market)\b/i],['Sightseeing',/\b(museum|palace|temple|tower|park|hike|viewpoint|gallery|market)\b/i],['Nightlife',/\b(bar|club|pub|rooftop|karaoke|noraebang|soju)\b/i]];
/* only tags when exactly one kind of keyword matches; otherwise leaves it blank for you */
function autoTag(text){text=String(text||'');const hits=KW.filter(([,re])=>re.test(text)).map(([c])=>c);return {category:hits.length===1?hits[0]:'',area:readLocation(text).area}}
function shortQuick(){const input=$('#shortquick');if(!input)return;const p=parseQuick(input.value);if(!p)return;input.value='';const t=autoTag(p.name);mut(()=>D().shortlist.unshift({id:uuid(),name:p.name,area:p.area||t.area,category:t.category||'Activity',done:false,favorite:false,link:p.link,notes:'',place:'',interest:A.me?[A.me]:[]}));toast('Added to the shortlist')}

/* archive: a safety net and a memory */
function archiveItem(kind,obj,note){const id=uuid(),d=D(),data=JSON.parse(JSON.stringify(obj));d.archive=d.archive||[];d.archive.unshift({id,kind,data,note,at:new Date().toISOString()});A.client.from('quest_archive').insert({id,trip_id:A.tripId,kind,data,note}).then(r=>{if(r.error)toast('Couldn’t save to the archive: '+r.error.message)});return id}
function unarchive(id){const d=D();d.archive=(d.archive||[]).filter(x=>x.id!==id);A.client.from('quest_archive').delete().eq('id',id).then(r=>{if(r.error)console.warn(r.error)})}
const KIND={opt:'Idea',short:'Shortlist',plan:'Plan'};
function archRow(x){const d=x.data||{},when=x.at?new Date(x.at).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'';
return `<div class="arch-row"><div class="arch-main"><div class="arch-name"><span class="tag">${KIND[x.kind]||esc(x.kind)}</span> ${esc(d.name||'Untitled')}</div><div class="arch-sub">${esc([x.note,when,d.groupName&&'from '+d.groupName,x.kind==='plan'&&d.date?displayDate(d.date):''].filter(Boolean).join(' · '))}</div></div><div class="arch-acts"><button type="button" class="small-btn" data-act="arch-restore" data-id="${x.id}">Restore</button><button type="button" class="small-btn danger" data-act="arch-purge" data-id="${x.id}">Delete forever</button></div></div>`}
function archiveHtml(){const a=D().archive||[],open=U.archOpen;return `<section class="archive"><button type="button" class="arch-toggle" data-act="toggle-archive" aria-expanded="${!!open}">${open?'▾':'▸'} Archive <span class="muted">(${a.length})</span></button>${open?(a.length?`<div class="arch-list">${a.map(archRow).join('')}</div>`:'<p class="empty-hint">Nothing here yet. Anything you move, remove or delete ends up here.</p>'):''}</section>`}
function restoreArchived(id){const d=D(),x=(d.archive||[]).find(a=>a.id===id);if(!x)return;const o=JSON.parse(JSON.stringify(x.data||{}));unarchive(id);
if(x.kind==='opt'){const {groupId,groupName,...opt}=o;let g=d.groups.find(q=>q.id===groupId)||d.groups.find(q=>q.name===groupName);mut(()=>{if(!g){g={id:uuid(),name:groupName||'Restored',options:[]};d.groups.push(g)}g.options.push(opt)})}
else if(x.kind==='short')mut(()=>{d.shortlist.unshift(o)});else mut(()=>{d.plans.push(o)});
toast('Restored')}
function softDelete(kind,id){const d=D();U.edit=null;U.menu=null;
if(kind==='plan'){const i=d.plans.findIndex(p=>p.id===id);if(i<0)return;const p=d.plans[i],aid=archiveItem('plan',p,'Deleted');mut(()=>{d.plans.splice(i,1)});toastUndo('Plan deleted',()=>{unarchive(aid);mut(()=>{D().plans.push(p)})})}
else if(kind==='short'){const i=d.shortlist.findIndex(p=>p.id===id);if(i<0)return;const p=d.shortlist[i],aid=archiveItem('short',p,'Removed from Shortlist');mut(()=>{d.shortlist.splice(i,1)});toastUndo('Moved to the archive',()=>{unarchive(aid);mut(()=>{D().shortlist.splice(Math.min(i,D().shortlist.length),0,p)})})}
else{const f=findOpt(id);if(!f)return;const {g,i,o}=f,gid=g.id,aid=archiveItem('opt',{...o,groupId:gid,groupName:g.name},'Removed');mut(()=>{g.options.splice(i,1)});toastUndo('Moved to the archive',()=>{unarchive(aid);mut(()=>{restoreOpt(gid,o,i)})})}}
function delGroup(id){const gs=D().groups,i=gs.findIndex(g=>g.id===id);if(i<0)return;const g=gs[i],aids=g.options.map(o=>archiveItem('opt',{...o,groupId:g.id,groupName:g.name},`Category “${g.name}” deleted`));mut(()=>{gs.splice(i,1)});toastUndo(`Deleted “${g.name}”`,()=>{aids.forEach(unarchive);mut(()=>{D().groups.splice(Math.min(i,D().groups.length),0,g)})})}
function optToShort(id){const f=findOpt(id);if(!f)return;U.armed=null;const {g,i,o}=f,gid=g.id,t=autoTag(o.name+' '+(o.notes||'')),gc=guessCat(g.name);
const item={id:uuid(),name:o.name,area:o.area||t.area,category:gc!=='Activity'?gc:(t.category||'Activity'),done:false,favorite:false,link:o.link||'',notes:o.notes||'',place:'',interest:(o.votes||{})[A.me]==='yes'&&A.me?[A.me]:[]};
const aid=archiveItem('opt',{...o,groupId:gid,groupName:g.name},'Moved to Shortlist');mut(()=>{g.options.splice(i,1);D().shortlist.unshift(item)});toastUndo('Moved to Shortlist',()=>{unarchive(aid);mut(()=>{rm(D().shortlist,item.id);restoreOpt(gid,o,i)})})}
function saveSched(){const s=U.sched;if(!s)return;const d=D(),isOpt=s.kind==='opt',src=isOpt?(findOpt(s.id)||{}).o:d.shortlist.find(x=>x.id===s.id);if(!src)return;
const v=f=>{const e=document.getElementById(`s_${s.id}_${f}`);return e?e.value.trim():''};const st=parseTime(v('start')),en=parseTime(v('end'));if(st===null||en===null){toast('Couldn’t read that time. Try 1pm, 1:30pm or noon');return}
let who=[...(U.sw||[])];if(who.length>=A.people.length)who=[];let end=en;if(st&&(!end||stamp(end)<=stamp(st)))end=minutes(stamp(st)+60);
const date=v('date')||U.date,plan={id:uuid(),date,who,name:src.name,start:st,end:st?end:en,area:src.area||'',place:src.place||'',link:src.link||'',notes:src.notes||''};U.sched=null;
if(isOpt){const {g,i,o}=findOpt(s.id),gid=g.id,aid=archiveItem('opt',{...o,groupId:gid,groupName:g.name},'Added to itinerary');mut(()=>{g.options.splice(i,1);D().plans.push(plan)});U.date=date;render();toastUndo('Added to itinerary · '+displayDate(date),()=>{unarchive(aid);mut(()=>{rm(D().plans,plan.id);restoreOpt(gid,o,i)})})}
else{mut(()=>{d.plans.push(plan)});U.date=date;toast('Added to itinerary · '+displayDate(date))}}

/* planning option: move buttons always there, small and quiet; booking etc under the menu */
function optRow(o){const ed=U.edit&&U.edit.kind==='opt'&&U.edit.id===o.id,u=o.link&&url(o.link),votes=o.votes||{},mine=votes[A.me]||'',armed=U.armed===o.id;
const nm=u?lnk(u,o.name):esc(o.name),allYes=A.people.length>1&&A.people.every(p=>votes[p.id]==='yes'),booked=o.status==='Booked';
const meta=[o.area&&'📍 '+o.area,o.price&&'₩'+o.price].filter(Boolean).join(' · ');
const items=mItem('set-option-status',booked?'Unmark booked':'Mark as booked',`data-id="${o.id}" data-value="${booked?'Considering':'Booked'}"`)+mItem('edit','Edit',`data-kind="opt" data-id="${o.id}"`)+mItem('del-opt','Archive',`data-id="${o.id}"`,'danger');
return `<div class="option-wrap opt3"><div class="o3-main"><div class="o3-title">${nm}${allYes?'<span class="two-yes">✓ all yes</span>':''}${booked?'<span class="badge">Booked</span>':''}</div>${meta?`<div class="o3-meta">${esc(meta)}</div>`:''}${o.notes?`<div class="o3-meta">${esc(o.notes)}</div>`:''}<div class="o3-acts"><button type="button" class="mv ${armed?'armed':''}" data-act="${armed?'to-short':'ask-short'}" data-id="${o.id}">${armed?'Tap again to move':'→ Shortlist'}</button><button type="button" class="mv" data-act="sched" data-kind="opt" data-id="${o.id}">→ Itinerary</button></div></div><div class="o3-side"><div class="pvs">${A.people.map(p=>pv(p,votes[p.id])).join('')}</div><div class="vote" aria-label="Your vote">${[['yes','✓'],['maybe','?'],['no','×']].map(([val,l])=>`<button type="button" title="${val}" class="${mine===val?'on-'+val:''}" data-act="vote" data-id="${o.id}" data-value="${val}">${l}</button>`).join('')}</div></div>${menuBtn('opt',o.id,items)}${isSched(o)?schedForm('opt',o):''}${ed?`<div class="ef full">${fld(o.id,'name','Name',o.name)}${fld(o.id,'link','Link',o.link,{type:'url',ph:'https://'})}<div class="two">${fld(o.id,'area','Area',o.area)}${fld(o.id,'price','Price per person',o.price)}</div>${fld(o.id,'notes','Notes',o.notes,{area:1})}${editBar('opt',o.id)}</div>`:''}</div>`}

/* shortlist: star, tag chips, Archive wording */
{const _sr=window.shortRow;window.shortRow=i=>{let h=_sr(i);
const star=`<button type="button" class="star ${i.favorite?'on':''}" data-act="fav" data-id="${i.id}" aria-pressed="${!!i.favorite}" title="${i.favorite?'Unpin':'Pin to the top'}" aria-label="Favourite">${i.favorite?'★':'☆'}</button>`;
h=h.replace('<div class="person-pick">',star+'<div class="person-pick">');
/* no icon here: the "·" separator between tags already comes from CSS (.tag+.tag:before),
   and v44's own location pin already sits right after this row, so a second pin here just
   duplicated it (that doubled-up glyph is what showed up as stray "b7"-looking text on some
   fonts) */
h=h.replace(/<div class="sl-meta">.*?<\/div>/,`<div class="sl-tags">${i.category?`<span class="tag">${esc(i.category)}</span>`:''}${i.area?`<span class="tag area">${esc(i.area)}</span>`:''}</div>`);
return h.replace(/(role="menuitem" class="danger" data-act="del-short"[^>]*>)Delete</,'$1Archive<')}}
{const _sl=window.shortlist;window.shortlist=()=>{return _sl()+archiveHtml()}}
{const _pl=window.planning;window.planning=()=>_pl().replace(/Grey circle[^<]*/,'Grey circle = hasn’t voted yet. → Shortlist and → Itinerary move an idea on, no need to wait for everyone. Moved or removed ideas wait in the Archive.')+archiveHtml()}

/* handlers */
root.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const m=/^del-(plan|opt|short)$/.exec(b.dataset.act);if(m){e.stopImmediatePropagation();softDelete(m[1],b.dataset.id)}},true);
root.addEventListener('click',e=>{if(e.target.closest('a[href]'))return;const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;
if(a==='fav'){const it=D().shortlist.find(x=>x.id===id);if(it)mut(()=>{it.favorite=!it.favorite})}
else if(a==='ask-short'){U.armed=id;render();setTimeout(()=>{if(U.armed===id){U.armed=null;render()}},3000)}
else if(a==='toggle-archive'){U.archOpen=!U.archOpen;render()}
else if(a==='arch-restore')restoreArchived(id);
else if(a==='arch-purge'){if(confirm('Delete this forever? This can’t be undone.'))unarchive(id),render()}
});
