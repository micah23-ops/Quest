/* v41: one compact itinerary card (closed + open), photo thumbnails with a swipe viewer */
(function(){
const ic=(d,n)=>`<svg class="q41-i" viewBox="0 0 24 24" width="${n||12}" height="${n||12}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const PIN='<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>';
const CLIP='<path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>';
const COIN='<path d="M16 7.5c-.6-1.3-2-2-4-2-2.2 0-3.8 1.1-3.8 2.7 0 3.9 8 1.7 8 5.6 0 1.6-1.7 2.7-4.2 2.7-2 0-3.5-.8-4.2-2.2M12 3v2.5m0 13V21"/>';
const LINK='<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>';
const isAll=p=>!p.who||!p.who.length||p.who.length>=A.people.length;
const inits=p=>isAll(p)?'':p.who.map(id=>initial(pName(id))).join(' ');
const files=p=>window.__att?window.__att.forPlan(p.id):[];
const price=p=>window.__q40price?window.__q40price(p):'';
const oneLine=s=>String(s||'').replace(/\s+/g,' ').trim();
function whenTxt(p){return p.start?(p.end?prettyTime(p.start)+'–'+prettyTime(p.end):prettyTime(p.start)):'Anytime'}

window.q41Closed=function(p,clash){
 const t=p.start?prettyTime(p.start):'Anytime',e=p.start&&p.end?prettyTime(p.end):'';
 const txt=[oneLine(p.area),oneLine(p.notes)].filter(Boolean).join(', ');
 const n=files(p).length,pr=price(p);
 const icons=(p.place?`<span class="q41-ic" title="Has an address">${ic(PIN)}</span>`:'')+(n?`<span class="q41-ic" title="${n} attached">${ic(CLIP)}</span>`:'')+(pr?`<span class="q41-ic" title="Has a price">${ic(COIN)}</span>`:'');
 const l2=txt||icons?`<span class="q31-s q41-l2">${txt?`<span class="q41-tx">${esc(txt)}</span>`:''}${icons}</span>`:'';
 const pend=(typeof reqOf==='function'&&A.me&&!isAll(p)&&p.who.includes(A.me))?reqOf(p).filter(m=>!p.who.includes(m)).length:0,w=inits(p),warn=clash&&clash.length?`<span class="q31-clash" title="Overlaps ${esc(clash.map(q=>q.name).join(', '))}" aria-label="Overlaps ${esc(clash.map(q=>q.name).join(', '))}">!</span>`:'';
 return `<div class="q31-row q41-row${p.tent?' tent':''}${clash&&clash.length?' clash':''}" data-t0="${st0(p)}" data-t1="${en0(p)}" data-act="toggle-ev" data-id="${p.id}" role="button" tabindex="0"><span class="q31-t"><b class="${p.start?'':'any'}">${esc(t)}</b>${e?`<small>${esc(e)}</small>`:''}</span><span class="q31-m"><span class="q31-n">${esc(p.name)}${p.tent?'<em class="q31-q" title="Tentative">?</em>':''}</span>${l2}</span>${pend?`<span class="q41-ask" title="Wants to join">+${pend}</span>`:''}${w?`<span class="q41-who" aria-label="${esc(p.who.map(id=>pName(id)).join(', '))}">${esc(w)}</span>`:''}${warn}</div>`};
const st0=p=>{try{const v=stamp(p.start);return v==null||isNaN(v)?'':v}catch(e){return ''}};
const en0=p=>{try{const v=stamp(p.end);return v==null||isNaN(v)?'':v}catch(e){return ''}};

const joinBlock=(p)=>{if(typeof isAll!=='function'||!A.me||isAll(p))return '';const reqs=typeof reqOf==='function'?reqOf(p):[],nm=id=>first(pName(id));
  if(!p.who.includes(A.me)){const owners=p.who.map(nm).join(' + ');
   if(reqs.includes(A.me))return `<div class="q41-jn"><span>Waiting for ${esc(owners)} to say yes</span><button type="button" class="q41-jb" data-act="req-cancel" data-id="${p.id}" data-m="${A.me}">Cancel request</button></div>`;
   const armed=U.armedJoin===p.id;return `<div class="q41-jn"><button type="button" class="q41-jb${armed?' armed':''}" data-act="${armed?'do-join':'ask-join'}" data-id="${p.id}">${armed?'Tap again to ask':'Ask to join'}</button><span class="q41-jh">${esc(owners)}${p.who.length>1?' are':' is'} going</span></div>`}
  return reqs.filter(m=>!p.who.includes(m)).map(m=>`<div class="q41-jn"><span>${esc(nm(m))} wants to join</span><button type="button" class="q41-jb acc" data-act="req-accept" data-id="${p.id}" data-m="${m}">Accept</button><button type="button" class="q41-jb" data-act="req-decline" data-id="${p.id}" data-m="${m}">Decline</button></div>`).join('')};
window.q41Open=function(p){
 const f=files(p),pr=price(p),w=inits(p),area=oneLine(p.area);
 const line=[whenTxt(p),w,area].filter(Boolean).join(' · ');
 const mapU=p.place_id?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.name)+'&query_place_id='+encodeURIComponent(p.place_id):(p.maps_url&&/^https:\/\//.test(p.maps_url)?p.maps_url:((p.place||p.area)?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent((p.place||p.name)+' '+(p.area||'')):''));
 const btn=(h,l,i)=>`<a class="q41-b" target="_blank" rel="noopener noreferrer" href="${h}">${i}<span>${l}</span></a>`;
 const bs=[mapU?btn(mapU,'Open in Maps',ic(PIN,13)):''].filter(Boolean);
 const logged=p.logged&&window.__qst&&window.__qst.ST.rows.some(r=>r.id===p.logged);
 const lk=p.link&&url(p.link)?url(p.link):'';
 const imgs=f.filter(a=>/^image\//.test(a.mime));
 const thumbs=f.length?`<div class="q41-ph">${f.map(a=>{const u=window.__att.AT.urls[a.path],img=/^image\//.test(a.mime);
  return img?`<button type="button" class="q41-th" data-q41view="${a.id}" aria-label="View photo">${u?`<img src="${u}" alt="" loading="lazy">`:'<span>Photo</span>'}</button>`:`<button type="button" class="q41-th doc" data-attview="${a.id}" aria-label="Open ${esc(a.name)}"><span>PDF</span></button>`}).join('')}</div>`:'';
 return `<div class="q41-card${p.tent?' tent':''}" data-t0="${st0(p)}" data-t1="${en0(p)}">
 <div class="q41-head" data-act="toggle-ev" data-id="${p.id}" role="button" tabindex="0" aria-expanded="true"><div class="q41-ttl">${esc(p.name)}${p.tent?'<em class="q31-q" title="Tentative">?</em>':''}</div>${line?`<div class="q41-meta">${esc(line)}</div>`:''}</div>
 <button type="button" class="dots q41-dots" data-act="edit" data-kind="plan" data-id="${p.id}" aria-label="Edit details">⋯</button>
 ${bs.length?`<div class="q41-bs n${bs.length}">${bs.join('')}</div>`:''}
 ${p.place?`<div class="q41-addr">${esc(p.place)}</div>`:''}
 ${p.notes?`<div class="q41-notes">${esc(p.notes)}</div>`:''}
 ${(pr||logged)?`<div class="q41-xr"><span class="q41-xp">${pr?esc(pr):''}</span>${logged?`<span class="q41-lg"><b>✓</b> Expense logged <button type="button" class="q41-vw" data-q40="exp" data-id="${p.id}">view</button></span>`:`<button type="button" class="q41-exp" data-q40="exp" data-id="${p.id}">＋ Add as expense</button>`}</div>`:''}
 ${lk?`<a class="q41-lk" target="_blank" rel="noopener noreferrer" href="${esc(lk)}">Open link ↗</a>`:''}
 ${thumbs}
 ${joinBlock(p)}
 ${p.note?'':`<div class="q41-rep"><button type="button" class="q31-repb" data-act="q31-replace" data-id="${p.id}">⇄ Replace with…</button></div>`}
 </div>`};

/* ---- photo viewer: sideways swipe + arrows ---- */
function closeV(){const v=document.getElementById('q41v');if(v)v.remove();document.removeEventListener('keydown',key)}
function key(e){const sc=document.querySelector('#q41v .q41v-sc');if(e.key==='Escape')closeV();if(!sc)return;if(e.key==='ArrowRight')sc.scrollBy({left:sc.clientWidth,behavior:'smooth'});if(e.key==='ArrowLeft')sc.scrollBy({left:-sc.clientWidth,behavior:'smooth'})}
function openV(id){const AT=window.__att&&window.__att.AT;if(!AT)return;const a=AT.list.find(x=>x.id===id);if(!a)return;
 const list=AT.list.filter(x=>x.kind==='plan'&&x.owner_id===a.owner_id&&/^image\//.test(x.mime)&&AT.urls[x.path]);let i=list.findIndex(x=>x.id===id);
 if(i<0){toast('Still loading, try again in a second');return}closeV();
 const d=document.createElement('div');d.id='q41v';d.setAttribute('role','dialog');d.setAttribute('aria-label','Photos');
 d.innerHTML=`<div class="q41v-top"><span class="q41v-c"></span><button type="button" class="q41v-x" data-q41v="x" aria-label="Close">×</button></div><div class="q41v-sc">${list.map(x=>`<div class="q41v-s"><img src="${AT.urls[x.path]}" alt="${esc(x.name)}"></div>`).join('')}</div>${list.length>1?'<button type="button" class="q41v-n prev" data-q41v="prev" aria-label="Previous photo">‹</button><button type="button" class="q41v-n next" data-q41v="next" aria-label="Next photo">›</button>':''}`;
 document.body.appendChild(d);const sc=d.querySelector('.q41v-sc'),c=d.querySelector('.q41v-c');
 const upd=()=>{const k=Math.round(sc.scrollLeft/sc.clientWidth);c.textContent=list.length>1?(k+1)+' / '+list.length:'';const pv=d.querySelector('.prev'),nx=d.querySelector('.next');if(pv)pv.style.visibility=k<=0?'hidden':'visible';if(nx)nx.style.visibility=k>=list.length-1?'hidden':'visible'};
 sc.addEventListener('scroll',upd,{passive:true});sc.scrollLeft=i*sc.clientWidth;upd();document.addEventListener('keydown',key)}
document.addEventListener('click',e=>{
 const t=e.target.closest&&e.target.closest('[data-q41view]');if(t){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openV(t.dataset.q41view);return}
 const v=e.target.closest&&e.target.closest('[data-q41v]');if(v){e.preventDefault();e.stopPropagation();const sc=document.querySelector('#q41v .q41v-sc'),k=v.dataset.q41v;if(k==='x')closeV();else if(sc)sc.scrollBy({left:(k==='next'?1:-1)*sc.clientWidth,behavior:'smooth'});return}
 if(e.target.id==='q41v'||(e.target.classList&&e.target.classList.contains('q41v-s')))closeV()},true);

/* pending join requests: small badge on the owner's compact (column) cards */
function reqBadges(){try{if(typeof reqOf!=='function'||!A.me)return;document.querySelectorAll('.q31-cr[data-id]').forEach(el=>{if(el.querySelector('.q41-ask'))return;const p=D().plans.find(x=>x.id===el.dataset.id);if(!p||isAll(p)||!p.who.includes(A.me))return;const n=reqOf(p).filter(m=>!p.who.includes(m)).length;if(n){const sp=document.createElement('span');sp.className='q41-ask';sp.title='Wants to join';sp.textContent='+'+n;el.appendChild(sp)}})}catch(e){}}
{const _r=window.render;if(typeof _r==='function')window.render=function(){const r=_r.apply(this,arguments);reqBadges();return r}}
})();
