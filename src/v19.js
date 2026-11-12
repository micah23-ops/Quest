/* v19: Shortlist "By area" view */
(function(){
const LS='quest.shortView';
const getV=()=>{if(U.shortView)return U.shortView;try{U.shortView=localStorage.getItem(LS)==='area'?'area':'all'}catch(e){U.shortView='all'}return U.shortView};
const setV=v=>{U.shortView=v;try{localStorage.setItem(LS,v)}catch(e){}};
const key=a=>String(a||'').trim().toLowerCase().replace(/\s+/g,' ');
const NONE='Area not set';
function areaNames(){const seen={},out=[];(D().shortlist||[]).concat((D().plans||[])).forEach(i=>{const a=String(i.area||'').trim().replace(/\s+/g,' ');if(a&&!seen[key(a)]){seen[key(a)]=1;out.push(a)}});return out.sort((a,b)=>a.localeCompare(b))}
{const _sl=window.shortlist;window.shortlist=()=>{
 let html=_sl();const t=document.createElement('template');t.innerHTML=html;const c=t.content;
 const view=getV();
 const items=D().shortlist||[];
 /* toggle (only when there is something to group) */
 const chips=c.querySelector('.short-chips');
 if(chips&&items.length){const seg=document.createElement('div');seg.className='view-seg';seg.setAttribute('role','group');seg.setAttribute('aria-label','View');
  seg.innerHTML=`<button type="button" data-act="short-view" data-v="all" class="${view==='all'?'on':''}" aria-pressed="${view==='all'}">All</button><button type="button" data-act="short-view" data-v="area" class="${view==='area'?'on':''}" aria-pressed="${view==='area'}">By area</button>`;
  chips.appendChild(seg)}
 /* grouping */
 const list=c.querySelector('.short-list');
 if(view==='area'&&list){const wraps=[...list.children].filter(n=>n.classList&&n.classList.contains('short-wrap'));
  if(wraps.length){const groups={},order=[];
   wraps.forEach(w=>{const idEl=w.querySelector('[data-id]');const it=items.find(x=>idEl&&x.id===idEl.getAttribute('data-id'));const raw=String((it&&it.area)||'').trim().replace(/\s+/g,' ');const k=raw?key(raw):'';
    if(!groups[k]){groups[k]={label:raw||NONE,nodes:[]};order.push(k)}else if(raw&&/^[a-z]/.test(groups[k].label)&&/^[A-Z]/.test(raw))groups[k].label=raw;groups[k].nodes.push(w);
    const meta=w.querySelector('.sl-meta');if(meta&&raw)meta.textContent=(it.category||'')||'';});
   /* groups stay in the order their newest idea appears, so what you just added is on top */
   order.forEach(k=>{const g=groups[k],sec=document.createElement('section');sec.className='area-group'+(k===''?' unset':'');
    const h=document.createElement('div');h.className='area-head';h.innerHTML=`<span class="area-name"></span><span class="area-n">${g.nodes.length}</span>`;h.querySelector('.area-name').textContent=g.label;sec.appendChild(h);
    g.nodes.forEach(n=>sec.appendChild(n));list.appendChild(sec)})}}
 /* reuse existing area names when adding/correcting */
 c.querySelectorAll('input[id^="e_"][id$="_area"]').forEach(i=>{i.setAttribute('list','quest-areas');i.setAttribute('placeholder','e.g. Hongdae');i.setAttribute('autocomplete','off')});
 if(c.querySelector('input[list="quest-areas"]')){const dl=document.createElement('datalist');dl.id='quest-areas';areaNames().forEach(a=>{const o=document.createElement('option');o.value=a;dl.appendChild(o)});c.appendChild(dl)}
 return t.innerHTML}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-act="short-view"]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();setV(b.dataset.v==='area'?'area':'all');render()},true);
})();
/* v19: Directions on opened itinerary plans (official Google Maps URLs, no API) */
(function(){
const mins=t=>{const m=/^(\d{1,2}):(\d{2})/.exec(t||'');return m?(+m[1])*60+(+m[2]):null};
const addr=p=>String((p&&p.place)||'').replace(/\s+/g,' ').trim();
function prevPlan(p){const s=mins(p.start);if(s==null)return null;const mine=p.who||[];
 const c=(D().plans||[]).filter(q=>q.id!==p.id&&q.date===p.date&&mins(q.start)!=null&&mins(q.start)<s&&(!mine.length||!(q.who||[]).length||(q.who||[]).some(w=>mine.includes(w)))).sort((a,b)=>mins(b.start)-mins(a.start));
 return c[0]||null}
window.dirUrl=p=>{const d=addr(p);if(!d)return '';let u='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(d);const q=prevPlan(p),o=q&&addr(q);if(o)u+='&origin='+encodeURIComponent(o);return u};
const _ev=window.evCard;window.evCard=(p,dup,col)=>{let h=_ev(p,dup,col);
 if(!p||!/class="event [^"]*\bopen\b/.test(h)||/class="event editing/.test(h))return h;const u=window.dirUrl(p);if(!u)return h;
 const a=`<a class="small-btn dir-btn" target="_blank" rel="noopener noreferrer" href="${esc(u)}">Directions</a>`;
 if(/>Map<\/a>/.test(h))return h.replace('>Map</a>','>Map</a>'+a);
 return h.replace('<div class="ev-detail">','<div class="ev-detail"><div class="evd-row dir-row"><span></span>'+a+'</div>')};
})();
/* v19: autofill from pasted links / Google Maps Share text (+ link lookup helper) */
(function(){
const URLRE=/https?:\/\/[^\s<>"]+/i;
const PLACEHOLDER=/^(new option|new activity|new place)?$/i;
const looksAddr=s=>/\d/.test(s)||/,/.test(s);
/* Google Maps long link: name from /place/NAME/ (client-side, no network) */
function gmapsName(u){try{const x=new URL(u);if(!/(^|\.)google\.[a-z.]+$/.test(x.hostname)||!x.pathname.startsWith('/maps/place/'))return '';
 let n=x.pathname.split('/')[3]||'';n=decodeURIComponent(n.replace(/\+/g,' ')).trim();return /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(n)?'':n}catch(e){return ''}}
/* Share text: "Name\nAddress\nlink" */
function parseShare(raw){const lines=String(raw||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);if(lines.length<2)return null;
 const li=lines.findIndex(l=>URLRE.test(l));if(li<0)return null;const link=URLRE.exec(lines[li])[0];
 const rest=lines.filter((l,i)=>i!==li).concat(lines[li].replace(link,'').trim()?[lines[li].replace(link,'').trim()]:[]).filter((l,i,a)=>l&&a.indexOf(l)===i);
 const ordered=lines.filter((l,i)=>i!==li);const txt=ordered.length?ordered:rest;
 if(txt.length>=2&&looksAddr(txt[1]))return {link,name:txt[0],address:txt.slice(1).join(', ')};
 return null}
/* paste: keep newlines meaningful, then put a clean one-liner in the box */
document.addEventListener('paste',e=>{const t=e.target;if(!t||!/^(shortquick|ideaquick|quick)$/.test(t.id))return;
 const txt=(e.clipboardData&&e.clipboardData.getData('text'))||'';const s=parseShare(txt);if(!s)return;
 e.preventDefault();t.value=s.name+' '+s.link;t.dataset.addr=s.address;t.dataset.addrLink=s.link;
 t.dispatchEvent(new Event('input',{bubbles:true}))},true);
const infoCache=new Map();
/* maps/search/?api=1&query=Name links hold a name, not a place. Google's page for them has no real pin, so use the name. */
const searchQ=url=>{try{const x=new URL(url);if(!/(^|\.)google\.[a-z.]+$/.test(x.hostname)||!/^\/maps\/search/.test(x.pathname))return '';const q=(x.searchParams.get('query')||x.searchParams.get('q')||'').trim();return q&&!/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(q)?q:''}catch(e){return ''}};
const geoName=async name=>{if(!navigator.onLine||!A.client||!A.client.functions)return null;
 try{const r=await Promise.race([A.client.functions.invoke('quest-geocode',{body:{name,hint:(D().trip&&D().trip.city)||''}}),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),9000))]);const d=r&&r.data;return d&&d.ok&&d.lat!=null?d:null}catch(e){return null}};
const getInfo=async url=>{
 if(infoCache.has(url))return infoCache.get(url);
 const sq=searchQ(url);
 if(sq){const g=await geoName(sq);const out={ok:true,source:(g&&g.source==='area')?'area':'search',name:sq,address:g?g.address:'',area:g?g.area:'',lat:g?g.lat:null,lng:g?g.lng:null};if(g)infoCache.set(url,out);return out}
 if(!navigator.onLine||!A.client||!A.client.functions)return null;
 try{const r=await Promise.race([A.client.functions.invoke('quest-link-info',{body:{url,hint:(D().trip&&D().trip.city)||''}}),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),9000))]);
  const d=r&&r.data;const out=d&&d.ok?d:null;if(out)infoCache.set(url,out);return out}catch(e){return null}};
