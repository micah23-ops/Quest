/* v21: smart paste. Paste a messy list into the itinerary, shortlist or planning box;
   we split it into items, work out time / day / address / link, show a preview, then add. */
(function(){
const Q=()=>window.__q19;if(!Q())return;
const URLRE=/https?:\/\/[^\s<>"]+/ig;
const BULLET=/^\s*(?:[-*•·▪●–—]|\d{1,2}[.)])\s+/;
const looksAddr=s=>Q().looksAddr(s);
const MAPHOST=/(^|\.)(maps\.app\.goo\.gl|goo\.gl|google\.[a-z.]+|naver\.me|map\.naver\.com|kko\.to|map\.kakao\.com|place\.map\.kakao\.com|maps\.apple\.com)$/i;
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return ''}};
const isMapLink=u=>{try{const x=new URL(u);return MAPHOST.test(x.hostname)&&(!/google\./.test(x.hostname)||/^\/(maps|search)/.test(x.pathname)||/maps/.test(x.search))||/^(maps\.app\.goo\.gl|naver\.me|kko\.to)$/.test(x.hostname)}catch(e){return false}};
const MON={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11};
const WD={sun:0,mon:1,tue:2,tues:2,wed:3,thu:4,thur:4,thurs:4,fri:5,sat:6};
const MONRE='(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const WDRE='(sun(?:day)?|mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:r(?:s(?:day)?)?)?|fri(?:day)?|sat(?:urday)?)';
/* find a trip day in the text; returns {date, text-without-it} or null */
function readDay(str){const days=tripDates();if(!days.length)return null;let m,rest=str,hit=null;
 const by=(f)=>days.find(f);
 if((m=new RegExp('\\b'+MONRE+'\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b','i').exec(str))){const mo=MON[m[1].slice(0,3).toLowerCase()],dd=+m[2];hit=by(d=>+d.slice(5,7)-1===mo&&+d.slice(8,10)===dd);if(hit){rest=str.replace(m[0],' ');return {date:hit,rest}}}
 if((m=new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+'+MONRE+'\\b','i').exec(str))){const mo=MON[m[2].slice(0,3).toLowerCase()],dd=+m[1];hit=by(d=>+d.slice(5,7)-1===mo&&+d.slice(8,10)===dd);if(hit){rest=str.replace(m[0],' ');return {date:hit,rest}}}
 if((m=/\b(\d{1,2})\/(\d{1,2})\b/.exec(str))){const a=+m[1],b=+m[2];hit=by(d=>+d.slice(5,7)===a&&+d.slice(8,10)===b)||by(d=>+d.slice(5,7)===b&&+d.slice(8,10)===a);if(hit){rest=str.replace(m[0],' ');return {date:hit,rest}}}
 if((m=/\bday\s*(\d{1,2})\b/i.exec(str))){const i=+m[1]-1;if(days[i]){rest=str.replace(m[0],' ');return {date:days[i],rest}}}
 if((m=new RegExp('\\b'+WDRE+'\\b','i').exec(str))){const k=m[1].toLowerCase();const wd=WD[k]!==undefined?WD[k]:WD[k.slice(0,3)];hit=by(d=>new Date(d+'T12:00:00').getDay()===wd);if(hit){rest=str.replace(m[0],' ');return {date:hit,rest}}}
 return null}
const tidy=s=>s.replace(/\s+/g,' ').replace(/^[\s,;:\-–—@|]+|[\s,;:\-–—@|]+$/g,'').replace(/^(?:on|at)\s+/i,'').trim();
/* ---- split pasted text into raw items ---- */
function split(text){
 const lines=String(text||'').split(/\r?\n/).map(l=>l.replace(BULLET,'').trim()).filter(Boolean);
 const items=[];const urlsIn=l=>l.match(URLRE)||[];
 for(const l of lines){const us=urlsIn(l);
  if(us.length>=2){let rest=l;us.forEach(u=>{const i=rest.indexOf(u);const before=rest.slice(0,i).trim();rest=rest.slice(i+u.length);items.push({text:before,link:u,addr:''})});const tail=rest.trim();if(tail){const last=items[items.length-1];last.text=last.text?last.text+' '+tail:tail}continue}
  if(us.length===1){const u=us[0],t=l.replace(u,' ').trim();
   if(!t){const last=items[items.length-1];
    if(last&&!last.link){ /* name\n[address]\nlink */
     const prev=items[items.length-2];
     if(prev&&!prev.link&&!prev.addr&&looksAddr(last.text)&&!looksAddr(prev.text)&&items.length>=2){prev.addr=last.text;prev.link=u;items.pop()}
     else last.link=u}
    else items.push({text:'',link:u,addr:''});continue}
   items.push({text:t,link:u,addr:''});continue}
  items.push({text:l,link:'',addr:''})}
 /* a lone address-looking line right after a name with nothing between: merge */
 for(let i=items.length-1;i>0;i--){const a=items[i],b=items[i-1];
  if(!a.link&&!b.addr&&!b.link&&/\d/.test(a.text)&&/,|\b(?:ro|gil|gu|dong|st|street|ave|road|rd)\b/i.test(a.text)&&!/\d{1,2}\s*(?::\d{2})?\s*(am|pm)\b/i.test(a.text)){b.addr=a.text;items.splice(i,1)}}
 return items.filter(x=>x.text||x.link)}
/* ---- fill in fields for one item ---- */
function enrich(raw,mode){
 let text=raw.text.replace(/^address:\s*/i,'').trim(),date='',start='',end='',area='',name=text;
 {const d=readDay(name);if(d){date=d.date;name=tidy(d.rest)}
  const q=window.parseQuick?window.parseQuick(name):null;if(q){start=q.start||'';end=q.end||'';area=q.area||'';name=q.name==='New activity'?'':q.name}}

 name=tidy(name);
 const gn=raw.link?Q().gmapsName(raw.link):'';
 if(!name&&gn)name=gn;
 const place=!!(raw.addr||area||(raw.link&&isMapLink(raw.link)));
 return {name,link:raw.link,addr:raw.addr||'',date,start,end,area,gn,isPlace:place,looking:false,on:true}}
const when=i=>[i.date?displayDate(i.date):'',i.start?t12(i.start):''].filter(Boolean).join(' · ');
const LNK=/^(\s*)$/;
function parseBlob(text,mode){return split(text).map(r=>enrich(r,mode)).filter(it=>it.name||it.link)}
const CAT=[[/\b(cafe|café|coffee|latte|bakery|dessert|tea)\b/i,'Cafe'],[/\b(ramen|restaurant|bbq|barbecue|dinner|lunch|brunch|food|noodle|chicken|pizza|sushi|buffet|eat|market)\b/i,'Restaurant'],[/\b(bar|pub|club|soju|cocktail|nightlife|rooftop)\b/i,'Nightlife'],[/\b(shop|shopping|mall|store|outlet|boutique|olive young|thrift)\b/i,'Shopping'],[/\b(spa|salon|massage|nail|skin|facial|hair|beauty)\b/i,'Beauty'],[/\b(class|workshop|lesson|tour)\b/i,'Class'],[/\b(palace|temple|museum|tower|park|hanok|gallery|view|viewpoint|shrine|bridge|village|walk|hike|garden)\b/i,'Sightseeing']];
const catOf=n=>{const h=CAT.find(([re])=>re.test(n));return h?h[1]:'Activity'};
/* ---- UI ---- */
let ov=null,state=null;
const E=s=>esc(s);
const t12=t=>{const m=/^(\d{1,2}):(\d{2})$/.exec(t||'');if(!m)return '';let h=+m[1];const ap=h>=12?'pm':'am';h=h%12||12;return h+(m[2]==='00'?'':':'+m[2])+ap};
const dest=mode=>mode==='plan'?'itinerary':mode==='short'?'shortlist':'planning ideas';
function close(){if(ov){ov.remove();ov=null}state=null;document.body.classList.remove('sp-open')}
function rows(){return state.items.map((it,i)=>{const chips=[];
  if(state.mode==='plan'){if(it.start)chips.push(`<span class="spc t">🕐 ${t12(it.start)}${it.end&&it.end!==it.start?'–'+t12(it.end):''}</span>`);
   chips.push(`<span class="spc d">📅 ${E(displayDate(it.date||state.defDate))}</span>`)}
  if(it.addr)chips.push(`<span class="spc a">📍 ${E(it.addr)}</span>`);
  else if(it.looking)chips.push('<span class="spc w">Looking up address…</span>');
  else if(it.isPlace)chips.push('<span class="spc p">📍 place</span>');
  if(it.area)chips.push(`<span class="spc r">${E(it.area)}</span>`);
  if(it.link)chips.push(`<span class="spc l">🔗 ${E(host(it.link))}</span>`);
  return `<li data-i="${i}"><div class="sp-top"><input class="sp-name" data-i="${i}" value="${E(it.name)}" placeholder="Name this" aria-label="Name"/><button type="button" class="sp-x" data-i="${i}" aria-label="Remove">×</button></div><div class="sp-chips">${chips.join('')}</div></li>`}).join('')}
function paint(){if(!ov)return;const n=state.items.length,busy=state.items.some(i=>i.looking);
 ov.querySelector('.sp-list').innerHTML=rows();
 const b=ov.querySelector('.sp-add');b.disabled=!n||state.saving;b.textContent=state.saving?'Adding…':busy?`Add ${n} (still looking up)`:`Add ${n}`;
 ov.querySelector('.sp-title').textContent=n?`Found ${n} ${n===1?'thing':'things'}`:'Nothing left to add'}
async function lookups(){const todo=state.items.filter(it=>it.link&&!it.addr);let i=0;const mine=state;
 todo.forEach(it=>it.looking=true);paint();
 const worker=async()=>{while(i<todo.length){const it=todo[i++];try{const info=await Q().getInfo(it.link);if(state!==mine)return;
   if(info){if(info.address)it.addr=info.address;if(!it.name&&info.name)it.name=info.name;if(info.area&&!it.area)it.area=info.area;if(info.address)it.isPlace=true}}catch(e){}
   it.looking=false;if(state===mine){const ae=document.activeElement;const keep=ae&&ae.classList&&ae.classList.contains('sp-name');const val=keep?ae.value:'',idx=keep?ae.dataset.i:null,pos=keep?ae.selectionStart:0;
    if(keep)state.items[+idx].name=val;paint();if(keep){const n=ov.querySelector(`.sp-name[data-i="${idx}"]`);if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}}}}};
 await Promise.all([worker(),worker(),worker()])}
function open(mode,items,box){close();state={mode,items,saving:false,defDate:(typeof U!=="undefined"&&U.date)||tripDates()[0],boxId:box.id};
 ov=document.createElement('div');ov.className='sp-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 const dd=mode==='plan'?`Items without a day go to ${E(displayDate(state.defDate))}.`:mode==='short'?'Each one is added to your shortlist.':'Each one is sorted into a group in Planning.';
 ov.innerHTML=`<div class="sp-card"><div class="sp-h"><div><strong class="sp-title"></strong><div class="sp-sub">Adding to your ${dest(mode)}. ${dd} Fix any name before you add.</div></div><button type="button" class="sp-close" aria-label="Close">×</button></div><ul class="sp-list"></ul><div class="sp-foot"><button type="button" class="ghost sp-cancel">Cancel</button><button type="button" class="primary sp-add">Add</button></div></div>`;
 document.body.appendChild(ov);document.body.classList.add('sp-open');paint();lookups();
 ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('.sp-close,.sp-cancel'))return close();
  const x=e.target.closest('.sp-x');if(x){state.items.splice(+x.dataset.i,1);paint();return}
  if(e.target.closest('.sp-add'))commit()});
 ov.addEventListener('input',e=>{const n=e.target.closest('.sp-name');if(n)state.items[+n.dataset.i].name=n.value});
 ov.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close()}if(e.key==='Enter'&&e.target.classList.contains('sp-name')){e.preventDefault();e.target.blur()}},true)}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function commit(){const st=state;if(!st||st.saving)return;st.saving=true;paint();
 while(st.items.some(i=>i.looking)&&state===st)await sleep(120);
 if(state!==st)return;
 const items=st.items.filter(i=>(i.name||'').trim()||i.link).map(i=>({...i,name:(i.name||'').trim()||i.gn||host(i.link)||'New activity'}));
 try{
  if(st.mode==='plan'){mut(()=>{items.forEach(i=>D().plans.push({id:uuid(),date:i.date||st.defDate,who:U.who==='all'?[]:[U.who],name:i.name,start:i.start||'',end:i.end||'',area:i.area||'',place:i.addr||'',link:i.link||'',notes:''}))});
   const days=new Set(items.map(i=>i.date||st.defDate));if(days.size===1&&[...days][0]!==U.date&&U.view==='day'){}}
  else if(st.mode==='short'){mut(()=>{items.slice().reverse().forEach(i=>D().shortlist.unshift({id:uuid(),name:i.name,area:i.area||'',category:catOf(i.name),done:false,link:i.link||'',notes:when(i)?'Planned: '+when(i):'',place:i.addr||'',interest:A.me?[A.me]:[]}))})}
  else{for(const i of items){const inp=document.getElementById('ideaquick');if(!inp)break;
    const oids=()=>new Set((D().groups||[]).flatMap(g=>(g.options||[]).map(o=>o.id)));const bset=oids();
    const count=()=>(D().groups||[]).reduce((a,g)=>a+(g.options||[]).length,0),before=count();
    inp.value=(i.name+(i.link?' '+i.link:'')).trim();
    inp.dispatchEvent(new Event('input',{bubbles:true}));
    if(i.addr&&i.link){inp.dataset.addr=i.addr;inp.dataset.addrLink=i.link}
    const btn=document.querySelector('[data-act="idea-add"]');if(btn){btn.disabled=false;btn.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}))}
    for(let k=0;k<120&&count()===before;k++)await sleep(100);
    const w=when(i);if(w){const o=(D().groups||[]).flatMap(g=>g.options||[]).find(x=>!bset.has(x.id));if(o)mut(()=>{o.notes=('Planned: '+w+((o.notes||'')?'\n'+o.notes:''))})}}}
  const n=items.length;close();toast(`Added ${n} to your ${dest(st.mode)}`)
 }catch(e){st.saving=false;paint();toast('Something went wrong, nothing was lost')}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ov){e.stopPropagation();close()}},true);
/* ---- hook the three boxes ---- */
const MODE={quick:'plan',shortquick:'short',ideaquick:'idea'};
document.addEventListener('paste',e=>{const t=e.target;if(!t||!MODE[t.id]||e.defaultPrevented)return;
 if(navigator.onLine===false&&false)return;
 const txt=(e.clipboardData&&e.clipboardData.getData('text'))||'';if(!txt||(txt.indexOf('\n')<0&&(txt.match(URLRE)||[]).length<2))return;
 const mode=MODE[t.id];const items=parseBlob(txt,mode);if(items.length<2)return;
 e.preventDefault();e.stopImmediatePropagation();open(mode,items,t)},true);
window.__smartPaste={parseBlob,split,readDay,catOf,open:(mode,text)=>{const b=document.getElementById({plan:'quick',short:'shortquick',idea:'ideaquick'}[mode]);const it=parseBlob(text,mode);if(it.length)open(mode,it,b||{id:''})}};
})();
