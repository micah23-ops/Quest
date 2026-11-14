/* v46: Map tab. Own tiny map on free OpenStreetMap tiles (no Google calls). Pins come from itinerary + ideas. */
(function(){
if(window.__q46)return;window.__q46=1;
const M={day:'all',ideas:true,sel:null,lat:0,lng:0,z:12,fit:true,adding:false,picks:[],rt:false,swap:null,save:false,pf:null,menu:null,more:false,fall:{},fcat:'food',st:null,custom:null,startKey:null,g:(()=>{try{return localStorage.getItem('q46g')!=='0'}catch(e){return true}})()};
const TS=256,PI=Math.PI;
const GKEY='AIzaSyD8Jb77mbnzotsBlhdDXk45vfhoI-GHXuE';/* browser key: restricted to Quest addresses + Maps Embed API only */
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const D_=()=>{try{return D()}catch(e){return null}};
const wp=(lat,lng,z)=>{const n=Math.pow(2,z)*TS,s=Math.sin(lat*PI/180);return{x:(lng+180)/360*n,y:(0.5-Math.log((1+s)/(1-s))/(4*PI))*n}};
const ll=(x,y,z)=>{const n=Math.pow(2,z)*TS;return{lat:Math.atan(Math.sinh(PI*(1-2*y/n)))*180/PI,lng:x/n*360-180}};
const ok=x=>x&&x.lat!=null&&x.lng!=null&&isFinite(x.lat)&&isFinite(x.lng);
function days(){const L=D_();if(!L)return[];const s=new Set((L.plans||[]).map(p=>p.date).filter(Boolean));
 try{const t=L.trip;if(t&&t.from&&t.to){const a=new Date(t.from+'T12:00:00'),b=new Date(t.to+'T12:00:00');for(let d=a,i=0;d<=b&&i<60;d=new Date(d.getTime()+864e5),i++)s.add(d.toISOString().slice(0,10))}}catch(e){}
 return[...s].sort()}
const dlab=d=>{try{const x=new Date(d+'T12:00:00');return x.toLocaleDateString('en-US',{weekday:'short'})+' '+x.getDate()}catch(e){return d}};
function mapsUrl(p){if(p.place_id)return'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.name||'')+'&query_place_id='+encodeURIComponent(p.place_id);
 if(p.maps_url&&/^https:\/\//.test(p.maps_url))return p.maps_url;return'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.lat+','+p.lng)}
function data(){const L=D_();const out={plans:[],ideas:[],stays:[],unpinnedIdeas:0,unpinnedDay:0};if(!L)return out;out.stays=stays().filter(x=>!M.picks.includes('stay:'+x.id));
 const stampOf=p=>{const m=String(p.start||'').match(/^(\d{1,2}):(\d{2})$/);return m?+m[1]*60+ +m[2]:9999};
 let pl=(L.plans||[]).slice();if(M.day!=='all')pl=pl.filter(p=>p.date===M.day);
 pl.sort((a,b)=>(a.date||'').localeCompare(b.date||'')||stampOf(a)-stampOf(b));
 out.plans=pl.filter(ok);out.unpinnedDay=pl.length-out.plans.length;
 if(M.rt){out.plans=routeStops();out.unpinnedDay=0;const inR=new Set(M.picks);const all=(L.shortlist||[]).filter(x=>!x.done&&ok(x)&&!inR.has('idea:'+x.id));out.ideas=all;out.unpinnedIdeas=0;return out}
 const have=new Set((L.plans||[]).map(p=>p.place_id).filter(Boolean));
 const all=(L.shortlist||[]).filter(x=>!x.done);out.unpinnedIdeas=all.filter(x=>!ok(x)).length;
 out.ideas=all.filter(x=>ok(x)&&!(x.place_id&&have.has(x.place_id)));return out}
/* ---------- engine ---------- */
let host=null,tiles={},drag=null,pts=new Map(),pinch=null,moved=false,lastData=null;
function size(){return host?{W:host.clientWidth||320,H:host.clientHeight||360}:{W:320,H:360}}
function selShift(){const W=window.innerWidth,Hh=window.innerHeight;if(W>=900)return{x:0,y:0};if(W>=700)return{x:230,y:0};const mt=host?host.getBoundingClientRect().top:110;const t=Math.max(40,(Hh*0.38-mt)/2);return{x:0,y:Math.round(size().H/2-t)}}
function setCenterPx(cx,cy){const p=ll(cx,cy,M.z);M.lat=Math.max(-80,Math.min(80,p.lat));M.lng=p.lng}
function zoomAt(nz,mx,my){nz=Math.max(3,Math.min(18,nz));if(nz===M.z)return;const{W,H}=size();const c=wp(M.lat,M.lng,M.z);
 const at=ll(c.x+(mx-W/2),c.y+(my-H/2),M.z);M.z=nz;const q=wp(at.lat,at.lng,nz);setCenterPx(q.x-(mx-W/2),q.y-(my-H/2));draw()}
function fit(){const d=lastData||data();const P=[];d.plans.forEach(p=>P.push(p));(d.stays||[]).forEach(p=>P.push(p));if(M.ideas)d.ideas.forEach(p=>P.push(p));
 if(M.sel){const s=find(M.sel);if(s&&ok(s)){P.length=0;P.push(s)}}
 if(!P.length)return;const{W,H}=size();let z=17;
 if(P.length>1){const pad=64;for(;z>3;z--){const a=P.map(p=>wp(p.lat,p.lng,z));const xs=a.map(q=>q.x),ys=a.map(q=>q.y);
  if(Math.max(...xs)-Math.min(...xs)<=W-pad*2&&Math.max(...ys)-Math.min(...ys)<=H-pad*2-70)break}}else z=15;
 M.z=Math.min(z,16);const a=P.map(p=>wp(p.lat,p.lng,M.z));const xs=a.map(q=>q.x),ys=a.map(q=>q.y);
 const sh=M.sel?selShift():{x:0,y:0};setCenterPx((Math.max(...xs)+Math.min(...xs))/2+sh.x,(Math.max(...ys)+Math.min(...ys))/2+sh.y);M.fit=false}
function stays(){const H=window.__hub;return H&&H.INFO?H.INFO.rows.filter(r=>r.section==='stay'&&r.fields&&r.fields.lat!=null&&r.fields.lat!==''&&r.fields.lng!=null&&r.fields.lng!==''&&isFinite(r.fields.lat)&&isFinite(r.fields.lng)).map(r=>({id:r.id,name:r.title||'Your stay',area:r.fields.area||'',address:r.fields.address||'',lat:+r.fields.lat,lng:+r.fields.lng,_k:'stay'})):[]}
function unpStays(){const H=window.__hub;return H&&H.INFO?H.INFO.rows.filter(r=>r.section==='stay'&&!(r.fields&&r.fields.lat!=null&&r.fields.lat!==''&&r.fields.lng!=null&&r.fields.lng!==''&&isFinite(r.fields.lat))&&r.fields&&(r.fields.address||r.title)):[]}
function find(k){const L=D_();if(!L||!k)return null;const[kind,id]=k.split(':');if(kind==='stay')return stays().find(v=>v.id===id)||null;if(kind==='pt')return M.custom?Object.assign({},M.custom,{_k:'pt'}):null;const arr=kind==='plan'?L.plans:L.shortlist;const x=(arr||[]).find(v=>v.id===id);return x?Object.assign({},x,{_k:kind}):null}
function draw(){if(!host)return;const lay=host.querySelector('.q46tiles'),mk=host.querySelector('.q46marks'),sv=host.querySelector('.q46route');if(!lay||!mk)return;
 const{W,H}=size();const c=wp(M.lat,M.lng,M.z),ox=c.x-W/2,oy=c.y-H/2,n=Math.pow(2,M.z);const need={};
 for(let tx=Math.floor(ox/TS);tx<=Math.floor((ox+W)/TS);tx++)for(let ty=Math.floor(oy/TS);ty<=Math.floor((oy+H)/TS);ty++){if(ty<0||ty>=n)continue;
  const wx=((tx%n)+n)%n,k=M.z+'/'+wx+'/'+ty+'@'+tx;need[k]=1;let im=tiles[k];
  if(!im){im=document.createElement('img');im.className='q46t';im.alt='';im.draggable=false;im.decoding='async';im.onerror=()=>{im.style.visibility='hidden'};im.src='https://tile.openstreetmap.org/'+M.z+'/'+wx+'/'+ty+'.png';lay.appendChild(im);tiles[k]=im}
  im.style.transform='translate('+Math.round(tx*TS-ox)+'px,'+Math.round(ty*TS-oy)+'px)'}
 for(const k in tiles){if(!need[k]){tiles[k].remove();delete tiles[k]}}
 mk.querySelectorAll('[data-q46pin]').forEach(b=>{const o=wp(+b.dataset.lat,+b.dataset.lng,M.z);b.style.transform='translate('+Math.round(o.x-ox)+'px,'+Math.round(o.y-oy)+'px)'});
 if(sv){const pl=sv.dataset.pts?sv.dataset.pts.split(';').map(s=>s.split(',').map(Number)):[];
  sv.querySelector('polyline').setAttribute('points',pl.map(p=>{const o=wp(p[0],p[1],M.z);return Math.round(o.x-ox)+','+Math.round(o.y-oy)}).join(' '))}}
/* ---------- Google map (loaded only when the Map tab is open in Google mode) ---------- */
let gm=null,gdiv=null,gmk=[],gline=null,gload=null,gSel=null;
function loadG(){if(window.google&&google.maps&&google.maps.Map)return Promise.resolve();if(gload)return gload;
 gload=new Promise((res,rej)=>{window.__q46gm=()=>res();window.gm_authFailure=()=>gFail('Google Maps would not load here. Using the Quest map.');
  const s=document.createElement('script');s.src='https://maps.googleapis.com/maps/api/js?key='+GKEY+'&callback=__q46gm&v=weekly';s.async=true;s.onerror=()=>rej(new Error('load'));document.head.appendChild(s);setTimeout(()=>rej(new Error('timeout')),15000)});
 gload.catch(()=>{gload=null});return gload}
function gFail(msg){if(!M.g)return;M.g=false;gm=null;gdiv=null;gmk=[];gline=null;gload=null;try{toast(msg)}catch(e){}if(U.tab==='map'&&document.querySelector('.q46'))refresh()}
async function gsync(){const h=host;if(!M.g||!h)return;const hold=h.querySelector('.q46g');if(!hold)return;
 try{await loadG()}catch(e){gFail('Could not reach Google Maps. Using the Quest map.');return}
 if(host!==h||!M.g||!h.isConnected)return;
 const first=!gm;if(!gdiv){gdiv=document.createElement('div');gdiv.className='q46gin'}
 if(gdiv.parentNode!==hold)hold.appendChild(gdiv);
 if(!gm){try{gm=new google.maps.Map(gdiv,{center:{lat:M.lat||35.68,lng:M.lng||139.76},zoom:M.z||12,gestureHandling:'greedy',clickableIcons:false,fullscreenControl:false,streetViewControl:false,mapTypeControl:false})}catch(e){gFail('Could not start Google Maps. Using the Quest map.');return}}
 else google.maps.event.trigger(gm,'resize');
 gmk.forEach(m=>m.setMap(null));gmk=[];if(gline){gline.setMap(null);gline=null}
 const d=lastData||data(),route=M.rt||M.day!=='all',B=new google.maps.LatLngBounds(),path=[];let n=0;
 const add=(p,kind,num)=>{const k=(p._k||kind)+':'+p.id,sel=M.sel===k,plan=kind==='plan',pos={lat:+p.lat,lng:+p.lng};
  const m=new google.maps.Marker({map:gm,position:pos,title:p.name||'',zIndex:sel?999:plan?2:1,
   label:{text:plan?String(num||'•'):kind==='stay'?'H':'★',color:plan?'#F7F3E9':'#2F4F46',fontWeight:'700',fontSize:sel?'15px':'13px'},
   icon:{path:google.maps.SymbolPath.CIRCLE,scale:sel?18:14,fillColor:plan?'#2F4F46':kind==='stay'?'#A7B89F':'#F4D06F',fillOpacity:1,strokeColor:'#F7F3E9',strokeWeight:2}});
  m.addListener('click',()=>{M.sel=k;M.adding=false;M.fit=false;refresh()});gmk.push(m);B.extend(pos);n++};
 if(M.ideas)d.ideas.forEach(x=>add(x,'idea',0));
 (d.stays||[]).forEach(x=>add(x,'stay',0));
 d.plans.forEach((x,i)=>{add(x,'plan',route?i+1:0);path.push({lat:+x.lat,lng:+x.lng})});
 if(route&&path.length>1)gline=new google.maps.Polyline({map:gm,path,strokeColor:'#2F4F46',strokeOpacity:.85,strokeWeight:4,geodesic:false});
 const sp=M.sel&&find(M.sel);
 if(sp&&ok(sp)){if(gSel!==M.sel){gSel=M.sel;gm.setCenter({lat:+sp.lat,lng:+sp.lng});if(gm.getZoom()<14)gm.setZoom(15);const sh=selShift();gm.panBy(sh.x,sh.y)}}
 else{gSel=null;if((M.fit||first)&&n){if(n===1){gm.setCenter(B.getCenter());gm.setZoom(15)}else{gm.fitBounds(B,{top:70,left:40,right:40,bottom:50});google.maps.event.addListenerOnce(gm,'idle',()=>{if(gm.getZoom()>16)gm.setZoom(16)})}}}
 M.fit=false}
/* ---------- day planner: travel times + stops panel ---------- */
const TR={},PEND={};let TRS={};try{TRS=JSON.parse(localStorage.getItem('q46tr')||'{}')}catch(e){}
/* per-leg "I'd rather walk/take the train/drive this one" override — people know the route
   better than a distance formula does, so let them override the computed mode directly
   instead of only ever seeing what the algorithm picked. */
let LEGOV={};try{LEGOV=JSON.parse(localStorage.getItem('q46lego')||'{}')}catch(e){}
const saveLegOv=()=>{try{localStorage.setItem('q46lego',JSON.stringify(LEGOV))}catch(e){}};
const hav=(a,b)=>{const R=6371e3,t=x=>x*PI/180,dl=t(b.lat-a.lat),dg=t(b.lng-a.lng),h=Math.sin(dl/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
const lk=(a,b)=>(+a.lat).toFixed(5)+','+(+a.lng).toFixed(5)+'>'+(+b.lat).toFixed(5)+','+(+b.lng).toFixed(5);
const estLeg=(a,b)=>{const d=hav(a,b);return d<1200?{s:Math.round(d*1.3/1.25),m:d,est:1,k:'walk'}:{s:Math.round(d*1.4/7+300),m:d,est:1,k:'car'}};
const hourOf=p=>{const m=String(p.end||p.start||'').match(/^(\d{1,2}):/);return m?Math.min(23,+m[1]):10};
const stampOf=p=>{const m=String(p.start||'').match(/^(\d{1,2}):(\d{2})$/);return m?+m[1]*60+ +m[2]:9999};
function fmt(sec){const m=Math.max(1,Math.round(sec/60));return m<60?m+' min':Math.floor(m/60)+'h '+(m%60?(m%60)+'m':'')}
const korea=p=>p&&p.lat>=33&&p.lat<=39&&p.lng>=124&&p.lng<=132;
function curStops(){return M.rt?routeStops():dayStops()}
function dayStops(){const L=D_();if(!L||M.day==='all')return[];return(L.plans||[]).filter(p=>p.date===M.day).sort((a,b)=>stampOf(a)-stampOf(b))}
function legOf(a,b){const k=lk(a,b);
 const ov=LEGOV[k];
 if(ov){if(ov==='transit'&&TRS[k]&&TRS[k].k==='transit')return TRS[k];const d=hav(a,b);
  if(ov==='walk')return{s:Math.round(d*1.3/1.25),m:d,est:1,k:'walk',ov:1};
  if(ov==='car')return{s:Math.round(d*1.4/7+300),m:d,est:1,k:'car',ov:1};
  return{s:Math.round(d*1.4/7+300),m:d,est:1,k:'transit',ov:1}}
 if(TR[k]&&!(TR[k].retry&&Date.now()-TR[k].t>60000))return TR[k];if(TRS[k])return TRS[k];if(hav(a,b)<1200)return TR[k]=estLeg(a,b);return null}
async function callR(body){const c=(typeof A!=='undefined'&&A)?A.client:null;if(!c||!c.functions)return{error:'offline'};
 try{const r=await c.functions.invoke('quest-route',{body});if(r.error){const x=r.error.context;if(x&&x.json){try{return await x.json()}catch(e){}}return{error:'network'}}return r.data||{}}catch(e){return{error:'network'}}}
async function loadLegs(){const pin=curStops().filter(ok);const need=[];
 for(let i=0;i<pin.length-1;i++){const a=pin[i],b=pin[i+1],k=lk(a,b);if(legOf(a,b)||PEND[k])continue;need.push({k,a,b})}
 if(!need.length)return;need.forEach(n=>PEND[n.k]=1);upd();
 const r=await callR({legs:need.slice(0,12).map(n=>({a:[+n.a.lat,+n.a.lng],b:[+n.b.lat,+n.b.lng],h:hourOf(n.a)}))});
 need.forEach((n,i)=>{delete PEND[n.k];const x=i<12&&r&&r.legs&&r.legs[i];
  if(x&&x.s!=null){TR[n.k]=TRS[n.k]={s:x.s,m:x.m,k:'transit'}}
  else TR[n.k]=Object.assign(estLeg(n.a,n.b),{retry:1,t:Date.now()})});
 try{const ks=Object.keys(TRS);if(ks.length>300)ks.slice(0,ks.length-300).forEach(k=>delete TRS[k]);localStorage.setItem('q46tr',JSON.stringify(TRS))}catch(e){}
 upd()}
function upd(){const el=document.querySelector('.q47');if(el)el.innerHTML=panelInner()}
const dlong=d=>{try{return new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',day:'numeric',month:'short'})}catch(e){return d}};
const LEGMODES=[['walk','🚶','Walk'],['transit','🚆','Train or bus'],['car','🚕','Car']];
function legHtml(a,b){const t=legOf(a,b),k=lk(a,b);
 const mode=t&&t.k==='walk'?'walking':'transit';
 const href='https://www.google.com/maps/dir/?api=1&origin='+a.lat+','+a.lng+'&destination='+b.lat+','+b.lng+'&travelmode='+mode;
 let txt;if(!t)txt='<span class="q47dim">'+(PEND[k]?'Working out travel time…':'Travel time')+'</span>';
 else txt=(t.k==='walk'?'🚶':t.k==='car'?'🚕':'🚆')+' '+(t.est?'about ':'')+fmt(t.s)+(t.k==='transit'?' · train or bus':t.k==='walk'?' walk':' by car');
 let h=`<div class="q47leg"><button type="button" class="q47legtxt" data-q46="legmode" data-k="${esc(k)}">${txt}<i>▾</i></button><a href="${esc(href)}" target="_blank" rel="noopener">Directions ↗</a></div>`;
 if(M.legSel===k)h+=`<div class="q47legopts">`+LEGMODES.map(([m,ic,lab])=>`<button type="button" class="q47legopt${t&&t.k===m?' on':''}" data-q46="legset" data-k="${esc(k)}" data-m="${m}">${ic} ${lab}</button>`).join('')+`</div>`;
 return h}
function startSet(k){M.st=null;M.pf=null;
 if(M.rt)M.picks=M.picks.filter(x=>x!==M.startKey&&x!==k);else{M.picks=dayStops().filter(ok).map(p=>'plan:'+p.id)}
 M.picks.unshift(k);M.startKey=k;M.rt=true;M.fall={};M.menu=null;M.more=false;M.sel=null;M.swap=null;M.save=false;M.fit=true;U.tab='map';render();pickBar();try{toast('Starting from '+((find(k)||{}).name||'there'))}catch(e){}}
async function stSearch(){const f=M.st;if(!f)return;const el=document.getElementById('q47s');if(el)f.q=el.value;const q=String(f.q||'').trim();if(q.length<2)return;
 f.busy=true;f.err='';upd();const r=await callP(Object.assign({action:'text',query:q.slice(0,160)},pfCtx()));if(M.st!==f)return;f.busy=false;
 if(r.error){f.res=[];f.err=r.error==='limit'?'Map search is resting for now. Try again later.':'Map search isn’t available right now.'}else f.res=(r.places||[]).filter(x=>x.lat!=null&&x.lng!=null).slice(0,5);upd()}
function stHtml(){const f=M.st;if(!f)return'';const L=D_();const sy=stays(),un=unpStays();
 const ids=(L&&L.shortlist||[]).filter(x=>!x.done&&ok(x)).slice(0,6);
 let h=`<div class="q47f"><div class="q47ct">Start from…</div>`;
 if(sy.length||un.length){h+=`<div class="q47s">Where you’re staying</div>`+sy.map(x=>`<button type="button" class="q47cr" data-q46="stset" data-k="stay:${esc(x.id)}"><b>${esc(x.name)}</b><small>${esc(x.address||x.area||'')}</small></button>`).join('')+un.map(r=>`<button type="button" class="q47cr" data-q46="staypin" data-id="${esc(r.id)}"><b>${esc(r.title||'Your stay')}</b><small>Not on the map yet. Tap to add it first.</small></button>`).join('')}
 if(ids.length)h+=`<div class="q47s" style="margin-top:8px">From your Ideas</div>`+ids.map(x=>`<button type="button" class="q47cr" data-q46="stset" data-k="idea:${esc(x.id)}"><b>${esc(x.name)}</b><small>${esc(x.area||'')}</small></button>`).join('');
 h+=`<div class="q47s" style="margin-top:8px">Or type a place</div><div class="q47frow"><input id="q47s" type="text" value="${esc(f.q)}" autocomplete="off" placeholder="Hotel, station, address" aria-label="Search for a starting point"><button type="button" class="q46b go" data-q46="stgo">${f.busy?'Searching…':'Search'}</button></div>`;
 if(f.err)h+=`<div class="q47s">${esc(f.err)}</div>`;
 if(f.res)h+=f.res.length?f.res.map((x,i)=>`<button type="button" class="q47cr" data-q46="stpick" data-i="${i}"><b>${esc(x.name)}</b><small>${esc(x.address||'')}</small></button>`).join(''):'<div class="q47s">Nothing found. Try a clearer name.</div>';
 return h+`<button type="button" class="q46b alt" data-q46="stx" style="margin-top:8px">Cancel</button></div>`}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='q47s'&&M.st)M.st.q=e.target.value},true);
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='q47s'&&e.key==='Enter'){e.preventDefault();stSearch()}},true);
function panelInner(){return pfHtml()+stHtml()+panelBody()}
function panelBody(){const L=D_();if(!L)return'';if(M.rt)return routePanel();const dl=days();
 if(M.day==='all'){const by={};(L.plans||[]).forEach(p=>{if(p.date)by[p.date]=(by[p.date]||0)+1});
  return`<div class="q47h"><div class="q47t">Plan a day</div><div class="q47s">Pick a day to see its stops, the route and travel times.</div></div>`+
   dl.filter(x=>by[x]).map(x=>`<button type="button" class="q47day" data-q46="day" data-v="${x}"><b>${esc(dlong(x))}</b><span>${by[x]} stop${by[x]>1?'s':''}</span></button>`).join('')+idealess()}
 const all=dayStops(),pin=all.filter(ok);let tot=0,est=0,miss=0;
 for(let i=0;i<pin.length-1;i++){const t=legOf(pin[i],pin[i+1]);if(!t)miss++;else{tot+=t.s;if(t.est)est=1}}
 const sub=!all.length?'Nothing scheduled yet. Add stops in the itinerary or from Ideas.':pin.length<2?'Pin at least two stops to see travel times.':miss?'Working out travel times…':'About '+fmt(tot)+' getting around'+(est?' (some are rough estimates)':'');
 let h=`<div class="q47h"><div class="q47t">${esc(dlong(M.day))} · ${all.length} stop${all.length===1?'':'s'}</div><div class="q47s">${esc(sub)}</div></div>`;
 if(pin.length>=2){const o=pin[0],d=pin[pin.length-1],w=pin.slice(1,-1).slice(0,9).map(p=>p.lat+','+p.lng).join('|');
  const u='https://www.google.com/maps/dir/?api=1&origin='+o.lat+','+o.lng+'&destination='+d.lat+','+d.lng+(w?'&waypoints='+encodeURIComponent(w):'');
  h+=`<div class="q47act">${pin.length>2?'<button type="button" class="q46b" data-q46="rtauto">Best order</button>':''}<a class="q46b go" href="${esc(u)}" target="_blank" rel="noopener">Open day in Google Maps</a></div>`}
 h+=`<div class="q47act"><button type="button" class="q46b alt" data-q46="stopen">📍 Start here</button></div>`;
 h+=stopsHtml(all,false)+nearHtml(all,false)+foodHtml()+idealess();return h}
let dayInit=0;function initDay(){if(dayInit)return;dayInit=1;const L=D_();if(!L)return;
 const ds=[...new Set((L.plans||[]).filter(p=>p.date&&ok(p)).map(p=>p.date))].sort();if(!ds.length){const dd=days();if(dd.length)M.day=dd[0];return}
 const t=new Date().toISOString().slice(0,10);M.day=ds.find(x=>x>=t)||ds[ds.length-1]}
/* ---------- edit a day from the map ---------- */
const snapNow=()=>({plans:JSON.parse(JSON.stringify(D_().plans)),short:JSON.parse(JSON.stringify(D_().shortlist||[]))});
const undoer=sn=>()=>{mut(()=>{D_().plans=sn.plans;D_().shortlist=sn.short})};
function applyDayOrder(ids,msg){const L=D_(),all=dayStops();const slots=all.map(p=>({start:p.start,end:p.end})),sn=snapNow();
 mut(()=>{const idx=all.map(p=>L.plans.indexOf(p)).sort((a,b)=>a-b);const objs=ids.map(id=>L.plans.find(x=>x.id===id));
  objs.forEach((p,i)=>{p.start=slots[i].start;p.end=slots[i].end});idx.forEach((ix,k)=>{L.plans[ix]=objs[k]})});
 try{toastUndo(msg||'Order changed',undoer(sn))}catch(e){}}
function autoDay(){const all=dayStops(),pin=all.filter(ok),rest=all.filter(p=>!ok(p));if(pin.length<3)return;const it=pin.slice(),out=[it.shift()];
 while(it.length){const l=out[out.length-1];let bi=0,bd=1e18;it.forEach((x,i)=>{const d=hav(l,x);if(d<bd){bd=d;bi=i}});out.push(it.splice(bi,1)[0])}
 M.fit=false;applyDayOrder(out.concat(rest).map(p=>p.id),'Best order applied. Times stay in order.')}
function delPlan(p){const sn=snapNow();M.sel=null;M.swap=null;mut(()=>{D_().plans=D_().plans.filter(x=>x.id!==p.id)});try{toastUndo('Removed '+(p.name||'stop')+' from the day',undoer(sn))}catch(e){}}
function swapPlanIdea(p,x){const L=D_(),sn=snapNow();
 mut(()=>{const old={id:uuid(),name:p.name,area:p.area||'',category:'Other',place:p.place||'',link:p.link||'',notes:p.notes||'',done:false,favorite:false,interest:[],place_id:p.place_id||null,lat:ok(p)?p.lat:null,lng:ok(p)?p.lng:null,address:p.address||null,maps_url:p.maps_url||null};
  p.name=x.name;p.area=x.area||'';p.place=x.place||x.address||'';p.link=x.link||'';p.notes=x.notes||'';p.place_id=x.place_id||null;p.lat=x.lat;p.lng=x.lng;p.address=x.address||null;p.maps_url=x.maps_url||null;
  L.shortlist=(L.shortlist||[]).filter(i=>i.id!==x.id);L.shortlist.unshift(old)});
 try{toastUndo('Swapped in '+x.name,undoer(sn))}catch(e){}}
function addIdeaToDay(x){const sn=snapNow();mut(()=>D_().plans.push({id:uuid(),date:M.day,who:[],name:x.name,start:'',end:'',area:x.area||'',place:x.place||x.address||'',link:x.link||'',notes:'',tent:false,note:false,place_id:x.place_id||null,lat:x.lat,lng:x.lng,address:x.address||null,maps_url:x.maps_url||null}));
 try{toastUndo('Added '+x.name,undoer(sn))}catch(e){}}
/* ---------- link a place from the map page ---------- */
async function callP(body){const c=(typeof A!=='undefined'&&A)?A.client:null;if(!c||!c.functions)return{error:'offline'};
 try{const r=await c.functions.invoke('quest-places',{body});if(r.error){const x=r.error.context;if(x&&x.json){try{return await x.json()}catch(e){}}return{error:'network'}}return r.data||{}}catch(e){return{error:'network'}}}
function pfCtx(){const L=D_(),o={};const pts=((L&&L.plans)||[]).filter(ok);if(pts.length)o.near={lat:pts.reduce((a,x)=>a+ +x.lat,0)/pts.length,lng:pts.reduce((a,x)=>a+ +x.lng,0)/pts.length};
 if(L&&L.trip&&L.trip.city)o.city=String(L.trip.city).slice(0,80);return o}
async function pfSearch(){const f=M.pf;if(!f)return;const el=document.getElementById('q47q');if(el)f.q=el.value;const q=String(f.q||'').trim();if(q.length<2)return;
 f.busy=true;f.err='';upd();
 const r=await callP(Object.assign({action:'text',query:q.slice(0,160)},pfCtx()));if(M.pf!==f)return;f.busy=false;
 if(r.error){f.res=[];f.err=r.error==='limit'?'Map search is resting for now. Try again later.':'Map search isn’t available right now.'}else f.res=(r.places||[]).filter(x=>x.lat!=null&&x.lng!=null);upd()}
function pfConfirm(f){const x=f.res&&f.res[f.pend];if(!x)return'';const q=x.placeId?'place_id:'+x.placeId:(x.lat+','+x.lng);
 const u=x.mapsUrl&&/^https:\/\//.test(x.mapsUrl)?x.mapsUrl:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(x.lat+','+x.lng);
 return`<div class="q47f"><div class="q47ct">Is this the right place?</div><iframe class="q46em" title="Google Maps place" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen src="https://www.google.com/maps/embed/v1/place?key=${GKEY}&q=${encodeURIComponent(q)}&zoom=16"></iframe><div class="q46n">${esc(x.name)}</div><div class="q47s">${esc(x.address||'')}</div><div class="q47act"><button type="button" class="q46b go" data-q46="pfok">Yes, pin this</button><button type="button" class="q46b alt" data-q46="pfno">Not this one</button><a class="q46b" href="${esc(u)}" target="_blank" rel="noopener">Open in Maps</a></div></div>`}
function pfLink(i){const f=M.pf;const x=f&&f.res&&f.res[i];if(!x)return;const[kind,id]=f.k.split(':');M.pf=null;M.fit=true;
 mut(()=>{const tgt=((kind==='plan'?D_().plans:D_().shortlist)||[]).find(v=>v.id===id);if(!tgt)return;tgt.place_id=x.placeId;tgt.lat=x.lat;tgt.lng=x.lng;tgt.address=x.address||null;tgt.maps_url=x.mapsUrl||null});
 try{toast('Pinned “'+x.name+'”')}catch(e){}}
function pfHtml(){const f=M.pf;if(!f)return'';const it=find(f.k);if(!it)return'';if(f.pend!=null)return pfConfirm(f);
 return`<div class="q47f"><div class="q47ct">Find “${esc(it.name)}” on the map</div><div class="q47frow"><input id="q47q" type="text" value="${esc(f.q)}" autocomplete="off" aria-label="Search Google Maps"><button type="button" class="q46b go" data-q46="pfgo">${f.busy?'Searching…':'Search'}</button></div>`+
  (f.err?`<div class="q47s">${esc(f.err)}</div>`:'')+(f.res?(f.res.length?f.res.map((x,i)=>`<button type="button" class="q47cr" data-q46="pflink" data-i="${i}"><b>${esc(x.name)}</b><small>${esc(x.address||'')}</small></button>`).join(''):'<div class="q47s">Nothing found. Try a clearer name.</div>'):'')+
  `<button type="button" class="q46b alt" data-q46="pfx">Cancel</button></div>`}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='q47q'&&M.pf)M.pf.q=e.target.value},true);
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='q47q'&&e.key==='Enter'){e.preventDefault();pfSearch()}},true);
/* ---------- top-rated food near the day ---------- */
const PR={PRICE_LEVEL_INEXPENSIVE:'$',PRICE_LEVEL_MODERATE:'$$',PRICE_LEVEL_EXPENSIVE:'$$$',PRICE_LEVEL_VERY_EXPENSIVE:'$$$$'};
const FC=[['food','Food'],['cafes','Cafés'],['sights','Sights'],['nightlife','Nightlife'],['shopping','Shopping']],FCAT={food:'Food',cafes:'Cafes',sights:'Sights',nightlife:'Nightlife',shopping:'Shopping'};
const nfmt=n=>n>=1000?(n/1000).toFixed(1).replace(/\.0$/,'')+'k':String(n);
function foodHtml(){const f=M.fall[M.fcat],pin=curStops().filter(ok);if(!pin.length)return'';const lab=(FC.find(c=>c[0]===M.fcat)||FC[0])[1];
 let h=`<div class="q47near q47food"><div class="q47nt">Top-rated nearby</div><div class="q46chips" style="padding:4px 0 8px">${FC.map(c=>`<button type="button" class="q46c${M.fcat===c[0]?' on':''}" data-q46="fcat" data-v="${c[0]}">${c[1]}</button>`).join('')}</div>`;
 if(!f)return h+`<div class="q47s">Well-reviewed places near these stops.</div><button type="button" class="q46b go" data-q46="food" style="margin-top:8px">Find top-rated ${esc(lab.toLowerCase())}</button></div>`;
 if(f.busy)return h+`<div class="q47s">Looking for good food…</div></div>`;
 if(f.err)return h+`<div class="q47s">${esc(f.err)}</div><button type="button" class="q46b" data-q46="food" style="margin-top:8px">Try again</button></div>`;
 if(!f.res.length)return h+`<div class="q47s">Nothing well-reviewed found around here.</div></div>`;
 h+=`<div class="q47s">Google ratings, best first. Only places with 100+ reviews.</div>`;
 f.res.forEach((x,i)=>{let best=null,bd=1e18;pin.forEach(p=>{const d=hav(p,x);if(d<bd){bd=d;best=p}});
  const meta=['★ '+x.rating.toFixed(1)+' ('+nfmt(x.reviews)+')',PR[x.price]||'',x.kind||'',best?km(bd)+' from '+best.name:''].filter(Boolean).join(' · ');
  h+=`<div class="q47nr"><div class="q47m"><b>${x.mapsUrl&&/^https:\/\//.test(x.mapsUrl)?`<a href="${esc(x.mapsUrl)}" target="_blank" rel="noopener" style="color:inherit">${esc(x.name)}</a>`:esc(x.name)}</b><small>${esc(meta)}</small></div><button type="button" class="q47add2" data-q46="fadd" data-i="${i}">Add</button><button type="button" class="q47add2" data-q46="fsave" data-i="${i}" style="border-style:dashed">Save</button></div>`});
 return h+'</div>'}
