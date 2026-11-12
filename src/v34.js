/* v34: Attach photos/PDFs by typing what they are. Finds the right itinerary card or Essentials card,
   shows it, and attaches after a short pause (tap Change to pick another). Undo after. */
(function(){
const S={open:false,label:'',files:[],cands:[],pick:0,timer:null,busy:false,auto:false};
let host=null;
const SB=()=>A.client.storage.from('quest-files');
async function prep(f){if(f.type==='application/pdf'){if(f.size>10*1048576)throw new Error('That PDF is over 10 MB');return {blob:f,mime:'application/pdf',ext:'pdf'}}
if(!/^image\//.test(f.type))throw new Error('Photos and PDFs only');const bmp=await createImageBitmap(f),s=Math.min(1,1800/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');c.width=Math.round(bmp.width*s);c.height=Math.round(bmp.height*s);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(bmp,0,0,c.width,c.height);
const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.85));return {blob,mime:'image/jpeg',ext:'jpg'}}
const STOP=new Set('the a an and of for at in on to my our we is it confirmation confirm booking booked reservation reserved ticket tickets receipt qr code pdf photo screenshot pic image check checkin checkin'.split(' '));
const tok=s=>String(s||'').toLowerCase().replace(/[^a-z0-9ㄱ-힝 ]+/g,' ').split(/\s+/).filter(w=>w&&w.length>1&&!STOP.has(w));
const MEAL={breakfast:[360,630],brunch:[540,810],lunch:[660,900],dinner:[1020,1380],supper:[1020,1380]};
const FLIGHT=/\b(flight|boarding|airline|airport|plane|check ?in|e-?ticket|itinerary)\b/i,HOTEL=/\b(hotel|hostel|airbnb|stay|room|lodging|booking\.com|agoda)\b/i;
const people=()=>A.people||[];
function personIn(label){const l=label.toLowerCase();return people().filter(p=>l.includes(first(p.name).toLowerCase())).map(p=>p.id)}
function cands(){
 const label=S.label.trim();if(label.length<2)return [];
 const T=tok(label),out=[],pids=personIn(label),l=label.toLowerCase();
 const hub=window.__hub;
 D().plans.filter(p=>!p.note).forEach(p=>{
  const bag=tok(p.name+' '+(p.area||'')+' '+(p.notes||'')+' '+(p.place||''));let sc=0;
  T.forEach(w=>{if(bag.includes(w))sc+=3;else if(bag.some(b=>b.length>3&&(b.startsWith(w)||w.startsWith(b))))sc+=1.5});
  Object.keys(MEAL).forEach(m=>{if(l.includes(m)&&p.start){const t=stamp(p.start);if(t!=null&&t>=MEAL[m][0]&&t<=MEAL[m][1])sc+=2.5}});
  if(pids.length&&!isAll(p)&&p.who.some(id=>pids.includes(id)))sc+=1;
  if(sc>=2)out.push({kind:'plan',id:p.id,score:sc,title:p.name,sub:[displayDate(p.date),p.start?prettyTime(p.start):''].filter(Boolean).join(' · ')})});
 if(hub&&hub.INFO)hub.INFO.rows.forEach(r=>{
  const f=r.fields||{},bag=tok(r.title+' '+Object.values(f).join(' '));let sc=0;
  T.forEach(w=>{if(bag.includes(w))sc+=3});
  if(FLIGHT.test(label)&&(r.section==='arrive'||r.section==='depart'))sc+=2.5;
  if(HOTEL.test(label)&&r.section==='stay')sc+=3;
  if(pids.length&&pids.some(id=>bag.includes(first(pName(id)).toLowerCase())))sc+=2.5;
  if(sc>=2.5)out.push({kind:'info',id:r.id,score:sc,title:r.title,sub:'Essentials · '+({stay:'Accommodation',arrive:'Arrivals',depart:'Departures',other:'Other'}[r.section]||''),scope:r.scope})});
 out.sort((a,b)=>b.score-a.score);
 const top=out.slice(0,3);
 /* a new Essentials card is always offered last */
 const sec=HOTEL.test(label)?'stay':(FLIGHT.test(label)?(/\b(back|return|home|depart)/i.test(label)?'depart':'arrive'):'other');
 top.push({kind:'new',section:sec,score:0,title:label,sub:'New Essentials card · '+({stay:'Accommodation',arrive:'Arrivals',depart:'Departures',other:'Other'}[sec])});
 return top}
const confident=c=>c.length>1&&c[0].kind!=='new'&&c[0].score>=5&&(c.length<3||c[0].score-(c[1].kind==='new'?0:c[1].score)>=2);
function recompute(){S.cands=cands();S.pick=0;clearTimeout(S.timer);S.auto=false;
 if(S.files.length&&S.label.trim().length>2&&confident(S.cands)){S.auto=true;S.timer=setTimeout(()=>{if(S.open&&S.auto)go()},3000)}}
function html(){
 const c=S.cands,fl=S.files.length;
 const cl=c.length?c.map((x,i)=>`<button type="button" class="q34-c${i===S.pick?' on':''}" data-q34="pick" data-i="${i}"><span class="q34-r"></span><span class="q34-ct"><b>${esc(x.title)}</b><small>${esc(x.sub)}</small></span></button>`).join(''):`<p class="q34-hint">Type what it is and I’ll find the card.</p>`;
 return `<div class="q34-back" data-q34="close"></div><div class="q34-sheet" role="dialog" aria-label="Attach photos"><div class="q34-top"><strong>Attach photos or PDFs</strong><button type="button" class="q34-x" data-q34="close" aria-label="Close">✕</button></div>
<label class="q34-l">What is it?<input id="q34_label" data-keep autocomplete="off" value="${esc(S.label)}" placeholder="Dinner confirmation, Mai flight check in…"></label>
<div class="q34-files"><label class="q34-pick"><input type="file" id="q34_files" accept="image/*,application/pdf" multiple hidden>📎 ${fl?fl+' file'+(fl===1?'':'s')+' chosen. Add more':'Choose photos or PDFs'}</label></div>
<div class="q34-cs">${cl}</div>
<div class="q34-foot">${S.auto?`<div class="q34-auto"><i></i></div><span class="q34-note">Attaching to “${esc(c[S.pick].title)}”… tap a different card to change.</span>`:''}<button type="button" class="primary" data-q34="go" ${fl&&c.length&&!S.busy?'':'disabled'}>${S.busy?'Attaching…':(c.length&&c[S.pick]?'Attach to '+(c[S.pick].kind==='new'?'a new card':'this card'):'Attach')}</button></div></div>`}
function paint(){
 if(!host){host=document.createElement('div');host.id='q34';document.body.appendChild(host)}
 host.className=S.open?'on':'';if(!S.open){host.innerHTML='';return}
 const keep=document.getElementById('q34_label'),had=keep&&document.activeElement===keep,pos=keep?keep.selectionStart:0;
 host.innerHTML=html();
 if(had){const n=document.getElementById('q34_label');n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}}
async function upload(files,mk){
 const made=[];
 for(const f of files){const p=await prep(f),path=mk(p);const up=await SB().upload(path,p.blob,{contentType:p.mime});if(up.error)throw up.error;made.push({path,p,f})}
 return made}
async function go(){
 if(S.busy)return;const x=S.cands[S.pick];if(!x||!S.files.length)return;
 clearTimeout(S.timer);S.auto=false;S.busy=true;paint();
 const hub=window.__hub,files=S.files.slice(),label=S.label.trim(),undo={paths:[],table:null,newCard:null};
 try{
  if(x.kind==='plan'){
   const made=await upload(files,p=>A.tripId+'/'+uuid()+'.'+p.ext);
   for(const m of made){const r=await A.client.from('quest_attachments').insert({trip_id:A.tripId,kind:'plan',owner_id:x.id,path:m.path,name:(m.f.name||label).replace(/\.[^.]+$/,'').slice(0,60)||label,mime:m.p.mime,size:m.p.blob.size});if(r.error)throw r.error;undo.paths.push(m.path)}
   undo.table='quest_attachments'}
  else{
   let id=x.id,scope=x.scope||'group';
   if(x.kind==='new'){id=uuid();scope='group';const r=await A.client.from('quest_info').upsert({id,trip_id:A.tripId,scope,section:x.section,title:label,notes:'',fields:{},pinned:[],owner_id:A.user.id});if(r.error)throw r.error;undo.newCard=id}
   const made=await upload(files,p=>scope==='mine'?`mine/${A.user.id}/${A.tripId}/${uuid()}.${p.ext}`:`${A.tripId}/info/${uuid()}.${p.ext}`);
   for(const m of made){const r=await A.client.from('quest_info_files').insert({info_id:id,trip_id:A.tripId,scope,path:m.path,name:(m.f.name||label).replace(/\.[^.]+$/,'').slice(0,60)||label,mime:m.p.mime,size:m.p.blob.size});if(r.error)throw r.error;undo.paths.push(m.path)}
   undo.table='quest_info_files';if(hub&&hub.loadInfo)await hub.loadInfo()}
  S.open=false;S.busy=false;S.files=[];S.label='';S.cands=[];paint();render();
  const n=files.length;
  toastUndo(`Attached ${n} file${n===1?'':'s'} to ${x.title}`,async()=>{
   try{if(undo.paths.length){await A.client.from(undo.table).delete().in('path',undo.paths);await SB().remove(undo.paths)}
    if(undo.newCard)await A.client.from('quest_info').delete().eq('id',undo.newCard)}catch(e){}
   if(hub&&hub.loadInfo)await hub.loadInfo();render()})
 }catch(err){S.busy=false;paint();toast('Couldn’t attach: '+(err.message||err))}}
window.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-q34],[data-act="q34-open"]'):null;if(!b)return;
 if(b.matches('#q34_files,label.q34-pick'))return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(b.dataset.act==='q34-open'){S.open=true;S.label='';S.files=[];S.cands=[];S.auto=false;paint();return}
 const k=b.dataset.q34;
 if(k==='close'){clearTimeout(S.timer);S.open=false;paint();return}
 if(k==='pick'){S.pick=+b.dataset.i;clearTimeout(S.timer);S.auto=false;paint();return}
 if(k==='go')go()},true);
document.addEventListener('input',e=>{if(e.target&&e.target.id==='q34_label'){S.label=e.target.value;clearTimeout(S.timer);S.timer=setTimeout(()=>{recompute();paint();},350)}});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='q34_files'){S.files=S.files.concat([...e.target.files]);recompute();paint()}});
window.__q34={cands,S,recompute};
})();
