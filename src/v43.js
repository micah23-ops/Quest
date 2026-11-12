/* v43: Google place suggestions under the Ideas box. Runs only for signed-in beta testers; never blocks adding an idea. */
(function(){
if(window.__q43)return;window.__q43=1;
const FN='quest-places';
let tok='',timer=0,seq=0,dead=false,sparing=false,S={q:'',items:[],kind:'sug',note:''};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const newTok=()=>{try{return crypto.randomUUID()}catch(e){return 't'+Date.now()+Math.random()}};
const css=document.createElement('style');
css.textContent='#q43dd{margin:8px 0 4px;background:#FBF8F0;border:1px solid #D9D3C2;border-radius:14px;box-shadow:0 10px 28px rgba(47,79,70,.18);overflow:hidden}'
+'#q43dd .q43l{max-height:172px;overflow-y:auto;overscroll-behavior:contain}#q43dd .q43l.more{box-shadow:inset 0 -10px 8px -8px rgba(47,79,70,.18)}'
+'#q43dd button{display:block;width:100%;text-align:left;border:0;background:none;padding:11px 14px;border-bottom:1px solid #EEE9DA;font:inherit;color:#2F4F46;cursor:pointer;min-height:44px}'
+'#q43dd button:last-child{border-bottom:0}#q43dd button:hover,#q43dd button:focus-visible{background:#F1EDDD;outline:0}'
+'#q43dd b{display:block;font-weight:600}#q43dd span{display:block;font-size:.82em;opacity:.7;margin-top:1px}'
+'#q43dd .q43n{padding:9px 14px;font-size:.82em;color:#6B7A72;border-bottom:1px solid #EEE9DA}#q43dd .q43s b{font-weight:500}'
+'.sl-tags .q43pin{font-size:12.5px;font-weight:600;color:#2F6F4A;text-decoration:none;white-space:nowrap;cursor:pointer}.sl-tags .q43pin:not(:first-child):before,.sl-tags .q44ln:not(:first-child):before{content:"\00b7";margin-right:6px;color:#b4bdb6;font-weight:400}';
document.head.appendChild(css);
const D_=()=>{try{return D()}catch(e){return null}};
let cur='shortquick';const IDS={shortquick:1,quick:1};
const inp=()=>document.getElementById(cur);
function ctx(){const L=D_();const o={};if(!L)return o;const pts=L.shortlist.filter(x=>x.lat!=null&&x.lng!=null);
if(pts.length){o.near={lat:pts.reduce((a,x)=>a+x.lat,0)/pts.length,lng:pts.reduce((a,x)=>a+x.lng,0)/pts.length}}
if(L.trip&&L.trip.city)o.city=String(L.trip.city).slice(0,80);return o}
function qtext(raw){let t=String(raw||'');try{if(cur==='quick'&&typeof dayWords==='function'){const r=dayWords(t);if(r&&r.rest)t=r.rest}}catch(e){}
if(cur==='quick'){
t=t.replace(/(?:^|\s)(?:at\s+|@\s*|from\s+)?\d{1,2}(?::\d\d)?\s*(?:am|pm)?\s*(?:-|–|to|until|till)\s*\d{1,2}(?::\d\d)?\s*(?:am|pm)(?=\s|$)/ig,' ');
t=t.replace(/^\s*(?:at\s+|@\s*)?(?:\d{1,2}(?::\d\d)?\s*(?:am|pm)|\d{1,2}:\d\d|\d{1,2}(?=\s*(?:-|–|to)\s*\d{1,2}(?::\d\d)?\s*(?:am|pm)))(?:\s*(?:-|–|to|until|till)\s*\d{1,2}(?::\d\d)?\s*(?:am|pm)?)?\s+/i,'');
t=t.replace(/(?:^|\s)(?:at\s+|@\s*|from\s+)?\d{1,2}(?::\d\d)?\s*(?:am|pm)(?:\s*(?:-|–|to|until|till)\s*\d{1,2}(?::\d\d)?\s*(?:am|pm)?)?(?=\s|$)/ig,' ');
t=t.replace(/(?:^|\s)(?:at\s+|@\s*)?\d{1,2}:\d\d(?:\s*(?:-|–|to)\s*\d{1,2}:\d\d)?(?=\s|$)/ig,' ');
t=t.replace(/\s+/g,' ')}
return t.trim()}
function noAuto(){for(const id in IDS){const i=document.getElementById(id);if(i&&i.getAttribute('autocomplete')!=='off'){i.setAttribute('autocomplete','off');i.setAttribute('autocorrect','off');i.setAttribute('spellcheck','false')}}}
function showFind(){for(const id in IDS){const i=document.getElementById(id);if(!i)continue;let host,b;
if(id==='quick'){const ql=i.closest('.quickline');if(!ql)continue;b=ql.querySelector('.q43find');host=ql.querySelector('.q26-opts')||ql}
else{const st=i.closest('.short-top');if(!st)continue;let row=st.nextElementSibling;if(!row||!row.classList.contains('q43frow')){row=document.createElement('div');row.className='q43frow';st.after(row)}b=row.querySelector('.q43find');host=row}
if(!b){b=document.createElement('button');b.type='button';b.className='q43find';b.dataset.for=id;b.textContent='🔍 Find on map';host.appendChild(b)}
const k=cur;cur=id;const t=qtext(i.value);cur=k;b.style.display=t.length>=2?'':'none';if(id!=='quick'){b.parentElement.style.display=t.length>=2?'':'none'}}}
async function findIn(id){const i=document.getElementById(id);if(!i)return;cur=id;const qt=qtext(i.value);S.q=i.value;S.kind='sug';S.items=[];if(qt.length<3){S.note='Type at least 3 letters, then tap Find on map.';paint();return}
S.note='Searching…';paint();tok=newTok();const r=await call(Object.assign({action:'autocomplete',input:qt,sessionToken:tok},ctx()));
if(r.error==='not_allowed'||r.error==='offline'){S.note='Map search isn’t available for this account yet.';paint();return}
sparing=r.mode==='sparing';S.items=r.suggestions||[];S.note=note(r)||(S.items.length?'':'No suggestions. Try “Search the map” below.');paint()}
function close(){const d=document.getElementById('q43dd');if(d)d.remove();S.items=[];tok=''}
function place(){}
function paint(){
const i=inp();if(!i){close();return}
let d=document.getElementById('q43dd');if(!d){d=document.createElement('div');d.id='q43dd';d.setAttribute('role','listbox')}
let host=i.closest('.short-top')||i.closest('.quickline')||i.parentElement;if(host.nextElementSibling&&host.nextElementSibling.classList.contains('q43frow'))host=host.nextElementSibling;if(d.previousElementSibling!==host||!d.isConnected)host.after(d)
let h='';if(S.note)h+=`<div class="q43n">${esc(S.note)}</div>`;
if(S.items.length)h+='<div class="q43l'+(S.items.length>3?' more':'')+'">';
S.items.forEach((x,n)=>{h+=`<button type="button" role="option" data-q43="pick" data-n="${n}" class="q43s"><b>${esc(x.text||x.name)}</b><span>${esc(x.secondary||x.address||'')}</span></button>`});
if(S.items.length)h+='</div>';
if(S.kind==='sug'&&qtext(S.q).length>=2)h+=`<button type="button" data-q43="text"><b>Search the map for “${esc(qtext(S.q).slice(0,40))}”</b><span>Finds the exact place if it isn’t listed above</span></button>`;
if(!h){close();return}
d.innerHTML=h;place()}
async function call(body){
const c=(typeof A!=='undefined'&&A)?A.client:null;if(!c||!c.functions)return{error:'offline'};
try{const r=await c.functions.invoke(FN,{body});
if(r.error){const x=r.error.context;if(x&&x.json){try{return await x.json()}catch(e){}}return{error:'network'}}
return r.data||{}}catch(e){return{error:'network'}}}
function note(r){
if(r.error==='limit')return r.scope==='minute'?'Slow down a moment. Pressing Add still saves your idea.':r.scope==='day'?'Map search is resting for today. Pressing Add still saves your idea.':'Map search is paused this month. Pressing Add still saves your idea.';
if(r.error==='google'||r.error==='network'||r.error==='key_missing'||r.error==='usage')return'Map search isn’t available right now. Pressing Add still saves your idea.';
return''}
function onType(){
noAuto();close();showFind();return}function _unused(){const i=inp();if(!i||dead)return;const q=i.value;S.q=q;clearTimeout(timer);const qt=qtext(q);
const need=sparing?5:3;
if(/^\s*https?:\/\//i.test(q)||q.includes('|')){close();return}
if(qt.length<need){S.items=[];S.kind='sug';S.note=sparing&&qt.length>=3?'Low-power mode: suggestions start at 5 letters. Press Add to save as typed.':'';paint();return}
timer=setTimeout(async()=>{
const my=++seq;if(!tok)tok=newTok();
const r=await call(Object.assign({action:'autocomplete',input:qt,sessionToken:tok},ctx()));
if(my!==seq||!inp()||inp().value!==q)return;
if(r.error==='not_allowed'||r.error==='sign_in'||r.error==='offline'){dead=r.error!=='sign_in';close();return}
sparing=r.mode==='sparing';
S.kind='sug';S.items=r.suggestions||[];S.note=note(r)||(sparing?'Low-power mode: fewer suggestions to keep search free.':'');paint()},sparing?700:350)}
function cat(p){const t=(p.types||[]).concat(p.primaryType||[]).join(' ');
if(/cafe|coffee/i.test(t)||/\b(cafe|coffee)\b/i.test(p.name||''))return'Cafe';
if(/restaurant|food|bar\b|bakery/i.test(t))return'Restaurant';return'Activity'}
function nm(p){return{name:p.name||'',place:p.address||''}}
function addPlan(p,area){
const D=D_();const i=inp();const raw=i?i.value:'';const n=nm(p);let date=U.date,txt=raw;try{if(typeof dayWords==='function'){const r=dayWords(raw);if(r&&r.rest){txt=r.rest;date=r.date}}}catch(e){}
let pq=null;try{pq=parseQuick(txt)}catch(e){}
const who=(U.whoSel||[]).length>1?U.whoSel.slice():(U.who==='all'?[]:[U.who]);
if(i)i.value='';close();
mut(()=>D.plans.push({id:uuid(),date:date,who:who,name:n.name,start:(pq&&pq.start)||'',end:(pq&&pq.end)||'',area:area||'',place:n.place,link:'',notes:'',tent:!!U.q23t,note:!!U.q26n,place_id:p.placeId||null,lat:p.lat==null?null:p.lat,lng:p.lng==null?null:p.lng,address:p.address||null,maps_url:p.mapsUrl||null}));
toast('Added to your itinerary with a map pin')}
function addPlace(p,area){
if(cur==='quick'){addPlan(p,area);return}
if(!p||!p.name)return;const D=D_();if(!D)return;
if(p.placeId&&D.shortlist.some(x=>x.place_id===p.placeId)){const i0=inp();if(i0)i0.value='';toast('Already in your ideas');close();return}
const i=inp();if(i)i.value='';close();
const nn=nm(p);mut(()=>D.shortlist.unshift({id:uuid(),name:nn.name,area:area||'',category:cat(p),done:false,link:'',notes:'',place:nn.place,interest:A.me?[A.me]:[],favorite:false,place_id:p.placeId||null,lat:p.lat==null?null:p.lat,lng:p.lng==null?null:p.lng,address:p.address||null,maps_url:p.mapsUrl||null}));
toast('Added with a map pin')}
function plainFrom(x){if(cur==='quick'){close();toast('Press Add to save as typed');return}const i=inp();if(i)i.value='';close();mut(()=>D_().shortlist.unshift({id:uuid(),name:x.text||x.name,area:(x.secondary||'').split(',')[0].trim(),category:'Activity',done:false,link:'',notes:'',place:'',interest:A.me?[A.me]:[]}));toast('Added to the shortlist')}
async function pick(n){
const x=S.items[n];if(!x)return;
if(S.kind==='txt'){addPlace(x,(x.address||'').split(',')[1]&&x.address.split(',')[1].trim());return}
const D=D_();if(cur!=='quick'&&D.shortlist.some(s=>s.place_id===x.placeId)){const i0=inp();if(i0)i0.value='';toast('Already in your ideas');close();return}
const t=tok;toast('Adding…');
const r=await call({action:'details',placeId:x.placeId,sessionToken:t});
if(r.place)addPlace(r.place,(x.secondary||'').split(',')[0].trim());
else{plainFrom(x);const m=note(r);if(m)toast(m)}}
async function textSearch(){
const q=qtext(inp()&&inp().value||'');if(!q)return;const act=document.querySelector('#q43dd [data-q43=text]');if(act)act.querySelector('span').textContent='Searching…';
const r=await call(Object.assign({action:'text',query:q},ctx()));
if(r.error){S.items=[];S.kind='sug';S.note=note(r)||'Map search isn’t available right now.';paint();return}
S.kind='txt';S.items=r.places||[];S.note=S.items.length?'Pick the right one':'Nothing found. Try a clearer name, or press Add to save as typed.';paint()}
document.addEventListener('focusin',e=>{if(e.target&&IDS[e.target.id]){cur=e.target.id;noAuto()}},true);
document.addEventListener('input',e=>{if(e.target&&IDS[e.target.id]){cur=e.target.id;onType()}},true);
document.addEventListener('mousedown',e=>{if(e.target.closest&&e.target.closest('#q43dd'))e.preventDefault()},true);
document.addEventListener('click',e=>{
const fb=e.target.closest&&e.target.closest('.q43find');if(fb){e.preventDefault();e.stopPropagation();findIn(fb.dataset.for||'quick');return}
const b=e.target.closest&&e.target.closest('#q43dd [data-q43]');
if(b){e.stopPropagation();e.preventDefault();if(b.dataset.q43==='pick')pick(+b.dataset.n);else textSearch();return}
if(!(e.target.closest&&(e.target.closest('#q43dd')||IDS[e.target.id]||e.target.closest('.quickline')||e.target.closest('.q43frow'))))close()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Enter'&&e.target&&IDS[e.target.id]){clearTimeout(timer);seq++;close()}},true);
function badges(){try{const L=D_();if(!L)return;const by={};L.shortlist.forEach(x=>{if(x.lat!=null&&x.lng!=null)by[x.id]=x.maps_url||1});
document.querySelectorAll('.sl-row').forEach(r=>{const b=r.querySelector('[data-id]');const t=r.querySelector('.sl-tags');if(!b||!t||!by[b.dataset.id]||t.querySelector('.q43pin'))return;
const u=by[b.dataset.id],s=document.createElement(typeof u==='string'?'a':'span');s.className='q43pin';s.textContent='📍 Pinned';if(typeof u==='string'&&/^https:\/\//.test(u)){s.href=u;s.target='_blank';s.rel='noopener'}t.appendChild(s)})}catch(e){}}
const _r=window.render;if(typeof _r==='function')window.render=function(){const v=_r.apply(this,arguments);if(!inp())close();else if(S.items.length||S.note)paint();noAuto();showFind();badges();return v};
window.__q43={call:call,ctx:ctx};
})();
