/* v47: tap checkboxes in Ideas to select (then Delete or Mark done) + Instagram icon on Instagram links */
(function(){
if(window.__q47s)return;window.__q47s=1;
const SEL=new Set();
const D_=()=>{try{return D()}catch(e){return null}};
const st=document.createElement('style');
st.textContent='.q48bar{position:fixed;right:10px;left:auto;top:calc(env(safe-area-inset-top,0px) + 10px);bottom:auto;z-index:46;display:flex;align-items:center;gap:8px;background:#2F4F46;color:#F7F3E9;border-radius:999px;padding:8px 10px 8px 16px;box-shadow:0 8px 24px rgba(0,0,0,.3);font-size:14px;white-space:nowrap}'
+'.q48bar{flex-wrap:wrap;justify-content:flex-end;max-width:calc(100vw - 20px)}'
+'.q48bar button{border:0;border-radius:999px;padding:8px 14px;font:inherit;font-size:13.5px;cursor:pointer;min-height:36px;background:rgba(255,255,255,.16);color:#F7F3E9}'
+'.q48bar button.del{background:#C8553D}.q48bar .x{padding:0;width:32px}'
+'.short-wrap.q48on .short-row,.short-wrap.q48on .sl-row{background:#F4D06F33;box-shadow:inset 0 0 0 2px #F4D06F}'
+'.q48ig{display:inline-flex;align-items:center;justify-content:center;color:#C13584;margin-left:6px;text-decoration:none;flex:0 0 auto;vertical-align:middle;line-height:1}'
+'.q48ig svg{width:13px;height:13px}'
+'.q49d{font-size:12px;color:#6B7A72;margin-top:3px}.q49pin{font-size:12.5px;opacity:.38;cursor:pointer;margin-left:2px}.q43pin{cursor:pointer;text-decoration:none}'
+'.q49leg{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;color:#6B7A72;padding:2px 2px 8px}.q49leg button{border:1px solid #D9D3C2;background:#FBF8F0;color:#2F4F46;border-radius:999px;padding:4px 10px;font:inherit;font-size:12px;cursor:pointer}.q49leg button.on{background:#2F4F46;color:#F7F3E9;border-color:#2F4F46}.q49leg .lx{border:0;background:none;padding:2px 6px;margin-left:auto;opacity:.6}'
+'.q49plan{display:flex;gap:8px;flex-wrap:wrap;padding:8px 12px 2px}.q49plan button{border:0;border-radius:999px;padding:9px 16px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;min-height:40px;background:#2F4F46;color:#F7F3E9}.q49plan button.alt{background:#F4D06F;color:#2F4F46}'
+'.q49back{position:fixed;inset:0;z-index:80;background:rgba(20,30,26,.45);display:flex;align-items:flex-end;justify-content:center}.q49sheet{background:#F7F3E9;color:#2F4F46;width:min(560px,100%);max-height:88vh;overflow-y:auto;border-radius:20px 20px 0 0;padding:16px 16px 20px}@media(min-width:700px){.q49back{align-items:center}.q49sheet{border-radius:20px}}'
+'.q49h{display:flex;align-items:center;justify-content:space-between;font-size:18px;font-weight:700}.q49h button{border:0;background:none;font-size:20px;color:#2F4F46;cursor:pointer}.q49s{font-size:13px;color:#6B7A72;margin:4px 0 10px}'
+'.q49day{background:#FBF8F0;border:1px solid #E4DECB;border-radius:14px;padding:10px 12px;margin-bottom:10px}.q49day>b{display:flex;justify-content:space-between;font-size:14px}.q49day>b small{font-weight:400;color:#6B7A72}'
+'.q49it{display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid #EEE9DA;font-size:13.5px}.q49it:first-of-type{border-top:0}.q49it.ex{opacity:.55}.q49it .t{flex:0 0 78px;font-size:12px;color:#6B7A72}.q49it .n{flex:1;min-width:0}.q49it .n small{display:block;color:#6B7A72;font-size:11.5px}.q49it button{border:0;background:none;color:#C8553D;font-size:16px;cursor:pointer;padding:4px 8px}'
+'.q49act{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap}.q49act button{flex:1;min-width:120px;border:0;border-radius:999px;padding:11px;font:inherit;font-weight:600;cursor:pointer;background:#2F4F46;color:#F7F3E9}.q49act button.alt{background:#E4DECB;color:#2F4F46}';
document.head.appendChild(st);
const IG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg>';
const isIg=u=>/^https?:\/\/(?:[\w-]+\.)?(?:instagram\.com|instagr\.am)\//i.test(String(u||''));
function igFor(L){
 if(!L)return;
 document.querySelectorAll('.sl-row').forEach(r=>{const c=r.querySelector('.check-done');const id=c&&c.dataset.id;const it=id&&(L.shortlist||[]).find(x=>x.id===id);const t=r.querySelector('.sl-tags');
  if(!it||!t||t.querySelector('.q48ig')||!isIg(it.link))return;t.insertAdjacentHTML('afterbegin','<a class="q48ig" href="'+String(it.link).replace(/"/g,'&quot;')+'" target="_blank" rel="noopener" aria-label="Open on Instagram" title="Instagram">'+IG+'</a>')});
 document.querySelectorAll('.q31-row[data-id]').forEach(r=>{const it=(L.plans||[]).find(x=>x.id===r.dataset.id);const n=r.querySelector('.q31-n');
  if(!it||!n||n.querySelector('.q48ig')||!isIg(it.link))return;n.insertAdjacentHTML('beforeend','<a class="q48ig" href="'+String(it.link).replace(/"/g,'&quot;')+'" target="_blank" rel="noopener" aria-label="Open on Instagram" title="Instagram">'+IG+'</a>')})}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('.q48ig');if(a){e.stopPropagation();return}
 const c=e.target.closest&&e.target.closest('.check-done[data-act="done"]');
 if(c){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const id=c.dataset.id;if(SEL.has(id))SEL.delete(id);else SEL.add(id);setTimeout(sync,0);return}
 const b=e.target.closest&&e.target.closest('[data-q48]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const k=b.dataset.q48,L=D_();
 if(k==='x'){SEL.clear();sync();return}
 if(!L)return;const ids=[...SEL];
 if(k==='route'){const Q=window.__q46;if(!Q)return;const ok=x=>x&&x.lat!=null&&x.lng!=null&&isFinite(x.lat)&&isFinite(x.lng);let n=0,sk=0;ids.forEach(id=>{const it=(L.shortlist||[]).find(x=>x.id===id);if(!ok(it)){sk++;return}const key='idea:'+id;if(!Q.M.picks.includes(key))Q.M.picks.push(key);n++});SEL.clear();sync();if(n){Q.M.fromIdeas=true;try{const t=document.createElement('button');t.dataset.q46='rtopen';document.body.appendChild(t);t.click();t.remove()}catch(e){}}try{toast((n?n+(n===1?' place':' places')+' ready to plan':'Nothing added')+(sk?'. '+sk+' not on the map yet, tap Link to map.':''))}catch(e){}return}
 if(k==='del'){const sn=JSON.parse(JSON.stringify(L.shortlist||[]));SEL.clear();mut(()=>{L.shortlist=(L.shortlist||[]).filter(x=>!ids.includes(x.id))});try{toastUndo('Deleted '+ids.length+(ids.length===1?' idea':' ideas'),()=>{mut(()=>{D().shortlist=sn})})}catch(x){}return}
 if(k==='done'){const items=(L.shortlist||[]).filter(x=>ids.includes(x.id)),allDone=items.length&&items.every(x=>x.done);SEL.clear();mut(()=>{(D().shortlist||[]).forEach(x=>{if(ids.includes(x.id))x.done=!allDone})});try{toast(allDone?'Moved back to ideas':'Marked done')}catch(x){}}
},true);
function sync(){
 const L=D_();if(U.tab!=='shortlist'||!L){SEL.clear()}
 const have=new Set((L&&L.shortlist||[]).map(x=>x.id));[...SEL].forEach(i=>{if(!have.has(i))SEL.delete(i)});
 document.querySelectorAll('.short-wrap').forEach(w=>{const c=w.querySelector('.check-done');if(!c)return;const on=SEL.has(c.dataset.id);c.checked=on;w.classList.toggle('q48on',on);c.setAttribute('aria-label',on?'Selected':'Select')});
 let bar=document.querySelector('.q48bar');
 if(!SEL.size){if(bar)bar.remove();return}
 const items=(L.shortlist||[]).filter(x=>SEL.has(x.id)),allDone=items.length&&items.every(x=>x.done);
 const h='<span>'+SEL.size+' selected</span><button type="button" data-q48="route">Plan my route</button><button type="button" data-q48="done">'+(allDone?'Not done':'Mark done')+'</button><button type="button" class="del" data-q48="del">Delete</button><button type="button" class="x" data-q48="x" aria-label="Clear selection">✕</button>';
 if(!bar){bar=document.createElement('div');bar.className='q48bar';document.body.appendChild(bar)}
 bar.innerHTML=h;bar.classList.toggle('up',!!document.querySelector('.q47bar'))}
const _r=window.render;
if(typeof _r==='function')window.render=function(){const v=_r.apply(this,arguments);try{document.querySelectorAll('.q47pick').forEach(x=>x.remove());igFor(D_());sync();deco()}catch(e){console.error(e)}return v};

/* ---------- v49: ideas distances + pin icon + legend, Plan my days on the Map ---------- */
const PI=Math.PI;let NEAR=null,NEARON=false;
const hv=(a,b)=>{const R=6371e3,t=x=>x*PI/180,dl=t(b.lat-a.lat),dg=t(b.lng-a.lng),h=Math.sin(dl/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
const okp=x=>x&&x.lat!=null&&x.lng!=null&&x.lat!==''&&x.lng!==''&&isFinite(x.lat)&&isFinite(x.lng);
const kmf=d=>d<950?Math.max(50,Math.round(d/50)*50)+' m':(d/1000).toFixed(1)+' km';
const esc9=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function hotels(){const H=window.__hub;if(!H||!H.INFO)return[];return H.INFO.rows.filter(r=>r.section==='stay'&&r.fields&&r.fields.lat!=null&&r.fields.lat!==''&&r.fields.lng!=null&&r.fields.lng!==''&&isFinite(r.fields.lat)&&isFinite(r.fields.lng)).map(r=>({lat:+r.fields.lat,lng:+r.fields.lng,name:r.title||'hotel'}))}
function deco(){
 const L=D_();if(!L)return;
 document.querySelectorAll('.q43pin').forEach(x=>{if(x.textContent!=='📍'){x.textContent='📍';x.title='On the map. Tap to see it or change the place.';x.setAttribute('aria-label','On the map')}x.removeAttribute('href');x.removeAttribute('target')});
 if(U.tab!=='shortlist')return;
 const hs=hotels();
 document.querySelectorAll('.sl-row').forEach(r=>{const c=r.querySelector('.check-done');const id=c&&c.dataset.id;const it=id&&(L.shortlist||[]).find(x=>x.id===id);if(!it)return;
  const tg=r.querySelector('.sl-tags'),body=r.querySelector('.sl-body');
  if(tg){const ln=tg.querySelector('.q44ln');if(ln){ln.dataset.q49=okp(it)?'show':'link';ln.dataset.id=id;ln.style.cursor='pointer'}}
  {const nt=r.querySelector('.sl-note');if(nt){nt.dataset.q49=okp(it)?'show':'link';nt.dataset.id=id;nt.style.cursor='pointer'}}
  if(tg&&okp(it)){const q=tg.querySelector('.q43pin');if(q)q.dataset.q49='show',q.dataset.id=id}
  let d=r.querySelector('.q49d');const parts=[];
  if(okp(it)){if(NEARON&&NEAR)parts.push(kmf(hv(NEAR,it))+' from me');if(hs.length){const m=Math.min.apply(null,hs.map(h=>hv(h,it)));parts.push(kmf(m)+' from hotel')}}
  const txt=parts.join(' | ');
  if(!txt){if(d)d.remove();return}
  if(!d&&body){d=document.createElement('div');d.className='q49d';body.appendChild(d)}if(d&&d.textContent!==txt)d.textContent=txt});
 const list=document.querySelector('.short-list');
 let leg=document.querySelector('.q49leg');let off=false;try{off=localStorage.getItem('q49leg')==='0'}catch(e){}
 if(list&&!off&&document.querySelector('.sl-row')){if(!leg){leg=document.createElement('div');leg.className='q49leg';list.insertBefore(leg,list.firstChild)}
  const h='<span>📍 on the map · tap an address to see it</span><button type="button" data-q49="near" class="'+(NEARON?'on':'')+'">'+(NEARON?'Distance from me: on':'Distance from me')+'</button><button type="button" class="lx" data-q49="legx" aria-label="Hide">✕</button>';
  if(leg.dataset.h!==h){leg.innerHTML=h;leg.dataset.h=h}}
 else if(leg&&off)leg.remove()}
function goMap(id,link){const Q=window.__q46;if(!Q)return;const M=Q.M;M.rt=false;M.pf=null;M.ideas=true;M.fit=true;M.sel=link?null:'idea:'+id;U.tab='map';render();
 if(link)setTimeout(()=>{const t=document.createElement('button');t.dataset.q46='pf';t.dataset.k='idea:'+id;document.body.appendChild(t);t.click();t.remove()},80)}
/* planner */
const dlong9=d=>{try{return new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',day:'numeric',month:'short'})}catch(e){return d}};
function tripDays(){const L=D_();if(!L)return[];const s=new Set((L.plans||[]).map(p=>p.date).filter(Boolean));try{const t=L.trip;if(t&&t.from&&t.to){const a=new Date(t.from+'T12:00:00'),b=new Date(t.to+'T12:00:00');for(let d=a,i=0;d<=b&&i<60;d=new Date(d.getTime()+864e5),i++)s.add(d.toISOString().slice(0,10))}}catch(e){}return[...s].sort()}
const mins=t=>{const m=String(t||'').match(/^(\d{1,2}):(\d{2})$/);return m?+m[1]*60+ +m[2]:null};
const hm=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
const legMin=(a,b)=>{const d=hv(a,b);return Math.max(5,Math.round((d<1200?d*1.3/1.25:d*1.4/7+300)/60))};
const cen=a=>a.length?{lat:a.reduce((s,x)=>s+ +x.lat,0)/a.length,lng:a.reduce((s,x)=>s+ +x.lng,0)/a.length}:null;
let PLAN=null;let PWHO=[];
function peeps(){return(typeof A!=='undefined'&&A&&Array.isArray(A.people))?A.people:[]}
function pNm(p){try{if(typeof first==='function')return first(p.name)}catch(e){}return String(p.name||'').split(' ')[0]||p.name}
function whoHtml(){const ppl=peeps();if(ppl.length<2)return'';const all=!PWHO.length;
 return '<div class="q49s">Who\'s this for?</div><div class="q50chips" style="margin:4px 0 12px"><button type="button" class="'+(all?'on':'')+'" data-q49="pwho" data-m="">All</button>'+ppl.map(p=>'<button type="button" class="'+(PWHO.includes(p.id)?'on':'')+'" data-q49="pwho" data-m="'+esc9(p.id)+'">'+esc9(pNm(p))+(p.id===A.me?' (you)':'')+'</button>').join('')+'</div>'}
function schedule(day){let cur=day.base;let prev=day.last;day.items.forEach(it=>{if(prev&&cur!=null)cur+=Math.round(legMin(prev,it.x)/5)*5;
  if(cur!=null&&cur<=21*60){it.start=hm(cur);it.end=hm(Math.min(cur+90,23*60+59));cur+=90}else{it.start='';it.end=''}prev=it.x});
 let t=0,pr=day.hotel||day.last;day.items.forEach(it=>{if(pr)t+=legMin(pr,it.x);pr=it.x});day.travel=t}
function build(dayList){const L=D_();const plans=L.plans||[];const have=new Set(plans.map(p=>p.place_id).filter(Boolean));
 const all=(L.shortlist||[]).filter(x=>!x.done&&!(x.place_id&&have.has(x.place_id)));const ideas=all.filter(okp);const unp=all.length-ideas.length;
 const hot=hotels()[0]||null,cap=5;
 const ds=dayList.map(d=>{const ex=plans.filter(p=>p.date===d).sort((a,b)=>(mins(a.start)==null?9999:mins(a.start))-(mins(b.start)==null?9999:mins(b.start)));return{date:d,ex,pin:ex.filter(okp),free:Math.max(0,cap-ex.length),items:[]}}).filter(d=>d.free>0);
 if(!ideas.length)return{empty:1,unp};if(!ds.length)return{full:1,unp};
 {let acc=0;const pick=[];for(const d of ds){const f=Math.max(0,4-d.ex.length);if(!f)continue;pick.push(d);d.free=f;acc+=f;if(acc>=ideas.length)break}
  if(acc>=ideas.length){ds.length=0;pick.forEach(d=>ds.push(d))}}
 const totalFree=ds.reduce((a,d)=>a+d.free,0);
 const ref=hot||cen(ds.flatMap(d=>d.pin))||cen(ideas);
 const pool=ideas.slice().sort((a,b)=>hv(ref,a)-hv(ref,b)).slice(0,totalFree);
 let cs=ds.map(d=>cen(d.pin));
 const anchors=cs.filter(Boolean).concat(hot?[hot]:[]);
 ds.forEach((d,i)=>{if(cs[i])return;let best=null,bd=-1;pool.forEach(x=>{if(cs.includes(x))return;const m=anchors.length?Math.min.apply(null,anchors.map(a=>hv(a,x))):hv(pool[0],x);if(m>bd){bd=m;best=x}});if(best){cs[i]={lat:best.lat,lng:best.lng};anchors.push(cs[i])}else cs[i]=ref});
 let buckets=ds.map(()=>[]);
 for(let k=0;k<4;k++){buckets=ds.map(()=>[]);
  pool.map(x=>({x,m:Math.min.apply(null,cs.map(c=>hv(c,x)))})).sort((a,b)=>b.m-a.m).forEach(o=>{let bi=-1,bd=1e18;cs.forEach((c,i)=>{if(buckets[i].length>=ds[i].free)return;const d=hv(c,o.x);if(d<bd){bd=d;bi=i}});if(bi>=0)buckets[bi].push(o.x)});
  cs=ds.map((d,i)=>cen(d.pin.concat(buckets[i]))||cs[i])}
 ds.forEach((d,i)=>{const last=d.ex.filter(okp).pop()||null;let start=hot||last||(buckets[i][0]||null);const it=buckets[i].slice(),out=[];
  while(it.length){let bi=0,bd=1e18;it.forEach((x,j)=>{const m=start?hv(start,x):0;if(m<bd){bd=m;bi=j}});const x=it.splice(bi,1)[0];out.push({x});start=x}
  d.items=out;d.hotel=hot;d.last=last;const ends=d.ex.map(p=>mins(p.end)||mins(p.start)).filter(v=>v!=null);d.base=ends.length?Math.max.apply(null,ends)+(last?0:0):10*60;d.hasEx=ends.length>0;if(d.hasEx)d.base=d.base;schedule(d)});
 return{days:ds.filter(d=>d.items.length||false),unp,hot}}
function openPlan(dayList){PWHO=[];const r=build(dayList);PLAN=r;paintPlan()}
function closePlan(){PLAN=null;const m=document.getElementById('q49m');if(m)m.remove()}
function paintPlan(){let m=document.getElementById('q49m');if(!PLAN){if(m)m.remove();return}
 if(!m){m=document.createElement('div');m.id='q49m';m.className='q49back';document.body.appendChild(m)}
 const P=PLAN;let h='<div class="q49sheet"><div class="q49h">Plan my days<button type="button" data-q49="pcl" aria-label="Close">✕</button></div>';
 if(P.empty||P.full||!P.days.length){h+='<div class="q49s">'+(P.empty?'No pinned ideas to plan yet. Pin ideas with the 📍 icon in Ideas first.':'Those days are already full (5 stops each).')+(P.unp?' '+P.unp+' idea'+(P.unp>1?'s are':' is')+' not on the map yet.':'')+'</div><div class="q49act"><button type="button" class="alt" data-q49="pcl">Close</button></div></div>';m.innerHTML=h;return}
 const n=P.days.reduce((a,d)=>a+d.items.length,0);
 h+='<div class="q49s">'+n+' idea'+(n>1?'s':'')+' grouped by area and ordered to cut travel'+(P.hot?', starting from '+esc9(P.hot.name):'')+'. This is just a suggestion — tap ✕ to leave one out, then add a day or all days to your itinerary when you\'re happy with it.'+(P.unp?' '+P.unp+' not on the map yet, left out.':'')+'</div>';
 h+=whoHtml();
 P.days.forEach((d,di)=>{h+='<div class="q49day"><b>'+esc9(dlong9(d.date))+'<small>'+(d.items.length?'~'+d.travel+' min getting around':'')+'</small></b>';
  d.ex.forEach(p=>{h+='<div class="q49it ex"><span class="t">'+esc9(p.start?p.start+(p.end?'–'+p.end:''):'planned')+'</span><span class="n">'+esc9(p.name)+'<small>already in your plan</small></span></div>'});
  d.items.forEach((it,ii)=>{h+='<div class="q49it"><span class="t">'+esc9(it.start?it.start+'–'+it.end:'any time')+'</span><span class="n">'+esc9(it.x.name)+'<small>'+esc9(it.x.area||'')+'</small></span><button type="button" data-q49="prm" data-d="'+di+'" data-i="'+ii+'" aria-label="Leave out">✕</button></div>'});
  if(d.items.length)h+='<div class="q49act"><button type="button" class="alt" data-q49="papday" data-d="'+di+'">Add this day to itinerary</button></div>';
  h+='</div>'});
 h+='<div class="q49act"><button type="button" class="alt" data-q49="pcl">Cancel</button><button type="button" class="alt" data-q49="papview">Check my routes</button><button type="button" data-q49="papall">Add all days to itinerary</button></div></div>';m.innerHTML=h}
function applyPlan(){const P=PLAN;if(!P||!P.days)return;const L=D_();const sn=JSON.parse(JSON.stringify(L.plans||[]));let n=0;
 mut(()=>{P.days.forEach(d=>d.items.forEach(it=>{const x=it.x;n++;L.plans.push({id:uuid(),date:d.date,who:PWHO.slice(),name:x.name,start:it.start||'',end:it.end||'',area:x.area||'',place:x.place||x.address||'',link:x.link||'',notes:'',tent:false,note:false,place_id:x.place_id||null,lat:x.lat,lng:x.lng,address:x.address||null,maps_url:x.maps_url||null})}))});
 const first=P.days.find(d=>d.items.length);closePlan();const Q=window.__q46;if(Q){Q.M.rt=false;Q.M.sel=null;Q.M.fit=true;if(first&&PLANSINGLE)Q.M.day=first.date}U.tab='map';render();
 try{toastUndo('Added all days ('+n+' stop'+(n>1?'s':'')+') to your itinerary',()=>{mut(()=>{D().plans=sn})})}catch(e){}}
function applyDay(di){const P=PLAN;if(!P||!P.days||!P.days[di])return;const d=P.days[di];const L=D_();const sn=JSON.parse(JSON.stringify(L.plans||[]));let n=0;
 mut(()=>{d.items.forEach(it=>{const x=it.x;n++;L.plans.push({id:uuid(),date:d.date,who:PWHO.slice(),name:x.name,start:it.start||'',end:it.end||'',area:x.area||'',place:x.place||x.address||'',link:x.link||'',notes:'',tent:false,note:false,place_id:x.place_id||null,lat:x.lat,lng:x.lng,address:x.address||null,maps_url:x.maps_url||null})})});
 P.days.splice(di,1);if(!P.days.length)closePlan();else paintPlan();
 try{toastUndo('Added '+dlong9(d.date)+' ('+n+' stop'+(n>1?'s':'')+') to your itinerary',()=>{mut(()=>{D().plans=sn})})}catch(e){}}
function previewRoutes(){const Q=window.__q46;const P=PLAN;if(!Q||!P||!P.days)return;
 P.days.forEach(d=>d.items.forEach(it=>{const key='idea:'+it.x.id;if(!Q.M.picks.includes(key))Q.M.picks.push(key)}));
 closePlan();Q.M.fromIdeas=true;Q.M.rt=false;Q.M.sel=null;Q.M.fit=true;U.tab='map';render();
 setTimeout(()=>{const t=document.createElement('button');t.dataset.q46='rtopen';document.body.appendChild(t);t.click();t.remove()},80)}
let PLANSINGLE=false;
function mapUi(){const Q=window.__q46;const sec=document.querySelector('.q46');if(!Q||!sec)return;const M=Q.M;
 const tabs=sec.querySelector('.q47tabs');let bar=sec.querySelector('.q49plan');
 if(tabs){if(!bar){bar=document.createElement('div');bar.className='q49plan';tabs.after(bar)}
  const h='<button type="button" data-q49="plan-all">✨ Plan my days</button>'+(M.day!=='all'&&!M.rt?'<button type="button" class="alt" data-q49="plan-day">Plan this day</button>':'');
  if(bar.dataset.h!==h){bar.innerHTML=h;bar.dataset.h=h}}
 const card=sec.querySelector('.q46card .q46a');
 if(card&&M.sel&&/^(idea|plan):/.test(M.sel)){const[k,id]=M.sel.split(':');const L=D_();const it=L&&((k==='plan'?L.plans:L.shortlist)||[]).find(x=>x.id===id);
  if(it&&okp(it)&&!card.querySelector('[data-q49=unlink]')){const a=document.createElement('button');a.type='button';a.className='q46b alt';a.dataset.q46='pf';a.dataset.k=M.sel;a.textContent='Change place';const b=document.createElement('button');b.type='button';b.className='q46b alt';b.dataset.q49='unlink';b.dataset.k=M.sel;b.textContent='Unlink';card.appendChild(a);card.appendChild(b)}
  if(it&&k==='plan'&&!card.querySelector('[data-q49=mvideas]')){const c=document.createElement('button');c.type='button';c.className='q46b alt';c.dataset.q49='mvideas';c.dataset.k=M.sel;c.textContent='Move to Ideas';card.appendChild(c)}}}
function moveToIdeas(key){const[k,id]=String(key).split(':');if(k!=='plan')return;const L=D_();const p=L&&(L.plans||[]).find(x=>x.id===id);if(!p)return;
 const sn={plans:JSON.parse(JSON.stringify(L.plans||[])),shortlist:JSON.parse(JSON.stringify(L.shortlist||[]))};
 mut(()=>{const Dv=D();Dv.plans=(Dv.plans||[]).filter(x=>x.id!==id);(Dv.shortlist=Dv.shortlist||[]).push({id:uuid(),name:p.name,link:p.link||'',place:p.place||'',address:p.address||null,area:p.area||'',place_id:p.place_id||null,lat:p.lat,lng:p.lng,maps_url:p.maps_url||null,done:false,notes:''})});
 const Q=window.__q46;if(Q){Q.M.sel=null;Q.M.fit=true}U.tab='shortlist';render();
 try{toastUndo('Moved to Ideas',()=>{mut(()=>{D().plans=sn.plans;D().shortlist=sn.shortlist})})}catch(e){}}
function backChip(){const Q=window.__q46;if(!Q)return;const M=Q.M;if(!M.rt){M.fromIdeas=false}const has=document.querySelector('[data-q49=toideas]');const anchor=document.querySelector('.q46b[data-q46=rtclear]');const want=M.rt&&M.fromIdeas&&anchor;if(want&&!has){const b=document.createElement('button');b.type='button';b.className='q46b alt';b.dataset.q49='toideas';b.textContent='← Ideas';anchor.parentNode.insertBefore(b,anchor)}else if(has&&!want)has.remove()}
let raf=0;new MutationObserver(()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;try{mapUi();backChip();gmRoute()}catch(e){}})}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-q49]');if(!b){
  if(e.target.id==='q49p'){closePP();return}
  if(e.target.id==='q49m'){closePlan();return}
  return}
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const a=b.dataset.q49;
 if(a==='near'){if(NEARON){NEARON=false;deco();return}if(!navigator.geolocation){try{toast('Your phone did not share location')}catch(x){}return}
  navigator.geolocation.getCurrentPosition(p=>{NEAR={lat:p.coords.latitude,lng:p.coords.longitude};NEARON=true;deco()},()=>{try{toast('Allow location to see how far things are from you')}catch(x){}},{enableHighAccuracy:false,timeout:10000,maximumAge:120000});return}
 if(a==='legx'){try{localStorage.setItem('q49leg','0')}catch(x){}const l=document.querySelector('.q49leg');if(l)l.remove();return}
 if(a==='link'||a==='show'){openPlace(b.dataset.id);return}
 if(a==='ppx'){closePP();return}
 if(a==='pps'){ppSearch();return}
 if(a==='ppsel'){if(PP){PP.pend=+b.dataset.i;paintPP()}return}
 if(a==='ppno'){if(PP){PP.pend=null;paintPP()}return}
 if(a==='ppchg'){if(PP){PP.edit=true;PP.pend=null;paintPP()}return}
 if(a==='ppback'){if(PP){PP.edit=false;PP.pend=null;paintPP()}return}
 if(a==='ppyes'){ppLink();return}
 if(a==='ppcopy'){const it=ppItem();const t=it&&(it.address||it.place)||'';const done=()=>{try{toast('Address copied')}catch(x){}};try{navigator.clipboard.writeText(t).then(done,()=>{const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(x){}ta.remove();done()})}catch(x){}return}
 if(a==='toideas'){const Q=window.__q46;if(Q){Q.M.rt=false;Q.M.fromIdeas=false}U.tab='shortlist';render();try{Q.pickBar()}catch(x){}return}
 if(a==='ppun'){ppUnlink();return}
 if(a==='plan-all'){PLANSINGLE=false;openPlan(tripDays());return}
 if(a==='plan-day'){const Q=window.__q46;if(!Q||Q.M.day==='all')return;PLANSINGLE=true;openPlan([Q.M.day]);return}
 if(a==='pcl'){closePlan();return}
 if(a==='papall'){applyPlan();return}
 if(a==='papday'){applyDay(+b.dataset.d);return}
 if(a==='papview'){previewRoutes();return}
 if(a==='pwho'){const m=b.dataset.m;if(!m)PWHO=[];else{const i=PWHO.indexOf(m);if(i>=0)PWHO.splice(i,1);else PWHO.push(m)}paintPlan();return}
 if(a==='prm'&&PLAN&&PLAN.days){const d=PLAN.days[+b.dataset.d];if(d){d.items.splice(+b.dataset.i,1);schedule(d);paintPlan()}return}
 if(a==='mvideas'){moveToIdeas(b.dataset.k);return}
 if(a==='unlink'){const[k,id]=String(b.dataset.k).split(':');const L=D_();if(!L)return;const sn=JSON.parse(JSON.stringify({p:L.plans,s:L.shortlist}));
  mut(()=>{const it=((k==='plan'?L.plans:L.shortlist)||[]).find(x=>x.id===id);if(it){it.place_id=null;it.lat=null;it.lng=null;it.address=null;it.maps_url=null}});
  const Q=window.__q46;if(Q){Q.M.sel=null;Q.M.fit=true}U.tab='map';render();try{toastUndo('Unlinked from the map',()=>{mut(()=>{D().plans=sn.p;D().shortlist=sn.s})})}catch(x){}}
},true);

/* ---------- v50: link / change a place right from Ideas, with a small map popup ---------- */
const GK='AIzaSyD8Jb77mbnzotsBlhdDXk45vfhoI-GHXuE';
const css2=document.createElement('style');
css2.textContent='.q49em{width:100%;height:210px;border:0;border-radius:12px;background:#E4DECB;display:block;margin:8px 0}.q49pn{font-weight:700;font-size:15px}.q49ad{font-size:13px;color:#6B7A72;margin:2px 0 8px}'
+'.q49row{display:flex;gap:8px;margin:8px 0}.q49row input{flex:1;min-width:0;border:1px solid #D9D3C2;border-radius:12px;padding:10px 12px;font:inherit;font-size:15px;background:#fff;color:#2F4F46}.q49row button{border:0;border-radius:12px;padding:0 16px;font:inherit;font-weight:600;background:#2F4F46;color:#F7F3E9;cursor:pointer}'
+'.q49rs{display:block;width:100%;text-align:left;border:0;border-top:1px solid #EEE9DA;background:none;padding:10px 4px;font:inherit;color:#2F4F46;cursor:pointer}.q49rs b{display:block;font-weight:600}.q49rs small{display:block;color:#6B7A72;font-size:12px}'
+'.q49cp{text-align:center;margin-top:2px}.q49cp button{border:0;background:none;color:#6B7A72;font:inherit;font-size:13px;padding:8px 12px;cursor:pointer;text-decoration:underline}.q49act a{flex:1;text-align:center;text-decoration:none;border-radius:999px;padding:11px;font-weight:600;background:#E4DECB;color:#2F4F46}.q49act button.red{background:#fff;color:#C8553D;border:1px solid #E4DECB}';
document.head.appendChild(css2);
let PP=null;
function ppItem(){const L=D_();return L&&PP?(L.shortlist||[]).find(x=>x.id===PP.id):null}
function openPlace(id){const L=D_();const it=L&&(L.shortlist||[]).find(x=>x.id===id);if(!it)return;PP={id,q:String(it.name||'').slice(0,120),res:null,busy:false,err:'',pend:null,edit:!okp(it)};paintPP();if(!okp(it))ppSearch()}
function closePP(){PP=null;const m=document.getElementById('q49p');if(m)m.remove()}
async function ppSearch(){const f=PP;if(!f)return;const el=document.getElementById('q49q');if(el)f.q=el.value;const q=String(f.q||'').trim();if(q.length<2)return;
 f.busy=true;f.err='';f.pend=null;paintPP();const T=window.__q43;
 const r=T?await T.call(Object.assign({action:'text',query:q.slice(0,160)},T.ctx())):{error:'offline'};if(PP!==f)return;f.busy=false;
 if(r.error){f.res=[];f.err=r.error==='limit'?'Map search is resting for now. Try again later.':'Map search isn’t available right now.';paintPP();return}
 f.res=(r.places||[]).filter(x=>x.lat!=null&&x.lng!=null).slice(0,6);
 if(f.res.length===1){f.pend=0;ppLink();return}
 if(f.res.length>1)f.pend=0;
 paintPP()}
function embed(q){return '<iframe class="q49em" title="Map" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen src="https://www.google.com/maps/embed/v1/place?key='+GK+'&q='+encodeURIComponent(q)+'&zoom=16"></iframe>'}
function mapsHref(x){return x.mapsUrl&&/^https:\/\//.test(x.mapsUrl)?x.mapsUrl:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(x.lat+','+x.lng)}
function paintPP(){let m=document.getElementById('q49p');if(!PP){if(m)m.remove();return}const it=ppItem();if(!it){closePP();return}
 if(!m){m=document.createElement('div');m.id='q49p';m.className='q49back';document.body.appendChild(m)}
 const keep=document.activeElement&&document.activeElement.id==='q49q';
 let h='<div class="q49sheet"><div class="q49h"><span>'+esc9(it.name)+'</span><button type="button" data-q49="ppx" aria-label="Close">✕</button></div>';
 if(PP.pend!=null&&PP.res&&PP.res[PP.pend]){const x=PP.res[PP.pend];
  h+='<div class="q49s">Is this the right place?</div>'+embed(x.placeId?'place_id:'+x.placeId:x.lat+','+x.lng)+'<div class="q49pn">'+esc9(x.name)+'</div><div class="q49ad">'+esc9(x.address||'')+'</div><div class="q49act"><button type="button" data-q49="ppyes">Yes, pin this</button><button type="button" class="alt" data-q49="ppno">Not this one</button></div><div class="q49act"><a href="'+esc9(mapsHref(x))+'" target="_blank" rel="noopener">Open in Maps</a></div>'}
 else if(okp(it)&&!PP.edit){
  h+=embed(it.place_id?'place_id:'+it.place_id:it.lat+','+it.lng)+'<div class="q49ad">'+esc9(it.address||it.place||'')+'</div><div class="q49act"><a href="'+esc9(mapsHref({mapsUrl:it.maps_url,lat:it.lat,lng:it.lng}))+'" target="_blank" rel="noopener">Open in Maps</a><button type="button" class="alt" data-q49="ppchg">Change place</button><button type="button" class="alt red" data-q49="ppun">Unlink</button></div>'+((it.address||it.place)?'<div class="q49cp"><button type="button" data-q49="ppcopy">Copy address</button></div>':'')}
 else{
  h+='<div class="q49s">'+(okp(it)?'Pick a different place. Your name for it stays as is.':'Type the place or address. Your name for it stays as is.')+'</div><div class="q49row"><input id="q49q" type="text" value="'+esc9(PP.q)+'" autocomplete="off" placeholder="Shop name, area or address" aria-label="Search for a place"><button type="button" data-q49="pps">'+(PP.busy?'…':'Search')+'</button></div>';
  if(PP.err)h+='<div class="q49s">'+esc9(PP.err)+'</div>';
  if(PP.res)h+=PP.res.length?PP.res.map((x,i)=>'<button type="button" class="q49rs" data-q49="ppsel" data-i="'+i+'"><b>'+esc9(x.name)+'</b><small>'+esc9(x.address||'')+'</small></button>').join(''):'<div class="q49s">Nothing found. Try the area or street too.</div>';
  h+='<div class="q49act">'+(okp(it)?'<button type="button" class="alt" data-q49="ppback">Back</button>':'<button type="button" class="alt" data-q49="ppx">Cancel</button>')+'</div>'}
 h+='</div>';m.innerHTML=h;if(keep){const el=document.getElementById('q49q');if(el){el.focus();try{el.setSelectionRange(el.value.length,el.value.length)}catch(e){}}}}
function ppLink(){const f=PP;const x=f&&f.res&&f.res[f.pend];const L=D_();if(!x||!L)return;
 mut(()=>{const t=(L.shortlist||[]).find(v=>v.id===f.id);if(!t)return;t.place_id=x.placeId||null;t.lat=x.lat;t.lng=x.lng;t.address=x.address||null;t.maps_url=x.mapsUrl||null});
 f.pend=null;f.edit=false;f.res=null;closePP();try{toast('Location linked: '+x.name)}catch(e){}}
function ppUnlink(){const f=PP,L=D_(),t=f&&L&&(L.shortlist||[]).find(v=>v.id===f.id);if(!t)return;const old={place_id:t.place_id,lat:t.lat,lng:t.lng,address:t.address,maps_url:t.maps_url},id=t.id;
 mut(()=>{t.place_id=null;t.lat=null;t.lng=null;t.address=null;t.maps_url=null});f.edit=true;f.res=null;paintPP();
 try{toastUndo('Unlinked from the map',()=>{mut(()=>{const u=(D().shortlist||[]).find(v=>v.id===id);if(u)Object.assign(u,old)});if(PP&&PP.id===id){PP.edit=false;paintPP()}})}catch(e){}}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='q49q'&&PP)PP.q=e.target.value},true);
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='q49q'&&e.key==='Enter'){e.preventDefault();ppSearch()}if(e.key==='Escape'&&PP)closePP()},true);

/* ---------- v51: Flexible today, Schedule at / Move to, same idea on many days, bigger taps, route in Google Maps ---------- */
const css3=document.createElement('style');
css3.textContent='.q50flex{display:flex;align-items:center;gap:6px;width:100%;border:0;background:none;color:#6B7A72;font:inherit;font-size:13.5px;padding:6px 4px;min-height:36px;cursor:pointer;text-align:left}.q50flex b{font-weight:600;color:#2F4F46}.q50flex i{font-style:normal;margin-left:auto;font-size:12px}'
+'.q50acts{display:flex;gap:2px;margin:-4px 0 6px 2px}.q50acts button{border:0;background:none;color:#2F4F46;font:inherit;font-size:13px;padding:8px 10px;min-height:36px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}'
+'.q50chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 12px}.q50chips button{border:1px solid #D9D3C2;background:#FBF8F0;color:#2F4F46;border-radius:999px;padding:9px 14px;min-height:40px;font:inherit;font-size:14px;cursor:pointer}.q50chips button.busy{opacity:.5}.q50chips button.on{background:#2F4F46;color:#F7F3E9;border-color:#2F4F46}'
+'.q50t{display:flex;gap:8px;align-items:center;margin:4px 0 8px}.q50t input{border:1px solid #D9D3C2;border-radius:12px;padding:9px 12px;font:inherit;font-size:15px;background:#fff;color:#2F4F46}.q50t button{border:0;border-radius:999px;padding:10px 18px;min-height:40px;font:inherit;font-weight:600;background:#2F4F46;color:#F7F3E9;cursor:pointer}'
+'.q50on{font-size:12.5px}.q50day{border:0;background:none;color:#2F4F46;font:inherit;font-size:12.5px;padding:8px 6px;min-height:36px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}'
+'.sl-row .check-done{width:26px;height:26px}.star{min-width:36px;min-height:36px}.o3-acts .mv{min-height:36px}.q31-row,.q41-row{min-height:44px}'
+'.toggle>button,.q32-qa>button,.q31-seg>button,.q31-chips>button,.q38-gb>button,.q38-tabs>button,.q49leg button,.person-pick button,.arch-toggle,.q44ln{position:relative}'
+'.toggle>button::after,.q32-qa>button::after,.q31-seg>button::after,.q31-chips>button::after,.q38-gb>button::after,.q38-tabs>button::after,.q49leg button::after,.person-pick button::after,.arch-toggle::after,.q44ln::after{content:"";position:absolute;left:-3px;right:-3px;top:-8px;bottom:-8px}'
+'.q49gm{display:inline-flex;align-items:center;text-decoration:none;color:#2F4F46;font-size:13px;padding:0 6px;min-height:36px}';
document.head.appendChild(css3);
const FLEX={};let FS=null;
const dlab2=d=>dlong9(d);
function flexUi(){
 const L=D_();document.querySelectorAll('.q50flex,.q50acts').forEach(x=>x.remove());
 if(!L||U.tab!=='trip')return;
 const rows=[...document.querySelectorAll('.q31-row[data-id]')].filter(r=>r.dataset.t0===''&&!r.classList.contains('q50seen')||r.dataset.t0==='');
 const un=rows.filter(r=>{const p=(L.plans||[]).find(x=>x.id===r.dataset.id);return p&&!p.is_note&&!p.start});
 document.querySelectorAll('.q31-row').forEach(r=>{r.style.display=''});
 if(!un.length)return;
 const open=!!FLEX[U.date];
 const b=document.createElement('button');b.type='button';b.className='q50flex';b.dataset.q50='flex';
 b.innerHTML='<span>'+(open?'▾':'▸')+'</span><b>Flexible today</b><span>('+un.length+')</span><i>'+(open?'hide':'show')+'</i>';
 un[0].parentNode.insertBefore(b,un[0]);
 un.forEach(r=>{if(!open){r.style.display='none';return}
  const a=document.createElement('div');a.className='q50acts';a.innerHTML='<button type="button" data-q50="at" data-id="'+esc9(r.dataset.id)+'">Schedule at…</button><button type="button" data-q50="mv" data-id="'+esc9(r.dataset.id)+'">Move to another day…</button>';
  r.parentNode.insertBefore(a,r.nextSibling)})}
function paintFS(){let m=document.getElementById('q50s');if(!FS){if(m)m.remove();return}
 const L=D_(),p=L&&(L.plans||[]).find(x=>x.id===FS.id);if(!p){FS=null;if(m)m.remove();return}
 if(!m){m=document.createElement('div');m.id='q50s';m.className='q49back';document.body.appendChild(m)}
 const busy=(L.plans||[]).filter(x=>x.date===p.date&&x.id!==p.id&&x.start&&!x.is_note).map(x=>[mins(x.start),mins(x.end)!=null?mins(x.end):mins(x.start)+60]);
 let h='<div class="q49sheet"><div class="q49h"><span>'+esc9(p.name)+'</span><button type="button" data-q50="x" aria-label="Close">✕</button></div>';
 if(FS.mode==='at'){h+='<div class="q49s">Pick a start time. Busy hours are dimmed.</div><div class="q50chips">';
  for(let t=8*60;t<=21*60;t+=60){const bz=busy.some(r=>t<r[1]&&t+60>r[0]);const lb=hm(t);h+='<button type="button" class="'+(bz?'busy':'')+'" data-q50="set" data-t="'+lb+'">'+lb+'</button>'}
  h+='</div><div class="q50t"><input id="q50ti" type="time" value="12:00" aria-label="Other time"><button type="button" data-q50="setx">Set time</button></div>'}
 else{h+='<div class="q49s">Move to which day?</div><div class="q50chips">'+tripDays().map(d=>'<button type="button" class="'+(d===p.date?'on':'')+'" data-q50="day" data-d="'+d+'">'+esc9(dlab2(d))+'</button>').join('')+'</div>'}
 h+='</div>';m.innerHTML=h}
function setTime(id,t){const L=D_();const p=L&&(L.plans||[]).find(x=>x.id===id);if(!p||!/^\d{1,2}:\d{2}$/.test(t))return;const old={start:p.start,end:p.end};const s0=mins(t);
 mut(()=>{p.start=hm(s0);p.end=hm(Math.min(s0+60,23*60+59))});FS=null;paintFS();
 try{toastUndo('Scheduled at '+hm(s0),()=>{mut(()=>{const q=(D().plans||[]).find(x=>x.id===id);if(q){q.start=old.start;q.end=old.end}})})}catch(e){}}
function moveDay(id,d){const L=D_();const p=L&&(L.plans||[]).find(x=>x.id===id);if(!p||p.date===d)return;const old=p.date;
 mut(()=>{p.date=d});FS=null;paintFS();U.date=d;render();
 try{toastUndo('Moved to '+dlab2(d),()=>{mut(()=>{const q=(D().plans||[]).find(x=>x.id===id);if(q)q.date=old})})}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-q50]');if(!b){const m=document.getElementById('q50s');if(m&&e.target===m){FS=null;paintFS()}return}
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const a=b.dataset.q50;
 if(a==='flex'){FLEX[U.date]=!FLEX[U.date];flexUi();return}
 if(a==='at'||a==='mv'){FS={id:b.dataset.id,mode:a};paintFS();return}
 if(a==='x'){FS=null;paintFS();return}
 if(a==='set'&&FS){setTime(FS.id,b.dataset.t);return}
 if(a==='setx'&&FS){const el=document.getElementById('q50ti');setTime(FS.id,el&&el.value);return}
 if(a==='day'&&FS){moveDay(FS.id,b.dataset.d);return}
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&FS){FS=null;paintFS()}},true);
/* same idea on several days: show every date, keep the + Add to day button */
function multi(){const L=D_();if(!L||U.tab!=='shortlist')return;
 document.querySelectorAll('.short-wrap').forEach(w=>{const c=w.querySelector('.check-done');const id=c&&c.dataset.id;const it=id&&(L.shortlist||[]).find(x=>x.id===id);if(!it)return;
  const on=w.querySelector('.o3-acts [data-q37day]');if(!on)return;
  const n=String(it.name||'').trim().toLowerCase(),l=String(it.link||'').trim();
  const pl=(L.plans||[]).filter(p=>!p.is_note&&((l&&p.link&&p.link===l)||(n&&String(p.name||'').trim().toLowerCase()===n))).map(p=>p.date).filter(Boolean);
  const ds=[...new Set(pl)].sort();
  const sp=on.querySelector('span');const txt='On '+ds.map(d=>{try{return new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short'})}catch(x){return d}}).join(', ');
  if(sp&&sp.textContent!==txt)sp.textContent=txt;
  if(!w.querySelector('.q50add')){const a=document.createElement('button');a.type='button';a.className='q50day q50add';a.dataset.act='sched';a.dataset.kind='short';a.dataset.id=id;a.textContent='+ another day';on.parentNode.appendChild(a)}})}
/* open the route in Google Maps */
function gmRoute(){const Q=window.__q46;const old=document.querySelector('.q49gm');if(!Q||!Q.M.rt){if(old)old.remove();return}
 const anchor=document.querySelector('.q46b[data-q46=rtclear]');if(!anchor){if(old)old.remove();return}
 const L=D_();const pts=[];Q.M.picks.forEach(k=>{const[t,id]=String(k).split(':');let x=null;if(t==='idea')x=(L.shortlist||[]).find(v=>v.id===id);else if(t==='plan')x=(L.plans||[]).find(v=>v.id===id);else if(t==='stay'){const H=window.__hub;const r=H&&H.INFO&&H.INFO.rows.find(v=>v.id===id);if(r&&r.fields)x={lat:r.fields.lat,lng:r.fields.lng}}
  if(okp(x))pts.push(x.lat+','+x.lng)});
 if(pts.length<2){if(old)old.remove();return}
 const wp=pts.slice(1,-1).slice(0,8);const u='https://www.google.com/maps/dir/?api=1&origin='+pts[0]+'&destination='+pts[pts.length-1]+(wp.length?'&waypoints='+wp.join('%7C'):'')+'&travelmode=transit';
 if(old){if(old.getAttribute('href')!==u)old.setAttribute('href',u);return}
 const a=document.createElement('a');a.className='q49gm';a.href=u;a.target='_blank';a.rel='noopener';a.textContent='Open in Google Maps ↗';anchor.parentNode.insertBefore(a,anchor)}
const _r2=window.render;
if(typeof _r2==='function')window.render=function(){const v=_r2.apply(this,arguments);try{flexUi();multi()}catch(e){console.error(e)}return v};
})();
