/* v28: Quick Add. One box for anything: parses lists and messy notes, shows where each item will go, lets you adjust, then adds. */
(function(){
const STOP=new Set('a an the and or of in on at to for with from my our your we i us me is are be it its this that some any try go see do visit have has want wants wanna would like definitely really maybe class lesson lessons studio workshop place spot new near'.split(' '));
const BASIC=new Set('a an the and or of in on at to for with from my our your we i us me is are be it its this that some any try go see do visit have has want wants wanna would like will definitely really maybe only just also too please together'.split(' '));
const sig2=s=>{const mem=new Set((A.people||[]).map(p=>first(p.name).toLowerCase()));return String(s||'').toLowerCase().replace(/[^a-z0-9ㄱ-힝]+/g,' ').trim().split(' ').filter(w=>w&&!BASIC.has(w)&&!mem.has(w))};
const STAYRX=/\b(hotel|hostel|airbnb|guest ?house|resort|motel|lodging|accommodations?|hanok stay|stay(?:ing)?\s+(?:at|in|near))\b/i;
const sig=s=>String(s||'').toLowerCase().replace(/[^a-z0-9ㄱ-힝\s]/g,' ').split(/\s+/).filter(w=>w.length>1&&!STOP.has(w));
const GENERIC=/^(shopping|shop|food|eats|cafes?|coffee|dinner|lunch|brunch|breakfast|dessert|bars?|nightlife|hotels?|stay|sightseeing|activities|restaurants?|spa|massage)$/i;
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9ㄱ-힝]+/g,' ').trim();
const CATRX=[['Stay',STAYRX],['Nightlife',/night ?life|\bclubs?\b|karaoke|cocktail|speakeasy|lounge|\bpubs?\b|\bbars?\b|soju|live music/i],['Cafes',/cafe|café|coffee|bakery|dessert|bingsu|\btea\b|tteok|patisserie|roastery/i],['Food',/restaurant|\bbbq\b|ramen|dinner|lunch|brunch|breakfast|noodle|chicken|street food|\beat\b|food|galbi|tteokbokki/i],['Shopping',/shop|\bmall\b|boutique|thrift|store|vintage/i],['Experience',/class|lesson|workshop|photo ?booth|color analysis|makeup|\bspa\b|massage|tour|hanbok|pottery|nail|hair/i],['Sights',/museum|palace|temple|tower|\bpark\b|hike|viewpoint|gallery|market|river|village|hill|bridge|picnic/i]];
const catOf=t=>{for(const [c,r] of CATRX)if(r.test(t))return c==='Stay'?'Other':c;return 'Other'};
const fmtDay=d=>{try{return displayDate(d)}catch(e){return d}};
const T12=t=>{try{return prettyTime(t)}catch(e){return t}};
const addMin=(t,m)=>{const x=/^(\d{1,2}):(\d{2})/.exec(t||'');if(!x)return '';let v=(+x[1])*60+(+x[2])+m;if(v>=1440)v=1439;return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')};

/* ---- parsing ---- */
function headFlags(l){const s=l.toLowerCase();return {must:/definitely|must|really want|top|priority/.test(s),maybe:/maybe|random|suggest|thinking|might|could|ideas?/.test(s)&&!/definitely|must/.test(s),booked:/booked|confirmed|reserv/.test(s)}}
const hostOf=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return ''}};
const CATLIST=['Food','Cafes','Experience','Sights','Shopping','Nightlife','Stay','Other'];
function structLine(raw){
 let l=String(raw||'').trim().replace(/^\s*(?:[-*•·▪◦–—]|\d{1,2}[.)])\s+/,'');if(!/\s\|\s/.test(l)||/https?:\/\/\S+\s*\|/.test(l)&&false)return null;
 const a=l.split('|').map(x=>x.trim());if(a.length<2)return null;
 const iso=/^\d{4}-\d{2}-\d{2}$/.test(a[0]);
 if(iso){const tm=/^(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})$/.exec(a[1]||'')||/^(\d{1,2}):(\d{2})()()$/.exec(a[1]||'');
  const z=n=>String(n).padStart(2,'0');
  return {date:a[0],start:tm?z(tm[1])+':'+tm[2]:'',end:tm&&tm[3]?z(tm[3])+':'+tm[4]:'',name:a[2]||'',area:a[3]||'',cat:a[4]||'',desc:a.slice(5).join(' | ')}}
 const isCat=x=>CATLIST.some(c=>c.toLowerCase()===String(x||'').toLowerCase());
 if(a.length>=3&&isCat(a[0])&&!isCat(a[2]))return {date:'',start:'',end:'',name:a[1],area:a[2]||'',cat:a[0],desc:a.slice(3).join(' | ')};
 return {date:'',start:'',end:'',name:a[0],area:a[1]||'',cat:a[2]||'',desc:a.slice(3).join(' | ')}}