async function foodGo(){const pin=curStops().filter(ok);if(!pin.length)return;
 const la=pin.reduce((a,x)=>a+ +x.lat,0)/pin.length,ln=pin.reduce((a,x)=>a+ +x.lng,0)/pin.length;
 const cat=M.fcat,f=M.fall[cat]={busy:true,res:null,err:''};upd();
 const r=await callP({action:'food',cat,lat:+la.toFixed(5),lng:+ln.toFixed(5)});if(M.fall[cat]!==f)return;f.busy=false;
 if(r.error)f.err=r.error==='limit'?'Food search is resting for now. Try again later.':'Food search isn’t available right now.';else f.res=r.places||[];upd()}
function foodIdea(x){return{id:uuid(),name:x.name,area:'',category:FCAT[M.fcat]||'Food',place:x.address||'',link:'',notes:'★ '+x.rating.toFixed(1)+' on Google ('+x.reviews+' reviews)',done:false,favorite:false,interest:[],place_id:x.placeId||null,lat:x.lat,lng:x.lng,address:x.address||null,maps_url:x.mapsUrl||null}}
/* ---------- pick-and-route ---------- */
function routeStops(){return M.picks.map(find).filter(x=>x&&ok(x))}
function autoOrder(){const it=M.picks.map(k=>({k,p:find(k)})).filter(x=>x.p&&ok(x.p));if(it.length<3)return;const out=[it.shift()];
 while(it.length){const l=out[out.length-1].p;let bi=0,bd=1e18;it.forEach((x,i)=>{const d=hav(l,x.p);if(d<bd){bd=d;bi=i}});out.push(it.splice(bi,1)[0])}M.picks=out.map(x=>x.k)}
