/* v27: Ideas = Shortlist + Planning in one tab. Views: List / Area / Plan (grouped by category, Compare drawer) */
(function(){
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null};
const planOn=()=>LS('quest_ideas_plan')==='1';
const open=()=>(U.q27o=U.q27o||{});
const mine=id=>D().groups.find(g=>g.idea_id===id);
const optOf=id=>{for(const g of D().groups){const o=g.options.find(x=>x.id===id);if(o)return {g,o}}return null};
const CATS=['Food','Cafes','Experience','Experiences','Sights','Shopping','Nightlife','Stay','Other'];

/* nav: Planning folds into Ideas */
{const i=NAV.findIndex(n=>n[0]==='planning');if(i>=0)NAV.splice(i,1);const s=NAV.find(n=>n[0]==='shortlist');if(s){s[2]='Ideas'}}
{const _r=window.render;if(typeof _r==='function')window.render=function(){if(U.tab==='planning')U.tab='shortlist';return _r.apply(this,arguments)}}

function drawer(it,plan){
 const g=mine(it.id),os=g?g.options:[],isOpen=!!open()[it.id],n=os.length;
 if(!n&&!isOpen)return plan?`<div class="q27-cmp none" data-for="${it.id}"><button type="button" class="q27-cbtn" data-act="q27-cmp" data-id="${it.id}" aria-expanded="false">⇄ Compare</button></div>`:'';
 let h=`<div class="q27-cmp has" data-for="${it.id}"><div class="q27-opts">`;
 h+=os.map(o=>`<div class="q27-opt">${optRow(o)}<div class="q27-pickrow"><button type="button" class="mv q27-pick" data-act="q27-pick" data-id="${o.id}">${o.status==='To book'?'✓ Picked':'Pick this one'}</button></div></div>`).join('');
 if(isOpen)h+=(n?'':`<p class="q27-empty">Add the first option, like a link or a studio name.</p>`)+`<div class="addrow"><input id="opt_${g.id}" data-keep data-addopt="${g.id}" placeholder="Paste a link or type a name" aria-label="Add an option to ${esc(it.name)}"/><button type="button" class="primary" data-act="add-opt-inline" data-id="${g.id}">Add</button></div>`;
 h+=`<button type="button" class="q27-cbtn" data-act="q27-cmp" data-id="${it.id}" aria-expanded="${isOpen}">${isOpen?'Done':'+ Add another option'}</button></div></div>`;
 return h}

function cgWrap(w,it,sec){const d=document.createElement('template');d.innerHTML=drawer(it,!!sec&&planOn());
 const g=mine(it.id);const has=g&&g.options.length;
 if(!has){if(d.innerHTML.trim())return d.content;return null}
 const box=document.createElement('div');box.className='q27-cg';
 const lb=document.createElement('div');lb.className='q27-cgl';lb.textContent='⇄ Comparing · pick one';box.appendChild(lb);
 w.parentNode.insertBefore(box,w);box.appendChild(w);box.appendChild(d.content);return null}
{const _sl=window.shortlist;if(typeof _sl==='function')window.shortlist=function(){
 let html=_sl.apply(this,arguments);
 const t=document.createElement('template');t.innerHTML=html;const c=t.content;
 const items=D().shortlist||[];
 const h2=c.querySelector('.section-title');if(h2)h2.textContent='Ideas';
 const kick=c.querySelector('.section-kicker');if(kick)kick.textContent='Everything you want to do. ★ marks a must-do.';
 const badge=c.querySelector('.summary-badge');if(badge)badge.textContent=badge.textContent.replace(/possibilit(y|ies)/,m=>m==='possibility'?'idea':'ideas');
 const addIn=c.querySelector('#shortquick');if(addIn){addIn.setAttribute('placeholder','Add an idea or paste a link');addIn.setAttribute('aria-label','Add an idea')}
 const seg=c.querySelector('.view-seg'),plan=planOn();
 if(seg){if(plan)seg.querySelectorAll('button').forEach(b=>{b.classList.remove('on');b.setAttribute('aria-pressed','false')});
  const b=document.createElement('button');b.type='button';b.setAttribute('data-act','q27-plan');b.className=plan?'on':'';b.setAttribute('aria-pressed',String(plan));b.textContent='Plan';seg.appendChild(b)}
 const list=c.querySelector('.short-list');
 if(list){
  const wraps=[...list.querySelectorAll('.short-wrap')];
  const idOf=w=>{const e=w.querySelector('[data-id]');return e?e.getAttribute('data-id'):''};
  if(plan&&wraps.length){
   const groups={};
   wraps.forEach(w=>{const tg=w.querySelector('.sl-tags .tag:not(.area)'),cat=(tg&&tg.textContent.trim())||'Other';(groups[cat]=groups[cat]||[]).push(w)});
   const order=Object.keys(groups).sort((a,b)=>wraps.indexOf(groups[a][0])-wraps.indexOf(groups[b][0]));
   list.innerHTML='';
   order.forEach(k=>{const sec=document.createElement('section');sec.className='area-group';
    const hd=document.createElement('div');hd.className='area-head';hd.innerHTML=`<span class="area-name"></span><span class="area-n">${groups[k].length}</span>`;hd.querySelector('.area-name').textContent=k;sec.appendChild(hd);
    groups[k].forEach(w=>{sec.appendChild(w);const it=items.find(x=>x.id===idOf(w));if(it){const r=cgWrap(w,it,true);if(r)sec.appendChild(r)}});
    list.appendChild(sec)})
  }else{
   wraps.forEach(w=>{const it=items.find(x=>x.id===idOf(w));if(!it)return;const r=cgWrap(w,it,false);if(r)w.after(r)})}
 }
 /* compare groups that came from the old Planning tab and are not linked to an idea yet */
 const linked=new Set((D().shortlist||[]).map(x=>x.id)),loose=(D().groups||[]).filter(g=>!g.idea_id||!linked.has(g.idea_id));
 if(loose.length&&typeof grp==='function'){
  const sec=document.createElement('section');sec.className='q27-loose';
  sec.innerHTML=`<h3 class="q27-h">Comparing</h3><p class="q27-sub">From your old Planning tab. Vote here, then use + Itinerary or + Shortlist on the winner.</p>${loose.map(g=>grp(g)).join('')}`;
  const arch=c.querySelector('.archive');if(arch)arch.parentNode.insertBefore(sec,arch);else c.appendChild(sec)}
 return t.innerHTML}}

/* clicks */
window.addEventListener('click',e=>{
 const sv=e.target&&e.target.closest?e.target.closest('[data-act="short-view"]'):null;
 if(sv){LS('quest_ideas_plan','0');return}
 const b=e.target&&e.target.closest?e.target.closest('[data-act="q27-plan"],[data-act="q27-cmp"],[data-act="q27-pick"]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const a=b.dataset.act;
 if(a==='q27-plan'){LS('quest_ideas_plan','1');render();return}
 if(a==='q27-cmp'){const id=b.dataset.id,it=D().shortlist.find(x=>x.id===id);if(!it)return;
  if(!mine(id))mut(()=>{D().groups.push({id:uuid(),name:it.name,idea_id:id,options:[]})});
  open()[id]=!open()[id];render();
  if(open()[id]){setTimeout(()=>{const g=mine(id),i=g&&document.getElementById('opt_'+g.id);if(i&&!i.value)i.focus({preventScroll:true})},50)}
  return}
 if(a==='q27-pick'){const f=optOf(b.dataset.id);if(!f)return;if(window.__q37&&window.__q37.openPick){window.__q37.openPick(f.g,f.o);return}const it=D().shortlist.find(x=>x.id===f.g.idea_id);if(!it)return;
  const prev={place:it.place,link:it.link,area:it.area,st:f.g.options.map(o=>[o.id,o.status])};
  mut(()=>{it.place=f.o.name;if(f.o.link)it.link=f.o.link;if(f.o.area)it.area=f.o.area;f.g.options.forEach(o=>{o.status=o.id===f.o.id?'To book':'Considering'})});
  toastUndo('Picked '+f.o.name,()=>mut(()=>{it.place=prev.place;it.link=prev.link;it.area=prev.area;prev.st.forEach(([id,s])=>{const x=f.g.options.find(o=>o.id===id);if(x)x.status=s})}));return}
},true);
})();
