/* v39: Settle, the bill splitter inside Quest (replaces the bill-e tab).
   Trip-scoped expenses + repayments, per-currency balances, smart settle-up suggestions,
   multi-expense entry, Equal / Amounts / Shares / Itemize, repayment popup with proof, payment details. */
(function(){
'use strict';
const TAB='bill';
const CURS={PHP:['₱',2],USD:['$',2],KRW:['₩',0],JPY:['¥',0],EUR:['€',2],CAD:['CA$',2],SGD:['S$',2],THB:['฿',2],GBP:['£',2],AUD:['A$',2]};
const CUR_LIST=Object.keys(CURS);
const dec=c=>(CURS[c]||['',2])[1],sym=c=>(CURS[c]||[c+' '])[0],F=c=>dec(c)?100:1;
const money=(m,c)=>{const neg=m<0;m=Math.abs(m);const v=m/F(c);const s=v.toLocaleString('en-US',{minimumFractionDigits:dec(c)&&m%100?2:0,maximumFractionDigits:dec(c)});return(neg?'-':'')+sym(c)+s};
/* integer minor units, string based so 1.005 style floats never creep in */
function toMinor(s,c){s=String(s==null?'':s).replace(/[,\s]/g,'');if(!/^\d*\.?\d*$/.test(s)||s===''||s==='.')return 0;const d=dec(c),p=s.split('.'),w=p[0]||'0',f=p[1]||'';let n=Number(w)*F(c)+(d?Number((f+'00').slice(0,d)):0);if(f.length>d&&f[d]>='5')n++;return n}
const toStr=(m,c)=>dec(c)?(m/100).toFixed(2).replace(/\.00$/,''):String(m);
function allocate(total,w){const S=w.reduce((a,b)=>a+b,0);if(!S)return w.map(()=>0);const b=w.map(x=>Math.floor(total*x/S));let r=total-b.reduce((a,c)=>a+c,0);const o=w.map((x,i)=>[(total*x)%S,i]).sort((a,c)=>c[0]-a[0]||a[1]-c[1]);for(let k=0;k<r;k++)b[o[k][1]]++;return b}
const people=()=>A.people||[],me=()=>A.me;
const nm=id=>{const p=people().find(x=>x.id===id);return p?p.name:'Someone'};
const who=id=>id===me()?'You':nm(id);
const letter=i=>i<26?String.fromCharCode(65+i):String(i+1);
const dateStr=t=>{try{return new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric'})}catch(e){return ''}};
const ST={rows:[],methods:[],ch:null,chTrip:null,trip:null,rates:{}};
let X=null,SH=null;/* X: add/edit expense sheet state, SH: other sheets */

/* ---------- trip currency settings (stored in trip details.settle) ---------- */
function cfg(){let c={};try{c=JSON.parse((D().details||{}).settle||'{}')||{}}catch(e){}
 const cur=CURS[c.cur]?c.cur:'PHP';let a=CURS[c.a]?c.a:cur,b=CURS[c.b]?c.b:(cur==='KRW'?'PHP':'KRW');if(a===b)b=a==='KRW'?'PHP':'KRW';
 return{cur,a,b,rate:+c.rate>0?+c.rate:0}}
function rateInfo(){const c=cfg();if(c.rate)return{r:c.rate,manual:true,a:c.a,b:c.b};
 const k=c.a+c.b,v=ST.rates[k];if(v)return{r:v.r,date:v.date,a:c.a,b:c.b};
 if(v===undefined){ST.rates[k]=null;(async()=>{try{const l=JSON.parse(localStorage.getItem('qstr_'+k)||'null');if(l&&Date.now()-l.t<6*36e5){ST.rates[k]=l;liveUi();return}}catch(e){}
  try{const r=await fetch('https://api.frankfurter.dev/v1/latest?base='+c.a+'&symbols='+c.b);const j=await r.json();if(j&&j.rates&&j.rates[c.b]){const o={r:j.rates[c.b],date:j.date,t:Date.now()};ST.rates[k]=o;try{localStorage.setItem('qstr_'+k,JSON.stringify(o))}catch(e){}liveUi()}}catch(e){}})()}
 return null}
function conv(minor,cur){const c=cfg();if(!minor||(cur!==c.a&&cur!==c.b))return'';const ri=rateInfo();if(!ri)return'';
 const to=cur===c.a?c.b:c.a,major=minor/F(cur),out=cur===c.a?major*ri.r:major/ri.r,om=Math.round(out*F(to));
 return'≈ '+money(om,to)+' · 1 '+c.a+' = '+(+ri.r.toPrecision(5))+' '+c.b+' · '+(ri.manual?'manual rate':dateStr(ri.date))}
function liveUi(){if(X)['main'].concat((X.staged||[]).map((_,i)=>String(i))).forEach(upd)}

/* ---------- data ---------- */
async function load(){if(!A.client||!A.tripId||!A.user)return;
 try{const[a,b]=await Promise.all([A.client.from('quest_ledger').select('*').eq('trip_id',A.tripId).order('created_at'),A.client.from('quest_payment_methods').select('*').order('created_at')]);
  if(!a.error){ST.rows=a.data||[];ST.trip=A.tripId}if(!b.error)ST.methods=b.data||[]}catch(e){}
 sub();if(U.tab===TAB&&U.screen==='trip')render()}
function sub(){if(!A.client||ST.chTrip===A.tripId||!A.client.channel)return;
 try{if(ST.ch)A.client.removeChannel(ST.ch);ST.chTrip=A.tripId;
  ST.ch=A.client.channel('quest_ledger_'+A.tripId).on('postgres_changes',{event:'*',schema:'public',table:'quest_ledger',filter:'trip_id=eq.'+A.tripId},()=>load()).on('postgres_changes',{event:'*',schema:'public',table:'quest_payment_methods'},()=>load()).subscribe()}catch(e){}}
let lastTrip=null;
{const _r=window.render;window.render=function(){if(A.tripId&&U.screen==='trip'&&lastTrip!==A.tripId){lastTrip=A.tripId;ST.rows=[];setTimeout(load,0)}return _r.apply(this,arguments)}}

/* ---------- nav + screen ---------- */
{const n=NAV.find(x=>x[0]===TAB);if(n){n[2]='Settle';n[1]='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.3c-.5-.8-1.5-1.3-2.6-1.3-1.5 0-2.5.8-2.5 1.9 0 2.6 5 1.3 5 3.8 0 1.2-1.1 2-2.6 2-1.3 0-2.3-.5-2.8-1.5M12 6.5V8M12 16v1.5"/></svg>'}}
{const _b=window.bill;window.bill=function(){return U.tab===TAB?settleHtml():_b.apply(this,arguments)}}

function nets(){const by={};ST.rows.forEach(r=>{const n=by[r.currency]||(by[r.currency]={}),add=(id,v)=>{n[id]=(n[id]||0)+v};
 if(r.kind==='expense'){add(r.payer_id,r.amount_minor);Object.keys(r.shares||{}).forEach(id=>add(id,-r.shares[id]))}
 else{add(r.payer_id,r.amount_minor);add(r.payee_id,-r.amount_minor)}});return by}
function matches(n){const d=[],c=[];Object.keys(n).forEach(id=>{const v=n[id];if(v<0)d.push([id,-v]);else if(v>0)c.push([id,v])});
 const srt=(a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:1);d.sort(srt);c.sort(srt);const out=[];let i=0,j=0;
 while(i<d.length&&j<c.length){const x=Math.min(d[i][1],c[j][1]);out.push({from:d[i][0],to:c[j][0],amt:x});d[i][1]-=x;c[j][1]-=x;if(!d[i][1])i++;if(!c[j][1])j++}return out}

function balancesHtml(){
 const by=nets();
 if(!ST.rows.length)return'<div class="qst-empty"><b>No expenses yet</b><span>Add one and Quest keeps track of who owes who.</span></div>';
 const curs=Object.keys(by),multi=curs.length>1;
 return curs.map(c=>{const ms=matches(by[c]),mine=ms.filter(m=>m.from===me()||m.to===me()),n=by[c][me()]||0,a=Math.abs(n);
  const line=m=>m.from===me()?`<div class="qst-bl owe"><span>You owe <b>${esc(nm(m.to))}</b> ${money(m.amt,c)}</span><button type="button" class="qst-settle" data-qst="pay" data-from="${m.from}" data-to="${m.to}" data-amt="${m.amt}" data-cur="${c}">Settle</button></div>`:`<div class="qst-bl due"><span><b>${esc(nm(m.from))}</b> owes you ${money(m.amt,c)}</span></div>`;
  return`<div class="qst-bal"><div class="qst-hero ${n>0?'up':n<0?'down':'even'}"><small>Your balance${multi?' · '+c:''}</small><strong>${n>0?'+':n<0?'−':''}${money(a,c)}</strong><span>${n>0?'You’re up. You’re owed overall':n<0?'You’re down. You owe overall':'All settled up ✓'}</span></div>${mine.map(line).join('')}</div>`}).join('')}
function openDet(){SH={type:'det'};X=null;paintDet()}
function paintDet(){const by=nets();let body=Object.keys(by).map(c=>{const ms=matches(by[c]),ppl=Object.keys(by[c]).filter(id=>by[c][id]!==0).sort((a,b)=>by[c][b]-by[c][a]);
  return`<div class="qst-dc"><h4>${c}</h4>${ms.length?ms.map(m=>`<div class="qst-bl oth"><span>${m.from===me()?'<b>You</b> owe':'<b>'+esc(nm(m.from))+'</b> owes'} ${m.to===me()?'<b>you</b>':'<b>'+esc(nm(m.to))+'</b>'} ${money(m.amt,c)}</span></div>`).join(''):'<div class="qst-bl ok"><span>Everyone is settled up ✓</span></div>'}${ppl.length?`<div class="qst-nets">${ppl.map(id=>`<span>${esc(who(id))} <b class="${by[c][id]>0?'pos':'neg'}">${by[c][id]>0?'+':'−'}${money(Math.abs(by[c][id]),c)}</b></span>`).join('')}</div>`:''}</div>`}).join('')||'<p class="qst-none">Nothing to show yet.</p>';
 mount(`<div class="qst-back" data-qst="close"></div><div class="qst-sheet qst-small" role="dialog" aria-label="Who owes who"><div class="qst-stop"><strong>Who owes who</strong><button type="button" class="qst-x" data-qst="close" aria-label="Close">✕</button></div>${body}</div>`,'on')}

function entryHtml(r){
 const edited=r.updated_at&&r.created_at&&new Date(r.updated_at)-new Date(r.created_at)>2500;
 const btn=`<button type="button" data-qst="edit" data-id="${r.id}">Edit</button><button type="button" data-qst="del" data-id="${r.id}">Delete</button>${edited?`<button type="button" data-qst="chg" data-id="${r.id}">Changes</button>`:''}`;
 if(r.kind==='payment'){return`<article class="qst-h pay"><div class="qst-hm"><strong>${esc(who(r.payer_id)==='You'?'You':nm(r.payer_id))} paid ${esc(r.payee_id===me()?'you':nm(r.payee_id))}</strong><span>${money(r.amount_minor,r.currency)}</span></div><small>${dateStr(r.created_at)}${edited?' · edited':''}${r.proof_path?` · <button type="button" class="qst-lnk" data-qst="proof" data-path="${esc(r.proof_path)}">Proof</button>`:''}</small><div class="qst-ha">${btn}</div></article>`}
 const ids=Object.keys(r.shares||{}).filter(k=>r.shares[k]>0),mode={equal:'split equally',amounts:'custom amounts',shares:'split by shares',itemize:'itemized'}[r.split_mode]||'';
 const itn=r.split_mode==='itemize'&&Array.isArray(r.items)?` (${r.items.length} items)`:'';
 return`<article class="qst-h"><div class="qst-hm"><strong>${esc(r.title)}</strong><span>${money(r.amount_minor,r.currency)}</span></div><small>${esc(who(r.payer_id)==='You'?'You':nm(r.payer_id))} paid · ${mode}${itn} · ${esc(ids.map(who).join(', '))} · ${dateStr(r.created_at)}${edited?' · edited':''}</small><div class="qst-ha">${btn}</div></article>`}

function settleHtml(){
 const t=D().trip||{};
 return`<div class="qst-wrap"><div class="qst-top"><div><h2>Settle</h2><p>Who owes who on this trip. Quest keeps the tally; it never moves money.</p></div><div class="qst-tools"><button type="button" data-qst="pm" aria-label="My payment details">My details</button><button type="button" data-qst="cfg" aria-label="Currency settings">Currency</button></div></div>
 <section class="panel qst-card"><div class="qst-ch"><h3>Balances</h3>${ST.rows.length?`<button type="button" class="qst-dt" data-qst="details">details</button>`:''}</div>${balancesHtml()}</section>
 <section class="panel qst-card"><h3>History</h3>${ST.rows.length?[...ST.rows].reverse().map(entryHtml).join(''):'<p class="qst-none">Expenses and repayments will show up here.</p>'}</section>
 ${t.billUrl&&url(t.billUrl)?`<p class="qst-bille"><a href="${esc(url(t.billUrl))}" target="_blank" rel="noopener noreferrer">Open the old bill-e group ↗</a></p>`:''}<button type="button" class="qst-fab" data-qst="add" aria-label="Add expense"><span>＋</span> Expense</button></div>`}

/* ---------- expense form state ---------- */
function fresh(o){return Object.assign({id:uuid(),text:'',title:'',amount:'',cur:cfg().cur,payer:me()||(people()[0]||{}).id,who:people().map(p=>p.id),all:true,mode:'equal',manual:{},wts:{},items:[],active:null,col:{},planId:null},o||{})}
const newItem=()=>({id:uuid(),price:'',who:[],all:false});
const allIds=()=>people().map(p=>p.id);
/* smart entry: "Dinner 1200" or "1200 Dinner" (amount at the start or the end) */
function parseEntry(t){t=String(t||'').trim();const num='[₱$€£¥₩]?\\s?\\d[\\d,]*(?:\\.\\d+)?';let m=t.match(new RegExp('^(.*?)\\s+('+num+')$'));if(m&&m[1].trim())return{title:m[1].trim(),amount:m[2].replace(/[^\d.]/g,'')};
 m=t.match(new RegExp('^('+num+')\\s+(.+)$'));if(m)return{title:m[2].trim(),amount:m[1].replace(/[^\d.]/g,'')};
 m=t.match(new RegExp('^('+num+')$'));if(m)return{title:'',amount:m[1].replace(/[^\d.]/g,'')};return{title:t,amount:''}}
function sync(s){const p=parseEntry(s.text);s.title=p.title;if(s.mode!=='itemize')s.amount=p.amount}
function pickWho(o,id,keepEmpty){const N=allIds().length;if(id==='*'){o.all=true;o.who=allIds();return}
 if(o.all){o.all=false;o.who=[id];return}
 const i=o.who.indexOf(id);if(i>=0)o.who.splice(i,1);else o.who.push(id);
 if(o.who.length>=N){o.all=true;o.who=allIds()}else if(!o.who.length&&!keepEmpty){o.all=true;o.who=allIds()}}
function seed(s){if(!s.items.length){s.items=[newItem(),newItem()];s.active=s.items[0].id}}
const hasInput=s=>!!(s.text.trim()||s.title.trim()||s.amount.trim()||Object.keys(s.manual).some(k=>String(s.manual[k]).trim())||s.items.some(x=>x.price.trim()||x.who.length));
function norm(s){sync(s)}
function calc(s){
 const cur=s.cur,P0=people().map(p=>p.id),it=s.mode==='itemize',sh={};let total=0,P,status='',cls='',err='',rem=0,autos=[];
 if(it){total=s.items.reduce((a,x)=>a+toMinor(x.price,cur),0);P=P0.filter(id=>s.items.some(x=>x.who.includes(id)));
  s.items.forEach(x=>{const p=toMinor(x.price,cur),w=x.who.filter(id=>P0.includes(id));if(p>0&&w.length)allocate(p,w.map(()=>1)).forEach((v,i)=>{sh[w[i]]=(sh[w[i]]||0)+v})})}
 else{total=toMinor(s.amount,cur);P=P0.filter(id=>s.who.includes(id));
  if(s.mode==='equal'){allocate(total,P.map(()=>1)).forEach((v,i)=>{sh[P[i]]=v})}
  else if(s.mode==='shares'){allocate(total,P.map(id=>Math.max(1,parseInt(s.wts[id])||1))).forEach((v,i)=>{sh[P[i]]=v})}
  else{const fixed=P.filter(id=>String(s.manual[id]==null?'':s.manual[id]).trim()!==''),fs=fixed.reduce((a,id)=>a+toMinor(s.manual[id],cur),0);autos=P.filter(id=>!fixed.includes(id));rem=total-fs;
   fixed.forEach(id=>{sh[id]=toMinor(s.manual[id],cur)});if(autos.length)allocate(Math.max(rem,0),autos.map(()=>1)).forEach((v,i)=>{sh[autos[i]]=v});
   if(rem<0){status=money(-rem,cur)+' over';cls='bad'}else if(rem>0&&!autos.length){status=money(rem,cur)+' left to assign';cls='bad'}else{status='Balanced';cls='ok'}}}
 if(!s.title.trim())err='Add a description';
 else if(it){if(!s.items.length)err='Add an item';else{for(let i=0;i<s.items.length&&!err;i++){const x=s.items[i];if(toMinor(x.price,cur)<=0)err='Item '+letter(i)+' needs an amount';else if(!x.who.filter(id=>P0.includes(id)).length)err='Item '+letter(i)+' needs at least one person'}}}
 else if(total<=0)err='Enter an amount';else if(!P.length)err='Pick who it\'s split with';
 else if(s.mode==='amounts'&&(rem<0||(rem>0&&!autos.length)))err='Amounts don\'t add up: '+status;
 if(!err&&!s.payer)err='Pick who paid';
 if(!err&&Object.values(sh).reduce((a,b)=>a+b,0)!==total)err='Something doesn\'t add up';
 return{total,sh,P,status,cls,err,ok:!err,rem,autos}}
function meta(s,c){if(s.mode==='itemize')return s.items.map(x=>({id:x.id,price_minor:toMinor(x.price,s.cur),who:x.who.filter(id=>people().some(p=>p.id===id))}));
 if(s.mode==='shares'){const w={};c.P.forEach(id=>{w[id]=Math.max(1,parseInt(s.wts[id])||1)});return{wts:w}}
 if(s.mode==='amounts'){const f={};c.P.forEach(id=>{if(String(s.manual[id]==null?'':s.manual[id]).trim()!=='')f[id]=toMinor(s.manual[id],s.cur)});return{fixed:f}}return null}
function toRow(s){const c=calc(s);return{id:s.id,trip_id:A.tripId,kind:'expense',title:s.title.trim().slice(0,200),currency:s.cur,amount_minor:c.total,payer_id:s.payer,payee_id:null,split_mode:s.mode,shares:c.sh,items:meta(s,c),plan_id:s.planId||null,client_key:s.id,created_by:A.user.id}}
function fromRow(r){const s=fresh({id:r.id,title:r.title,cur:r.currency,payer:r.payer_id,mode:r.split_mode||'equal',planId:r.plan_id||null});const sh=r.shares||{},ids=Object.keys(sh);
 if(r.split_mode==='itemize'&&Array.isArray(r.items)){s.items=r.items.map(x=>({id:x.id||uuid(),price:toStr(x.price_minor,r.currency),who:x.who||[],all:allIds().length>0&&allIds().every(i=>(x.who||[]).includes(i))}));s.who=ids.length?ids:s.who;s.text=r.title}
 else{s.amount=toStr(r.amount_minor,r.currency);s.text=r.title+' '+s.amount;s.who=ids.filter(k=>sh[k]>=0);if(!s.who.length)s.who=people().map(p=>p.id);
  const m=r.items||{};if(r.split_mode==='shares'&&m.wts)s.wts=m.wts;
  if(r.split_mode==='amounts'){const f=m.fixed||sh;Object.keys(f).forEach(k=>{s.manual[k]=toStr(f[k],r.currency)})}}

 s.all=allIds().length>0&&allIds().every(i=>s.who.includes(i));return s}

/* ---------- overlay plumbing ---------- */
function host(){let h=document.getElementById('qst');if(!h){h=document.createElement('div');h.id='qst';document.body.appendChild(h);wire(h)}return h}
function closeAll(){X=null;SH=null;const h=document.getElementById('qst');if(h)h.remove()}
function focusKey(){const a=document.activeElement,h=document.getElementById('qst');if(!a||!h||!h.contains(a)||!a.dataset||!a.dataset.k)return null;let st=null;try{st=a.selectionStart}catch(e){}return{f:a.dataset.f,k:a.dataset.k,i:a.dataset.i||a.dataset.id||'',st}}
function refocus(fk){if(!fk)return;const h=document.getElementById('qst');if(!h)return;const e=[...h.querySelectorAll('[data-k]')].find(n=>n.dataset.f===fk.f&&n.dataset.k===fk.k&&(n.dataset.i||n.dataset.id||'')===fk.i);if(e){e.focus({preventScroll:true});try{if(fk.st!=null)e.setSelectionRange(fk.st,fk.st)}catch(x){}}}
function mount(html,cls){const h=host(),fk=focusKey(),old=h.querySelector('.qst-sheet'),sc=old?old.scrollTop:0;h.className=cls||'';h.innerHTML=html;const sheet=h.querySelector('.qst-sheet');if(sheet)sheet.scrollTop=sc;refocus(fk)}

/* ---------- expense sheet ---------- */
const S=f=>f==='main'?X.main:X.staged[+f];
function chipsHtml(o,f,i){const ix=i!=null?` data-i="${i}"`:'',k=i!=null?'iwho':'who';
 return`<div class="qst-chips"><button type="button" class="qst-chip${o.all?' on':''}" data-qst="${k}" data-f="${f}"${ix} data-id="*">All</button>${people().map(p=>`<button type="button" class="qst-chip${!o.all&&o.who.includes(p.id)?' on':''}" data-qst="${k}" data-f="${f}"${ix} data-id="${p.id}">${esc(who(p.id))}</button>`).join('')}</div>`}
function itemRow(s,x,i,f){
 if(s.col[x.id]){const p=toMinor(x.price,s.cur),w=x.who.map(who).join(', ');
  return`<button type="button" data-row="${x.id}" class="qst-isum${p>0&&x.who.length?'':' warn'}" data-qst="ireopen" data-f="${f}" data-i="${x.id}"><span>Item ${letter(i)}</span><b>${p>0?money(p,s.cur):'add amount'}</b><em>${w||'pick who'}</em><i>✎</i></button>`}
 return`<div class="qst-ir" data-row="${x.id}"><span class="qst-il">Item ${letter(i)}</span><input class="qst-in qst-ip" data-f="${f}" data-k="ip" data-i="${x.id}" inputmode="decimal" placeholder="0.00" value="${esc(x.price)}" aria-label="Item ${letter(i)} amount" autocomplete="off">${chipsHtmlItem(s,x,f)}${s.items.length>1?`<button type="button" class="qst-irm" data-qst="irm" data-f="${f}" data-i="${x.id}" aria-label="Remove item ${letter(i)}">✕</button>`:''}</div>`}
function chipsHtmlItem(s,x,f){return chipsHtml(x,f,x.id)}
function formHtml(s,f){
 const it=s.mode==='itemize',c=calc(s);
 let body='';
 if(it){body=`<div class="qst-items">${s.items.map((x,i)=>itemRow(s,x,i,f)).join('')}</div><button type="button" class="qst-ghost" data-qst="ia" data-f="${f}">＋ Add another item</button><div class="qst-per" data-per></div>`}
 else{const P=people().filter(p=>s.who.includes(p.id));
  if(!P.length)body='<p class="qst-none">Pick at least one person.</p>';
  else if(s.mode==='equal')body=`<div class="qst-rows">${P.map(p=>`<div class="qst-pr"><span>${esc(who(p.id))}</span><b data-calc="${p.id}"></b></div>`).join('')}</div>`;
  else if(s.mode==='shares')body=`<div class="qst-rows">${P.map(p=>`<div class="qst-pr"><span>${esc(who(p.id))}</span><span class="qst-step"><button type="button" data-qst="step" data-f="${f}" data-id="${p.id}" data-d="-1" aria-label="Fewer shares">−</button><b data-wt="${p.id}">${Math.max(1,parseInt(s.wts[p.id])||1)}</b><button type="button" data-qst="step" data-f="${f}" data-id="${p.id}" data-d="1" aria-label="More shares">＋</button></span><b data-calc="${p.id}"></b></div>`).join('')}</div>`;
  else body=`<div class="qst-rows">${P.map(p=>`<div class="qst-pr"><span>${esc(who(p.id))}</span><input class="qst-in qst-man" data-f="${f}" data-k="man" data-id="${p.id}" inputmode="decimal" placeholder="auto" value="${esc(s.manual[p.id]==null?'':s.manual[p.id])}" aria-label="${esc(who(p.id))} amount" autocomplete="off"></div>`).join('')}</div>`}
 const cs=`<select class="qst-cur" data-f="${f}" data-k="cur" aria-label="Currency">${CUR_LIST.map(k=>`<option${k===s.cur?' selected':''}>${k}</option>`).join('')}</select>`;
 return`<div class="qst-form" data-form="${f}">
 <input class="qst-in qst-title" data-f="${f}" data-k="title" placeholder="Dinner 1200  ·  or  1200 Dinner" value="${esc(s.text)}" autocomplete="off" enterkeyhint="done" aria-label="What and how much">
 <div class="qst-r2">${cs}<div class="qst-pv" data-pv></div></div>
 <div class="qst-conv" data-conv></div>
 <div class="qst-lb">Paid by</div><div class="qst-chips">${people().map(p=>`<button type="button" class="qst-chip${p.id===s.payer?' on':''}" data-qst="payer" data-f="${f}" data-id="${p.id}">${esc(who(p.id))}</button>`).join('')}</div>
 ${it?'':`<div class="qst-lb">Split between</div>${chipsHtml(s,f)}`}
 <div class="qst-seg" role="tablist">${[['equal','Equal'],['amounts','Amounts'],['shares','Shares'],['itemize','Itemize']].map(m=>`<button type="button" role="tab" aria-selected="${s.mode===m[0]}" class="${s.mode===m[0]?'on':''}" data-qst="mode" data-f="${f}" data-m="${m[0]}">${m[1]}</button>`).join('')}</div>
 ${body}<div class="qst-stat" data-status></div></div>`}
function stagedHtml(){return X.staged.map((s,i)=>{const c=calc(s);
 if(X.open===i)return`<div class="qst-stg open"><div class="qst-sh"><b>Editing: ${esc(s.title||'expense')}</b><button type="button" data-qst="sclose">Close</button></div>${formHtml(s,String(i))}</div>`;
 return`<div class="qst-stg${c.ok?'':' bad'}"><div class="qst-sm"><b>${esc(s.title||'Untitled')}</b><span>${money(c.total,s.cur)}</span><small>${esc(who(s.payer)==='You'?'You':nm(s.payer))} paid · ${c.P.length} ${c.P.length===1?'person':'people'}${c.ok?'':' · '+esc(c.err)}</small></div><div class="qst-sa"><button type="button" data-qst="sedit" data-i="${i}">Edit</button><button type="button" data-qst="srem" data-i="${i}">Remove</button></div></div>`}).join('')}
function paintX(){
 const edit=!!X.edit,n=X.staged.length+(hasInput(X.main)?1:0);
 mount(`<div class="qst-back" data-qst="close"></div><div class="qst-sheet" role="dialog" aria-label="${edit?'Edit expense':'Add expense'}"><div class="qst-stop"><strong>${edit?'Edit expense':'Add expense'}</strong><button type="button" class="qst-x" data-qst="close" aria-label="Close">✕</button></div>
 ${X.staged.length?`<div class="qst-stgs"><div class="qst-lb">Ready to save (${X.staged.length})</div>${stagedHtml()}</div>`:''}
 ${X.staged.length?'<div class="qst-lb">New expense</div>':''}${formHtml(X.main,'main')}
 ${X.confirm?`<div class="qst-warn">You have unsaved expenses. <button type="button" data-qst="keep">Keep editing</button><button type="button" data-qst="discard">Discard</button></div>`:''}
 <div class="qst-err" data-err>${esc(X.err||'')}</div>
 <div class="qst-foot">${edit?`<button type="button" class="qst-pri" data-qst="done"${X.saving?' disabled':''}>${X.saving?'Saving…':'Save changes'}</button>`:`<button type="button" class="qst-sec" data-qst="another">＋ Add another expense</button><button type="button" class="qst-pri" data-qst="done"${X.saving?' disabled':''}>${X.saving?'Saving…':n>1?'Done · save '+n:'Done'}</button>`}</div></div>`,'on');
 ['main'].concat(X.staged.map((_,i)=>String(i))).forEach(upd)}
/* cheap partial refresh while typing: no DOM rebuild, so the keyboard stays up */
function upd(f){const h=document.getElementById('qst');if(!h||!X)return;const s=S(f);if(!s)return;const root=h.querySelector('[data-form="'+f+'"]');if(!root)return;const c=calc(s);
 root.querySelectorAll('[data-calc]').forEach(e=>{e.textContent=money(c.sh[e.dataset.calc]||0,s.cur)});
 root.querySelectorAll('.qst-man').forEach(e=>{const id=e.dataset.id;e.placeholder=c.autos.includes(id)?money(c.sh[id]||0,s.cur):'auto'});
 const st=root.querySelector('[data-status]');if(st){st.textContent=s.mode==='amounts'?c.status:'';st.className='qst-stat '+(s.mode==='amounts'?c.cls:'')}
 const t=root.querySelector('[data-total]');if(t)t.textContent=money(c.total,s.cur);
 const pv=root.querySelector('[data-pv]');if(pv){const p=parseEntry(s.text);pv.innerHTML=s.mode==='itemize'?'<span>Total <b>'+money(c.total,s.cur)+'</b></span>':(c.total>0?'<b>'+money(c.total,s.cur)+'</b>'+(s.title?'<span> · '+esc(s.title)+'</span>':''):'<span class="qst-pvh">Type a name and an amount</span>')}
 const cv=root.querySelector('[data-conv]');if(cv)cv.textContent=conv(c.total,s.cur);
 const per=root.querySelector('[data-per]');if(per)per.innerHTML=c.P.length?c.P.map(id=>`<span>${esc(who(id))} <b>${money(c.sh[id]||0,s.cur)}</b></span>`).join(''):'';
 const bar=h.querySelector('.qst-pri');if(bar&&!X.edit&&!X.saving){const n=X.staged.length+(hasInput(X.main)?1:0);bar.textContent=n>1?'Done · save '+n:'Done'}}
function activate(s,id){if(s.active===id)return false;if(s.active)s.col[s.active]=true;s.col[id]=false;s.active=id;return true}
function openAdd(o){X={main:fresh(o),staged:[],open:null,err:'',edit:null,confirm:false,saving:false};SH=null;paintX();setTimeout(()=>{const e=document.querySelector('#qst .qst-title');if(e)e.focus()},60)}
function openEdit(id){const r=ST.rows.find(x=>x.id===id);if(!r)return;if(r.kind==='payment'){openPay(r.payer_id,r.payee_id,r.amount_minor,r.currency,r);return}
 X={main:fromRow(r),staged:[],open:null,err:'',edit:id,confirm:false,saving:false};SH=null;paintX()}
function tryClose(){if(!X&&!SH){closeAll();return}if(X&&!X.edit&&(X.staged.length||hasInput(X.main))){X.confirm=true;paintX();return}if(X&&X.edit&&X.dirty){X.confirm=true;paintX();return}closeAll()}
function another(){const m=X.main;norm(m);if(!hasInput(m)){X.err='Add a description and amount first';paintX();return}const c=calc(m);if(!c.ok){X.err=c.err;paintX();return}
 X.staged.push(JSON.parse(JSON.stringify(m)));X.err='';
 const n=fresh({cur:m.cur,payer:m.payer,who:m.who.slice(),mode:m.mode});if(n.mode==='itemize')seed(n);X.main=n;paintX();setTimeout(()=>{const e=document.querySelector('#qst .qst-title');if(e)e.focus()},40)}
async function done(){if(X.saving)return;const forms=X.staged.map(s=>s);
 for(let i=0;i<forms.length;i++){norm(forms[i]);const c=calc(forms[i]);if(!c.ok){X.open=i;X.err=(forms[i].title||'An expense')+': '+c.err;paintX();return}}
 const m=X.main;norm(m);const cur=hasInput(m);if(cur){const c=calc(m);if(!c.ok){X.err=c.err;paintX();return}forms.push(m)}
 if(!forms.length){closeAll();return}
 if(!A.client||!A.user){toast('Sign in to save expenses');return}
 X.saving=true;X.err='';paintX();const rows=forms.map(toRow);let er=null;
 try{if(X.edit){const r=rows[0];const u=Object.assign({},r);['id','trip_id','created_by','client_key','kind'].forEach(k=>delete u[k]);const q=await A.client.from('quest_ledger').update(u).eq('id',X.edit);er=q&&q.error}
  else{const q=await A.client.from('quest_ledger').insert(rows);er=q&&q.error}}catch(e){er=e}
 if(er&&String(er.code)!=='23505'){X.saving=false;X.err='Couldn’t save: '+(er.message||'check your connection')+'. Nothing was lost, try again.';paintX();return}
 const n=rows.length,wasEdit=!!X.edit,pl=X.main.planId;if(pl&&!wasEdit){try{const p=D().plans.find(x=>x.id===pl);if(p){p.logged=rows[0].id;quiet()}}catch(e){}}closeAll();await load();toast(wasEdit?'Expense updated':n>1?n+' expenses added':'Expense added')}

/* ---------- repayment popup ---------- */
function methodsFor(uid){return uid?ST.methods.filter(m=>m.owner_id===uid&&(m.shared||(A.user&&m.owner_id===A.user.id))):[]}
function openPay(from,to,amt,cur,ex){SH={type:'pay',from,to,cur,id:ex?ex.id:uuid(),amount:toStr(amt,cur),file:null,proof:ex?ex.proof_path:null,ex:!!ex,err:'',saving:false};X=null;paintPay()}
function paintPay(){const s=SH,p=people().find(x=>x.id===s.to),ms=methodsFor(p&&p.userId);
 mount(`<div class="qst-back" data-qst="close"></div><div class="qst-sheet qst-small" role="dialog" aria-label="Record payment"><div class="qst-stop"><strong>${s.ex?'Edit payment':'Pay '+esc(nm(s.to))}</strong><button type="button" class="qst-x" data-qst="close" aria-label="Close">✕</button></div>
 <p class="qst-help">${esc(who(s.from)==='You'?'You':nm(s.from))} → ${esc(nm(s.to))}. Record money you already sent; Quest doesn’t move it.</p>
 <div class="qst-lb">Amount (${s.cur}), edit for a partial payment</div><div class="qst-r2"><span class="qst-sym">${sym(s.cur)}</span><input class="qst-in qst-amt" data-k="payamt" inputmode="decimal" value="${esc(s.amount)}" aria-label="Payment amount" autocomplete="off"></div>
 <div class="qst-lb">${esc(nm(s.to))}’s payment details</div>
 ${ms.length?ms.map(m=>`<div class="qst-pm"><div><b>${esc(m.label)}</b><span>${esc(m.details)}</span></div>${m.details?`<button type="button" data-qst="copy" data-t="${esc(m.details)}">Copy</button>`:''}</div>`).join(''):`<p class="qst-none">${esc(nm(s.to))} hasn’t shared payment details.</p>`}
 <div class="qst-lb">Proof of payment (optional)</div>
 <label class="qst-file"><input type="file" data-k="proof" accept="image/*,application/pdf"><span>${s.file?esc(s.file.name):s.proof?'Proof attached · choose another':'Attach a screenshot or PDF'}</span></label>
 <div class="qst-err">${esc(s.err)}</div>
 <div class="qst-foot"><button type="button" class="qst-pri" data-qst="savepay"${s.saving?' disabled':''}>${s.saving?'Saving…':s.ex?'Save changes':'Record payment'}</button></div></div>`,'on')}
async function savePay(){const s=SH;if(!s||s.saving)return;const m=toMinor(s.amount,s.cur);if(m<=0){s.err='Enter an amount';paintPay();return}
 if(!A.client||!A.user){toast('Sign in first');return}
 s.saving=true;s.err='';paintPay();let path=s.proof||null;
 try{if(s.file){if(s.file.size>10*1048576)throw new Error('That file is over 10 MB');const nmx=String(s.file.name).replace(/[^\w.\-]+/g,'_').slice(-60);path=A.tripId+'/proof/'+uuid()+'-'+nmx;const up=await A.client.storage.from('quest-files').upload(path,s.file,{contentType:s.file.type||'application/octet-stream'});if(up&&up.error)throw up.error}
  let er=null;if(s.ex){const q=await A.client.from('quest_ledger').update({amount_minor:m,proof_path:path}).eq('id',s.id);er=q&&q.error}
  else{const q=await A.client.from('quest_ledger').insert({id:s.id,trip_id:A.tripId,kind:'payment',title:'',currency:s.cur,amount_minor:m,payer_id:s.from,payee_id:s.to,shares:{},proof_path:path,client_key:s.id,created_by:A.user.id});er=q&&q.error}
  if(er&&String(er.code)!=='23505')throw er}
 catch(e){s.saving=false;s.err='Couldn’t save: '+(e.message||'try again');paintPay();return}
 const wasEx=s.ex;closeAll();await load();toast(wasEx?'Payment updated':'Payment recorded')}
async function viewProof(path){const w=window.open('','_blank');try{const r=await A.client.storage.from('quest-files').createSignedUrls([path],300);const u=r&&r.data&&r.data[0]&&r.data[0].signedUrl;if(!u)throw 0;if(w)w.location=u;else location.href=u}catch(e){if(w)w.close();toast('Couldn’t open the proof')}}

/* ---------- currency settings + my payment details ---------- */
function openCfg(){const c=cfg();SH={type:'cfg',cur:c.cur,a:c.a,b:c.b,rate:c.rate?String(c.rate):'',err:''};X=null;paintCfg()}
function paintCfg(){const s=SH,opt=v=>CUR_LIST.map(k=>`<option${k===v?' selected':''}>${k}</option>`).join('');
 mount(`<div class="qst-back" data-qst="close"></div><div class="qst-sheet qst-small" role="dialog" aria-label="Currency"><div class="qst-stop"><strong>Trip currency</strong><button type="button" class="qst-x" data-qst="close" aria-label="Close">✕</button></div>
 <div class="qst-lb">Default currency for new expenses</div><select class="qst-sel" data-k="ccur">${opt(s.cur)}</select>
 <div class="qst-lb">Show an approximate conversion between</div><div class="qst-r2"><select class="qst-sel" data-k="ca">${opt(s.a)}</select><span class="qst-sym">⇄</span><select class="qst-sel" data-k="cb">${opt(s.b)}</select></div>
 <div class="qst-lb">Rate: 1 ${s.a} = ? ${s.b} (leave empty for the live rate)</div><input class="qst-in" data-k="crate" inputmode="decimal" placeholder="live rate" value="${esc(s.rate)}" autocomplete="off">
 <p class="qst-help">The conversion is only a preview under the amount. Expenses and balances always stay in the currency they were entered in.</p>
 <div class="qst-err">${esc(s.err)}</div><div class="qst-foot"><button type="button" class="qst-pri" data-qst="savecfg">Save</button></div></div>`,'on')}
async function saveCfg(){const s=SH;let r=parseFloat(String(s.rate).replace(/,/g,''));if(String(s.rate).trim()&&!(r>0)){s.err='Rate must be a positive number';paintCfg();return}
 if(s.a===s.b){s.err='Pick two different currencies';paintCfg();return}
 const o={cur:s.cur,a:s.a,b:s.b};if(String(s.rate).trim())o.rate=r;const v=JSON.stringify(o);
 try{const q=await A.client.rpc('quest_set_detail',{p_trip:A.tripId,p_key:'settle',p_value:v});if(q&&q.error)throw q.error;D().details.settle=v;if(A.det)A.det.settle=v}catch(e){s.err='Couldn’t save: '+(e.message||'try again');paintCfg();return}
 closeAll();render();toast('Currency settings saved')}
function openPm(){SH={type:'pm',drafts:[]};X=null;paintPm()}
function paintPm(){const mine=ST.methods.filter(m=>A.user&&m.owner_id===A.user.id),all=mine.concat(SH.drafts);
 const card=m=>`<div class="qst-pmc" data-mid="${m.id}"><input class="qst-in" data-k="pml" data-id="${m.id}" value="${esc(m.label)}" placeholder="Name, e.g. GCash" aria-label="Method name" autocomplete="off"><textarea class="qst-in" data-k="pmd" data-id="${m.id}" rows="2" placeholder="Number, account name, link…" aria-label="Details">${esc(m.details)}</textarea><div class="qst-pmr"><label class="qst-sw"><input type="checkbox" data-k="pms" data-id="${m.id}"${m.shared?' checked':''}> Share with people on my trips</label><button type="button" class="qst-lnk" data-qst="pmdel" data-id="${m.id}">Delete</button></div></div>`;
 mount(`<div class="qst-back" data-qst="close"></div><div class="qst-sheet qst-small" role="dialog" aria-label="My payment details"><div class="qst-stop"><strong>My payment details</strong><button type="button" class="qst-x" data-qst="close" aria-label="Close">✕</button></div>
 <p class="qst-help">Save the ways people can pay you. They’re yours across every trip, and only visible to trip mates if you switch sharing on. Nobody else can edit them.</p>
 ${all.map(card).join('')||'<p class="qst-none">No payment methods yet.</p>'}
 <button type="button" class="qst-ghost" data-qst="pmadd">＋ Add a method</button><div class="qst-foot"><button type="button" class="qst-pri" data-qst="close">Done</button></div></div>`,'on')}
async function pmSave(id){const h=document.getElementById('qst'),g=k=>h.querySelector('[data-k="'+k+'"][data-id="'+id+'"]');const label=(g('pml').value||'').trim(),details=(g('pmd').value||'').trim(),shared=g('pms').checked;
 if(!label){return}
 const row={id,owner_id:A.user.id,label:label.slice(0,60),details:details.slice(0,500),shared};
 const q=await A.client.from('quest_payment_methods').upsert(row);if(q&&q.error){toast('Couldn’t save: '+q.error.message);return}
 const i=ST.methods.findIndex(m=>m.id===id);if(i>=0)ST.methods[i]=Object.assign({},ST.methods[i],row);else{ST.methods.push(row);SH.drafts=SH.drafts.filter(d=>d.id!==id)}}
async function openChg(id){SH={type:'chg',id,rows:null};X=null;paintChg();try{const q=await A.client.from('quest_ledger_log').select('*').eq('entry_id',id).order('at');SH.rows=(q&&q.data)||[]}catch(e){SH.rows=[]}if(SH&&SH.type==='chg')paintChg()}
function paintChg(){const s=SH;const by=uid=>{const p=people().find(x=>x.userId===uid);return p?p.name:'Someone'};
 const body=s.rows===null?'<p class="qst-none">Loading…</p>':s.rows.length?s.rows.map(l=>{const o=l.snapshot||{};return`<div class="qst-chg"><b>${l.action==='add'?'Added':l.action==='edit'?'Edited':'Deleted'} by ${esc(by(l.by_user))}</b><small>${dateStr(l.at)}</small><span>${l.action==='edit'?'Before: ':''}${esc(o.title||(o.kind==='payment'?'Payment':'Expense'))} · ${money(o.amount_minor||0,o.currency||'PHP')}${o.payer_id?' · paid by '+esc(nm(o.payer_id)):''}</span></div>`}).join(''):'<p class="qst-none">No changes recorded.</p>';
 mount(`<div class="qst-back" data-qst="close"></div><div class="qst-sheet qst-small" role="dialog" aria-label="Changes"><div class="qst-stop"><strong>Change history</strong><button type="button" class="qst-x" data-qst="close" aria-label="Close">✕</button></div>${body}</div>`,'on')}
async function del(id){const r=ST.rows.find(x=>x.id===id);if(!r)return;if(!confirm('Delete '+(r.kind==='payment'?'this payment':'“'+r.title+'”')+'? Balances will update.'))return;
 const q=await A.client.from('quest_ledger').delete().eq('id',id);if(q&&q.error){toast('Couldn’t delete: '+q.error.message);return}
 ST.rows=ST.rows.filter(x=>x.id!==id);render();
 toastUndo('Deleted',async()=>{const row=Object.assign({},r);delete row.created_at;delete row.updated_at;const u=await A.client.from('quest_ledger').insert(row);if(u&&u.error){toast('Couldn’t restore');return}await load()})}

/* ---------- events ---------- */
function setVal(el){const s=X&&el.dataset.f?S(el.dataset.f):null,k=el.dataset.k;
 if(k==='payamt'){SH.amount=el.value;return}
 if(k==='ccur'||k==='ca'||k==='cb'||k==='crate'){SH[{ccur:'cur',ca:'a',cb:'b',crate:'rate'}[k]]=el.value;return}
 if(!s)return;
 if(k==='title'){s.text=el.value;sync(s)}
 else if(k==='amount'){const v=el.value.replace(/[^\d.,]/g,'');if(v!==el.value)el.value=v;s.amount=v}
 else if(k==='man'){const v=el.value.replace(/[^\d.,]/g,'');if(v!==el.value)el.value=v;s.manual[el.dataset.id]=v}
 else if(k==='ip'){const v=el.value.replace(/[^\d.,]/g,'');if(v!==el.value)el.value=v;const x=s.items.find(i=>i.id===el.dataset.i);if(x)x.price=v}
 if(X)X.err='',(()=>{const e=document.querySelector('#qst [data-err]');if(e)e.textContent=''})();
 if(X)upd(el.dataset.f);if(X&&!X.edit){const b=document.querySelector('#qst .qst-pri');if(b&&!X.saving){const n=X.staged.length+(hasInput(X.main)?1:0);b.textContent=n>1?'Done · save '+n:'Done'}}if(X&&X.edit)X.dirty=true}
function wire(h){
 h.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.k&&el.type!=='file'&&el.type!=='checkbox'&&el.tagName!=='SELECT'){if(SH&&SH.type==='pm'){return}setVal(el)}});
 h.addEventListener('change',e=>{const el=e.target,k=el.dataset&&el.dataset.k;if(!k)return;
  if(SH&&SH.type==='pm'){const id=el.dataset.id;pmSave(id);return}
  if(k==='proof'){SH.file=el.files&&el.files[0]||null;paintPay();return}
  if(k==='title'&&X){return}
  if(el.tagName==='SELECT'){if(k==='cur'){const s=S(el.dataset.f);s[k]=el.value;if(X.edit)X.dirty=true;paintX()}else setVal(el)}});
 h.addEventListener('focusin',e=>{const el=e.target;if(X&&el.dataset&&el.dataset.k==='ip'){const f=el.dataset.f,s=S(f),prev=s&&s.active;if(s&&activate(s,el.dataset.i)){/* swap only the previously active row, so the field being tapped keeps focus + keyboard */
  const i=prev?s.items.findIndex(x=>x.id===prev):-1,node=i>=0?h.querySelector('[data-row="'+prev+'"]'):null;
  if(node){const t=document.createElement('div');t.innerHTML=itemRow(s,s.items[i],i,f);node.replaceWith(t.firstElementChild)}upd(f)}}});
 h.addEventListener('keydown',e=>{if(e.key==='Escape'){tryClose();return}if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.k==='title'&&X){e.preventDefault();const s=S(e.target.dataset.f);if(s.mode==='itemize'){const ip=document.querySelector('#qst [data-k="ip"]');if(ip)ip.focus()}else e.target.blur()}});
}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-qst]');if(!b)return;const a=b.dataset.qst;e.preventDefault();
 const f=b.dataset.f,s=X&&f!=null?S(f):null,tog=(arr,id)=>{const i=arr.indexOf(id);if(i>=0)arr.splice(i,1);else arr.push(id)};
 switch(a){
 case'add':if(!people().length)return;openAdd();return;
 case'pay':openPay(b.dataset.from,b.dataset.to,+b.dataset.amt,b.dataset.cur);return;
 case'edit':openEdit(b.dataset.id);return;
 case'del':del(b.dataset.id);return;
 case'cfg':openCfg();return;
 case'pm':openPm();return;
 case'chg':openChg(b.dataset.id);return;
 case'proof':viewProof(b.dataset.path);return;
 case'copy':try{navigator.clipboard.writeText(b.dataset.t);toast('Copied')}catch(x){toast('Couldn’t copy')}return;
 case'close':tryClose();return;
 case'keep':X.confirm=false;paintX();return;
 case'discard':closeAll();return;
 case'who':pickWho(s,b.dataset.id,false);break;
 case'payer':s.payer=b.dataset.id;break;
 case'mode':s.mode=b.dataset.m;if(s.mode==='itemize')seed(s);break;
 case'step':{const id=b.dataset.id,v=Math.max(1,(parseInt(s.wts[id])||1)+(+b.dataset.d));s.wts[id]=v;const e2=document.querySelector('#qst [data-form="'+f+'"] [data-wt="'+id+'"]');if(e2)e2.textContent=v;upd(f);return}
 case'ia':{const x=newItem();s.items.push(x);activate(s,x.id);paintX();setTimeout(()=>{const i=document.querySelector('#qst [data-k="ip"][data-i="'+x.id+'"]');if(i)i.focus()},30);return}
 case'irm':s.items=s.items.filter(x=>x.id!==b.dataset.i);if(s.active===b.dataset.i)s.active=null;break;
 case'ireopen':activate(s,b.dataset.i);break;
 case'iwho':{const x=s.items.find(i=>i.id===b.dataset.i);activate(s,x.id);pickWho(x,b.dataset.id,true);break}
 case'details':openDet();return;
 case'sedit':X.open=+b.dataset.i;paintX();return;
 case'sclose':X.open=null;paintX();return;
 case'srem':X.staged.splice(+b.dataset.i,1);if(X.open!=null)X.open=null;paintX();return;
 case'another':another();return;
 case'done':done();return;
 case'savepay':savePay();return;
 case'savecfg':saveCfg();return;
 case'pmadd':{const d={id:uuid(),label:'',details:'',shared:false};SH.drafts.push(d);paintPm();setTimeout(()=>{const i=document.querySelector('#qst [data-k="pml"][data-id="'+d.id+'"]');if(i)i.focus()},30);return}
 case'pmdel':{const id=b.dataset.id;SH.drafts=SH.drafts.filter(d=>d.id!==id);if(ST.methods.some(m=>m.id===id)){A.client.from('quest_payment_methods').delete().eq('id',id).then(()=>{});ST.methods=ST.methods.filter(m=>m.id!==id)}paintPm();return}
 default:return}
 if(X){X.err='';if(X.edit)X.dirty=true;paintX()}},true);
window.questLogExpense=function(p){if(!people().length)return;const ex=p.logged&&ST.rows.find(r=>r.id===p.logged);if(ex){openEdit(ex.id);return}
 const cur=(p.cost_cur&&CURS[p.cost_cur])?p.cost_cur:cfg().cur,amt=p.cost_minor>0?toStr(p.cost_minor,cur):'';
 openAdd({cur,planId:p.id,text:p.name+(amt?' '+amt:''),title:p.name,amount:amt,who:(p.who&&p.who.length&&p.who.length<people().length)?p.who.slice():allIds(),all:!(p.who&&p.who.length&&p.who.length<people().length)})};
window.__qst={ST,cfg,calc,allocate,toMinor,money,nets,matches,get X(){return X},get SH(){return SH}};
})();