const ids=()=>{const d=D(),s=new Set();(d.shortlist||[]).forEach(x=>s.add(x.id));(d.plans||[]).forEach(x=>s.add(x.id));(d.groups||[]).forEach(g=>(g.options||[]).forEach(o=>s.add(o.id)));return s};
const findNew=(before)=>{const d=D();let it=(d.shortlist||[]).find(x=>!before.has(x.id));if(it)return {it,kind:'short'};it=(d.plans||[]).find(x=>!before.has(x.id));if(it)return {it,kind:'plan'};
 for(const g of d.groups||[]){const o=(g.options||[]).find(x=>!before.has(x.id));if(o)return {it:o,kind:'opt'}}return null};
const ADDR=/^Address: (.*)(\n|$)/;
function wrap(fn,sel,btnSel,origFn){const orig=origFn||window[fn];let busy=false;
 const impl=async function(){const inp=document.querySelector(sel);if(!inp||!inp.value.trim()||busy)return orig.apply(this,arguments);
  const v=inp.value,m=URLRE.exec(v),link=m?m[0]:'';let info=null,addr='',typed=!!v.replace(link,'').trim();
  if(link&&inp.dataset.addr&&inp.dataset.addrLink===link){addr=inp.dataset.addr}
  delete inp.dataset.addr;delete inp.dataset.addrLink;
  const gn=link?gmapsName(link):'';
  if(link&&!addr){busy=true;const b=document.querySelector(btnSel);const old=b&&b.textContent;if(b){b.disabled=true;b.textContent='Looking…'}
   try{info=await getInfo(link)}finally{busy=false;const b2=document.querySelector(btnSel);if(b2){b2.disabled=false;if(old)b2.textContent=old}}}
  /* the box may have re-rendered while we waited */
  const cur=document.querySelector(sel);if(!cur||cur.value!==v)return;
  const before=ids();const r=orig.apply(this,arguments);
  if(link&&(addr||info||gn)){const f=findNew(before);
   if(f){const place=addr||(info&&info.address)||'',area=(info&&info.area)||'',nm=(info&&info.name)||gn||'';
    mut(()=>{const it=f.it;
     if(nm&&(!typed||PLACEHOLDER.test((it.name||'').trim())))it.name=nm;
     if(f.kind==='opt'){if(place&&!ADDR.test(it.notes||'')&&!(it.notes||'').includes(place))it.notes=('Address: '+place+((it.notes||'')?'\n'+it.notes:''));if(area&&!it.area)it.area=area}
     else{if(place&&!it.place)it.place=place;if(area&&!it.area)it.area=area}});
    if(place||nm)toast(place?'Filled in from your link · double-check the address':'Added · couldn’t find an address for that link, add it in Edit')}}
  return r};
 if(!origFn)window[fn]=impl;return impl}
