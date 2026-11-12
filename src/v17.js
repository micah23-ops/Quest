/* v17: Trip Details hub — Group | Mine, four sections, flexible cards, quick actions, private files, solo mode */
(()=>{
const SEC=[['stay','Accommodation','Add a hotel, Airbnb or stay'],['arrive','Arrivals','Add a flight, train or transfer in'],['depart','Departures','Add a flight, train or transfer home'],['other','Other','Add anything else worth keeping handy']];
const FD={address:'Full address',area:'Area / neighborhood',maps:'Google Maps link',checkin:'Check-in',checkout:'Check-out',unit:'Unit / room #',cost:'Cost',code:'Door / room code',ref:'Booking reference',link:'Website / confirmation link',phone:'Phone',who:'Traveler',when:'Date & time',route:'Transport'};
const PH={address:'Street, building, city',area:'Seongsu, Seoul',maps:'https://maps.app.goo.gl/…',checkin:'Nov 16, 3pm',checkout:'Nov 22, 11am',unit:'Unit 1204',cost:'₩180,000 / night',code:'1234#',ref:'ABC123',link:'https://',phone:'+82 10 1234 5678',who:'Mai',when:'Nov 17, 4:05am',route:'KE 624 · MNL → ICN'};
const OFFER={stay:['unit','code','checkin','checkout','area','address','maps','cost','ref','phone','link'],arrive:['who','when','route','ref','link','phone','maps'],depart:['who','when','route','ref','link','phone','maps'],other:['when','area','address','ref','link','phone','maps','code']};
const DEF={stay:['unit','code','checkin','checkout','area','address'],arrive:['who','when','route'],depart:['who','when','route'],other:[]};
const ORDER=['who','when','route','unit','code','dates','area','address','maps','cost','ref','phone','link'];
const SB=()=>A.client.storage.from('quest-files');
const INFO={rows:[],files:[],urls:{},at:0,trip:null,ch:null,chTrip:null};
const solo=()=>A.people.length<=1;
const offer=s=>OFFER[s].filter(k=>!(solo()&&k==='who'));
const defs=s=>DEF[s].filter(k=>!(solo()&&k==='who'));
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return u}};
const mapsQ=a=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(a);
const tel=p=>String(p||'').replace(/[^\d+]/g,'');
const mineOk=r=>r.scope==='group'||r.owner_id===(A.user&&A.user.id);
/* ---------- data ---------- */
async function loadInfo(){const tid=A.tripId;if(!tid||!A.client)return;
try{const [r,f]=await Promise.all([A.client.from('quest_info').select('*').eq('trip_id',tid).order('created_at'),A.client.from('quest_info_files').select('*').eq('trip_id',tid).order('created_at')]);
if(r.error||f.error)throw (r.error||f.error);
INFO.rows=(r.data||[]).filter(mineOk);const ids=new Set(INFO.rows.map(x=>x.id));INFO.files=(f.data||[]).filter(x=>ids.has(x.info_id));
await signUrls()}catch(e){console.warn('info load',e&&e.message)}
INFO.trip=tid}
async function signUrls(){const paths=INFO.files.map(x=>x.path);INFO.urls={};if(!paths.length){INFO.at=Date.now();return}
const r=await SB().createSignedUrls(paths,3600);(r.data||[]).forEach(x=>{if(x&&x.signedUrl)INFO.urls[x.path]=x.signedUrl});INFO.at=Date.now()}
function subInfo(){if(!A.client||INFO.chTrip===A.tripId)return;if(INFO.ch)try{A.client.removeChannel(INFO.ch)}catch(e){}INFO.chTrip=A.tripId;const c=A.client.channel('quest_info_'+A.tripId);
['quest_info','quest_info_files'].forEach(tb=>c.on('postgres_changes',{event:'*',schema:'public',table:tb},()=>{clearTimeout(INFO.t);const go=async()=>{const ae=document.activeElement;if(document.getElementById('infoEdit')||(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName)&&root.contains(ae))){INFO.t=setTimeout(go,1200);return}await loadInfo();render()};INFO.t=setTimeout(go,400)}));INFO.ch=c.subscribe()}
{const _l=window.loadTrip;window.loadTrip=async function(){const first=A.tripId!==INFO.trip;const ok=await _l.apply(this,arguments);if(ok){if(first){U.hubTab='group';U.hubOpen={};U.hubMenu=null}await loadInfo();subInfo()}return ok}}
/* ---------- helpers ---------- */
async function copyText(t){try{await navigator.clipboard.writeText(t)}catch(e){const ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(_){}ta.remove()}toast('Copied')}
const cb=v=>`<button type="button" class="small-btn" data-act="hub-copy" data-v="${esc(v)}">Copy</button>`;
const ob=(href,l)=>`<a class="small-btn" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${l}</a>`;
const lockOn=id=>!!(U.hubShow&&U.hubShow[id]);
const lockBtn=id=>`<button type="button" class="small-btn lk" data-act="hub-lock" data-id="${id}" aria-pressed="${lockOn(id)}">${lockOn(id)?'🔓 Hide':'🔒 Show'}</button>`;
function cell(k,v,rid){const e=esc(v);
if(k==='address')return{l:'Address',h:`<a href="${esc(mapsQ(v))}" target="_blank" rel="noopener noreferrer">${e}</a>`,b:cb(v)};
if(k==='unit')return{l:'Unit / room',h:lockOn(rid)?`<span class="code unit">${e}</span>`:`<span class="code lkd">••••</span>`,b:lockBtn(rid)+(lockOn(rid)?cb(v):'')};
if(k==='maps'){const u=url(v);return{l:'Map',h:u?`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(host(u))}</a>`:e,b:(u?ob(u,'Open Maps'):'')+cb(v)}}
if(k==='code')return{l:'Door / room code',h:lockOn(rid)?`<span class="code">${e}</span>`:`<span class="code lkd">••••</span>`,b:lockBtn(rid)+(lockOn(rid)?cb(v):'')};
if(k==='ref')return{l:'Booking ref',h:`<span class="code sm">${e}</span>`,b:cb(v)};
if(k==='phone'){const t=tel(v);return{l:'Phone',h:e,b:(t?`<a class="small-btn" href="tel:${t}">Call</a>`:'')+cb(v)}}
if(k==='link'){const u=url(v);return{l:'Link',h:u?`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(host(u))}</a>`:e,b:u?ob(u,'Open'):''}}
return{l:k==='area'?'Area':(FD[k]||k),h:e,b:''}}
function rowsOf(r){const f=r.fields||{},pin=new Set(r.pinned||[]),out=[];
ORDER.forEach(k=>{if(k==='dates'){if(!f.checkin&&!f.checkout)return;out.push({k,l:'Dates',h:esc([f.checkin&&'In '+f.checkin,f.checkout&&'Out '+f.checkout].filter(Boolean).join('  →  ')),b:'',pin:pin.has('checkin')||pin.has('checkout')});return}
const v=f[k];if(!v)return;out.push({k,...cell(k,v,r.id),pin:pin.has(k)})});return out}
const rowHtml=x=>`<div class="hc-row k-${x.k}"><span class="hc-l">${x.l}</span><span class="hc-v">${x.h}</span>${x.b?`<span class="hc-b">${x.b}</span>`:''}</div>`;
function plain(r){const f=r.fields||{},L=[r.title];ORDER.forEach(k=>{if(k==='dates'){if(f.checkin)L.push('Check-in: '+f.checkin);if(f.checkout)L.push('Check-out: '+f.checkout);return}if(f[k])L.push((FD[k]||k)+': '+f[k])});if(f.pnote)L.push('',f.pnote);if(r.notes)L.push('',r.notes);return L.join('\n')}
/* ---------- cards ---------- */
const hasGeo=r=>{const f=r.fields||{};return f.lat!=null&&f.lat!==''&&f.lng!=null&&f.lng!==''&&isFinite(f.lat)&&isFinite(f.lng)};
const mapRow=r=>hasGeo(r)?`<div class="hc-map"><span>📍 On the map and route planner</span><button type="button" class="small-btn" data-act="hub-unpin" data-id="${r.id}">Remove</button></div>`:((r.fields&&(r.fields.address||r.title))?`<div class="hc-map"><button type="button" class="small-btn" data-act="hub-pin" data-id="${r.id}">📍 Add to map and route</button></div>`:'');
async function pinStay(id){const r=byId(id);if(!r)return false;const c=window.__q43;if(!c){toast('Map search isn’t available right now');return false}
const f=r.fields||{},q=[r.title,f.address||f.area].filter(Boolean).join(' ').slice(0,160);toast('Finding it on the map…');
let res;try{res=await c.call(Object.assign({action:'text',query:q},c.ctx()))}catch(e){res={error:'offline'}}
const x=res&&!res.error&&(res.places||[]).find(p=>p.lat!=null&&p.lng!=null);
if(!x){toast(res&&res.error==='limit'?'Map search is resting for now. Try again later.':'Couldn’t find it on the map. Check the address.');return false}
r.fields={...f,lat:x.lat,lng:x.lng};const up=await A.client.from('quest_info').upsert({id:r.id,trip_id:r.trip_id,scope:r.scope,section:r.section,title:r.title,notes:r.notes||'',fields:r.fields,pinned:r.pinned||[]});
if(up.error){delete r.fields.lat;delete r.fields.lng;toast('Couldn’t save the pin');return false}
toast('On the map: '+(x.name||r.title));render();return true}
async function unpinStay(id){const r=byId(id);if(!r)return;const f={...(r.fields||{})};delete f.lat;delete f.lng;r.fields=f;await A.client.from('quest_info').upsert({id:r.id,trip_id:r.trip_id,scope:r.scope,section:r.section,title:r.title,notes:r.notes||'',fields:f,pinned:r.pinned||[]});render();toast('Removed from the map')}
function card(r){const open=!!(U.hubOpen&&U.hubOpen[r.id]),rows=rowsOf(r),files=INFO.files.filter(x=>x.info_id===r.id),pr=rows.filter(x=>x.pin),rest=rows.filter(x=>!x.pin),more=rest.length||r.notes||files.length;
const hint=[rest.length?rest.length+' detail'+(rest.length>1?'s':''):'',r.notes?'notes':'',files.length?files.length+' file'+(files.length>1?'s':''):''].filter(Boolean).join(' · ');
const thumbs=files.map((f,i)=>{const u=INFO.urls[f.path];return /^image\//.test(f.mime)&&u?`<button type="button" class="hc-file" data-act="hub-view" data-id="${r.id}" data-i="${i}" aria-label="Open ${esc(f.name)}"><img src="${esc(u)}" alt="" loading="lazy"></button>`:`<button type="button" class="hc-file pdf" data-act="hub-view" data-id="${r.id}" data-i="${i}" aria-label="Open ${esc(f.name)}"><b>PDF</b><span>${esc(f.name)}</span></button>`}).join('');
return `<article class="hc ${open?'open':''}" data-card="${r.id}"><div class="hc-top"><button type="button" class="hc-head" data-act="hub-exp" data-id="${r.id}" aria-expanded="${open}"><b>${esc(r.title||'Untitled')}</b>${more?`<span class="chev">${open?'▴':'▾'}</span>`:''}</button><div class="hc-menuwrap"><button type="button" class="dots static" data-act="hub-menu" data-id="${r.id}" aria-label="Card options" aria-haspopup="true">⋯</button><div class="hc-menu" hidden><button type="button" data-act="hub-edit" data-id="${r.id}">Edit</button><button type="button" class="danger" data-act="hub-del" data-id="${r.id}">Delete</button></div></div></div>
${pr.map(rowHtml).join('')}${r.section==='stay'?mapRow(r):''}${(r.fields&&r.fields.pnote)?`<div class="hc-pnote">${esc(r.fields.pnote)}</div>`:''}
${open?rest.map(rowHtml).join('')+(r.notes?`<div class="hc-notes">${esc(r.notes)}</div>`:'')+(files.length?`<div class="hc-files">${thumbs}</div>`:'')+`<div class="hc-foot"><button type="button" class="small-btn" data-act="hub-copyall" data-id="${r.id}">Copy all</button></div>`:(more?`<button type="button" class="hc-more" data-act="hub-exp" data-id="${r.id}">${esc(hint)} ▾</button>`:'')}</article>`}
function hubHtml(){const tab=U.hubTab||'group',me=!!A.user;
const tabs=`<div class="hub-tabs" role="tablist"><button type="button" role="tab" aria-selected="${tab==='group'}" class="${tab==='group'?'on':''}" data-act="hub-tab" data-t="group">Group</button><button type="button" role="tab" aria-selected="${tab==='mine'}" class="${tab==='mine'?'on':''}" data-act="hub-tab" data-t="mine">Mine <span aria-hidden="true">🔒</span></button></div><p class="hub-note">${tab==='mine'?'Private. Only you can see this, including your files.':(solo()?'Your trip info, all in one place.':'Everyone on the trip can see this.')}</p>`;
if(tab==='mine'&&!me)return tabs+'<div class="hub-empty">Sign in to use your private notes.</div>';
const rows=INFO.rows.filter(r=>r.scope===tab&&mineOk(r));
return tabs+SEC.map(([k,l,h])=>{const rs=rows.filter(r=>r.section===k);return `<section class="hub-sec"><div class="hub-sh"><h3>${l}</h3><button type="button" class="small-btn" data-act="hub-add" data-sec="${k}">+ Add</button></div>${rs.length?rs.map(card).join(''):`<button type="button" class="hub-empty" data-act="hub-add" data-sec="${k}">${h}</button>`}</section>`}).join('')}
{window.detailsCard=()=>{const t=D().trip,n=A.people.length,meta=[t.city,t.from?fmtRange(t.from,t.to):'',n+' traveler'+(n===1?'':'s')].filter(Boolean).join(' · '),open=!!U.detailsOpen;
const g=INFO.rows.filter(r=>r.scope==='group'),sum=g.filter(r=>r.section==='stay').slice(0,2).map(r=>`<div>${esc(r.title)}</div>`).join('')||'<div class="muted">Stays, flights, codes and files. Tap to open.</div>';
return `<div class="dtrip"><div><b>${esc(t.name||t.city||'Untitled trip')}</b><span>${esc(meta)}</span></div><button type="button" class="edit-link" data-act="trip-settings">edit</button></div><section class="details-card panel hub ${open?'open':''}" id="detailsCard"><button type="button" class="dc-head" data-act="toggle-details" aria-expanded="${open}"><span>Trip details</span><span class="chev">${open?'▴':'▾'}</span></button>${open?`<div class="hub-body">${hubHtml()}</div>`:`<div class="dc-sum" data-act="toggle-details">${sum}</div>`}</section>`}}
/* default to Group whenever Trip details opens */
{const _r=window.render;let was=false;window.render=function(){const now=!!(U.dsheet||U.detailsOpen);if(now&&!was)U.hubTab='group';was=now;
try{document.body.classList.toggle('solo',solo())}catch(e){}return _r.apply(this,arguments)}}
/* ---------- actions ---------- */
const byId=id=>INFO.rows.find(x=>x.id===id);
document.addEventListener('click',e=>{if(!e.target.closest('.hc-menuwrap'))document.querySelectorAll('.hc-menu:not([hidden])').forEach(m=>m.hidden=true)});
root.addEventListener('click',async e=>{const b=e.target.closest('[data-act^="hub-"]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;e.stopImmediatePropagation();
if(a==='hub-tab'){U.hubTab=b.dataset.t;U.hubOpen={};render();return}
if(a==='hub-exp'){U.hubOpen=U.hubOpen||{};U.hubOpen[id]=!U.hubOpen[id];render();return}
if(a==='hub-menu'){const m=b.parentNode.querySelector('.hc-menu'),was=m.hidden;document.querySelectorAll('.hc-menu').forEach(x=>x.hidden=true);m.hidden=!was;return}
if(a==='hub-lock'){U.hubShow=U.hubShow||{};U.hubShow[id]=!U.hubShow[id];render();return}
if(a==='hub-pin'){pinStay(id);return}
if(a==='hub-unpin'){unpinStay(id);return}
if(a==='hub-copy'){copyText(b.dataset.v);return}
if(a==='hub-copyall'){const r=byId(id);if(r)copyText(plain(r));return}
if(a==='hub-add'){openEdit(null,b.dataset.sec);return}
if(a==='hub-edit'){openEdit(byId(id));return}
if(a==='hub-del'){delCard(id);return}
if(a==='hub-view'){const r=byId(id),fs=INFO.files.filter(x=>x.info_id===id);if(INFO.at&&Date.now()-INFO.at>50*60*1000)await signUrls();openGallery(fs.map(f=>({url:INFO.urls[f.path],name:f.name,mime:f.mime})).filter(x=>x.url),+b.dataset.i||0)}},true);
async function delCard(id){const r=byId(id);if(!r||!confirm('Delete “'+(r.title||'this card')+'” and its files?'))return;
const paths=INFO.files.filter(x=>x.info_id===id).map(x=>x.path);const d=await A.client.from('quest_info').delete().eq('id',id);if(d.error){toast('Couldn’t delete: '+d.error.message);return}
if(paths.length)try{await SB().remove(paths)}catch(e){}await loadInfo();render();toast('Deleted')}
/* ---------- edit pop-up (lives outside render so sync never wipes what you type) ---------- */
let E=null;
function openEdit(r,sec){closeEdit();const me=A.people.find(p=>p.id===A.me);
E=r?{id:r.id,scope:r.scope,section:r.section,title:r.title,notes:r.notes,fields:{...(r.fields||{})},pnote:(r.fields||{}).pnote||'',geo:hasGeo(r)?{lat:r.fields.lat,lng:r.fields.lng}:null,addr0:(r.fields||{}).address||'',keys:Object.keys(r.fields||{}).filter(k=>FD[k]),pinned:new Set(r.pinned||[]),queue:[],removed:new Set(),files:INFO.files.filter(x=>x.info_id===r.id)}
:{id:null,scope:U.hubTab==='mine'?'mine':'group',section:sec||'other',title:'',notes:'',pnote:'',fields:{},keys:[],pinned:new Set(),queue:[],removed:new Set(),files:[]};
E.me=me?first(me.name):'';const d=document.createElement('div');d.id='infoEdit';d.className='ie-ov';document.body.appendChild(d);paintEdit();setTimeout(()=>{const t=document.getElementById('ie_title');if(t&&!E.id)t.focus()},60)}
function closeEdit(){const d=document.getElementById('infoEdit');if(d)d.remove();E=null}
function collect(){if(!E)return;const g=id=>document.getElementById(id);if(g('ie_title'))E.title=g('ie_title').value;if(g('ie_notes'))E.notes=g('ie_notes').value;if(g('ie_pnote'))E.pnote=g('ie_pnote').value;document.querySelectorAll('#infoEdit [data-fk]').forEach(i=>{E.fields[i.dataset.fk]=i.value})}
function paintEdit(){const d=document.getElementById('infoEdit');if(!d||!E)return;const sc=E.scope==='mine';
const fileRows=E.files.filter(f=>!E.removed.has(f.id)).map(f=>`<div class="ie-file"><span>${/^image\//.test(f.mime)?'🖼':'📄'} ${esc(f.name)}</span><button type="button" data-rmfile="${f.id}" aria-label="Remove ${esc(f.name)}">×</button></div>`).join('')+E.queue.map((f,i)=>`<div class="ie-file new"><span>＋ ${esc(f.name||'file')}</span><button type="button" data-rmq="${i}" aria-label="Remove">×</button></div>`).join('');
const rest=offer(E.section).filter(k=>!E.keys.includes(k));
d.innerHTML=`<form class="ie-card" role="dialog" aria-label="${E.id?'Edit card':'New card'}" autocomplete="off"><div class="ie-head"><b>${E.id?'Edit card':'New card'}</b><span class="ie-scope">${sc?'🔒 Only you':'Whole trip'}</span><button type="button" class="ie-x" data-ie="close" aria-label="Close">×</button></div>
<div class="ie-secs" role="radiogroup" aria-label="Section">${SEC.map(([k,l])=>`<button type="button" role="radio" aria-checked="${E.section===k}" class="${E.section===k?'on':''}" data-sec="${k}">${l}</button>`).join('')}</div>
<input id="ie_title" class="ie-title" value="${esc(E.title)}" placeholder="${E.section==='stay'?'Hotel or stay name':E.section==='other'?'Title':'Flight, train or transfer'}" maxlength="120" enterkeyhint="done">
<div class="ie-fields">${E.keys.map(k=>`<div class="ie-f"><label for="ie_f_${k}">${FD[k]}</label><div class="ie-fr"><input id="ie_f_${k}" data-fk="${k}" value="${esc(E.fields[k]||'')}" placeholder="${esc(PH[k]||'')}" ${k==='phone'?'inputmode="tel"':''}><button type="button" class="ie-pin ${E.pinned.has(k)?'on':''}" data-pin="${k}" aria-pressed="${E.pinned.has(k)}" title="Show this on the compact card">${E.pinned.has(k)?'On card':'In details'}</button><button type="button" class="ie-rm" data-rmf="${k}" aria-label="Remove ${FD[k]}">×</button></div></div>`).join('')}</div>
${rest.length?`<div class="ie-add"><span>Add detail</span>${rest.map(k=>`<button type="button" class="chip" data-addf="${k}">${FD[k]}</button>`).join('')}</div>`:''}
<label class="ie-nl" for="ie_pnote">Note on the card <small>always visible</small></label><textarea id="ie_pnote" class="ie-notes" rows="2" placeholder="Quick things to see at a glance: which door, lobby code, how to find it.">${esc(E.pnote||'')}</textarea><label class="ie-nl" for="ie_notes">More notes <small>hidden until you open the card</small></label><textarea id="ie_notes" class="ie-notes" rows="4" placeholder="House rules, booking details, anything else. Line breaks are kept.">${esc(E.notes)}</textarea>
<div class="ie-files">${fileRows}<label class="ie-up"><input type="file" id="ie_file" accept="image/*,application/pdf" multiple hidden>＋ Photo, screenshot or PDF</label></div>
<div class="ie-actions">${E.id?'<button type="button" class="ie-del" data-ie="del">Delete</button>':'<span></span>'}<div><button type="button" class="ghost" data-ie="close">Cancel</button><button type="submit" class="primary" data-ie="save">Save</button></div></div></form>`}
document.addEventListener('click',async e=>{const d=document.getElementById('infoEdit');if(!d||!E)return;
if(e.target===d){closeEdit();return}const t=e.target.closest('#infoEdit [data-ie],#infoEdit [data-sec],#infoEdit [data-pin],#infoEdit [data-rmf],#infoEdit [data-addf],#infoEdit [data-rmfile],#infoEdit [data-rmq]');if(!t)return;
if(t.dataset.ie==='close'){closeEdit();return}
if(t.dataset.ie==='del'){const id=E.id;closeEdit();delCard(id);return}
collect();
if(t.dataset.sec){E.section=t.dataset.sec;paintEdit();return}
if(t.dataset.pin){const k=t.dataset.pin;E.pinned.has(k)?E.pinned.delete(k):E.pinned.add(k);paintEdit();return}
if(t.dataset.rmf){const k=t.dataset.rmf;E.keys=E.keys.filter(x=>x!==k);delete E.fields[k];E.pinned.delete(k);paintEdit();return}
if(t.dataset.addf){const k=t.dataset.addf;E.keys.push(k);if(k==='who'&&!E.fields.who)E.fields.who=E.me;if(defs(E.section).includes(k))E.pinned.add(k);paintEdit();const i=document.getElementById('ie_f_'+k);if(i)i.focus();return}
if(t.dataset.rmfile){E.removed.add(t.dataset.rmfile);paintEdit();return}
if(t.dataset.rmq){E.queue.splice(+t.dataset.rmq,1);paintEdit()}},true);
document.addEventListener('change',e=>{const i=e.target.closest&&e.target.closest('#ie_file');if(!i||!E)return;collect();[...i.files].forEach(f=>E.queue.push(f));i.value='';paintEdit()});
document.addEventListener('submit',e=>{if(e.target.closest&&e.target.closest('#infoEdit')){e.preventDefault();saveEdit()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('infoEdit')&&!document.getElementById('hubViewer'))closeEdit()});
async function prep(f){if(f.type==='application/pdf'){if(f.size>10*1048576)throw new Error('That PDF is over 10 MB');return {blob:f,mime:'application/pdf',ext:'pdf'}}
if(!/^image\//.test(f.type))throw new Error('Photos and PDFs only');const bmp=await createImageBitmap(f),s=Math.min(1,1800/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');c.width=Math.round(bmp.width*s);c.height=Math.round(bmp.height*s);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(bmp,0,0,c.width,c.height);
const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.85));return {blob,mime:'image/jpeg',ext:'jpg'}}
let saving=false;
async function saveEdit(){if(!E||saving)return;collect();const title=E.title.trim();if(!title){toast('Give it a title');const t=document.getElementById('ie_title');if(t)t.focus();return}
saving=true;const btn=document.querySelector('#infoEdit [data-ie=save]');if(btn){btn.disabled=true;btn.textContent='Saving…'}
try{const id=E.id||uuid(),fields={};E.keys.forEach(k=>{const v=(E.fields[k]||'').trim();if(v)fields[k]=v});const pinned=Object.keys(fields).filter(k=>E.pinned.has(k));if(E.geo&&(fields.address||'')===E.addr0){fields.lat=E.geo.lat;fields.lng=E.geo.lng}{const pn=(E.pnote||'').replace(/\s+$/,'');if(pn)fields.pnote=pn}
const row={id,trip_id:A.tripId,scope:E.scope,section:E.section,title,notes:E.notes.replace(/\s+$/,''),fields,pinned};if(!E.id)row.owner_id=A.user.id;
const r=await A.client.from('quest_info').upsert(row);if(r.error)throw r.error;
let failed=0;for(const f of E.queue){try{const p=await prep(f),path=E.scope==='mine'?`mine/${A.user.id}/${A.tripId}/${uuid()}.${p.ext}`:`${A.tripId}/info/${uuid()}.${p.ext}`,up=await SB().upload(path,p.blob,{contentType:p.mime});if(up.error)throw up.error;
const ins=await A.client.from('quest_info_files').insert({info_id:id,trip_id:A.tripId,scope:E.scope,path,name:(f.name||'file').replace(/\.[^.]+$/,'').slice(0,60)||'file',mime:p.mime,size:p.blob.size});if(ins.error)throw ins.error}catch(err){failed++;toast('Couldn’t attach: '+(err.message||err))}}
const rm=E.files.filter(f=>E.removed.has(f.id));for(const f of rm){await A.client.from('quest_info_files').delete().eq('id',f.id)}if(rm.length)try{await SB().remove(rm.map(f=>f.path))}catch(_){}
const wasNew=!E.id;closeEdit();await loadInfo();U.hubTab=U.hubTab||'group';if(wasNew){U.hubOpen=U.hubOpen||{};}render();if(!failed)toast('Saved')}
catch(err){toast('Couldn’t save: '+(err.message||err));if(btn){btn.disabled=false;btn.textContent='Save'}}finally{saving=false}}
/* ---------- swipe-through viewer (also used for itinerary photos) ---------- */
function closeGallery(){const g=document.getElementById('hubViewer');if(g)g.remove();const o=document.getElementById('viewer');if(o)o.remove()}
function openGallery(items,start){if(!items.length)return;closeGallery();const g=document.createElement('div');g.id='hubViewer';g.className='gv';g.setAttribute('role','dialog');g.setAttribute('aria-label','Files');
const many=items.length>1;
g.innerHTML=`<div class="gv-top"><b class="gv-name"></b><span class="gv-n"></span><button type="button" class="gv-x" data-gv="close" aria-label="Close">×</button></div><div class="gv-track">${items.map(it=>/^image\//.test(it.mime)?`<div class="gv-slide"><img src="${esc(it.url)}" alt="${esc(it.name)}"></div>`:`<div class="gv-slide"><div class="gv-pdf"><p>📄 ${esc(it.name)}</p><a class="primary" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">Open PDF</a></div></div>`).join('')}</div>${many?'<button type="button" class="gv-nav prev" data-gv="prev" aria-label="Previous">‹</button><button type="button" class="gv-nav next" data-gv="next" aria-label="Next">›</button>':''}<div class="gv-foot"><span>${many?'Swipe for more · ':''}Tap a photo to zoom</span><a class="gv-open" href="#" target="_blank" rel="noopener noreferrer">Open full size</a></div>`;
document.body.appendChild(g);const tr=g.querySelector('.gv-track'),slides=[...g.querySelectorAll('.gv-slide')];let cur=0;
const upd=()=>{g.querySelector('.gv-name').textContent=items[cur].name;g.querySelector('.gv-n').textContent=many?(cur+1)+' / '+items.length:'';g.querySelector('.gv-open').href=items[cur].url;const p=g.querySelector('.prev'),n=g.querySelector('.next');if(p){p.hidden=cur===0;n.hidden=cur===items.length-1}};
const go=i=>{cur=Math.max(0,Math.min(items.length-1,i));tr.scrollTo({left:cur*tr.clientWidth,behavior:'smooth'});upd()};
tr.addEventListener('scroll',()=>{const i=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));if(i!==cur){cur=i;upd()}});
g.addEventListener('click',ev=>{const t=ev.target.closest('[data-gv]');if(t){const a=t.dataset.gv;if(a==='close')closeGallery();else if(a==='prev')go(cur-1);else go(cur+1);return}
const im=ev.target.closest('.gv-slide img');if(im){im.closest('.gv-slide').classList.toggle('zoom');return}if(ev.target===tr||ev.target.classList.contains('gv-slide')||ev.target===g)closeGallery()});
g.tabIndex=-1;g.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeGallery();else if(ev.key==='ArrowLeft')go(cur-1);else if(ev.key==='ArrowRight')go(cur+1)});
tr.scrollLeft=start*tr.clientWidth;cur=start;upd();g.focus()}
/* itinerary photos: take over the old single-photo viewer so you can swipe through all of a plan's photos */
document.addEventListener('click',e=>{const v=e.target.closest('[data-attview]');if(!v||!v.querySelector('img'))return;const grid=v.closest('.att-grid');if(!grid)return;
const btns=[...grid.querySelectorAll('.att-open')].filter(x=>x.querySelector('img')),items=btns.map(x=>({url:x.querySelector('img').src,name:(x.querySelector('small')||{}).textContent||'Photo',mime:'image/jpeg'}));if(!items.length)return;
const old=document.getElementById('viewer');if(old)old.remove();e.stopImmediatePropagation();openGallery(items,Math.max(0,btns.indexOf(v)))},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGallery()},true);
/* ---------- unique name badges: shortest prefix that tells everyone on the trip apart ---------- */
function badges(){const names=A.people.map(p=>[p.id,String(p.name||'?').trim().split(/\s+/)[0]]),out={};
names.forEach(([id,n])=>{let L=1;const other=names.filter(x=>x[0]!==id).map(x=>x[1].toLowerCase());while(L<n.length&&other.some(o=>o.slice(0,L)===n.toLowerCase().slice(0,L)))L++;out[n.toLowerCase()]=n.slice(0,L).charAt(0).toUpperCase()+n.slice(1,L).toLowerCase()});return out}
function fixBadges(){try{if(A.people.length<2)return;const b=badges();document.querySelectorAll('.pv[title]').forEach(el=>{const nm=(el.getAttribute('title')||'').split(':')[0].trim().split(/\s+/)[0].toLowerCase();if(b[nm])el.textContent=b[nm]})}catch(e){}}
{const _r=window.render;window.render=function(){const r=_r.apply(this,arguments);fixBadges();return r}}
/* ---------- remove someone / leave the trip ---------- */
{const _d=window.drawer;window.drawer=()=>{let h=_d();if(U.modal==='settings'){const owner=!!(A.data&&A.data.trip&&A.data.trip.owner);A.people.forEach(p=>{const self=p.id===A.me;if(!(owner&&!self)&&!(self&&!owner))return;h=h.replace(new RegExp('(<input id="pn_'+p.id+'"[^>]*/>)'),'$1<button type="button" class="small-btn danger rm-person" data-act="rm-member" data-m="'+p.id+'">'+(self?'Leave this trip':'Remove from trip')+'</button>')})}return h}}
root.addEventListener('click',async e=>{const b=e.target.closest('[data-act="rm-member"]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();const id=b.dataset.m,p=A.people.find(x=>x.id===id);if(!p)return;const self=id===A.me;
if(!confirm(self?'Leave this trip? Your plans and votes will be removed, and your private notes deleted.':'Remove '+first(p.name)+' from the trip? Their votes and solo plans go with them, and their private notes are deleted.'))return;
if(self){const mine=INFO.files.filter(f=>f.scope==='mine'&&f.owner_id===A.user.id).map(f=>f.path);if(mine.length)try{await SB().remove(mine)}catch(_){}}
const r=await A.client.rpc('quest_remove_member',{p_member:id});if(r.error){toast('Couldn’t do that: '+r.error.message);return}
U.modal=null;if(self){setLast(null);await loadTrips();U.screen='trips';render();toast('You left the trip')}else{await loadTrip();render();toast(first(p.name)+' was removed')}},true);
window.__hub={INFO,openEdit,openGallery,loadInfo,pinStay};
})();