function cands(){const L=D_();let rs,excl;
 if(M.rt){rs=routeStops();const inR=new Set(M.picks);excl=x=>inR.has('idea:'+x.id)}
 else{rs=dayStops();const have=new Set((L.plans||[]).map(p=>p.place_id).filter(Boolean));excl=x=>x.place_id&&have.has(x.place_id)}
 let base=null;
 if(M.swap!=null&&M.swap>=0&&rs[M.swap]){const before=rs.slice(0,M.swap).filter(ok).pop(),after=rs.slice(M.swap+1).find(ok);const ps=[before,after].filter(Boolean);
  base=ps.length?{lat:ps.reduce((s,x)=>s+ +x.lat,0)/ps.length,lng:ps.reduce((s,x)=>s+ +x.lng,0)/ps.length,name:ps.map(x=>x.name).join(' & ')}:(ok(rs[M.swap])?rs[M.swap]:null)}
 else{const pn=rs.filter(ok);if(pn.length)base=pn[pn.length-1]}
 const list=(L.shortlist||[]).filter(x=>!x.done&&ok(x)&&!excl(x)).map(x=>({x,d:base?hav(base,x):0})).sort((a,b)=>a.d-b.d).slice(0,6);return{base,list}}
function stopsHtml(list,isRoute){let h='',n=0;
 list.forEach((p,i)=>{const pn=ok(p);if(pn)n++;const key=(p._k||'plan')+':'+p.id,sel=M.sel===key;
  const tm=isRoute?[key===M.startKey?'Start':'',p.area,p._k==='plan'?'in itinerary':p._k==='stay'?'where you’re staying':''].filter(Boolean).join(' · '):[p.start&&p.end?p.start+'–'+p.end:p.start,p.area].filter(Boolean).join(' · ');
  const act=pn?` data-q46="row" data-k="${esc(key)}"`:'';
  h+=`<div class="q47r${pn?'':' np'}${sel?' sel':''}" data-ri="${i}"><span class="q47h2" data-q47drag="${i}" title="Drag to reorder" aria-label="Drag to reorder">≡</span><span class="q47n"${act}>${pn?n:'·'}</span><div class="q47m"${act}><b>${esc(p.name||'Untitled')}</b><small>${esc(tm||'')}${pn?'':(tm?' · ':'')+'no place pinned yet'}</small></div>${pn?'':`<button type="button" class="q47pinb" data-q46="pf" data-k="${esc(key)}">Find on map</button>`}<button type="button" class="q47i" data-q46="menu" data-i="${i}" aria-label="More">⋯</button></div>`;
  if(M.menu===i){h+=`<div class="q47menu"><button type="button" data-q46="rtswap" data-i="${i}">⇄ Swap with another idea</button><button type="button" data-q46="rtrm" data-i="${i}">✕ Remove from ${isRoute?'route':'this day'}</button></div>`;if(M.swap===i)h+=candHtml(list)}
  if(pn){const nx=list.slice(i+1).find(ok);if(nx)h+=legHtml(p,nx)}});
 return h}
