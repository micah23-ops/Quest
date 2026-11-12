/* v18: friendly copy, clearer actions/votes, multi-select "who" on quick add */
(()=>{
const solo=()=>A.people&&A.people.length<=1;
const R=(h,pairs)=>pairs.reduce((s,[a,b])=>s.replace(a,b),h);
/* sign in / create account */
{const _a=window.authScreen;window.authScreen=()=>R(_a(),[
['>Welcome back<','>Welcome back!<'],['Sign in to see your trips.','Your next trip is waiting.'],['>Create your account<','>Let’s get you started.<'],['Plan · Explore · Together','Get your trip together.']])}
/* create trip */
{const _n=window.newScreen;window.newScreen=()=>R(_n(),[
['<h1 class="auth-title">Plan a trip</h1><p class="helper">Just the basics. You can change everything later.</p>','<h1 class="auth-title">Where to next?</h1><p class="helper">Give your trip a name to get started.</p>']])}
/* join + claim */
{const _j=window.joinScreen;window.joinScreen=()=>{let h=_j();
if(U.joinInfo)h=h.replace('<h1 class="auth-title">Join a trip</h1>','<h1 class="auth-title">Which one’s you?</h1>').replace(/<p class="helper">You’re joining[\s\S]*?<\/p>/,'<p class="helper">Pick your name so we know which plans are yours.</p>');
else h=h.replace('<h1 class="auth-title">Join a trip</h1>','<h1 class="auth-title">Got a trip code?</h1><p class="helper">Enter the code your friend shared with you.</p>');return h}}
/* trip details hub copy */
{const _d=window.detailsCard;window.detailsCard=()=>R(_d(),[
['<div class="hub-body">','<div class="hub-body"><p class="hub-sub">The important stuff, minus the digging.</p>'],
[/<p class="hub-note">[^<]*<\/p>/,m=>/Private\./.test(m)?'<p class="hub-note">Your personal notes and details. Only you can see them.</p>':''] ])}
/* trip */
{const _t=window.trip;window.trip=()=>R(_t(),[
['>The itinerary</h2>','>Your itinerary</h2>'],
[/<p class="section-kicker">Tap a plan to see notes[^<]*<\/p>/,''],
[/Nothing planned yet\.[^<]*/g,'A whole day of possibilities.'],
[/>1 plans</g,'>1 plan<']])}
/* shortlist */
{const _s=window.shortlist;window.shortlist=()=>R(_s(),[
[/<p class="section-kicker">Bored at 3pm[^<]*<\/p>/,'<p class="section-kicker">Your favorites, all in one place.</p>'],
[/>1 possibilities</g,'>1 possibility<'],
[/<strong>Your list is empty<\/strong>[^<]*/,'<strong>The good stuff goes here.</strong>Type a place or idea above to start your list.']])}
/* planning */
{const _p=window.planning;window.planning=()=>{let h=_p();
h=h.replace(/<p class="section-kicker">[^<]*<\/p>/,'<p class="section-kicker">'+(solo()?'Drop ideas here and see what makes the cut.':'Drop ideas, vote together, see what makes the cut.')+'</p>');
const n=(D().groups||[]).reduce((a,g)=>a+(g.options||[]).length,0);
if(!n)h=h.replace('<div class="idea-stack">','<p class="idea-empty">Got an idea? Drop it here.</p><div class="idea-stack">');
const mv='“+ Shortlist” and “+ Itinerary” move an idea on'+(solo()?'.':', no need to wait for everyone.')+' Moved or removed ideas wait in the Archive.';
return h.replace(/(<div style="margin-top:18px" class="notice">)Grey circle[^<]*(<\/div>)/,(m,a,b)=>a+(solo()?'':'Vote with ✓ ? ×. Grey circle = hasn’t voted yet. ')+mv+b)}}
/* ---------- who pickers: All is its own button; tap names to pick one or several ---------- */
const ids=()=>A.people.map(p=>p.id);
const nextWho=(cur,id)=>{const n=A.people.length;if(id==='all')return[];const s=new Set(cur.length>=n?[]:cur);s.has(id)?s.delete(id):s.add(id);return(s.size===0||s.size>=n)?[]:[...s]};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="sched-who"],[data-act="edit-who"]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
if(b.dataset.act==='sched-who')U.sw=nextWho(U.sw||[],b.dataset.w);else U.ew=nextWho(U.ew||[],b.dataset.w);render()},true);
document.addEventListener('click',e=>{const b=e.target.closest('#root .who-select [data-who]');if(!b||!A.data||U.screen!=='trip')return;e.stopImmediatePropagation();
U.whoSel=nextWho(U.whoSel||[],b.dataset.who);U.who=U.whoSel.length===1?U.whoSel[0]:'all';render()},true);
{const _q=window.addQuick;window.addQuick=function(){const sel=(U.whoSel||[]).length>1?U.whoSel.slice():null,n=D().plans.length;const r=_q.apply(this,arguments);
if(sel&&D().plans.length>n){const pl=D().plans[D().plans.length-1];mut(()=>{pl.who=sel})}return r}}
/* ---------- shortlist votes (yes / maybe / no), carried over from the idea lab ---------- */
const first1=n=>String(n||'').trim().split(/\s+/)[0];
const vOf=(it,pid)=>(it.vv&&it.vv[pid])||((it.interest||[]).includes(pid)?'yes':'');
function applyLocal(it,pid,v){it.vv=it.vv||{};if(v)it.vv[pid]=v;else delete it.vv[pid];it.interest=(it.interest||[]).filter(x=>x!==pid);if(v==='yes')it.interest.push(pid);
if(A.snap&&A.snap.interest){const k=it.id+'|'+pid;if(v==='yes')A.snap.interest[k]={item_id:it.id,member_id:pid,trip_id:A.tripId};else delete A.snap.interest[k]}}
async function setV(it,pid,v){const r=await A.client.rpc('quest_set_interest',{p_item:it.id,p_member:pid,p_vote:v||null});if(r.error){toast('Couldn’t update that: '+r.error.message);return}applyLocal(it,pid,v);render();toast('Updated')}
async function loadVV(){try{const r=await A.client.from('quest_interest').select('item_id,member_id,vote').eq('trip_id',A.tripId);if(r.error||!r.data)return;const by={};r.data.forEach(x=>{(by[x.item_id]=by[x.item_id]||{})[x.member_id]=x.vote||'yes'});
(D().shortlist||[]).forEach(it=>{it.vv=by[it.id]||{};it.interest=Object.keys(it.vv).filter(m=>it.vv[m]==='yes')});
if(A.snap&&A.snap.interest)Object.keys(A.snap.interest).forEach(k=>{const [i,m]=k.split('|'),v=(by[i]||{})[m];if(v&&v!=='yes')delete A.snap.interest[k]})}catch(e){}}
{const _l=window.loadTrip;window.loadTrip=async function(){const ok=await _l.apply(this,arguments);if(ok)await loadVV();return ok}}
async function carry(id,votes){for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,700));try{const x=await A.client.from('quest_shortlist').select('id').eq('id',id);if(x.data&&x.data.length){const r=await A.client.rpc('quest_carry_votes',{p_item:id,p_votes:votes});if(r.error)console.warn('carry',r.error.message);return}}catch(e){}}}
{const _o=window.optToShort;window.optToShort=function(id){const f=findOpt(id),votes=f&&f.o&&f.o.votes?{...f.o.votes}:{},before=new Set(D().shortlist.map(x=>x.id));const r=_o.apply(this,arguments);
const it=D().shortlist.find(x=>!before.has(x.id));if(it&&Object.keys(votes).length){it.vv={...votes};it.interest=Object.keys(votes).filter(m=>votes[m]==='yes');carry(it.id,votes)}return r}}
const closeS=()=>{const x=document.getElementById('ovsheet');if(x)x.remove()};
function voteSheet(it,pid){closeS();const p=A.people.find(x=>x.id===pid);if(!p)return;const self=pid===A.me,cur=vOf(it,pid),nm=esc(first1(p.name)),L={yes:'Yes',maybe:'Maybe',no:'No','':'no vote'};
const d=document.createElement('div');d.id='ovsheet';d.className='ovs';
d.innerHTML=`<div class="ovs-card" role="dialog" aria-label="${self?'Your vote':nm+'’s vote'}"><b>${self?'Your vote':nm+'’s vote'}</b><span class="ovs-sub">${esc(it.name)}</span><div class="ovs-btns">${[['yes','✓ Yes'],['maybe','? Maybe'],['no','× No'],['','Clear']].map(([v,l])=>`<button type="button" data-ov="${v}" class="ov-${v||'clear'}${v===cur&&v?' cur':''}">${l}</button>`).join('')}</div><button type="button" class="ghost" data-ovx>Cancel</button></div>`;
document.body.appendChild(d);
d.addEventListener('click',ev=>{const card=d.querySelector('.ovs-card');if(ev.target===d||ev.target.closest('[data-ovx]')){closeS();return}
const b=ev.target.closest('[data-ov]');if(b){const v=b.dataset.ov;if(self){closeS();setV(it,pid,v);return}
card.innerHTML=`<b>Set ${nm}’s vote to ${L[v]}?</b><span class="ovs-sub">${esc(it.name)}. This changes it for everyone.</span><div class="ovs-btns two"><button type="button" class="primary" data-go="${v}">Confirm</button><button type="button" class="ghost" data-back>Back</button></div>`;return}
const go=ev.target.closest('[data-go]');if(go){closeS();setV(it,pid,go.dataset.go);return}
if(ev.target.closest('[data-back]'))voteSheet(it,pid)})}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="short-interest"]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
const it=D().shortlist.find(x=>x.id===b.dataset.id),pid=b.dataset.person;if(!it||!pid)return;
if(pid!==A.me&&!(A.data&&A.data.trip&&A.data.trip.owner))return;voteSheet(it,pid)},true);
/* moving to the itinerary: the people who said yes are pre-picked */
let lastSched=null;
const yesWho=sc=>{let y=[];try{if(sc.kind==='opt'){const f=findOpt(sc.id),v=(f&&f.o.votes)||{};y=ids().filter(m=>v[m]==='yes')}else{const it=D().shortlist.find(x=>x.id===sc.id);y=ids().filter(m=>it&&(it.interest||[]).includes(m))}}catch(e){}return(y.length&&y.length<A.people.length)?y:[]};
/* ---------- tidy the DOM after each render ---------- */
const tidy=()=>{try{
document.querySelectorAll('[data-act="to-short"]').forEach(b=>{if(b.classList.contains('pill'))b.textContent='+ Shortlist'});
document.querySelectorAll('[data-act="sched"][data-kind="opt"].pill,[data-act="sched"][data-kind="short"].mv').forEach(b=>{b.textContent='+ Itinerary'});
const me=A.people.find(p=>p.id===A.me),nm=me?first1(me.name):'';
document.querySelectorAll('.vote button[data-value]').forEach(b=>{b.title='Vote '+b.dataset.value;b.setAttribute('aria-label','Vote '+b.dataset.value)});
document.querySelectorAll('.pvs .pv').forEach(c=>{const t=c.getAttribute('title')||'';if(nm&&t.indexOf(nm+':')===0){c.classList.add('me');c.setAttribute('title','You: '+t.slice(nm.length+1).trim())}});
/* shortlist chips carry the vote colour */
document.querySelectorAll('[data-act="short-interest"]').forEach(c=>{const it=D().shortlist.find(x=>x.id===c.dataset.id);if(!it)return;const pid=c.dataset.person,v=vOf(it,pid),p=A.people.find(x=>x.id===pid);
c.classList.remove('v-yes','v-maybe','v-no','on');if(v)c.classList.add('v-'+v);if(v==='yes')c.classList.add('on');if(pid===A.me)c.classList.add('me');
if(p)c.title=(pid===A.me?'You':first1(p.name))+': '+(v||'no vote yet')+(pid===A.me?' (tap to change)':'');c.setAttribute('aria-pressed',String(v==='yes'))});
/* shortlist circles: shortest letters that tell everyone apart */
if(A.people.length>1){const nm=A.people.map(p=>[p.id,first1(p.name)]),bd={};nm.forEach(([id,n])=>{let L=1;const o=nm.filter(x=>x[0]!==id).map(x=>x[1].toLowerCase());while(L<n.length&&o.some(t=>t.slice(0,L)===n.toLowerCase().slice(0,L)))L++;bd[id]=n.slice(0,1).toUpperCase()+n.slice(1,L).toLowerCase()});
document.querySelectorAll('[data-act="short-interest"]').forEach(c=>{if(bd[c.dataset.person])c.textContent=bd[c.dataset.person]})}
document.querySelectorAll('.slot-time').forEach(x=>{if(x.textContent.trim()==='Anytime')x.textContent='Flexible'});
/* who pickers */
const n=A.people.length,st=(sel,get,idf)=>document.querySelectorAll(sel).forEach(b=>{const arr=get(),all=!arr.length||arr.length>=n,id=idf(b);b.classList.toggle('sel',id==='all'?all:(!all&&arr.includes(id)))});
const set=new Set((U.whoSel||[]).filter(id=>A.people.some(p=>p.id===id)));U.whoSel=[...set];
st('#root .who-select [data-who]',()=>U.whoSel||[],b=>b.dataset.who);st('.who-select [data-act="edit-who"]',()=>U.ew||[],b=>b.dataset.w);st('.who-select [data-act="sched-who"]',()=>U.sw||[],b=>b.dataset.w);
/* "Everyone" is just "All" */
const root0=document.getElementById('root');if(root0){const w=document.createTreeWalker(root0,NodeFilter.SHOW_TEXT);let x;while((x=w.nextNode())){if(x.nodeValue.trim()==='Everyone')x.nodeValue=x.nodeValue.replace('Everyone','All')}}
}catch(e){}};
{const _r=window.render;window.render=function(){if(U.sched&&U.sched!==lastSched){lastSched=U.sched;U.sw=yesWho(U.sched)}else if(!U.sched)lastSched=null;const r=_r.apply(this,arguments);tidy();return r}}
})();
