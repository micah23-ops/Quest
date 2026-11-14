/* v20: offline read-only copy. Records what the signed-in account has loaded, replays it when there is no connection.
   Stored per account in this browser (IndexedDB). Wiped on sign-out. No offline edits. */
(function(){
const DBN='quest-offline',MAX_FILE=25*1024*1024,MAX_TOTAL=200*1024*1024;
const R={uid:'',map:{},dirty:false};let real=null,cur=null,stub=null,persistT=0,syncing=false,lastSync=0,blockUntil=0;
A.offline=false;A.savedAt=0;
/* ---------- tiny IndexedDB wrapper ---------- */
const idb=()=>new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('no idb'));const r=indexedDB.open(DBN,1);r.onupgradeneeded=()=>{r.result.createObjectStore('kv');r.result.createObjectStore('blob')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const tx=async(store,mode,fn)=>{const d=await idb();return new Promise((res,rej)=>{const t=d.transaction(store,mode);let o;try{o=fn(t.objectStore(store))}catch(e){d.close();rej(e);return}t.oncomplete=()=>{d.close();res(o&&'result' in o?o.result:o)};t.onerror=t.onabort=()=>{d.close();rej(t.error)}})};
const kvGet=k=>tx('kv','readonly',s=>s.get(k)).catch(()=>null);
const kvSet=(k,v)=>tx('kv','readwrite',s=>s.put(v,k)).catch(()=>{});
const blobGet=k=>tx('blob','readonly',s=>s.get(k)).catch(()=>null);
const blobKeys=()=>tx('blob','readonly',s=>s.getAllKeys()).catch(()=>[]);
async function wipeAll(){R.map={};R.dirty=false;R.uid='';A.savedAt=0;clearTimeout(persistT);blockUntil=Date.now()+4000;
 try{await tx('kv','readwrite',s=>s.clear())}catch(e){}try{await tx('blob','readwrite',s=>s.clear())}catch(e){}}
/* ---------- who is signed in on this device (from the auth token, no network) ---------- */
function storedUser(){try{const k=Object.keys(localStorage).find(x=>/^sb-.*-auth-token$/.test(x));if(!k)return null;const v=JSON.parse(localStorage.getItem(k));const s=v&&(v.currentSession||v);return s&&s.user&&s.user.id?s:null}catch(e){return null}}
async function load(uid){if(!uid||R.uid===uid)return;R.uid=uid;R.map={};const st=await kvGet('resp|'+uid);if(R.uid===uid&&st&&st.map)R.map=Object.assign({},st.map,R.map);calcSaved()}
const keyOf=(t,calls)=>t+'|'+JSON.stringify(calls);
function calcSaved(){let m=0;const tid=A.tripId;for(const k in R.map){if(!tid||k.includes(tid))m=Math.max(m,R.map[k].at||0)}A.savedAt=m||Object.values(R.map).reduce((a,x)=>Math.max(a,x.at||0),0)}
function record(key,data){const uid=A.user&&A.user.id;if(!uid||Date.now()<blockUntil||A.offline)return;
 if(R.uid!==uid){R.uid=uid;R.map={};kvGet('resp|'+uid).then(st=>{if(R.uid===uid&&st&&st.map)R.map=Object.assign({},st.map,R.map)})}
 R.map[key]={data:JSON.parse(JSON.stringify(data)),at:Date.now()};R.dirty=true;calcSaved();
 clearTimeout(persistT);persistT=setTimeout(persist,1500)}
async function persist(){if(!R.dirty||!R.uid||!A.user||A.user.id!==R.uid||Date.now()<blockUntil)return;R.dirty=false;await kvSet('resp|'+R.uid,{map:R.map,at:Date.now(),email:A.user.email||''});syncFiles()}
/* ---------- recording wrapper around the real client ---------- */
const WRITE=/^(insert|update|upsert|delete)$/;
function recFrom(t){const calls=[];let b=real.from(t);
 const h={get(_,m){if(m==='then'){return (ok,bad)=>{const sel=calls[0]&&calls[0][0]==='select';return Promise.resolve(b).then(r=>{if(sel&&r&&!r.error&&r.data!==undefined)record(keyOf(t,calls),r.data);return r}).then(ok,bad)}}
  if(m==='catch'||m==='finally')return (...a)=>Promise.resolve(b)[m](...a);
  return (...a)=>{calls.push([m,a]);b=b[m](...a);return px}}};
 const px=new Proxy({},h);return px}
function wrapAuth(auth){return new Proxy(auth,{get(t,k){const v=t[k];
 if(k==='getSession')return async function(){let r;try{r=await t.getSession()}catch(e){r={data:{session:null},error:e}}
  if(r&&r.data&&r.data.session)return r;
  const s=storedUser();if(s&&(!navigator.onLine||A.offline||(r&&r.error&&/fetch|network|load failed/i.test(String(r.error.message||r.error))))){A.offline=true;return {data:{session:s},error:null}}
  return r};
 if(k==='signOut')return async function(){await wipeAll();let r;try{r=await t.signOut.apply(t,arguments)}catch(e){r={error:e}}
  try{Object.keys(localStorage).filter(x=>/^sb-.*-auth-token/.test(x)).forEach(x=>localStorage.removeItem(x))}catch(e){}
  A.offline=false;document.documentElement.classList.remove('is-offline');return r||{error:null}};
 if(k==='onAuthStateChange')return function(cb){return t.onAuthStateChange(function(e,s){if(e==='SIGNED_OUT'&&navigator.onLine)wipeAll();return cb.apply(this,arguments)})};
 return typeof v==='function'?v.bind(t):v}})}
function wrapReal(c){real=c;return new Proxy(c,{get(t,k){if(k==='from')return recFrom;if(k==='auth')return wrapAuth(t.auth);const v=t[k];return typeof v==='function'?v.bind(t):v}})}
/* ---------- replay stub (offline) ---------- */
const offErr={message:'You’re offline'};
function stubFrom(t){const calls=[];const px=new Proxy({},{get(_,m){
 if(m==='then')return (ok,bad)=>{const first=calls[0]&&calls[0][0];let r;if(first==='select'){const rec=R.map[keyOf(t,calls)];r=rec?{data:JSON.parse(JSON.stringify(rec.data)),error:null}:{data:null,error:{message:'Not saved for offline'}}}else r={data:null,error:offErr};return Promise.resolve(r).then(ok,bad)};
 if(m==='catch'||m==='finally')return (...a)=>Promise.resolve({data:null,error:offErr})[m](...a);
 return (...a)=>{calls.push([m,a]);return px}}});return px}
const objUrls={};
async function urlFor(uid,p){const k=uid+'|'+p;if(objUrls[k])return objUrls[k];const b=await blobGet(k);if(!b)return null;return objUrls[k]=URL.createObjectURL(b)}
function makeStub(){return {from:stubFrom,
 storage:{from(){return {createSignedUrls:async paths=>({data:await Promise.all(paths.map(async p=>({path:p,signedUrl:await urlFor(R.uid,p)}))),error:null}),
   createSignedUrl:async p=>{const u=await urlFor(R.uid,p);return u?{data:{signedUrl:u},error:null}:{data:null,error:{message:'Not saved for offline'}}},
   upload:async()=>({data:null,error:offErr}),remove:async()=>({data:null,error:offErr})}}},
 rpc:async()=>({data:null,error:offErr}),channel(){const c={on(){return c},subscribe(){return c},unsubscribe(){}};return c},removeChannel(){},
 functions:{invoke:async()=>({data:null,error:offErr})},
 get auth(){return wrapAuth(real.auth)}}}
let _cur=null;
Object.defineProperty(A,'client',{configurable:true,enumerable:true,get(){if(A.offline&&real){return stub||(stub=makeStub())}return _cur},set(v){if(!v){_cur=v;return}_cur=wrapReal(v);stub=null}});
/* ---------- files (photos / PDFs) ---------- */
async function syncFiles(){if(syncing||A.offline||!navigator.onLine||!R.uid||Date.now()-lastSync<20000||!real)return;syncing=true;lastSync=Date.now();
 try{const uid=R.uid,want=new Map();
  for(const k in R.map){if(!/^quest_(info_files|attachments)\|/.test(k))continue;(R.map[k].data||[]).forEach(r=>{if(r&&r.path)want.set(r.path,r.size||0)})}
  const have=new Set((await blobKeys()).filter(k=>String(k).startsWith(uid+'|')));
  const keyN=p=>uid+'|'+p;
  /* drop copies of files that no longer exist */
  const del=[...have].filter(k=>![...want.keys()].some(p=>keyN(p)===k));
  if(del.length)await tx('blob','readwrite',s=>del.forEach(k=>s.delete(k)));
  const need=[...want.keys()].filter(p=>!have.has(keyN(p)));if(!need.length)return;
  let total=0;for(const k of have){const b=await blobGet(k);total+=b?b.size:0}
  const sg=await real.storage.from('quest-files').createSignedUrls(need,600);
  for(const x of (sg.data||[])){if(!x||!x.signedUrl||A.offline||R.uid!==uid||!A.user)continue;
   try{const r=await fetch(x.signedUrl);if(!r.ok)continue;const b=await r.blob();if(b.size>MAX_FILE||total+b.size>MAX_TOTAL)continue;if(!A.user||R.uid!==uid||Date.now()<blockUntil)break;total+=b.size;await tx('blob','readwrite',s=>s.put(b,keyN(x.path)))}catch(e){}}
 }catch(e){}finally{syncing=false}}
/* ---------- going offline / online ---------- */
function goOffline(){if(A.offline)return;A.offline=true;document.documentElement.classList.add('is-offline');try{render()}catch(e){}}
window.addEventListener('offline',()=>{if(R.uid&&Object.keys(R.map).length)goOffline()});
window.addEventListener('online',()=>{if(A.offline){A.offlineBack=true;try{render()}catch(e){}setTimeout(()=>location.reload(),700)}});
{const _b=window.boot;window.boot=async function(){const s=storedUser();if(s)await load(s.user.id);
 if(!navigator.onLine&&s&&Object.keys(R.map).length)A.offline=true;
 if(A.offline)document.documentElement.classList.add('is-offline');return _b.apply(this,arguments)}}
{const _lt=window.loadTrips;window.loadTrips=async function(){await _lt.apply(this,arguments);
 if(!A.offline&&/fetch|network|load failed/i.test(U.msg||'')&&A.user&&Object.keys(R.map).length){U.msg='';goOffline();return _lt.apply(this,arguments)}}}
{const _l=window.loadTrip;window.loadTrip=async function(){let ok;try{ok=await _l.apply(this,arguments)}catch(e){ok=false}
 if(!ok&&!A.offline&&/fetch|network|load failed/i.test(A.status||'')&&Object.keys(R.map).length){goOffline();ok=await _l.apply(this,arguments)}
 if(ok&&!A.offline){setTimeout(()=>{calcSaved();persist()},2500)}return ok}}
/* ---------- view-only guard ---------- */
const OKACT=new Set(['toggle-ev','toggle-short','toggle-opt','toggle-group','toggle-day','toggle-details','toggle-archive','toggle-completed','toggle-filters','short-find-toggle','short-view','details','close','close-dsheet','hub-tab','hub-view','hub-copy','hub-copyall','copy-address','copy-field','go-trips','open-trip','sign-out','offline-remove']);
window.addEventListener('click',e=>{if(!A.offline)return;const t=e.target.closest&&e.target.closest('[data-act],[data-attdel],[data-addopt]');if(!t)return;
 const a=t.getAttribute('data-act');if(a&&OKACT.has(a))return;e.stopImmediatePropagation();e.preventDefault();toast('You’re offline. View only for now.')},true);
window.addEventListener('keydown',e=>{if(A.offline&&e.key==='Enter'&&e.target&&/^(quick|shortquick|ideaquick)$/.test(e.target.id)){e.stopImmediatePropagation();e.preventDefault()}},true);
window.addEventListener('submit',e=>{if(A.offline&&e.target&&e.target.id!=='authform'){e.stopImmediatePropagation();e.preventDefault();toast('You’re offline. View only for now.')}},true);
/* ---------- banner, saved note, remove button ---------- */
const when=t=>{try{return new Date(t).toLocaleString([], {weekday:'short',hour:'numeric',minute:'2-digit'})}catch(e){return ''}};
{const _r=window.render;window.render=function(){const r=_r.apply(this,arguments);try{decorate()}catch(e){}return r}}
function decorate(){const root=document.getElementById('root');if(!root)return;
 document.documentElement.classList.toggle('is-offline',!!A.offline);
 root.querySelectorAll('.offline-banner').forEach(n=>n.remove());
 if(A.offline){const b=document.createElement('div');b.className='offline-banner';b.setAttribute('role','status');
  b.innerHTML=A.offlineBack?'<b>Back online</b> · refreshing…':`<b>Offline · may be out of date</b><span>View only${A.savedAt?` · saved ${when(A.savedAt)}`:''}</span>`;
  const sh=root.querySelector('.shell');if(sh)sh.insertBefore(b,sh.firstChild);else root.insertBefore(b,root.firstChild);
  const ss=root.querySelector('.sync-status');if(ss)ss.textContent='Offline · view only';
  root.querySelectorAll('#quick,#shortquick,#ideaquick').forEach(i=>{i.disabled=true;i.placeholder='View only while offline'})}
 else{const s=root.querySelector('.sync-status');if(s&&A.savedAt&&A.tripId&&/Live/.test(s.textContent)&&!/Saved for offline/.test(s.textContent))s.textContent+=' · Saved for offline '+when(A.savedAt)}
 const dr=root.querySelector('.drawer');if(dr&&U.modal==='settings'&&!dr.querySelector('.offline-card')&&!A.offline){const c=document.createElement('div');c.className='offline-card';
  c.innerHTML=`<div class="eyebrow">Offline copy</div><p class="helper">${A.savedAt?'Saved for offline · '+when(A.savedAt):'Saves automatically once a trip has loaded.'}. It lives only on this device, in this browser, and is removed when you sign out.</p><button type="button" class="small-btn danger" data-act="offline-remove">Remove offline copy from this device</button>`;
  const f=dr.querySelector('.footer');if(f)f.parentNode.insertBefore(c,f);else dr.appendChild(c)}}
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-act="offline-remove"]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
 if(!confirm('Remove the offline copy from this device? It will save again the next time you open a trip.'))return;await wipeAll();toast('Offline copy removed');setTimeout(()=>{blockUntil=0;if(A.user){R.uid=A.user.id}},4200);render()},true);
/* ---------- app shell for offline loads ---------- */
/* app shell updates (new code pushed under this same URL) used to sit there until someone
   happened to fully close and reopen the installed app — on a phone that can be days away,
   so a just-shipped fix looked like it "didn't take". Reload once the new worker takes over,
   and check for an update whenever the app comes back to the foreground, not just on cold load. */
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
 let reloading=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});
 window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').then(reg=>{
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)try{reg.update()}catch(e){}})
 }).catch(()=>{})})}
})();