function nearHtml(list,isRoute){const L=D_();if(!L)return'';const pin=list.filter(ok);const inR=new Set(M.picks);
 const here=new Set(isRoute?[]:(L.plans||[]).filter(p=>p.date===M.day).map(p=>p.place_id).filter(Boolean));
 const dl=days();
 let items=(L.shortlist||[]).filter(x=>!x.done&&ok(x)&&!(isRoute?inR.has('idea:'+x.id):(x.place_id&&here.has(x.place_id))));
 items=items.map(x=>{let best=null,bd=1e18;pin.forEach(p=>{const d=hav(p,x);if(d<bd){bd=d;best=p}});return{x,d:best?bd:null,best}}).sort((a,b)=>(a.d==null?1e18:a.d)-(b.d==null?1e18:b.d));
 if(!items.length)return'';const shown=M.more?items.slice(0,15):items.slice(0,5);
 let h=`<div class="q47near"><div class="q47nt">${isRoute?'Also near your route':'Also near this day'}</div><div class="q47s">Saved places${isRoute?' not in this route':' that are not on this day'}${pin.length?', nearest first':''}.</div>`;
 shown.forEach(o=>{const on=(L.plans||[]).find(p=>p.place_id&&p.place_id===o.x.place_id&&p.date!==M.day);const di=on?dl.indexOf(on.date):-1;
  const sub=[o.x.area,o.best?km(o.d)+' from '+o.best.name:'',di>=0?'scheduled on Day '+(di+1):''].filter(Boolean).join(' · ');
  h+=`<div class="q47nr"><div class="q47m" data-q46="row" data-k="idea:${esc(o.x.id)}"><b>${esc(o.x.name)}</b><small>${esc(sub)}</small></div><button type="button" class="q47add2" data-q46="nadd" data-id="${esc(o.x.id)}">Add</button></div>`});
 if(items.length>5)h+=`<button type="button" class="q47more" data-q46="more">${M.more?'Show fewer':'Show '+(Math.min(items.length,15)-5)+' more'}</button>`;
 return h+'</div>'}
