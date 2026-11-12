/* v13: booking attachments (plans + trip details) and travel-info extras */
(()=>{
const AT={list:[],urls:{},t:0},SB=()=>A.client.storage.from('quest-files');
const forPlan=id=>AT.list.filter(a=>a.kind==='plan'&&a.owner_id===id),forTrip=()=>AT.list.filter(a=>a.kind==='trip');
async function loadAtt(){if(!A.client||!A.tripId)return;const r=await A.client.from('quest_attachments').select('*').eq('trip_id',A.tripId).order('created_at');AT.list=r.error?[]:(r.data||[]);
const stale=Date.now()-AT.t>45*60000,need=AT.list.map(a=>a.path).filter(p=>stale||!AT.urls[p]);
if(need.length){const s=await SB().createSignedUrls(need,3600);(s.data||[]).forEach(x=>{if(x.signedUrl)AT.urls[x.path]=x.signedUrl});AT.t=Date.now()}}
let ch=null,chT=null;function watch(){if(chT===A.tripId)return;if(ch)A.client.removeChannel(ch);chT=A.tripId;ch=A.client.channel('quest_att_'+A.tripId).on('postgres_changes',{event:'*',schema:'public',table:'quest_attachments'},()=>loadAtt().then(()=>softRender()).catch(()=>{})).subscribe()}
const _lt=window.loadTrip;window.loadTrip=async()=>{const ok=await _lt();if(ok){try{await loadAtt();watch()}catch(e){console.warn(e)}}return ok};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&A.tripId){AT.t=0;loadAtt().then(()=>softRender()).catch(()=>{})}});
const thumb=(a,ed)=>{const u=AT.urls[a.path],img=/^image\//.test(a.mime);return `<div class="att"><button type="button" class="att-open" data-attview="${a.id}" aria-label="View ${esc(a.name)}">${img&&u?`<img src="${u}" alt="" loading="lazy">`:`<span class="att-doc">${img?'Photo':'PDF'}</span>`}<small>${esc(a.name)}</small></button>${ed?`<button type="button" class="att-x" data-attdel="${a.id}" aria-label="Remove ${esc(a.name)}">×</button>`:''}</div>`};
const grid=(l,ed)=>l.length?`<div class="att-grid">${l.map(a=>thumb(a,ed)).join('')}</div>`:'';
const editor=(kind,owner)=>{const l=kind==='plan'?forPlan(owner):forTrip();return `<div class="att-box"><div class="att-head">Booking files <span>tickets, QR codes, confirmations</span></div>${grid(l,true)}<label class="small-btn att-add">+ Add photo or PDF<input type="file" accept="image/*,application/pdf" multiple hidden data-attfile data-kind="${kind}" data-owner="${owner||''}"></label></div>`};
window.__att={AT,forPlan,grid,editor};
const clip=n=>n?`<span class="clip"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/></svg>${n}</span>`:'';
/* plan cards: badge, details when opened, file editor when editing */
{const _ev=window.evCard;window.evCard=(p,dup,col)=>{let h=_ev(p,dup,col);if(h.includes('class="event ghost')||!p)return h;const f=forPlan(p.id);
if(h.includes('class="event editing')){return h.replace('<div class="ef-actions">',editor('plan',p.id)+'<div class="ef-actions">')}
h=h.replace(/(<div class="event-sub">[\s\S]*?)(<\/div>)/,(m,a,b)=>a+clip(f.length)+b);
if(/class="event [^"]*\bopen\b/.test(h)){const rows=[];const where=[p.place,p.area].filter(Boolean).join(' · ');
if(where)rows.push(`<div class="evd-row"><span>${esc(where)}</span><a class="small-btn" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((p.place||p.name)+' '+(p.area||''))}">Map</a></div>`);
if(p.notes)rows.push(`<div class="evd-note">${esc(p.notes)}</div>`);
if(p.link&&url(p.link))rows.push(`<div class="evd-row"><span>${esc(String(p.link).replace(/^https?:\/\/(www\.)?/,'').slice(0,40))}</span><a class="small-btn" target="_blank" rel="noopener noreferrer" href="${esc(url(p.link))}">Open</a></div>`);
if(f.length)rows.push(grid(f,false));
if(!rows.length)rows.push('<div class="evd-empty">No details yet. Use ⋯ to add notes or booking files.</div>');
h=h.replace(/<\/div>\s*$/,`<div class="ev-detail">${rows.join('')}</div></div>`)}
return h}}
/* trip details: phone, booking reference, access code, files */
{const _dc=window.detailsCard;window.detailsCard=()=>{let h=_dc();const x=D().details,ed=U.detailsEdit&&U.detailsOpen;
if(ed){h=h.replace('<label class="inl"><span>Everything else',dIn('phone','Phone (host, hotel…)',x.phone,{ph:'+82 10 1234 5678'})+dIn('bookingRef','Booking reference / codes',x.bookingRef)+dIn('access','Access instructions / door code',x.access,{area:1})+'<label class="inl"><span>Everything else').replace('<div class="ef-actions">',editor('trip','')+'<div class="ef-actions">')}
else if(U.detailsOpen){const tel=String(x.phone||'').replace(/[^\d+]/g,'');const rows=dRow('Phone',x.phone,(tel?`<a class="small-btn" href="tel:${tel}">Call</a>`:'')+cpBtn('phone'))+dRow('Booking ref',x.bookingRef,cpBtn('bookingRef'))+dRow('Access',x.access,cpBtn('access'));const f=forTrip();
const files=f.length?`<div class="dv"><div class="dv-l">Files</div><div class="dv-v">${grid(f,false)}</div></div>`:'';
const mark='<div class="ef-actions" style="margin-top:10px">';if(h.includes(mark))h=h.replace(mark,rows+files+mark)}
return h}}
window.saveDetails=function(){const d=D(),v=k=>{const e=document.getElementById('d_'+k);return e?e.value.trim():''};U.detailsEdit=false;mut(()=>{['stay','address','checkin','checkout','bookingUrl','phone','bookingRef','access','notes'].forEach(k=>{d.details[k]=v(k)});A.people.forEach(p=>{p.arrival=v('arr_'+p.id);p.departure=v('dep_'+p.id)})});toast('Saved')};
/* upload */
async function prep(f){if(f.type==='application/pdf'){if(f.size>10*1048576)throw new Error('That PDF is over 10 MB');return {blob:f,mime:'application/pdf',ext:'pdf'}}
if(!/^image\//.test(f.type))throw new Error('Photos and PDFs only');const bmp=await createImageBitmap(f),s=Math.min(1,1800/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');c.width=Math.round(bmp.width*s);c.height=Math.round(bmp.height*s);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(bmp,0,0,c.width,c.height);
const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.85));return {blob,mime:'image/jpeg',ext:'jpg'}}
document.addEventListener('change',async e=>{const inp=e.target.closest&&e.target.closest('[data-attfile]');if(!inp||!inp.files.length)return;const files=[...inp.files],kind=inp.dataset.kind,owner=inp.dataset.owner||null;inp.value='';
toast('Uploading…');let ok=0;for(const f of files){try{const p=await prep(f),path=A.tripId+'/'+uuid()+'.'+p.ext,up=await SB().upload(path,p.blob,{contentType:p.mime});if(up.error)throw up.error;
const row={trip_id:A.tripId,kind,owner_id:owner,path,name:(f.name||'file').replace(/\.[^.]+$/,'').slice(0,60)||'file',mime:p.mime,size:p.blob.size},ins=await A.client.from('quest_attachments').insert(row);if(ins.error)throw ins.error;ok++}catch(err){toast('Couldn’t attach: '+(err.message||err))}}
if(ok){await loadAtt();render();toast(ok===1?'Attached ✓':ok+' files attached ✓')}});
/* remove / view */
document.addEventListener('click',async e=>{const del=e.target.closest('[data-attdel]');if(del){e.preventDefault();e.stopPropagation();const a=AT.list.find(x=>x.id===del.dataset.attdel);if(!a||!confirm('Remove this file for everyone?'))return;await A.client.from('quest_attachments').delete().eq('id',a.id);await SB().remove([a.path]);await loadAtt();render();toast('Removed');return}
const v=e.target.closest("[data-attview]");if(v){e.preventDefault();e.stopPropagation();openViewer(v.dataset.attview);return}
if(e.target.closest('[data-vclose]')||e.target.id==='viewer')closeViewer()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeViewer()});
function closeViewer(){const v=document.getElementById('viewer');if(v)v.remove()}
function openViewer(id){const a=AT.list.find(x=>x.id===id);if(!a)return;const u=AT.urls[a.path];if(!u){toast('Still loading, try again in a second');return}closeViewer();const img=/^image\//.test(a.mime);
const d=document.createElement('div');d.id='viewer';d.className='viewer';d.setAttribute('role','dialog');d.setAttribute('aria-label',a.name);
d.innerHTML=`<div class="v-top"><b>${esc(a.name)}</b><button type="button" class="v-x" data-vclose aria-label="Close">×</button></div><div class="v-body">${img?`<img src="${u}" alt="${esc(a.name)}" class="v-img">`:`<div class="v-pdf"><p>PDF</p><a class="primary" href="${u}" target="_blank" rel="noopener noreferrer">Open PDF</a></div>`}</div><div class="v-foot">${img?'<span>Tap the picture to zoom</span>':''}<a href="${u}" target="_blank" rel="noopener noreferrer">Open full size</a></div>`;
document.body.appendChild(d);const im=d.querySelector('.v-img');if(im)im.addEventListener('click',()=>d.querySelector('.v-body').classList.toggle('zoom'))}
})();