function fromStruct(st){
 const cat=CATLIST.find(c=>c.toLowerCase()===String(st.cat||'').toLowerCase().replace(/^experiences$/,'experience'))||catOf(st.name+' '+st.area);
 const dates=tripDates(),notes=[];let dest='idea',date=st.date||'';
 if(date&&dates.includes(date))dest='itin';else if(date){notes.push('That date is outside your trip dates, so it’s going to Ideas.');date=''}
 const isStay=cat==='Stay'||STAYRX.test(st.name);if(isStay&&dest==='idea')dest='stay';
 const e={raw:'|'+[st.date,st.start,st.name].join('|'),addr:'',nameless:false,name:st.name,area:st.area,link:'',date,start:dest==='itin'?st.start:'',end:dest==='itin'?(st.end||(st.start?addMin(st.start,60):'')):'',interest:[],explicit:false,must:false,maybe:false,booked:false,dest,tent:dest==='itin',cat,notes,match:null,dup:null,optOf:'',isStay,desc:st.desc||'',struct:true};
 matchExisting(e);return e}
function pieces(text){
 const sl=String(text||'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean),st=sl.map(structLine);
 if(st.filter(Boolean).length>=1&&st.filter(Boolean).length>=sl.length/2){const o=[];st.forEach((x,i)=>{if(x&&x.name)o.push({text:sl[i],f:{},struct:x})});if(o.length)return o}
 const out=[];let head={};
 const sp=window.__smartPaste&&window.__smartPaste.split;
 if(sp&&/https?:\/\//i.test(text)){
  try{let seg=[],hd={};const flush=()=>{if(!seg.length)return;sp(seg.join('\n')).forEach(r=>out.push({text:r.text||'',f:Object.assign({},hd),link:r.link||'',addr:r.addr||''}));seg=[]};
   String(text).split(/\r?\n/).forEach(raw=>{const l=raw.trim();if(!l)return;if(/:$/.test(l)&&l.length<90&&!/https?:/.test(l)){flush();hd=headFlags(l);return}seg.push(l)});flush();if(out.length)return out}catch(e){out.length=0}}
 String(text||'').split(/\r?\n/).forEach(raw=>{
  let line=raw.trim();if(!line)return;
  if(/:$/.test(line)&&line.length<90&&!/https?:/.test(line)){head=headFlags(line);return}
  line=line.replace(/^\s*(?:[-*•·▪◦–—]|\d{1,2}[.)]|\[\s?[x ]?\s?\])\s+/i,'').trim();
  const lab=/^(definitely|must(?:\s*do)?|maybe|random(?:\s+suggestions?)?|booked|confirmed|thinking about|ideas?)\s*[:\-]\s*(.+)$/i.exec(line);
  let f=Object.assign({},head);if(lab){Object.assign(f,headFlags(lab[1]));line=lab[2]}
  line.split(/(?<=[.!?])\s+(?=[A-Z])|;\s+/).map(x=>x.trim()).filter(Boolean).forEach(p=>out.push({text:p,f}))});
 return out}