function tabsHtml(){const dl=days(),L=D_(),cnt={};((L&&L.plans)||[]).forEach(p=>{if(p.date)cnt[p.date]=(cnt[p.date]||0)+1});
 return`<div class="q47tabs">`+dl.map((x,i)=>`<button type="button" class="q47tab${!M.rt&&M.day===x?' on':''}" data-q46="day" data-v="${x}"><b>Day ${i+1}</b><small>${esc(dlab(x))} · ${cnt[x]||0}</small></button>`).join('')+
  ((M.picks.length||M.rt)?`<button type="button" class="q47tab rt${M.rt?' on':''}" data-q46="rtopen"><b>Route</b><small>${M.picks.length} stop${M.picks.length===1?'':'s'}</small></button>`:'')+`</div>`}
function candHtml(rs){if(M.swap==null)return'';const c=cands();const ttl=M.swap>=0&&rs[M.swap]?`Swap “${esc(rs[M.swap].name)}” with…`:'Add a stop';
 return`<div class="q47c"><div class="q47ct">${ttl}${c.base?` · closest to ${esc(c.base.name||'your stops')}`:''}</div>`+
  (c.list.length?c.list.map(o=>`<button type="button" class="q47cr" data-q46="rtchoose" data-id="${esc(o.x.id)}"><b>${esc(o.x.name)}</b><small>${esc(o.x.area||'')}${c.base?(o.x.area?' · ':'')+km(o.d)+' away':''}</small></button>`).join(''):`<div class="q47s">No other pinned ideas yet. Use Find on map below to pin more.</div>`)+`</div>`}
function idealess(){const L=D_();if(!L)return'';const un=(L.shortlist||[]).filter(x=>!x.done&&!ok(x));if(!un.length)return'';
 return`<div class="q47c"><div class="q47ct">Ideas not on the map yet</div>`+un.slice(0,5).map(x=>`<div class="q47cr q47un"><b>${esc(x.name)}</b><button type="button" class="q46b" data-q46="pf" data-k="idea:${esc(x.id)}">Find on map</button></div>`).join('')+(un.length>5?`<div class="q47s">+${un.length-5} more in Ideas</div>`:'')+`</div>`}
const km=d=>d<950?Math.max(50,Math.round(d/50)*50)+' m':(d/1000).toFixed(1)+' km';
function routePanel(){const rs=routeStops();const dl=days();let tot=0,est=0,miss=0;
 for(let i=0;i<rs.length-1;i++){const t=legOf(rs[i],rs[i+1]);if(!t)miss++;else{tot+=t.s;if(t.est)est=1}}
 const sub=rs.length<2?'Add at least two stops to see travel times.':miss?'Working out travel times…':'About '+fmt(tot)+' getting around'+(est?' (some are rough estimates)':'');
 let h=`<div class="q47h"><div class="q47t">Your route · ${rs.length} stop${rs.length===1?'':'s'}</div><div class="q47s">${esc(sub)}</div></div><div class="q47act">`+
  (rs.length>2?`<button type="button" class="q46b" data-q46="rtauto">Best order</button>`:'')+
  `<button type="button" class="q46b go" data-q46="rtsave">${M.save?'Pick a day below':'Save to a day'}</button><button type="button" class="q46b alt" data-q46="rtclear">Clear</button></div>`;
 if(M.save)h+=`<div class="q46days q47days">`+dl.map(x=>`<button type="button" class="q46c" data-q46="rtday" data-v="${x}">${esc(dlab(x))}</button>`).join('')+`</div>`;

 h+=`<div class="q47act"><button type="button" class="q46b alt" data-q46="stopen">📍 ${M.startKey&&M.picks.includes(M.startKey)?'Change start':'Start here'}</button></div>`;
 h+=stopsHtml(rs,true)+nearHtml(rs,true)+foodHtml()+idealess();
 return h}
