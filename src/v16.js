/* v16: header landscapes, trip name, QT celebrations, owner sets shortlist taps */
(()=>{
const AR='art/',ini=n=>String(n||'?').trim().charAt(0).toUpperCase();
const land=(k,h)=>`<div class="land-wrap" aria-hidden="true"><img class="land land-${k}" src="${AR}land_${k}.webp" alt="" width="640" height="${h}"></div>`;
/* header landscapes */
{const _t=window.trip;window.trip=()=>{let h=_t();const t=A.data&&A.data.trip,nm=t&&(t.name||t.city);if(nm)h=h.replace('<h2 class="section-title">The itinerary</h2>',`<div class="trip-kicker">${esc(nm)}</div><h2 class="section-title">The itinerary</h2>`);return h.replace('<div class="trip-main">','<div class="trip-main">'+land('trip',96))}}
{const _s=window.shortlist;window.shortlist=()=>land('short',136)+_s()}
{const _p=window.planning;window.planning=()=>land('plan',137)+_p()}
/* trips page: scenic bottom + thumbnails */
{const _t=window.tripsScreen;window.tripsScreen=()=>{let h=_t();h=h.replace(/<svg class="page-hills"[\s\S]*?<\/svg>/,`<img class="page-land" src="${AR}land_trip.webp" alt="" width="640" height="96">`);
h=h.replace(/(<button class="trip-card"[^>]*data-id="([^"]+)">)([\s\S]*?)(<\/button>)/g,(m,open,id,inner,close)=>{const t=(A.trips||[]).find(x=>x.id===id)||{};const th=/seoul|korea/i.test((t.name||'')+' '+(t.city||''))?`<img class="tc-img" src="${AR}trip_korea.webp" alt="" width="240" height="180">`:`<span class="tc-img tc-ph" aria-hidden="true">${esc(ini(t.city||t.name))}</span>`;return open+th+'<span class="tc-txt">'+inner+'</span>'+close});return h}}
/* trip creation: name first, then destination */
{const _n=window.newScreen;window.newScreen=()=>{const h=_n(),m=/<div class="field"><label for="n_where">[\s\S]*?<\/div>/.exec(h),k=/<div class="field"><label for="n_name">[\s\S]*?<\/div>/.exec(h);if(!m||!k)return h;const nm=k[0].replace('Trip name (optional)','Name your trip');return h.replace(m[0]+k[0],nm+m[0])}}
/* you are always first in your own view (colours stay tied to join order) */
{const _l=window.loadTrip;window.loadTrip=async function(){const ok=await _l.apply(this,arguments);if(ok&&A.people&&A.people.length){A.people.forEach((p,i)=>{if(!p.color)p.color=PKEYS[i%PKEYS.length]});const me=A.people.find(p=>p.id===A.me);if(me)A.people=[me,...A.people.filter(p=>p!==me)]}return ok}}
/* quick toasts */
{const _t=window.toast;window.toast=s=>{_t(s);clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.add('hidden'),1000)}}
{const _u=window.toastUndo;if(typeof _u==='function')window.toastUndo=function(){_u.apply(this,arguments);clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.classList.add('hidden');toastEl.classList.remove('act')},2200)}}
/* celebrations */
const POP={book:['qt_ticket.webp',"You're booked!",150,122],buddy:['qt_buddies.webp','Yay, quest buddies!',170,109],done:['qt_done.webp','Quest complete!',150,145]};
let popT;
function celebrate(k){const p=POP[k];if(!p)return;const o=document.getElementById('qtpop');if(o)o.remove();clearTimeout(popT);
const d=document.createElement('div');d.id='qtpop';d.className='qtpop';d.setAttribute('role','status');d.innerHTML=`<img src="${AR}${p[0]}" alt="" width="${p[2]}" height="${p[3]}"><b>${p[1]}</b>`;document.body.appendChild(d);popT=setTimeout(()=>d.remove(),2000)}
/* v11 already decides WHEN (done / join accepted); this swaps in the final art, text and 2s timing */
window.celebrate=(art,msg)=>celebrate(art==='buddies'?'buddy':art);
{const _s=window.saveSched;if(typeof _s==='function')window.saveSched=function(){const s=U.sched,n=D().plans.length,fromShort=!!s;const r=_s.apply(this,arguments);if(fromShort&&D().plans.length>n)celebrate('book');return r}}
const meCss=document.createElement('style');document.head.appendChild(meCss);
{const _r=window.render;window.render=function(){const r=_r.apply(this,arguments);try{
const own=!!(A.data&&A.data.trip&&A.data.trip.owner);document.body.classList.toggle('is-owner',own);meCss.textContent=own&&A.me?`.is-owner [data-act="short-interest"]:not([data-person="${A.me}"]){outline:1.5px dashed #9bb59a;outline-offset:1px}`:''}catch(e){}return r}}
/* owner sets someone else's keen tap */
const closeSheet=()=>{const s=document.getElementById('ovsheet');if(s)s.remove()};
async function setInterest(id,pid,on){const it=D().shortlist.find(x=>x.id===id);if(!it)return;const row={item_id:id,member_id:pid,trip_id:A.tripId};
const r=on?await A.client.from('quest_interest').upsert(row,{ignoreDuplicates:true}):await A.client.from('quest_interest').delete().eq('item_id',id).eq('member_id',pid);
if(r.error){toast('Couldn’t update that: '+r.error.message);return}
it.interest=on?[...it.interest.filter(x=>x!==pid),pid]:it.interest.filter(x=>x!==pid);
if(A.snap&&A.snap.interest){const k=id+'|'+pid;if(on)A.snap.interest[k]=row;else delete A.snap.interest[k]}
render();toast('Updated')}
function interestSheet(id,pid){const it=D().shortlist.find(x=>x.id===id),p=A.people.find(x=>x.id===pid);if(!it||!p)return;closeSheet();const has=it.interest.includes(pid),nm=esc(p.name);
const d=document.createElement('div');d.id='ovsheet';d.className='ovs';
d.innerHTML=`<div class="ovs-card" role="dialog" aria-label="Change ${nm}’s pick"><b>${has?`Take ${nm} off “${esc(it.name)}”?`:`Mark ${nm} as keen on “${esc(it.name)}”?`}</b><span class="ovs-sub">This changes it for everyone.</span><div class="ovs-btns two"><button type="button" class="primary" data-go>Confirm</button><button type="button" class="ghost" data-ovx>Cancel</button></div></div>`;
document.body.appendChild(d);d.addEventListener('click',ev=>{if(ev.target===d||ev.target.closest('[data-ovx]')){closeSheet();return}if(ev.target.closest('[data-go]')){closeSheet();setInterest(id,pid,!has)}})}
root.addEventListener('click',e=>{const b=e.target.closest('[data-act="short-interest"]');if(!b)return;const pid=b.dataset.person;if(!pid||pid===A.me||!(A.data&&A.data.trip&&A.data.trip.owner))return;e.stopImmediatePropagation();e.preventDefault();interestSheet(b.dataset.id,pid)},true);
/* Esc closes the edit pop-up */
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&U.edit&&!document.getElementById('ovsheet')){U.edit=null;render()}});
})();