function peopleBy(name){const n=String(name||'').toLowerCase();return (A.people||[]).find(p=>first(p.name).toLowerCase()===n)}
function analyze(text,f,ctx,extra){
 ctx=ctx||{};f=f||{};extra=extra||{};if(extra.struct)return fromStruct(extra.struct);let s=String(text||'').trim().replace(/[.!?]+$/,'').trim();if(!s&&!extra.link)return null;
 const flags={must:!!f.must,maybe:!!f.maybe,booked:!!f.booked};let interest=[];
 /* who wants it */
 let m=/^(\w+)\s+(?:wants?|would like|is keen on|is keen to|wanna|will|is going to|is gonna)\s+(?:to\s+)?(?:(?:go|do|try|visit|see|eat)\s+(?:to\s+)?)?(.+)$/i.exec(s);
 let explicit=false;if(m){const p=peopleBy(m[1]);if(p){interest=[p.id];explicit=true;s=m[2]}else if(/^(we|i)$/i.test(m[1])){s=m[2]}}
 if(/\b(definitely|must|really want|have to|need to|can't miss)\b/i.test(s)){flags.must=true;s=s.replace(/\b(we\s+)?(definitely|really)\s+(want|need)\s+(to\s+)?(do\s+|go\s+to\s+|visit\s+|try\s+)?/i,'').replace(/\b(definitely|must[- ]do|must|really want to|have to|need to)\b\s*/ig,'')}
 s=s.replace(/^(?:we|i)\s+(?:want|wanna|would like)\s+to\s+(?:do\s+|go\s+to\s+|visit\s+|try\s+)?/i,'');
 if(/^(maybe|perhaps|random suggestions?|suggestion|thinking (?:about|of)|might|could)\b/i.test(s)){flags.maybe=true;s=s.replace(/^(maybe|perhaps|random suggestions?|suggestion|thinking (?:about|of)|might|could)\s*[:,-]?\s*(?:we\s+(?:can|could)\s+)?(?:do\s+|try\s+|go\s+to\s+)?/i,'')}
 else if(/\b(thinking about|maybe)\b/i.test(s)){flags.maybe=true;s=s.replace(/\b(thinking about|maybe)\b\s*/ig,'')}
 const bk=/^(?:our\s+)?(.+?)\s+(?:is|are|was)\s+(?:booked|confirmed|reserved)\s*(.*)$/i.exec(s);
 if(bk){flags.booked=true;s=(bk[1]+' '+(bk[2]||'')).trim()}else if(/\b(booked|confirmed)\b/i.test(s)){flags.booked=true;s=s.replace(/\b(booked|confirmed)\b\s*/ig,'')}
 s=s.replace(/^our\s+/i,'').replace(/\s+/g,' ').trim();
 /* date, time, area, link */
 let date='',dw=null;try{dw=dayWords(s)}catch(e){}if(!(dw&&dw.date)){try{dw=window.__smartPaste&&window.__smartPaste.readDay?window.__smartPaste.readDay(s):null}catch(e){dw=null}}if(dw&&dw.date){date=dw.date;s=dw.rest||s}
 s=s.replace(/\b(?:on|for)\s*$/i,'').replace(/\s+(?:on|for|at)\s+(?=\d)/i,' ');
 let pq=null;try{pq=parseQuick(s)}catch(e){}
 if(!pq){const u=/https?:\/\/\S+/.exec(s);pq={name:s,area:'',start:'',end:'',link:u?u[0]:''}}
 if(extra.link&&!pq.link)pq.link=extra.link;
 let gn='';if(pq.link&&window.__q19&&window.__q19.gmapsName){try{gn=window.__q19.gmapsName(pq.link)||''}catch(e){}}
 let name=String(pq.name||'').replace(/^[\s,.;:\-]+|[\s,.;:\-]+$/g,'').trim();
 if(/^new activity$/i.test(name))name='';
 const nameless=!name;if(!name&&gn)name=gn;
 let renamed=false;if(name&&pq.area&&GENERIC.test(name)){name=name.charAt(0).toUpperCase()+name.slice(1).toLowerCase()+' in '+pq.area;renamed=true}
 if(!name&&!pq.link)return null;
 const dates=tripDates(),inTrip=!date||dates.includes(date),hasTime=!!pq.start;
 let dest='idea';const notes=[];
 if(!flags.maybe&&date&&inTrip)dest='itin';
 else if(!flags.maybe&&!date&&ctx.itinDefault&&ctx.day)dest='itin';
 const isStay=STAYRX.test(name);if(isStay&&!date&&!flags.maybe){dest='stay';name=name.replace(/^(?:we(?:'re| are)?\s+)?stay(?:ing)?\s+(?:at|in|near)\s+/i,'')||name}
 if(date&&!inTrip)notes.push('That date is outside your trip dates, so it’s going to Ideas.');
 if(dest==='itin'&&!date)date=ctx.day;
 const e={raw:text+(extra.link&&text.indexOf(extra.link)<0?' '+extra.link:''),addr:extra.addr||'',nameless:nameless&&!gn,name:name||hostOf(pq.link)||'New idea',area:pq.area||'',link:pq.link||'',date,start:pq.start||'',end:pq.end||'',interest,explicit,must:flags.must,maybe:flags.maybe,booked:flags.booked,dest,tent:false,cat:catOf(name+' '+(pq.area||'')),notes,match:null,dup:null,optOf:'',isStay,renamed};
 if(dest==='itin'&&e.start&&!e.end)e.end=addMin(e.start,60);
 if(!e.interest.length&&A.me)e.interest=[A.me];
 matchExisting(e);return e}
function matchExisting(e){
 const items=D().shortlist||[],a=sig(e.name),an=norm(e.name),e2=sig2(e.name);let dup=null,match=null;
 for(const it of items){
  const b=sig(it.name),bn=norm(it.name);
  if(an&&an===bn&&!(e.area&&it.area&&norm(e.area)!==norm(it.area))){dup=dup||{id:it.id,name:it.name,where:'Ideas',kind:'idea'};continue}
  if(e.link&&it.link&&e.link===it.link){dup=dup||{id:it.id,name:it.name,where:'Ideas',kind:'idea'};continue}
  if(!a.length||!b.length)continue;
  const shared=a.filter(w=>b.includes(w)).length;
  if(shared&&b.every(w=>a.includes(w))){
   const i2=sig2(it.name),extra=e2.filter(w=>!i2.includes(w));
   if(!extra.length)dup=dup||{id:it.id,name:it.name,where:'Ideas',kind:'idea'};else match=match||{id:it.id,name:it.name}}}
 for(const g of (D().groups||[]))for(const o of g.options){
if(e.link&&o.link&&e.link===o.link)dup=dup||{id:o.id,name:o.name,where:'Compare',kind:'opt'}}
 e.dup=dup;e.match=dup?null:match}
function parseAll(text,ctx){const out=[];pieces(text).forEach(p=>{const e=analyze(p.text,p.f,ctx,{link:p.link,addr:p.addr,struct:p.struct});if(e)out.push(e)});return out}

/* ---- adding ---- */
function commit(entries){
 const made={plans:[],ideas:[],opts:[],groups:[],keen:[],stay:null};let n=0;
 mut(()=>{
  entries.forEach(e=>{
   if(e.dest==='skip')return;
   const link=e.link||'';
   if(e.dest==='keen'){const it=D().shortlist.find(x=>x.id===e.keenOf);if(it){(e.explicit?e.interest:[]).forEach(m=>{if(!it.interest.includes(m)){it.interest.push(m);made.keen.push([it.id,m])}});n++}return}
   if(e.dest==='stay'){const r=putStay({name:e.name,link,addr:e.addr,area:e.area});(made.stays=made.stays||[]).push(r);if(!made.stay)made.stay=r;made.stayMode=r.mode;e._ref={k:'stay',id:r.prev.id};n++;return}
   if(e.dest==='itin'){
    const id=uuid();D().plans.push({id,date:e.date||U.date,who:e.explicit?e.interest.slice():((U.tab==='trip'&&U.who&&U.who!=='all')?[U.who]:[]),name:e.name,start:e.start||'',end:(U.tab==='trip'&&U.q26n)?'':(e.end||''),area:e.area||'',place:e.addr||'',link,notes:e.desc||'',tent:!!e.tent,note:!!(U.tab==='trip'&&U.q26n),place_id:e.pin?e.pin.placeId||null:null,lat:e.pin?e.pin.lat:null,lng:e.pin?e.pin.lng:null,address:e.pin?e.pin.address||null:null,maps_url:e.pin?e.pin.mapsUrl||null:null});if(U.tab==='trip'){U.q26n=false;U.q23t=false}made.plans.push(id);e._ref={k:'plan',id};n++}
   else if(e.dest==='opt'&&e.optOf){
    let g=(D().groups||[]).find(x=>x.idea_id===e.optOf);
    if(!g){const it=D().shortlist.find(x=>x.id===e.optOf);g={id:uuid(),name:it?it.name:e.name,idea_id:e.optOf,options:[]};D().groups.push(g);made.groups.push(g.id)}
    const id=uuid();g.options.push({id,name:e.name,link,area:e.area||'',price:'',notes:e.addr?'Address: '+e.addr:(e.desc||''),status:'Considering',votes:{}});made.opts.push([g.id,id]);e._ref={k:'opt',id,gid:g.id};n++}
   else{const id=uuid();D().shortlist.unshift({id,name:e.name,area:e.area||'',category:(e.cat&&e.cat!=='Stay')?e.cat:'Other',done:false,favorite:!!e.must,link,notes:e.desc||(e.date&&e.dest==='idea'?('Date: '+fmtDay(e.date)+(e.start?' '+T12(e.start):'')):''),place:e.addr||'',interest:e.interest.slice(),place_id:e.pin?e.pin.placeId||null:null,lat:e.pin?e.pin.lat:null,lng:e.pin?e.pin.lng:null,address:e.pin?e.pin.address||null:null,maps_url:e.pin?e.pin.mapsUrl||null:null});made.ideas.push(id);e._ref={k:'idea',id};n++}})});
 enrichAfter(entries);
 return {n,made}}
function putStay(s){
 const link=s.link||'',addr=s.addr||s.place||'',area=s.area||'',H=window.__hub,id=uuid();
 const fields={};if(area)fields.area=area;if(addr)fields.address=addr;if(link)fields.link=link;
 const row={id,trip_id:A.tripId,scope:'group',section:'stay',title:s.name,notes:'',fields,pinned:Object.keys(fields)};
 if(A.user&&A.user.id)row.owner_id=A.user.id;
 if(H&&H.INFO)H.INFO.rows.push(Object.assign({created_at:new Date().toISOString()},row));
 Promise.resolve(A.client.from('quest_info').upsert(row)).then(r=>{
  if(r&&r.error){toast('Couldn’t save to Essentials: '+r.error.message);if(H&&H.INFO)H.INFO.rows=H.INFO.rows.filter(x=>x.id!==id);render()}
  else if(H&&H.loadInfo)H.loadInfo().then(()=>render())}).catch(()=>{});
 return {prev:{id},mode:'info'}}
function restoreStay(prev){const H=window.__hub;if(!prev||!prev.id)return;
 if(H&&H.INFO)H.INFO.rows=H.INFO.rows.filter(x=>x.id!==prev.id);
 Promise.resolve(A.client.from('quest_info').delete().eq('id',prev.id)).catch(()=>{});render()}
function enrichAfter(entries){
 const q=window.__q19;if(!q||!q.getInfo)return;
 entries.filter(e=>e.link&&e._ref&&e.dest!=='skip').forEach(e=>{
  q.getInfo(e.link).then(info=>{if(!info)return;const r=e._ref;
   mut(()=>{
    if(r.k==='stay'){const H=window.__hub,row=H&&H.INFO.rows.find(x=>x.id===r.id);if(row){row.fields=Object.assign({},row.fields);if(!row.fields.address&&info.address)row.fields.address=info.address;if(!row.fields.area&&info.area)row.fields.area=info.area;row.pinned=Object.keys(row.fields);A.client.from('quest_info').upsert({id:row.id,trip_id:row.trip_id,scope:row.scope,section:row.section,title:row.title,notes:row.notes||'',fields:row.fields,pinned:row.pinned});render()}}
    else if(r.k==='plan'){const p=D().plans.find(x=>x.id===r.id);if(!p)return;if(!p.place&&info.address)p.place=info.address;if(e.nameless&&info.name)p.name=info.name;if(!p.area&&info.area)p.area=info.area}
    else if(r.k==='idea'){const p=D().shortlist.find(x=>x.id===r.id);if(!p)return;if(!p.place&&info.address)p.place=info.address;if(e.nameless&&info.name){p.name=info.name;p.category=catOf(info.name+' '+(info.area||''))}if(!p.area&&info.area)p.area=info.area}
    else if(r.k==='opt'){const g=D().groups.find(x=>x.id===r.gid),o=g&&g.options.find(x=>x.id===r.id);if(!o)return;if(e.nameless&&info.name)o.name=info.name;if(!o.area&&info.area)o.area=info.area;if(info.address&&!/Address:/.test(o.notes||''))o.notes=((o.notes?o.notes+' · ':'')+'Address: '+info.address)}
   })}).catch(()=>{})})}
function undoMade(m){mut(()=>{const d=D();d.plans=d.plans.filter(p=>!m.plans.includes(p.id));d.shortlist=d.shortlist.filter(x=>!m.ideas.includes(x.id));m.opts.forEach(([gid,oid])=>{const g=d.groups.find(x=>x.id===gid);if(g)g.options=g.options.filter(o=>o.id!==oid)});d.groups=d.groups.filter(g=>!m.groups.includes(g.id));(m.keen||[]).forEach(([id,mm])=>{const it=d.shortlist.find(x=>x.id===id);if(it)it.interest=it.interest.filter(x=>x!==mm)});(m.stays||(m.stay?[m.stay]:[])).forEach(x=>restoreStay(x.prev))})}
function done(r,label){if(!r.n){toast('Nothing to add');return}const sm=r.made.stay?(r.made.stayMode==='note'?'Added to Essentials notes':'Saved to Essentials'):'';toastUndo((r.n===1&&sm)?sm:(label||('Added '+r.n+(r.n===1?' item':' items'))),()=>undoMade(r.made))}

/* ---- default destination chips ---- */
const DESTS=e=>{const a=[['itin','Itinerary'],['idea',e.dup?'Add anyway':(e.match?'Separate idea':'Idea')]];
 if(e.isStay)a.unshift(['stay','Essentials · Stay']);
 if(e.match)a.push(['opt','Compare with '+e.match.name]);
 if(e.dup&&e.explicit&&e.interest.length&&e.dup.kind==='idea')a.push(['keen','Mark '+first(pName(e.interest[0]))+' keen']);
 a.push(['skip','Skip']);return e.dup?a.filter(x=>x[0]!=='itin'):a};
function applyDefaults(e,prev){
 if(e.dup){e.flag='Already in '+e.dup.where+': '+e.dup.name;if(e.explicit&&e.interest.length&&e.dup.kind==='idea'){e.dest='keen';e.keenOf=e.dup.id}else e.dest='skip'}

 if(prev){if(prev.dest&&(prev.dest!=='skip'||e.dup))e.dest=prev.dest;if(prev.tent!=null)e.tent=prev.tent;if(prev.must!=null)e.must=prev.must;if(prev.date)e.date=prev.date;if(prev.pin)e.pin=prev.pin;if(e.dest==='opt'&&e.match)e.optOf=e.match.id;if(e.dest==='keen'&&e.dup)e.keenOf=e.dup.id}
 return e}
function setDest(e,d){e.dest=d;if(d==='opt'&&e.match)e.optOf=e.match.id;if(d==='keen'&&e.dup)e.keenOf=e.dup.id;if(d==='itin'&&!e.date)e.date=U.date||tripDates()[0]}

/* ---- sheet ---- */
const Q={open:false,text:'',entries:[]};
let host=null;
const dayOpts=sel=>tripDates().map(d=>`<option value="${d}" ${d===sel?'selected':''}>${esc(fmtDay(d))}</option>`).join('');
function rowHtml(e,i){
 const when=[e.date?fmtDay(e.date):'',e.start?T12(e.start)+(e.end?'–'+T12(e.end):''):''].filter(Boolean).join(' · ');
 const det=[e.area,when,e.interest.length&&e.interest[0]!==A.me?first(pName(e.interest[0]))+' is keen':'',e.desc].filter(Boolean).join(' · ');
 const chips=DESTS(e).map(([k,l])=>`<button type="button" class="q28-c${e.dest===k?' on':''}" data-q28="dest" data-i="${i}" data-v="${k}">${esc(l)}</button>`).join('');
 const extra=e.dest==='itin'?`<label class="q28-c tog${e.tent?' on':''}"><input type="checkbox" data-q28="tent" data-i="${i}" ${e.tent?'checked':''}><span>Tentative</span></label><select class="q28-day" data-q28="day" data-i="${i}" aria-label="Day">${dayOpts(e.date)}</select>`:e.dest==='idea'?`<label class="q28-c tog${e.must?' on':''}"><input type="checkbox" data-q28="must" data-i="${i}" ${e.must?'checked':''}><span>★ Must-do</span></label>`:'';
 const stayWarn='';
 const warn=stayWarn+(e.flag?`<div class="q28-w">${esc(e.flag)}</div>`:'')+e.notes.map(n=>`<div class="q28-w">${esc(n)}</div>`).join('')+(e.match&&e.dest!=='opt'&&!e.dup?`<div class="q28-w">Looks related to “${esc(e.match.name)}”. Compare with it, or keep it separate.</div>`:'');
 return `<div class="q28-row${e.dest==='skip'?' skip':''}${warn?' flagged':''}"><div class="q28-n">${esc(e.dest==='keen'&&e.dup?e.dup.name:e.name)}${e.link?' <span class="q28-l">link</span>':''}</div>${det?`<div class="q28-d">${esc(det)}</div>`:''}<div class="q28-cs">${chips}${extra}</div>${pinHtml(e,i)}${warn}</div>`}
function pinHtml(e,i){if(e.dest!=='itin'&&e.dest!=='idea')return'';
 if(e.pin)return`<div class="q28-pin"><span>📍 <b>${esc(e.pin.name||'On the map')}</b>${e.pin.address?' · '+esc(e.pin.address):''}</span>${e.pin.mapsUrl?`<a class="q28-c" href="${esc(e.pin.mapsUrl)}" target="_blank" rel="noopener">View on map</a>`:''}<button type="button" class="q28-c" data-q28="unpin" data-i="${i}">Remove pin</button></div>`;
 const f=e.pf;if(!f)return`<div class="q28-pin"><button type="button" class="q28-c" data-q28="pf" data-i="${i}">📍 Link on map</button></div>`;
 if(f.busy)return`<div class="q28-pin"><span class="q28-pw">Finding it on the map…</span></div>`;
 return`<div class="q28-pin q28-pl"><div class="q28-pt">${f.err?esc(f.err):f.res.length?'Which one is it?':'Nothing found. You can still add it without a pin.'}</div>${(f.res||[]).map((x,n)=>`<button type="button" class="q28-pc" data-q28="pfpick" data-i="${i}" data-n="${n}"><b>${esc(x.name)}</b><small>${esc(x.address||'')}</small></button>`).join('')}<button type="button" class="q28-c" data-q28="pfx" data-i="${i}">Not now</button></div>`}
async function pfFind(i){const e=Q.entries[i];if(!e)return;const c=window.__q43;e.pf={busy:true};paint(false);
 const r=c?await c.call(Object.assign({action:'text',query:String(e.name||'').slice(0,160)},c.ctx())):{error:'offline'};if(Q.entries.indexOf(e)<0)return;
 if(r.error){e.pf={res:[],err:r.error==='limit'?'Map search is resting for now. You can still add it.':'Map search isn’t available right now. You can still add it.'};paint(false);return}
 const res=(r.places||[]).filter(x=>x.lat!=null&&x.lng!=null).slice(0,4);
 if(res.length===1){const c0=res[0];e.pin={placeId:c0.placeId||null,lat:c0.lat,lng:c0.lng,address:c0.address||'',mapsUrl:c0.mapsUrl||'',name:c0.name};e.pf=null;if(!e.addr&&c0.address)e.addr=c0.address;paint(false);return}
 e.pf={res};paint(false)}
function bodyHtml(){
 const n=Q.entries.filter(e=>e.dest!=='skip').length,fl=Q.entries.filter(e=>e.flag||e.notes.length||(e.match&&e.dest!=='opt')).length;
 return `<div class="q28-list">${Q.entries.map(rowHtml).join('')||'<div class="q28-empty">Where each item will go appears here.</div>'}</div>${fl?`<div class="q28-note">${fl} ${fl===1?'item needs':'items need'} a look.</div>`:''}<div class="q28-foot"><button type="button" class="primary" data-q28="add" ${n?'':'disabled'}>Add ${n||''}</button></div>`}
function shellHtml(){
 return `<div class="q28-back" data-q28="close"></div><div class="q28-sheet" role="dialog" aria-label="Quick Add"><div class="q28-top"><strong>Quick Add</strong><button type="button" class="q28-x" data-q28="close" aria-label="Close">✕</button></div><textarea id="q28_text" data-keep rows="5" autocomplete="off" autocapitalize="sentences" placeholder="Type, paste or dictate. Lists and messy notes are fine.\nExample: We definitely want color analysis. Maybe pottery. Ethan wants Korean BBQ. Makeup lesson Nov 19 at 2pm.">${esc(Q.text)}</textarea><div class="q28-hint">Anything with a date goes to your itinerary. The rest goes to Ideas. You can change any row below.</div><div id="q28_body">${bodyHtml()}</div></div>`}
/* the text box is built once and never replaced while you type, so the keyboard stays smooth */
function paint(){if(!host){host=document.createElement('div');host.id='q28';document.body.appendChild(host)}
 host.className=Q.open?'on':'';if(!Q.open){host.innerHTML='';return}
 if(!document.getElementById('q28_text'))host.innerHTML=shellHtml();
 else{const b=document.getElementById('q28_body');if(b)b.innerHTML=bodyHtml()}}
function reparse(){const prev={};Q.entries.forEach(e=>{prev[e.raw]=e});Q.entries=parseAll(Q.text,{day:null}).map(e=>applyDefaults(e,prev[e.raw]&&{dest:prev[e.raw].dest,tent:prev[e.raw].tent,must:prev[e.raw].must,date:prev[e.raw].date,pin:prev[e.raw].pin}))}
function openSheet(text){Q.open=true;if(text!=null)Q.text=text;reparse();paint();{const t=document.getElementById('q28_text');if(t&&text!=null)t.value=Q.text}document.body.classList.add('q28-lock');setTimeout(()=>{const t=document.getElementById('q28_text');if(t)t.focus()},30)}
function closeSheet(){Q.open=false;paint();document.body.classList.remove('q28-lock')}
let tm=0;
document.addEventListener('input',e=>{const t=e.target;if(t&&t.id==='q28_text'){Q.text=t.value;clearTimeout(tm);tm=setTimeout(()=>{reparse();paint()},320);return}
 if(t&&(t.id==='quick'||t.id==='shortquick')){clearTimeout(tm);tm=setTimeout(()=>inlinePreview(t),160)}});
document.addEventListener('change',e=>{const t=e.target,k=t&&t.dataset&&t.dataset.q28;if(!k)return;const i=+t.dataset.i,x=Q.entries[i];if(!x)return;
 if(k==='tent')x.tent=t.checked;if(k==='must')x.must=t.checked;if(k==='day'){x.date=t.value}
 paint(false)});
window.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-q28],#q28fab,[data-q28i]'):null;if(!b)return;
 if(b.id==='q28fab'){e.preventDefault();e.stopPropagation();openSheet(null);return}
 const k=b.dataset.q28;
 if(b.dataset.q28i){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();inlineClick(b);return}
 if(k==='close'){e.preventDefault();closeSheet();return}
 if(k==='dest'){e.preventDefault();const x=Q.entries[+b.dataset.i];if(x){setDest(x,b.dataset.v);paint(false)}return}
 if(k==='pf'){e.preventDefault();pfFind(+b.dataset.i);return}
 if(k==='pfx'){e.preventDefault();const x=Q.entries[+b.dataset.i];if(x){x.pf=null;paint(false)}return}
 if(k==='unpin'){e.preventDefault();const x=Q.entries[+b.dataset.i];if(x){x.pin=null;x.pf=null;paint(false)}return}
 if(k==='pfpick'){e.preventDefault();const x=Q.entries[+b.dataset.i],c=x&&x.pf&&x.pf.res&&x.pf.res[+b.dataset.n];if(c){x.pin={placeId:c.placeId||null,lat:c.lat,lng:c.lng,address:c.address||'',mapsUrl:c.mapsUrl||'',name:c.name};x.pf=null;if(!x.addr&&c.address)x.addr=c.address;paint(false)}return}
 if(k==='add'){e.preventDefault();const r=commit(Q.entries);Q.text='';Q.entries=[];closeSheet();done(r);return}
},true);

/* ---- floating + ---- */
function fab(){let f=document.getElementById('q28fab');
 const show=U.screen==='trip'&&(U.tab==='trip'||U.tab==='shortlist')&&!Q.open&&!U.modal&&!(U.edit);
 if(!f){f=document.createElement('button');f.id='q28fab';f.type='button';f.setAttribute('aria-label','Quick Add');f.innerHTML='<span class="q28-plus">+</span><span class="q28-lab">Quick add</span>';document.body.appendChild(f)}
 f.style.display=show?'flex':'none'}
{const _r=window.render;if(typeof _r==='function')window.render=function(){const r=_r.apply(this,arguments);try{fab();inlineSetup()}catch(e){}return r}}

/* ---- inline preview under the two add boxes ---- */
const INL={};  /* per box overrides */
function boxCtx(id){return id==='quick'?{itinDefault:true,day:U.date}:{}}
function native(id){return id==='quick'?'itin':'idea'}
function inlineSetup(){
 [['quick','.quickline'],['shortquick','.short-top']].forEach(([id,sel])=>{
  const inp=document.getElementById(id);if(!inp)return;const box=inp.closest(sel)||inp.parentElement;if(!box)return;
  let pv=box.parentElement.querySelector('.q28-pv[data-for="'+id+'"]');
  if(!pv){pv=document.createElement('div');pv.className='q28-pv';pv.dataset.for=id;box.insertAdjacentElement('afterend',pv)}
  if(inp.value)inlinePreview(inp);else pv.innerHTML=''})}
function curInline(id){const inp=document.getElementById(id);if(!inp||!inp.value.trim())return null;
 const es=parseAll(inp.value,boxCtx(id));if(es.length!==1)return es.length>1?{multi:es.length}:null;
 const e=applyDefaults(es[0],null);const o=INL[id];
 if(o&&o.raw===inp.value.trim()){if(o.dest)setDest(e,o.dest);if(o.tent!=null)e.tent=o.tent;if(o.must!=null)e.must=o.must}
 else if(id==='quick'&&e.dest==='idea'&&!e.maybe&&!e.dup){e.dest='itin';e.date=e.date||U.date}
 else if(id==='shortquick'&&e.dest==='itin'&&false){}
 return e}
function inlineHtml(id,e){
 if(!e)return '';
 if(id==='quick'&&!e.multi&&e.dest==='itin'&&!e.flag&&!(e.notes||[]).length)return '';
 if(e.multi)return `<div class="q28-pvr"><span>${e.multi} items found.</span> <button type="button" class="q28-c" data-q28i="sheet" data-for="${id}">Review them in Quick Add</button></div>`;
 const where=e.dest==='itin'?'Itinerary · '+[fmtDay(e.date||U.date),e.start?T12(e.start)+(e.end?'–'+T12(e.end):''):''].filter(Boolean).join(' · '):e.dest==='opt'?'Compare with '+e.match.name:e.dest==='stay'?'Essentials · Stay':e.dest==='keen'?'Mark '+first(pName(e.interest[0]))+' keen on '+e.dup.name:e.dest==='skip'?'Not added':'Ideas'+(e.cat&&e.cat!=='Other'?' · '+e.cat:'');
 const chips=DESTS(e).filter(([k])=>k!=='skip'||e.dup).map(([k,l])=>`<button type="button" class="q28-c${e.dest===k?' on':''}" data-q28i="dest" data-for="${id}" data-v="${k}">${esc(l)}</button>`).join('');
 const tg=e.dest==='itin'?`<button type="button" class="q28-c tog${e.tent?' on':''}" data-q28i="tent" data-for="${id}">Tentative</button>`:e.dest==='idea'?`<button type="button" class="q28-c tog${e.must?' on':''}" data-q28i="must" data-for="${id}">★ Must-do</button>`:'';
 const sug=(e.match&&!e.dup&&e.dest==='idea'&&!(INL[id]&&INL[id].nm))?`<div class="q28-sug"><span>Compare with <b>${esc(e.match.name)}</b>?</span><button type="button" class="q28-c on" data-q28i="dest" data-for="${id}" data-v="opt">Compare</button><button type="button" class="q28-c" data-q28i="nm" data-for="${id}">Keep separate</button></div>`:'';
 const w=sug+(e.flag?`<div class="q28-w">${esc(e.flag)}</div>`:'')+''+e.notes.map(n=>`<div class="q28-w">${esc(n)}</div>`).join('');
 return `<div class="q28-pvr"><span class="q28-goes">Goes to: <b>${esc(where)}</b></span><div class="q28-cs">${chips}${tg}</div>${w}</div>`}
function inlinePreview(inp){const id=inp.id,pv=document.querySelector('.q28-pv[data-for="'+id+'"]');if(!pv)return;
 const e=curInline(id);window.__q28cur=window.__q28cur||{};window.__q28cur[id]=e;pv.innerHTML=inlineHtml(id,e)}
function inlineClick(b){const id=b.dataset.for,inp=document.getElementById(id);const a=b.dataset.q28i;
 if(a==='sheet'){const t=inp?inp.value:'';if(inp)inp.value='';const pv=document.querySelector('.q28-pv[data-for="'+id+'"]');if(pv)pv.innerHTML='';openSheet(t);return}
 if(!inp)return;const raw=inp.value.trim();const o=INL[id]&&INL[id].raw===raw?INL[id]:(INL[id]={raw});
 const e=curInline(id);if(!e||e.multi)return;
 if(a==='nm')o.nm=true;if(a==='dest')o.dest=b.dataset.v;if(a==='tent')o.tent=!e.tent;if(a==='must')o.must=!e.must;
 inlinePreview(inp)}
/* Add button / Enter: use the original handlers unless the destination changed */
function intercept(id,ev){const inp=document.getElementById(id);if(!inp||!inp.value.trim())return false;
 const es=parseAll(inp.value,boxCtx(id));
 if(es.length>1){ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();const t=inp.value;inp.value='';const pv=document.querySelector('.q28-pv[data-for="'+id+'"]');if(pv)pv.innerHTML='';openSheet(t);return true}
 const e=curInline(id);if(!e)return false;
 const nat=native(id),sameDay=id!=='quick'||!e.date||e.date===U.date;
 const needs=e.dest!==nat||(e.dest==='itin'&&(!sameDay||e.tent))||(e.dest==='idea'&&e.must)||e.dest==='opt'||e.dest==='skip'||e.renamed;
 if(!needs)return false;
 ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
 if(e.dest==='skip'){toast('Already there. Pick another place or edit the name.');return true}
 const text=inp.value;inp.value='';INL[id]=null;const pv=document.querySelector('.q28-pv[data-for="'+id+'"]');if(pv)pv.innerHTML='';
 const r=commit([e]);done(r,'Added to '+(e.dest==='itin'?'Itinerary':e.dest==='opt'?'Compare':'Ideas'));return true}
window.addEventListener('paste',e=>{const t=e.target;if(!t||(t.id!=='quick'&&t.id!=='shortquick'))return;
 const txt=(e.clipboardData&&e.clipboardData.getData('text'))||'';if(!txt||(txt.indexOf('\n')<0&&(txt.match(/https?:\/\/\S+/g)||[]).length<2))return;
 if(parseAll(txt,{}).length<2)return;e.preventDefault();e.stopImmediatePropagation();openSheet(txt)},true);
window.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-act="quick-add"],[data-act="short-add"]'):null;if(!b)return;intercept(b.dataset.act==='quick-add'?'quick':'shortquick',e)},true);
window.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.shiftKey)return;const t=e.target;if(!t||(t.id!=='quick'&&t.id!=='shortquick'))return;intercept(t.id,e)},true);
window.__q28={putStay,restoreStay,STAYRX,catOf,parseAll,openSheet};
})();