function pickBar(){let bar=document.querySelector('.q47bar');const on=M.picks.length>0&&(U.tab==='shortlist'||(U.tab==='map'&&!M.rt));
 if(!on){if(bar)bar.remove();return}
 const html=`<span>${M.picks.length} for your route</span><button type="button" class="q46b go" data-q46="rtopen">Plan my route</button><button type="button" class="q47x" data-q46="rtclear" aria-label="Clear picks">✕</button>`;
 if(!bar){bar=document.createElement('div');bar.className='q47bar';document.body.appendChild(bar)}bar.innerHTML=html}
function injectPicks(){if(U.tab!=='shortlist')return;const L=D_();if(!L)return;
 document.querySelectorAll('.sl-row').forEach(r=>{const el=r.querySelector('[data-id]');if(!el)return;const id=el.dataset.id;const it=(L.shortlist||[]).find(x=>x.id===id);if(!it||!ok(it))return;
  const t=r.querySelector('.sl-tags');if(!t||t.querySelector('.q47pick'))return;const on=M.picks.includes('idea:'+id);
  const b=document.createElement('button');b.type='button';b.className='q47pick'+(on?' on':'');b.dataset.q46='pickidea';b.dataset.id=id;b.textContent=on?'✓ In route':'＋ Route';t.appendChild(b)})}
function togglePick(k){const i=M.picks.indexOf(k);if(i>=0)M.picks.splice(i,1);else M.picks.push(k)}
let dgr=null;
document.addEventListener('pointerdown',e=>{const hd=e.target.closest&&e.target.closest('[data-q47drag]');if(!hd)return;const row=hd.closest('.q47r');if(!row)return;e.preventDefault();dgr={i:+hd.dataset.q47drag,row,y0:e.clientY};row.classList.add('drag');try{hd.setPointerCapture(e.pointerId)}catch(x){}},true);
document.addEventListener('pointermove',e=>{if(!dgr)return;dgr.row.style.transform='translateY('+(e.clientY-dgr.y0)+'px)'},true);
const dgEnd=e=>{if(!dgr)return;const from=dgr.i;let to=from;document.querySelectorAll('.q47r[data-ri]').forEach(r=>{const b=r.getBoundingClientRect(),n=+r.dataset.ri;if(n!==from&&e.clientY>b.top&&e.clientY<b.bottom)to=n});dgr=null;
 if(to!==from&&e.type==='pointerup'){if(M.rt){const a=M.picks.splice(from,1)[0];M.picks.splice(to,0,a);M.fit=false;refresh()}else{const ids=dayStops().map(p=>p.id);const a=ids.splice(from,1)[0];ids.splice(to,0,a);M.fit=false;applyDayOrder(ids,'Order changed. Times stay in order.')}}else upd()};
document.addEventListener('pointerup',dgEnd,true);document.addEventListener('pointercancel',dgEnd,true);
/* ---------- view ---------- */
function pinHtml(p,kind,num,sel){const k=(p._k||kind)+':'+p.id;
 return`<button type="button" class="q46pin ${kind==='plan'?'plan':kind==='stay'?'stay':'idea'}${sel?' sel':''}" data-q46pin="${esc(k)}" data-lat="${p.lat}" data-lng="${p.lng}" aria-label="${esc(p.name)}"><i>${kind==='plan'?(num||''):kind==='stay'?'⌂':'★'}</i></button>`}
function view(){initDay();const L=D_();const d=data();lastData=d;const dl=days();
 const chips=`<div class="q46chips"><button type="button" class="q46c${M.day==='all'?' on':''}" data-q46="day" data-v="all">All</button>`+dl.map(x=>`<button type="button" class="q46c${M.day===x?' on':''}" data-q46="day" data-v="${x}">${esc(dlab(x))}</button>`).join('')+`<button type="button" class="q46c q46i${M.ideas?' on':''}" data-q46="ideas">★ Ideas</button></div>`;
 const total=d.plans.length+(d.stays||[]).length+(M.ideas?d.ideas.length:0);
 const chips2=M.rt?`<div class="q46chips"><button type="button" class="q46c on">Your route</button><button type="button" class="q46c" data-q46="rtback">← Back to days</button><button type="button" class="q46c q46i${M.ideas?' on':''}" data-q46="ideas">★ Ideas</button></div>`:chips;
 let note='';if(d.unpinnedDay)note+=`${d.unpinnedDay} plan${d.unpinnedDay>1?'s':''} ${M.day==='all'?'':'this day '}not pinned yet. `;if(M.ideas&&d.unpinnedIdeas)note+=`${d.unpinnedIdeas} idea${d.unpinnedIdeas>1?'s':''} not pinned yet. `;
 if(note)note=`<div class="q46note">${note}Use <b>Find on map</b> to pin ${(d.unpinnedDay+d.unpinnedIdeas)>1?'them':'it'}.</div>`;
 {const us=unpStays();if(us.length)note+=`<div class="q46note">${us.length>1?'Your stays aren’t':'Your stay isn’t'} on the map yet. <button type="button" class="q46b" data-q46="staypin" data-id="${esc(us[0].id)}">📍 Add ${esc(us[0].title||'it')}</button></div>`}
 if(!total&&!M.rt)return`<section class="q46">${tabsHtml()}<div class="q46wrap"><div class="q46col"><div class="q46empty"><div class="q46e1">Nothing pinned yet</div><p>Add a place with <b>Find on map</b> in Ideas or in the itinerary box and it shows up here.</p></div>${note}</div><aside class="q47">${panelInner()}</aside></div></section>`;
 let marks='',pts=[];const route=M.rt||M.day!=='all';
 if(M.ideas)d.ideas.forEach(x=>{marks+=pinHtml(x,'idea',0,M.sel==='idea:'+x.id)});
 (d.stays||[]).forEach(x=>{marks+=pinHtml(x,'stay',0,M.sel==='stay:'+x.id)});
 d.plans.forEach((x,i)=>{marks+=pinHtml(x,'plan',route?i+1:0,M.sel===(x._k||'plan')+':'+x.id);if(route)pts.push(x.lat+','+x.lng)});
 return`<section class="q46">${tabsHtml()}<div class="q46wrap"><div class="q46col"><div class="q46map${M.sel&&find(M.sel)?' sel':''}" id="q46map">${M.g?'<div class="q46g"></div>':`<div class="q46tiles"></div><svg class="q46route" data-pts="${pts.length>1?pts.join(';'):''}"><polyline points="" fill="none"/></svg><div class="q46marks">${marks}</div>`}<div class="q46sw" role="group" aria-label="Map type"><button type="button" class="${M.g?'':'on'}" data-q46="gset" data-v="0">Quest map</button><button type="button" class="${M.g?'on':''}" data-q46="gset" data-v="1">Google</button></div><button type="button" class="q46ideas${M.ideas?' on':''}" data-q46="ideas">★ Ideas${M.ideas?'':' off'}</button>${M.g?'<div class="q46zoom"><button type="button" data-q46="fit" aria-label="Show all pins">◎</button></div>':'<div class="q46zoom"><button type="button" data-q46="zin" aria-label="Zoom in">+</button><button type="button" data-q46="zout" aria-label="Zoom out">−</button><button type="button" data-q46="fit" aria-label="Show all pins">◎</button></div><a class="q46attr" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>'}</div>${note}</div><aside class="q47">${panelInner()}</aside>${card()}</div></section>`}
function card(){const p=M.sel&&find(M.sel);if(!p||!ok(p))return'';const plan=p._k==='plan',stay=p._k==='stay'||p._k==='pt';const sub=[plan?(p.start?p.start:''):'',p.area,p.place||p.address].filter(Boolean).join(' · ');
 let h=`<div class="q46card"><button type="button" class="q46x" data-q46="close" aria-label="Close">×</button><div class="q46n">${esc(p.name)}</div>${sub?`<div class="q46s">${esc(sub)}</div>`:''}<div class="q46a">`;
 if(plan)h+=`<button type="button" class="q46b" data-q46="goplan">View in itinerary</button>`;
 else if(!stay)h+=`<button type="button" class="q46b" data-q46="addto">${M.adding?'Pick a day':'Add to itinerary'}</button><button type="button" class="q46b alt" data-q46="goidea">View in Ideas</button>`;
 else if(false){}
 if(korea(p))h+=`<a class="q46b" href="https://map.naver.com/p/search/${encodeURIComponent(p.name||'')}" target="_blank" rel="noopener">Naver</a>`;
 {const inr=M.picks.includes(p._k+':'+p.id);h+=`<button type="button" class="q46b">${inr?'✓ In route · remove':'＋ Add to route'}</button>`}
 h+=`<a class="q46b go" href="${esc(mapsUrl(p))}" target="_blank" rel="noopener">Open in Maps</a></div>`;
 if(!plan&&!stay&&M.adding)h+=`<div class="q46days">`+days().map(x=>`<button type="button" class="q46c" data-q46="adddays" data-v="${x}">${esc(dlab(x))}</button>`).join('')+`</div>`;
 return h+'</div>'}
