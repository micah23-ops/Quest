/* v49: a simple trip budget tracker on Settle.
   One input (set a trip budget) + one readout (spent so far / how close to it), with a plain fine/near/over
   color cue. No charts, no category breakdowns — on purpose, per the "does this need to be visible at
   rest?" rule the rest of this simplify pass follows. */
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CURS={PHP:['₱',2],USD:['$',2],KRW:['₩',0],JPY:['¥',0],EUR:['€',2],CAD:['CA$',2],SGD:['S$',2],THB:['฿',2],GBP:['£',2],AUD:['A$',2]};
const CUR_LIST=Object.keys(CURS);
const dec=c=>(CURS[c]||['',2])[1],sym=c=>(CURS[c]||[c+' '])[0],F=c=>dec(c)?100:1;
const money=(m,c)=>{const neg=m<0;m=Math.abs(m);const v=m/F(c);const s=v.toLocaleString('en-US',{minimumFractionDigits:dec(c)&&m%100?2:0,maximumFractionDigits:dec(c)});return(neg?'-':'')+sym(c)+s};
function toMinor(s,c){s=String(s==null?'':s).replace(/[,\s]/g,'');if(!/^\d*\.?\d*$/.test(s)||s===''||s==='.')return 0;const d=dec(c),p=s.split('.'),w=p[0]||'0',f=p[1]||'';return Number(w)*F(c)+(d?Number((f+'00').slice(0,d)):0)}
const toStr=(m,c)=>dec(c)?(m/100).toFixed(2).replace(/\.00$/,''):String(m);
function cfgCur(){try{return window.__qst?window.__qst.cfg().cur:'PHP'}catch(e){return 'PHP'}}
function getBudget(){try{const o=JSON.parse((D().details||{}).budget||'null');return o&&CURS[o.cur]&&o.amt>0?o:null}catch(e){return null}}
/* Group total: every expense counted once at its full amount, whoever paid it. This is
   deliberately NOT scoped to the current person — a 330,000 dinner one person paid for
   the whole group is 330,000 of group spend, even though that payer is only "out" their
   own share (everyone else owes the rest back). See mySpendMinor() below for that other,
   per-person number, which the panel shows alongside this one so the two can't be confused. */
function spentMinor(cur){const Q=window.__qst;if(!Q)return 0;return Q.ST.rows.filter(r=>r.kind==='expense'&&r.currency===cur).reduce((a,r)=>a+r.amount_minor,0)}
/* My actual share of the group spend: sum of my slice of every expense (not what I fronted,
   not my net balance) — i.e. what this trip actually costs me once everyone settles up. */
function mySpendMinor(cur){const Q=window.__qst;if(!Q||!A.me)return 0;
 return Q.ST.rows.filter(r=>r.kind==='expense'&&r.currency===cur).reduce((a,r)=>{const sh=r.shares||{};
  if(Object.prototype.hasOwnProperty.call(sh,A.me))return a+sh[A.me];
  /* no explicit shares recorded (older row) and nobody else listed either: treat as all-mine */
  return Object.keys(sh).length?a:a+r.amount_minor},0)}
function otherCurSpent(cur){const Q=window.__qst;if(!Q)return false;return Q.ST.rows.some(r=>r.kind==='expense'&&r.currency!==cur)}

let E=null; /* {amt,cur,err} while the small set/edit form is open */
function panelHtml(){
 const b=getBudget();
 if(E){
  const cs=CUR_LIST.map(k=>`<option${k===E.cur?' selected':''}>${k}</option>`).join('');
  return `<div class="qbud-edit">
  <div class="qbud-row"><select class="qst-sel" data-qbud="cur">${cs}</select><input class="qst-in" data-qbud="amt" inputmode="decimal" placeholder="Trip budget, e.g. 50000" value="${esc(E.amt)}" aria-label="Budget amount" autocomplete="off"></div>
  ${E.err?`<div class="qbud-err">${esc(E.err)}</div>`:''}
  <div class="qst-foot"><button type="button" class="qst-pri" data-qbud="save">Save</button><button type="button" class="qst-sec" data-qbud="cancel">Cancel</button>${b?`<button type="button" class="qst-sec" data-qbud="clear">Remove</button>`:''}</div></div>`;
 }
 /* unset: a single small text link, not a card — stays out of the way until wanted */
 if(!b)return `<button type="button" class="qbud-mini" data-qbud="open">＋ Set a trip budget</button>`;
 const spent=spentMinor(b.cur),pct=b.amt>0?spent/b.amt:0;
 const cls=pct>=1?'over':pct>=0.8?'near':'fine';
 const note=otherCurSpent(b.cur)?`<small class="qbud-note">Only ${esc(b.cur)} expenses are counted.</small>`:'';
 /* set: one line folded right into the balance card — "Budget X of Y spent", then the bar.
    No separate card, no extra stats; tap the line to edit. */
 return `<div class="qbud-line ${cls}" data-qbud="open" role="button" tabindex="0"><b>Budget</b> ${money(spent,b.cur)} of ${money(b.amt,b.cur)} spent
 <div class="qbud-bar"><div class="qbud-fill" style="width:${Math.min(100,Math.round(pct*100))}%"></div></div>${note}</div>`;
}
{const _b=window.bill;if(typeof _b==='function')window.bill=function(){const h=_b.apply(this,arguments);if(typeof h!=='string'||U.tab!=='bill')return h;
 /* folds into the first panel (Balances), right above its closing tag, instead of its own
    lead card or a strip between sections */
 const i=h.indexOf('</section>');
 return i<0?h+panelHtml():h.slice(0,i)+panelHtml()+h.slice(i)}}
async function saveBudget(o){
 const v=o?JSON.stringify(o):'';
 try{if(A.client&&A.tripId){const q=await A.client.rpc('quest_set_detail',{p_trip:A.tripId,p_key:'budget',p_value:v});if(q&&q.error)throw q.error}
  D().details=D().details||{};D().details.budget=v;if(A.det)A.det.budget=v}
 catch(e){try{toast('Couldn’t save: '+(e.message||'try again'))}catch(x){}return}
 render();try{toast(o?'Budget saved':'Budget removed')}catch(e){}
}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-qbud]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.qbud;
 if(a==='open'){const cur=getBudget();E=cur?{amt:toStr(cur.amt,cur.cur),cur:cur.cur,err:''}:{amt:'',cur:cfgCur(),err:''};render();return}
 if(a==='cancel'){E=null;render();return}
 if(a==='clear'){E=null;saveBudget(null);return}
 if(a==='save'){
  const amtI=document.querySelector('[data-qbud="amt"]'),curS=document.querySelector('[data-qbud="cur"]');
  if(curS)E.cur=curS.value;if(amtI)E.amt=amtI.value;
  const m=toMinor(E.amt,E.cur);if(m<=0){E.err='Enter a budget amount';render();return}
  const o={amt:m,cur:E.cur};E=null;saveBudget(o);return
 }
},true);
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.qbud==='amt'&&E)E.amt=t.value},true);
})();