['shortQuick','addQuick'].forEach((f,i)=>{if(typeof window[f]==='function')wrap(f,['#shortquick','#quick'][i],['[data-act="short-add"]','[data-act="quick-add"]'][i])});
/* idea box: its add function is private, so gate the click/Enter and replay it */
{let pass=false;const run=wrap('idea','#ideaquick','[data-act="idea-add"]',function(){pass=true;try{const b=document.querySelector('[data-act="idea-add"]');if(b)b.click()}finally{pass=false}});
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-act="idea-add"]');if(!b||pass)return;e.stopImmediatePropagation();e.preventDefault();run()},true);
 document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='ideaquick'&&!pass){e.stopImmediatePropagation();e.preventDefault();run()}},true)}
/* an idea's "Address:" note travels with it to the shortlist and itinerary */
{const _o=window.optToShort;if(_o)window.optToShort=function(id){const before=ids();const r=_o.apply(this,arguments);const f=findNew(before);
 if(f&&f.kind==='short'){const mm=ADDR.exec(f.it.notes||'');if(mm)mut(()=>{if(!f.it.place)f.it.place=mm[1];f.it.notes=(f.it.notes||'').replace(ADDR,'')})}return r}}
{const _om=window.openModal;if(_om)window.openModal=function(m,id){if(m==='plan'&&U.draft&&!U.draft.place){const mm=ADDR.exec(U.draft.notes||'');if(mm){U.draft.place=mm[1];U.draft.notes=(U.draft.notes||'').replace(ADDR,'')}}return _om.apply(this,arguments)}}
window.__q19={URLRE,looksAddr,gmapsName,getInfo,searchQ,geoName};
})();