/* ---------- wiring ---------- */
function mount(){host=document.getElementById('q46map');tiles={};if(!host)return;const L=D_();
 if(M.g){gsync()}else{if(M.fit||(!M.lat&&!M.lng)){fit()}
 draw();bind()}
 if(M.rt||M.day!=='all')loadLegs()}
function bind(){const h=host;if(!h||h.dataset.b)return;h.dataset.b=1;
 h.addEventListener('pointerdown',e=>{if(e.target.closest('.q46card,.q46zoom,.q46attr'))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=false;
  if(pts.size===1){drag={x:e.clientX,y:e.clientY,lat:M.lat,lng:M.lng,id:e.pointerId};pinch=null}
  else if(pts.size===2){const a=[...pts.values()];pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),z:M.z};drag=null}});
 const mv=e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&pts.size>=2){const a=[...pts.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);const r=d/pinch.d;
   if(r>1.5){const rc=h.getBoundingClientRect();zoomAt(M.z+1,(a[0].x+a[1].x)/2-rc.left,(a[0].y+a[1].y)/2-rc.top);pinch.d=d;moved=true}else if(r<0.66){const rc=h.getBoundingClientRect();zoomAt(M.z-1,(a[0].x+a[1].x)/2-rc.left,(a[0].y+a[1].y)/2-rc.top);pinch.d=d;moved=true}return}
  if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<5)return;moved=true;
  const c=wp(drag.lat,drag.lng,M.z);setCenterPx(c.x-dx,c.y-dy);draw()};
 h.addEventListener('pointermove',mv);
 const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size)drag=null;else if(pts.size===1){const r=[...pts.values()][0];drag={x:r.x,y:r.y,lat:M.lat,lng:M.lng}}setTimeout(()=>{moved=false},60)};
 h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up);
 h.addEventListener('wheel',e=>{e.preventDefault();const rc=h.getBoundingClientRect();zoomAt(M.z+(e.deltaY<0?1:-1),e.clientX-rc.left,e.clientY-rc.top)},{passive:false});
 h.addEventListener('dblclick',e=>{if(e.target.closest('.q46card,.q46zoom'))return;const rc=h.getBoundingClientRect();zoomAt(M.z+1,e.clientX-rc.left,e.clientY-rc.top)})}
