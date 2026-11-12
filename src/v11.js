/* v11: mascot celebrations (non-blocking pop, owl art static). Triggered only by real actions. */
(()=>{
const KEY='quest_cel',ART={buddies:'mascot/buddies.png',done:'mascot/celebrate.png'};
const seen=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
const once=k=>{const s=seen();if(s.includes(k))return false;s.push(k);try{localStorage.setItem(KEY,JSON.stringify(s.slice(-300)))}catch(e){}return true};
let cur=null,t=null;
window.celebrate=(art,msg)=>{clearTimeout(t);if(cur)cur.remove();const d=document.createElement('div');d.className='qpop';d.setAttribute('role','status');d.innerHTML=`<img src="${ART[art]}" alt="" width="120" height="120"><b>${esc(msg)}</b>`;document.body.appendChild(d);cur=d;t=setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),260)},1900)};
/* Quest complete!: user ticks a shortlist item done (once per item) */
root.addEventListener('click',e=>{const b=e.target.closest('input[data-act="done"]');if(b&&b.checked&&once('done:'+b.dataset.id))celebrate('done','Quest complete!')},true);
/* Yay, quest buddies!: someone accepted MY join request while this app was open */
let pend=new Map(),tid=null;
const _dr=window.dropReq;window.dropReq=(pid,mid)=>{if(mid===A.me)pend.delete(pid);return _dr(pid,mid)};
const _lt=window.loadTrip;window.loadTrip=async()=>{const ok=await _lt();if(!ok)return ok;const d=D(),mine=new Set((d.requests||[]).filter(r=>r.member_id===A.me).map(r=>r.plan_id));
if(tid!==A.tripId){tid=A.tripId;pend=new Map();mine.forEach(p=>pend.set(p,0));return ok}
for(const p of mine)if(!pend.has(p))pend.set(p,0);
for(const [pid,gone] of [...pend]){if(mine.has(pid)){pend.set(pid,0);continue}
const p=d.plans.find(x=>x.id===pid);if(!p){pend.delete(pid);continue}
if(!p.who.length||p.who.includes(A.me)){pend.delete(pid);if(once('join:'+pid+':'+A.me))celebrate('buddies','Yay, quest buddies!')}
else{const g=gone||Date.now();pend.set(pid,g);if(Date.now()-g>20000)pend.delete(pid)}}
return ok};
})();