function refresh(){const sec=document.querySelector('.q46');if(!sec)return;const keepZ=M.z,kl=M.lat,kg=M.lng;const t=document.createElement('div');t.innerHTML=view();sec.replaceWith(t.firstElementChild);M.z=keepZ;M.lat=kl;M.lng=kg;mount()}
document.addEventListener('click',e=>{
 const pin=e.target.closest&&e.target.closest('[data-q46pin]');
 if(pin){if(moved)return;e.preventDefault();M.sel=pin.dataset.q46pin;M.adding=false;{const c=wp(+pin.dataset.lat,+pin.dataset.lng,M.z);const sh=selShift();setCenterPx(c.x+sh.x,c.y+sh.y)}refresh();return}
 const b=e.target.closest&&e.target.closest('[data-q46]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.q46;
 if(a==='day'){M.fall={};gSel=null;M.day=b.dataset.v;M.rt=false;M.menu=null;M.swap=null;M.pf=null;M.more=false;M.sel=null;M.adding=false;M.fit=true;refresh()}
 else if(a==='menu'){const i=+b.dataset.i;M.menu=M.menu===i?null:i;M.swap=null;upd()}
 else if(a==='more'){M.more=!M.more;upd()}
 else if(a==='stayadd'){M.picks.unshift('stay:'+b.dataset.id);M.swap=null;M.fit=true;refresh();pickBar()}
 else if(a==='staypin'){const H=window.__hub;if(H&&H.pinStay)H.pinStay(b.dataset.id).then(ok2=>{if(ok2){M.fit=true;refresh()}})}
 else if(a==='nadd'){const x=find('idea:'+b.dataset.id);if(!x)return;if(M.rt){M.picks.push('idea:'+x.id);M.fit=true;refresh()}else{M.fit=false;addIdeaToDay(x)}}
 else if(a==='ideas'){M.ideas=!M.ideas;M.fit=true;refresh()}
 else if(a==='food'){foodGo()}
 else if(a==='fcat'){M.fcat=b.dataset.v;upd()}
 else if(a==='fsave'||a==='fadd'){const fs=M.fall[M.fcat],x=fs&&fs.res&&fs.res[+b.dataset.i];if(!x)return;const dup=(D_().shortlist||[]).find(i=>i.place_id&&i.place_id===x.placeId);
  if(a==='fadd'&&!M.rt){const sn=snapNow();mut(()=>D_().plans.push({id:uuid(),date:M.day,who:[],name:x.name,start:'',end:'',area:'',place:x.address||'',link:'',notes:'★ '+x.rating.toFixed(1)+' on Google',tent:false,note:false,place_id:x.placeId||null,lat:x.lat,lng:x.lng,address:x.address||null,maps_url:x.mapsUrl||null}));M.fit=false;try{toastUndo('Added '+x.name,undoer(sn))}catch(e){}}
  else{let id=dup&&dup.id;if(!id){const it=foodIdea(x);id=it.id;mut(()=>{D_().shortlist=D_().shortlist||[];D_().shortlist.unshift(it)})}
   if(a==='fadd'&&M.rt){if(!M.picks.includes('idea:'+id))M.picks.push('idea:'+id);M.fit=true;refresh()}else{try{toast('Saved '+x.name+' to Ideas')}catch(e){}}}}
 else if(a==='sample'){makeSample()}
 else if(a==='gset'){const v=b.dataset.v==='1';if(v===M.g)return;M.g=v;try{localStorage.setItem('q46g',v?'1':'0')}catch(x){}M.fit=true;refresh()}
 else if(a==='zin'){const s=size();zoomAt(M.z+1,s.W/2,s.H/2)}
 else if(a==='zout'){const s=size();zoomAt(M.z-1,s.W/2,s.H/2)}
 else if(a==='fit'){gSel=null;M.sel=null;M.adding=false;M.fit=true;refresh()}
 else if(a==='row'){const p=find(b.dataset.k);if(!p||!ok(p))return;M.sel=b.dataset.k;M.adding=false;{const c=wp(+p.lat,+p.lng,M.z);const sh=selShift();setCenterPx(c.x+sh.x,c.y+sh.y)}refresh();try{if(window.innerWidth<900){const m=document.getElementById('q46map');m&&m.scrollIntoView({block:'start',behavior:'smooth'})}}catch(x){}}
 else if(a==='pick'){const p=find(M.sel);if(!p)return;togglePick(M.sel);M.sel=null;refresh();pickBar();try{toast(M.picks.length+' for your route')}catch(x){}}
 else if(a==='pickidea'){togglePick('idea:'+b.dataset.id);b.classList.toggle('on',M.picks.includes('idea:'+b.dataset.id));b.textContent=b.classList.contains('on')?'✓ In route':'＋ Route';pickBar()}
 else if(a==='rtopen'){M.fall={};M.menu=null;M.more=false;M.rt=true;M.sel=null;M.swap=null;M.save=false;M.fit=true;U.tab='map';render()}
 else if(a==='rtback'){M.fall={};M.rt=false;M.sel=null;M.swap=null;M.save=false;M.fit=true;refresh();pickBar()}
 else if(a==='rtclear'){M.picks=[];M.startKey=null;M.swap=null;M.save=false;if(M.rt){M.rt=false;M.fit=true;refresh()}pickBar();if(U.tab==='shortlist')render()}
 else if(a==='rtauto'){if(M.rt){autoOrder();M.fit=false;refresh()}else autoDay()}
 else if(a==='rtrm'){M.menu=null;if(!M.rt){const p=dayStops()[+b.dataset.i];if(p)delPlan(p);return}M.picks.splice(+b.dataset.i,1);M.swap=null;if(!M.picks.length)M.rt=false;M.fit=true;refresh();pickBar()}
 else if(a==='rtadd'){M.swap=M.swap===-1?null:-1;upd()}
 else if(a==='rtswap'){const i=+b.dataset.i;M.swap=M.swap===i?null:i;upd()}
 else if(a==='rtchoose'){if(!M.rt){const x=find('idea:'+b.dataset.id);if(!x)return;const all=dayStops();M.fit=true;const sw=M.swap;M.swap=null;M.menu=null;if(sw!=null&&sw>=0&&all[sw])swapPlanIdea(all[sw],x);else addIdeaToDay(x);return}const k='idea:'+b.dataset.id;if(M.swap!=null&&M.swap>=0)M.picks[M.swap]=k;else M.picks.push(k);M.swap=null;M.menu=null;M.fit=true;refresh()}
 else if(a==='pf'){const it=find(b.dataset.k);if(!it)return;M.pf={k:b.dataset.k,q:String(it.name||'').slice(0,120),res:null,busy:false,err:''};upd();pfSearch();try{const q=document.querySelector('.q47');q&&q.scrollIntoView({block:'start',behavior:'smooth'})}catch(x){}}
 else if(a==='pfgo'){pfSearch()}
 else if(a==='pfx'){M.pf=null;upd()}
 else if(a==='pflink'){if(M.pf){M.pf.pend=+b.dataset.i;upd()}}
 else if(a==='pfok'){if(M.pf&&M.pf.pend!=null)pfLink(M.pf.pend)}
 else if(a==='pfno'){if(M.pf){M.pf.pend=null;upd()}}
 else if(a==='stopen'){M.st={q:'',res:null,busy:false,err:''};upd()}
 else if(a==='stx'){M.st=null;upd()}
 else if(a==='stgo'){stSearch()}
 else if(a==='stset'){startSet(b.dataset.k)}
 else if(a==='stpick'){const x=M.st&&M.st.res&&M.st.res[+b.dataset.i];if(!x)return;M.custom={id:'custom',name:x.name,area:'',address:x.address||'',lat:x.lat,lng:x.lng};startSet('pt:custom')}
 else if(a==='rtsave'){M.save=!M.save;upd()}
 else if(a==='rtday'){const date=b.dataset.v;const items=M.picks.map(find).filter(x=>x&&x._k==='idea'&&ok(x));
  if(items.length)mut(()=>{items.forEach(p=>D_().plans.push({id:uuid(),date:date,who:[],name:p.name,start:'',end:'',area:p.area||'',place:p.place||p.address||'',link:p.link||'',notes:'',tent:false,note:false,place_id:p.place_id||null,lat:p.lat,lng:p.lng,address:p.address||null,maps_url:p.maps_url||null}))});
  M.picks=[];M.rt=false;M.save=false;M.swap=null;M.day=date;M.sel=null;M.fit=true;refresh();pickBar();try{toast('Saved to '+dlab(date))}catch(x){}}
 else if(a==='close'){M.sel=null;M.adding=false;refresh()}
 else if(a==='addto'){M.adding=!M.adding;refresh()}
 else if(a==='adddays'){const p=find(M.sel);if(!p)return;const date=b.dataset.v;M.sel=null;M.adding=false;
  mut(()=>D_().plans.push({id:uuid(),date:date,who:[],name:p.name,start:'',end:'',area:p.area||'',place:p.place||p.address||'',link:p.link||'',notes:'',tent:false,note:false,place_id:p.place_id||null,lat:p.lat,lng:p.lng,address:p.address||null,maps_url:p.maps_url||null}));
  try{toast('Added to '+dlab(date))}catch(x){}}
 else if(a==='goplan'){const p=find(M.sel);if(!p)return;U.tab='trip';U.date=p.date||U.date;U.open=U.open||{};U.open[p.id]=true;render()}
 else if(a==='goidea'){const p=find(M.sel);if(!p)return;U.tab='shortlist';render();setTimeout(()=>{const el=document.querySelector('.sl-row [data-id="'+p.id+'"]');if(el){const r=el.closest('.sl-row')||el;r.scrollIntoView({block:'center'});r.classList.add('q46flash');setTimeout(()=>r.classList.remove('q46flash'),1600)}},80)}
 else if(a==='legmode'){M.legSel=M.legSel===b.dataset.k?null:b.dataset.k;upd()}
 else if(a==='legset'){const k=b.dataset.k,m=b.dataset.m;if(TR[k])delete TR[k];LEGOV[k]=m;saveLegOv();M.legSel=null;upd()}
},true);
/* ---------- sample trip (Tokyo) for trying the planner ---------- */
const SAMPLE={plans:[
['2026-12-04','09:00','10:30','Senso-ji Temple','Asakusa',35.7148,139.7967],['2026-12-04','11:30','13:00','Ueno Park','Ueno',35.7156,139.7745],['2026-12-04','13:30','14:30','Ameyoko Market lunch','Ueno',35.7106,139.7747],['2026-12-04','15:30','17:30','Akihabara','Akihabara',35.6984,139.7731],
['2026-12-05','09:00','10:30','Meiji Jingu','Harajuku',35.6764,139.6993],['2026-12-05','11:00','12:30','Takeshita Street','Harajuku',35.6702,139.7027],['2026-12-05','13:00','14:30','Shibuya Crossing','Shibuya',35.6595,139.7005],['2026-12-05','16:00','17:30','Shibuya Sky','Shibuya',35.6580,139.7016],['2026-12-05','19:00','21:00','Omoide Yokocho dinner','Shinjuku',35.6930,139.6991],
['2026-12-06','08:00','10:00','Tsukiji Outer Market','Tsukiji',35.6655,139.7707],['2026-12-06','11:00','14:00','teamLab Planets','Toyosu',35.6491,139.7897],['2026-12-06','16:00','17:30','Tokyo Tower','Minato',35.6586,139.7454]],
ideas:[['Tokyo Skytree','Sumida',35.7101,139.8107],['Kappabashi Street','Asakusa',35.7157,139.7886],['Yanaka Ginza','Yanaka',35.7270,139.7660],['Yoyogi Park','Shibuya',35.6717,139.6949],['Golden Gai','Shinjuku',35.6940,139.7035],['Nezu Museum','Aoyama',35.6620,139.7150],['Shimokitazawa','Setagaya',35.6613,139.6684],['Hamarikyu Gardens','Shiodome',35.6602,139.7632]]};
let sampBusy=false;
async function makeSample(){if(sampBusy)return;sampBusy=true;
 try{const nm=String((A.user&&A.user.email)||'Me').split('@')[0].slice(0,24)||'Me';
  const {data,error}=await A.client.rpc('quest_create_trip',{p_name:'Tokyo sample',p_city:'Tokyo',p_from:'2026-12-04',p_to:'2026-12-06',p_my_name:nm,p_others:[]});
  if(error){try{toast(error.message)}catch(e){}return}
  const row=Array.isArray(data)?data[0]:data;await openTrip(row.trip_id);
  mut(()=>{const L=D_();SAMPLE.plans.forEach(a=>L.plans.push({id:uuid(),date:a[0],who:[],name:a[3],start:a[1],end:a[2],area:a[4],place:'',link:'',notes:'',tent:false,note:false,place_id:null,lat:a[5],lng:a[6],address:null,maps_url:null}));
   L.shortlist=L.shortlist||[];SAMPLE.ideas.forEach(a=>L.shortlist.push({id:uuid(),name:a[0],area:a[1],category:'Other',place:'',link:'',notes:'',done:false,favorite:false,interest:[],place_id:null,lat:a[2],lng:a[3],address:null,maps_url:null}))});
  dayInit=0;M.day='all';M.fit=true;M.sel=null;U.tab='map';render()}
 finally{sampBusy=false}}
function addSampleBtn(){const tb=document.querySelector('.trip-list');if(!tb||document.querySelector('.q46samp'))return;
 const b=document.createElement('button');b.type='button';b.className='ghost q46samp';b.dataset.q46='sample';b.textContent='Try a Tokyo sample trip';
 const bar=document.querySelector('.toolbar');(bar||tb.parentNode).appendChild(b)}
/* ---------- tab + render hook ---------- */
const ICO='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"></path><circle cx="12" cy="10" r="2.3"></circle></svg>';
function navBtn(cls){const b=document.createElement('button');b.dataset.tab='map';if(cls==='bottom'){b.className=U.tab==='map'?'on':'';b.innerHTML='<span class="nav-icon">'+ICO+'</span>Map'}else{b.className=U.tab==='map'?'active':'';b.innerHTML=ICO+' &nbsp;Map'}return b}
function addNav(){['.main-nav','.bottom-nav'].forEach((s,i)=>{const nav=document.querySelector(s);if(!nav)return;let b=nav.querySelector('[data-tab=map]');if(!b){b=navBtn(i?'bottom':'top');const pl=nav.querySelector('[data-tab=info]')||nav.querySelector('[data-tab=planning]');nav.insertBefore(b,pl||null)}
 const on=U.tab==='map';if(i){b.classList.toggle('on',on)}else b.classList.toggle('active',on);
 if(on)nav.querySelectorAll('[data-tab]').forEach(x=>{if(x!==b){x.classList.remove(i?'on':'active')}})})}
const _r=window.render;
if(typeof _r==='function')window.render=function(){const was=U.tab;let v;
 if(was==='map'){U.tab='trip';try{v=_r.apply(this,arguments)}finally{U.tab='map'}}else v=_r.apply(this,arguments);
 try{addSampleBtn()}catch(e){}
 try{if(document.querySelector('.main-nav')){addNav();
  if(U.tab==='map'){const m=document.querySelector('main');if(m){m.innerHTML=view();document.body.classList.add('q46-on');mount()}}else document.body.classList.remove('q46-on')}
  document.querySelectorAll('.q43pin').forEach(x=>{if(/Pinned/.test(x.textContent))x.textContent='📍 On map'});injectPicks();pickBar()}catch(e){console.error(e)}
 return v};
window.__q46={M,data,view};
})();
