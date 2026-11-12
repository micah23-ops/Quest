/* v38 - Ideas: All | Compare tabs, Group by, always-visible filter chips, + menu, compare-with suggestions; Group chips on by default; plan sheet date title */
(function(){
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null};
const tab=()=>LS('quest_itab')==='cmp'?'cmp':'all';
const grp=()=>{const g=LS('quest_igroup');return g==='area'||g==='cat'?g:'none'};
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9ㄱ-힝]+/g,' ').trim();
const dd=d=>{try{return displayDate(d)}catch(e){return d}};
const STOP=new Set(['the','and','for','with','near','best','cafe','café']);
const ideaOf=w=>{const e=w.querySelector('.check-done');return e?e.dataset.id:''};
const cmpGroups=()=>{const ids=new Set((D().shortlist||[]).map(x=>x.id));return (D().groups||[]).filter(g=>g.idea_id&&ids.has(g.idea_id)&&g.options.length)};

{const _sl=window.shortlist;if(typeof _sl==='function')window.shortlist=function(){
 if(grp()!=='area'||tab()!=='all')U.shortArea='All areas';if(grp()==='none'||tab()!=='all')U.shortCat='All types';
 U.shortView=grp()==='area'&&tab()==='all'?'area':'all';
 const html=_sl.apply(this,arguments);if(typeof html!=='string')return html;
 const t=document.createElement('template');t.innerHTML=html;const c=t.content;
 const items=D().shortlist||[];
 /* + menu */
 const top=c.querySelector('.short-top');
 if(top){const qa=c.querySelector('.q32-qa'),ask=c.querySelector('.q30-ask-row');
  const add=top.querySelector('[data-act="short-add"]');
  const plus=document.createElement('button');plus.type='button';plus.className='ghost q38-plus';plus.setAttribute('data-q38','menu');plus.setAttribute('aria-label','More ways to add');plus.setAttribute('aria-expanded','false');plus.textContent='+';
  const menu=document.createElement('div');menu.className='q38-menu';menu.hidden=true;
  if(ask)menu.appendChild(ask);if(qa)qa.remove();
  if(add)add.after(plus);else top.appendChild(plus);
  top.appendChild(menu)}
 /* compare boxes: no header, pick on the first idea too */
 c.querySelectorAll('.q27-cg').forEach(b=>{const l=b.querySelector('.q27-cgl');if(l)l.remove();
  const w=b.querySelector('.short-wrap');const id=w?ideaOf(w):'';
  if(w&&id&&!b.querySelector('.q38-first')){const r=document.createElement('div');r.className='q27-pickrow q38-pickidea';r.innerHTML=`<button type="button" class="mv q27-pick" data-act="q38-pickidea" data-id="${id}">Pick this one</button>`;const f=document.createElement('div');f.className='q38-first';b.insertBefore(f,w);f.appendChild(w);f.appendChild(r)}});
 c.querySelectorAll('.short-wrap').forEach(w=>{if(w.closest('.q27-cg'))return;const ed=w.querySelector('.q37-edit'),id=ideaOf(w);if(!ed||!id||ed.querySelector('.q38-cmpbtn'))return;
  ed.insertAdjacentHTML('beforeend','<button type="button" class="q38-cmpbtn" data-q38cmp="'+esc(id)+'">⚖ Compare with another idea…</button>')});
 const ncmp=cmpGroups().length;
 /* tabs, group by, filter chips */
 const old=c.querySelector('.short-chips'),oldF=c.querySelector('.short-filters');if(oldF)oldF.remove();
 const bar=document.createElement('div');bar.className='q38-bar';
 const T=tab(),G=grp();
 let h=`<div class="q38-tabs" role="tablist"><button type="button" role="tab" aria-selected="${T==='all'}" class="${T==='all'?'on':''}" data-q38t="all">All</button><button type="button" role="tab" aria-selected="${T==='cmp'}" class="${T==='cmp'?'on':''}" data-q38t="cmp">Compare${ncmp?` <span>${ncmp}</span>`:''}</button></div>`;
 if(T==='all'&&items.length){
  h+=`<div class="q38-gb"><span>Group by</span>${[['none','None'],['area','Area'],['cat','Category']].map(([k,l])=>`<button type="button" class="${G===k?'on':''}" data-q38g="${k}" aria-pressed="${G===k}">${l}</button>`).join('')}</div>`;
  const areas=[...new Set(items.map(i=>String(i.area||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const cats=[...new Set(items.map(i=>i.category).filter(Boolean))];
  const chip=(kind,v,on)=>`<button type="button" class="q38-chip${on?' on':''}" data-q38f="${kind}" data-v="${esc(v)}" aria-pressed="${on}">${esc(v)}</button>`;
  if(G==='area'&&areas.length>1){h+=`<div class="q38-chips" aria-label="Area">${areas.map(a=>chip('area',a,U.shortArea===a)).join('')}</div>`;
   const scoped=U.shortArea&&U.shortArea!=='All areas'?items.filter(i=>String(i.area||'').trim()===U.shortArea):items;
   const cats2=[...new Set(scoped.map(i=>i.category).filter(Boolean))];
   if(cats2.length>1)h+=`<div class="q38-chips" aria-label="Category">${cats2.map(a=>chip('cat',a,U.shortCat===a)).join('')}</div>`}
  if(G==='cat'&&cats.length>1)h+=`<div class="q38-chips" aria-label="Category">${cats.map(a=>chip('cat',a,U.shortCat===a)).join('')}</div>`}
 bar.innerHTML=h;
 if(old)old.replaceWith(bar);else if(top)top.after(bar);
 if(top){const sa=document.createElement('div');sa.className='q32-qa q38-smart';sa.innerHTML='<button type="button" data-act="q32-qa">✦ Smart add</button>';top.after(sa)}
 const list=c.querySelector('.short-list');
 /* compare tab: only the compare boxes */
 if(T==='cmp'&&list){
  const boxes=[...list.querySelectorAll('.q27-cg')];
  list.innerHTML='';boxes.forEach(b=>list.appendChild(b));
  if(!boxes.length)list.innerHTML='<div class="empty-state"><strong>Nothing to compare yet.</strong>Type an idea above, then tap “Compare with…” under it.</div>';
  const pl=c.querySelector('.q37-planned');if(pl)pl.remove()}
 /* compare boxes go to the very bottom of All */
 if(T==='all'&&list){
  const boxes=[...c.querySelectorAll('.q27-cg')];
  if(boxes.length){
   const sec=document.createElement('section');sec.className='q38-cmpsec';sec.innerHTML=`<div class="q38-cmph">Comparing · ${boxes.length}</div>`;
   boxes.forEach(b=>sec.appendChild(b));
   list.querySelectorAll('.area-group').forEach(g=>{const n=g.querySelectorAll(':scope > .short-wrap').length;if(!n){g.remove();return}const cn=g.querySelector('.area-n');if(cn)cn.textContent=String(n)});
   const pl=c.querySelector('.q37-planned');(pl||list).after(sec)}}
 /* group by category */
 if(T==='all'&&G==='cat'&&list){
  const kids=[...list.children].filter(n=>(n.classList.contains('short-wrap')||n.classList.contains('q27-cg')));
  const catOf=n=>{const tg=n.querySelector('.sl-tags .tag:not(.area):not(.q37-when)');return (tg&&tg.textContent.trim())||'Other'};
  const gs={},order=[];kids.forEach(n=>{const k=catOf(n);if(!gs[k]){gs[k]=[];order.push(k)}gs[k].push(n)});
  if(order.length){list.innerHTML='';
   order.forEach(k=>{const s=document.createElement('section');s.className='area-group';
    s.innerHTML=`<div class="area-head"><span class="area-name"></span><span class="area-n">${gs[k].length}</span></div>`;s.querySelector('.area-name').textContent=k;
    gs[k].forEach(n=>s.appendChild(n));list.appendChild(s)})}}
 /* suggestion strip under the add box */
 const pv=c.querySelector('.q28-pv[data-for="shortquick"]');
 const sg=document.createElement('div');sg.id='q38sg';sg.className='q38-sg';sg.hidden=true;
 if(pv)pv.after(sg);else if(top)top.after(sg);
 return t.innerHTML}}

/* ---- compare-with suggestions ---- */
function fillSg(){
 const inp=document.getElementById('shortquick'),sg=document.getElementById('q38sg');if(!inp||!sg)return;
 const txt=inp.value.trim();
 if(!txt){sg.hidden=true;sg.innerHTML='';return}
 const words=norm(txt).split(' ').filter(w=>w.length>=3&&!STOP.has(w));
 /* candidates: ideas not in a compare box yet, plus every undecided compare box (linked to an idea or not) */
 const gs=(D().groups||[]).filter(g=>g.options&&g.options.length&&!g.options.some(o=>o.status==='To book'));
 const inBox=new Set(gs.map(g=>g.idea_id).filter(Boolean));
 const ideas=(D().shortlist||[]).filter(i=>!i.done&&!inBox.has(i.id)).map(i=>({id:i.id,name:i.name,txt:i.name+' '+(i.area||''),fav:!!i.favorite,g:false}));
 const boxes=gs.map(g=>({id:g.id,name:g.name||(g.options[0]&&g.options[0].name)||'Comparing',txt:(g.name||'')+' '+g.options.map(o=>o.name+' '+(o.area||'')).join(' '),fav:false,g:true}));
 const cand=boxes.concat(ideas);
 if(!cand.length){sg.hidden=true;return}
 const sc=i=>{const n=' '+norm(i.txt)+' ';return words.reduce((a,w)=>a+(n.includes(' '+w+' ')||n.includes(w)?1:0),0)};
 const rows=cand.map(i=>({i,s:sc(i)})).sort((a,b)=>b.s-a.s||(b.i.g?1:0)-(a.i.g?1:0)||(b.i.fav?1:0)-(a.i.fav?1:0)||a.i.name.localeCompare(b.i.name));
 const sim=rows.filter(r=>r.s>0),other=rows.filter(r=>!r.s);
 const all=!!U.q38all,lim=4;
 let show=sim.concat(other);const more=show.length>lim;if(!all)show=show.slice(0,Math.max(lim,Math.min(sim.length,6)));
 sg.hidden=false;
 sg.innerHTML=`<span class="q38-sgl">Compare with…</span>`+show.map(r=>r.i.g?`<button type="button" class="q38-sgb q38-sgg${r.s?' sim':''}" data-q38cg="${esc(r.i.id)}" title="Already being compared">⚖ ${esc(r.i.name)}</button>`:`<button type="button" class="q38-sgb${r.s?' sim':''}" data-q38c="${esc(r.i.id)}">${esc(r.i.name)}</button>`).join('')+(more?`<button type="button" class="q38-sgm" data-q38="showall">${all?'Show fewer':'Show all ('+rows.length+')'}</button>`:'')+`<span class="q38-sgh">or just press Add</span>`}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='shortquick')fillSg()},true);
function addCompare(ideaId){
 const inp=document.getElementById('shortquick');const it=(D().shortlist||[]).find(x=>x.id===ideaId);if(!inp||!it)return;
 const text=inp.value.trim();if(!text)return;inp.value='';
 const isUrl=/^https?:\/\/\S+$/i.test(text);let name=text,link='';
 if(isUrl){link=text;try{name=new URL(text).hostname.replace(/^www\./,'')}catch(e){}}
 let area='';try{area=window.__q37.areaFrom(text)||''}catch(e){}
 if(!D().groups.find(g=>g.idea_id===ideaId))mut(()=>{D().groups.push({id:uuid(),name:it.name,idea_id:ideaId,options:[]})});
 const g=D().groups.find(x=>x.idea_id===ideaId);
 mut(()=>{g.options.push({id:uuid(),name,link,area,price:'',notes:'',status:'Considering',votes:{}})});
 inp.value='';U.q38all=false;LS('quest_itab','cmp');
 toast('Comparing with '+it.name);render()}
/* the typed text becomes one more option in a compare box that already exists */
function addToBox(gid){
 const inp=document.getElementById('shortquick');const g=(D().groups||[]).find(x=>x.id===gid);if(!inp||!g)return;
 const text=inp.value.trim();if(!text)return;inp.value='';
 const isUrl=/^https?:\/\/\S+$/i.test(text);let name=text,link='';
 if(isUrl){link=text;try{name=new URL(text).hostname.replace(/^www\./,'')}catch(e){}}
 let area='';try{area=window.__q37.areaFrom(text)||''}catch(e){}
 mut(()=>{g.options.push({id:uuid(),name,link,area,price:'',notes:'',status:'Considering',votes:{}})});
 U.q38all=false;LS('quest_itab','cmp');
 toast('Added to the '+(g.name||'compare')+' box');render()}

/* ---- compare an existing idea with another entry ---- */
let CMP=null;
function closeCmp(){CMP=null;const h=document.getElementById('q38cmp');if(h)h.remove()}
function openCmp(id){
 const it=(D().shortlist||[]).find(x=>x.id===id);if(!it)return;CMP=id;closeCmp();CMP=id;
 const boxes=(D().groups||[]).filter(g=>g.options&&g.options.length&&!g.options.some(o=>o.status==='To book')&&g.idea_id!==id);
 const inBox=new Set(boxes.map(g=>g.idea_id).filter(Boolean));
 const ideas=(D().shortlist||[]).filter(x=>x.id!==id&&!x.done&&!inBox.has(x.id));
 const row=(k,n,s)=>'<button type="button" class="q38-cr" data-q38cpick="'+esc(k)+'"><b>'+esc(n)+'</b><small>'+esc(s)+'</small></button>';
 const body=boxes.map(g=>row('g:'+g.id,g.name||(g.options[0]&&g.options[0].name)||'Comparing','⚖ Already comparing · '+g.options.length+' option'+(g.options.length===1?'':'s'))).join('')+ideas.map(x=>row('i:'+x.id,x.name,[x.category,x.area].filter(Boolean).join(' · ')||'Idea')).join('');
 const h=document.createElement('div');h.id='q38cmp';
 h.innerHTML='<div class="q38-cback" data-q38cclose="1"></div><div class="q38-csheet" role="dialog" aria-label="Compare"><div class="q38-ctop"><strong>Compare “'+esc(it.name)+'” with…</strong><button type="button" class="q38-cx" data-q38cclose="1" aria-label="Close">✕</button></div><div class="q38-clist">'+(body||'<p class="q38-cnone">Nothing else to compare with yet.</p>')+'</div></div>';
 document.body.appendChild(h)}
function mergeInto(key){
 const id=CMP,it=(D().shortlist||[]).find(x=>x.id===id);if(!it){closeCmp();return}
 const kind=key.slice(0,1),tid=key.slice(2);
 const opt=()=>({id:uuid(),name:it.name,link:it.link||'',area:it.area||'',price:'',notes:it.notes||'',status:'Considering',votes:{}});
 let tname='';
 mut(()=>{
  let g;
  if(kind==='g'){g=D().groups.find(x=>x.id===tid)}
  else{const o=(D().shortlist||[]).find(x=>x.id===tid);if(!o)return;g=D().groups.find(x=>x.idea_id===tid);if(!g){g={id:uuid(),name:o.name,idea_id:tid,options:[]};D().groups.push(g)}}
  if(!g)return;tname=g.name||'';
  /* if this idea already had its own compare box, bring its options along */
  const own=D().groups.find(x=>x.idea_id===id);
  if(own&&own!==g){own.options.forEach(o=>g.options.push(o));D().groups=D().groups.filter(x=>x!==own)}
  g.options.push(opt());
  D().shortlist=D().shortlist.filter(x=>x.id!==id)});
 closeCmp();LS('quest_itab','cmp');
 toast('Now comparing '+it.name+(tname?' with '+tname:''));render()}

/* ---- clicks ---- */
function stop(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
window.addEventListener('click',e=>{
 const tg=e.target&&e.target.closest?e.target:null;if(!tg)return;
 const m=tg.closest('.q38-menu'),pb=tg.closest('[data-q38="menu"]');
 if(pb){stop(e);const mn=document.querySelector('.q38-menu');if(mn){mn.hidden=!mn.hidden;pb.setAttribute('aria-expanded',String(!mn.hidden))}return}
 if(!m){const mn=document.querySelector('.q38-menu');if(mn&&!mn.hidden){mn.hidden=true;const p=document.querySelector('.q38-plus');if(p)p.setAttribute('aria-expanded','false')}}
 else{setTimeout(()=>{const mn=document.querySelector('.q38-menu');if(mn)mn.hidden=true},0)}
 let b=tg.closest('[data-q38t]');if(b){stop(e);LS('quest_itab',b.dataset.q38t==='cmp'?'cmp':'all');render();return}
 b=tg.closest('[data-q38g]');if(b){stop(e);LS('quest_igroup',b.dataset.q38g);render();return}
 b=tg.closest('[data-q38f]');if(b){stop(e);const v=b.dataset.v;
  if(b.dataset.q38f==='area')U.shortArea=U.shortArea===v?'All areas':v;else U.shortCat=U.shortCat===v?'All types':v;
  render();return}
 b=tg.closest('[data-q38cmp]');if(b){stop(e);openCmp(b.dataset.q38cmp);return}
 b=tg.closest('[data-q38cpick]');if(b){stop(e);mergeInto(b.dataset.q38cpick);return}
 b=tg.closest('[data-q38cclose]');if(b){stop(e);closeCmp();return}
 b=tg.closest('[data-q38cg]');if(b){stop(e);addToBox(b.dataset.q38cg);return}
 b=tg.closest('[data-q38c]');if(b){stop(e);addCompare(b.dataset.q38c);return}
 b=tg.closest('[data-q38="showall"]');if(b){stop(e);U.q38all=!U.q38all;fillSg();return}
 b=tg.closest('[data-act="q38-pickidea"]');if(b){stop(e);const it=(D().shortlist||[]).find(x=>x.id===b.dataset.id);if(it&&window.__q37)window.__q37.openPickIdea(it);return}
},true);
/* Enter in the add box with compare chips shown still just adds */

/* after adding a plan, the who-chips go back to the start */
function resetQuick(){setTimeout(()=>{const q=document.getElementById('quick');if(q&&!q.value.trim()&&(U.who!=='all'||(U.whoSel||[]).length)){U.who='all';U.whoSel=[];render()}},200)}
window.addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('[data-act="quick-add"]'))resetQuick()},true);
window.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='quick')resetQuick()},true);

/* ---- Group view: everyone's chips on by default ---- */
function initChips(){try{if(!A.tripId||!A.people||A.people.length<2||A.people.length>4)return;const k='quest_chips_'+A.tripId,kn=k+'_seen',ids=A.people.map(p=>p.id);let cur=localStorage.getItem(k);
 if(cur===null){localStorage.setItem(k,JSON.stringify(ids));localStorage.setItem(kn,JSON.stringify(ids));return}
 let seen=[];try{seen=JSON.parse(localStorage.getItem(kn)||'null')||[]}catch(e){}
 const fresh=ids.filter(id=>!seen.includes(id));
 if(fresh.length){let c=[];try{c=JSON.parse(cur)||[]}catch(e){}if(seen.length)localStorage.setItem(k,JSON.stringify(c.concat(fresh)));localStorage.setItem(kn,JSON.stringify(ids))}}catch(e){}}

/* ---- plan sheet title = the date; small Add plan button ---- */
function mins(t){const m=/^(\d{1,2}):(\d{2})/.exec(t||'');return m?(+m[1])*60+(+m[2]):-1}
function interleave(){
 document.querySelectorAll('.cl-day').forEach(day=>{
  const wg=day.querySelector('.q31-wg');if(!wg)return;
  let rows=day.querySelector('.cl-rows');if(!rows){rows=document.createElement('div');rows.className='cl-rows';wg.before(rows)}
  [...wg.querySelectorAll('.q31-gap')].forEach(g=>{
   const a=+g.dataset.a;
   const items=[...rows.children].filter(n=>!n.classList.contains('q31-gap'));
   const next=items.find(n=>{const b=n.querySelector('[data-id]');const p=b&&(D().plans||[]).find(x=>x.id===b.dataset.id);const s=p?mins(p.start):-1;return s>a});
   if(next)rows.insertBefore(g,next);else rows.appendChild(g)});
  if(!wg.children.length)wg.remove()})}
function post(){
 interleave();
 const h=document.querySelector('.drawer-head h2'),di=document.querySelector('.drawer input[name="date"]');
 if(h&&di&&di.value&&(h.textContent==='Add a plan'||h.dataset.q38)){h.textContent=dd(di.value);h.dataset.q38='1'}
 document.querySelectorAll('.empty-add').forEach(b=>{if(/Add a plan/.test(b.textContent))b.textContent='+ Add plan'});
 document.querySelectorAll('.q31-gw').forEach(g=>{if(/^everyone else free$/i.test(g.textContent.trim()))g.remove()});
 document.querySelectorAll('.q31-gt').forEach(g=>{const t=g.textContent.trim();let m=/^(\d.*?) free$/.exec(t);if(m)g.textContent='Free time · '+m[1];else if(t==='Free all day')g.textContent='Free time · all day'});
 document.querySelectorAll('.q26-chip span,.q26-chip').forEach(n=>{if(n.children.length===0&&n.textContent==='Just a note')n.textContent='Reminder'});
 document.querySelectorAll('.q32-qa').forEach(q=>{q.classList.add('q38-smart');const a=q.querySelector('[data-act="q34-open"]');if(a)a.remove();const b=q.querySelector('[data-act="q32-qa"]');if(b&&b.textContent!=='✦ Smart add')b.textContent='✦ Smart add'});
 planChip();
 fillSg()}
function planChip(){const o=document.querySelector('.quickline.q26 .q26-opts');if(!o)return;
 const t=document.getElementById('q23_tent'),n=document.getElementById('q26_note');if(!t||!n)return;
 let p=o.querySelector('.q38-planchip');
 if(!p){p=document.createElement('button');p.type='button';p.className='q26-chip q38-planchip';p.textContent='Plan';p.setAttribute('data-q38plan','1');o.insertBefore(p,o.firstChild)}
 p.classList.toggle('on',!t.checked&&!n.checked)}
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-q38plan]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
 U.q23t=false;U.q26n=false;const q=document.getElementById('quick'),v=q?q.value:'';render();const q2=document.getElementById('quick');if(q2){q2.value=v;q2.focus()}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||(t.id!=='q23_tent'&&t.id!=='q26_note'))return;
 if(t.checked){if(t.id==='q23_tent'){U.q26n=false}else{U.q23t=false}}setTimeout(()=>{const q=document.getElementById('quick'),v=q?q.value:'';render();const q2=document.getElementById('quick');if(q2)q2.value=v},0)},false);
document.addEventListener('change',e=>{if(e.target&&e.target.name==='date')try{post()}catch(x){}},true);
{const _r=window.render;if(typeof _r==='function')window.render=function(){initChips();const r=_r.apply(this,arguments);try{post()}catch(e){}return r}}
initChips();
})();

/* compact plan editor: Day + Time and Area + Exact place sit side by side */
(function(){let busy=false;function tag(){if(busy)return;busy=true;try{document.querySelectorAll('.ef').forEach(ef=>{ef.classList.add('q38-ef');{const nb=ef.querySelector('input[id$="_note"]');ef.classList.toggle('q40-note',!!(nb&&nb.checked));if(nb&&nb.checked){const sp=ef.querySelector('input[id$="_name"]');const l=sp&&sp.parentElement&&sp.parentElement.querySelector(':scope > span');if(l&&l.textContent==='Activity')l.textContent='Reminder'}}[...ef.children].forEach(c=>{const s=c.querySelector&&c.querySelector(':scope > span');const t=((s&&s.textContent)||'').trim();const h=(c.tagName==='LABEL'||c.tagName==='DIV')&&t;const k={Day:'half',Time:'half',Area:'half','Exact place':'half'}[t];if(k&&!c.classList.contains('q38-half'))c.classList.add('q38-half')})})}finally{busy=false}}
new MutationObserver(()=>{tag();try{document.querySelectorAll('.q26-chip span').forEach(n=>{if(n.textContent==='Just a note')n.textContent='Reminder'})}catch(e){}}).observe(document.documentElement,{childList:true,subtree:true});tag()})();

/* Essentials: reorder the checklist, the categories and the cards with up / down arrows */
(function(){
let ro=false,busy=false,SORT={},lastF=0,hold=0;
const q=(s,r)=>(r||document).querySelector(s),qa=(s,r)=>[...(r||document).querySelectorAll(s)];
const ordKey=()=>'quest_secord_'+(A&&A.tripId);
const secOrder=()=>{try{return JSON.parse(localStorage.getItem(ordKey())||'[]')}catch(e){return[]}};
const secKey=el=>{if(el.classList.contains('q33-todo'))return 'todo';const b=q('[data-sec]',el);return b?b.dataset.sec:''};
const BL='.q33-hub .hub-sec, .q33-hub .q33-todo';
const clKey=()=>'quest_cl_'+(A&&A.tripId)+'_'+(U.hubTab||'group');
const clOn=()=>{try{return localStorage.getItem(clKey())==='1'}catch(e){return false}};
function pullTodo(){const td=q('.q33-todo'),body=q('.q33-hub .hub-body');if(!td||!body)return;const first=q('.hub-sec',body);if(first&&td.parentNode!==body)body.insertBefore(td,first)}
function addMenu(on){
 const sw=q('.q33-sw');if(!sw)return;
 let ar=q('.q39-addrow');
 const secs=qa('.q33-hub .hub-sec').map(s=>{const b=q('[data-act="hub-add"][data-sec]',s);return b?[b.dataset.sec,(q('h3',s)||{}).textContent||b.dataset.sec]:null}).filter(Boolean);
 if(!secs.length&&!q('.q33-todo'))return;
 const sig=secs.map(x=>x[0]).join(',')+'|'+on;
 if(!ar){ar=document.createElement('div');ar.className='q39-addrow';sw.after(ar)}
 if(ar.dataset.sig!==sig){ar.dataset.sig=sig;
  const nice={stay:'Stay',arrive:'Arrival',arrival:'Arrival',arrivals:'Arrival',depart:'Departure',departure:'Departure',departures:'Departure',other:'Other'};
  ar.innerHTML='<button type="button" class="q39-addbtn" data-q39="addmenu" aria-expanded="false">+ Add</button><div class="q39-addlist" hidden>'+secs.map(([k,l])=>'<button type="button" data-q39="addsec" data-k="'+k+'">'+(nice[k]||l)+'</button>').join('')+(on?'':'<button type="button" data-q39="addcl">Checklist</button>')+'</div>'}
 const any=qa('.q33-hub .hc').length||on;
 let em=q('.q39-emptyhint');
 if(!any){if(!em){em=document.createElement('p');em.className='q39-emptyhint';em.textContent='Nothing here yet. Add a stay, a flight or a checklist when you need one.';ar.after(em)}}else if(em)em.remove()}
function hideEmpty(){qa('.q33-hub .hub-sec').forEach(s=>s.classList.toggle('q39-off',!q('.hc',s)))}
function checklist(){const td=q('.q33-todo');if(!td)return;
 const has=!!(q('.q33-it',td)||q('.q33-dtog',td)),on=has||clOn();
 td.classList.toggle('q39-off',!on);
 const h3=q('.q33-h h3',td);if(h3&&h3.textContent!=='Checklist')h3.textContent='Checklist';
 addMenu(on);
 const hd=q('.q33-h',td);let rm=hd&&q('.q39-rm',hd);
 if(on&&!has&&hd){if(!rm){rm=document.createElement('button');rm.type='button';rm.className='q39-rm';rm.setAttribute('data-q39','rmcl');rm.textContent='Remove';hd.appendChild(rm)}}else if(rm)rm.remove()}
const ARR=(a,b,l)=>`<span class="q39-mv"><button type="button" data-q39="${a}" aria-label="Move ${l} up">▲</button><button type="button" data-q39="${b}" aria-label="Move ${l} down">▼</button></span>`;
function applyOrder(){
 pullTodo();
 const secs=qa(BL);
 if(secs.length>1){const o=secOrder(),rank=k=>{const i=o.indexOf(k);return i<0?99:i};
  const sorted=secs.map((s,i)=>[s,i]).sort((a,b)=>rank(secKey(a[0]))-rank(secKey(b[0]))||a[1]-b[1]).map(x=>x[0]);
  if(sorted.some((s,i)=>s!==secs[i])){const p=secs[0].parentNode,after=secs[secs.length-1].nextSibling;sorted.forEach(s=>p.insertBefore(s,after))}}
 secs.forEach(sec=>{const cs=qa(':scope > .hc',sec);if(cs.length<2)return;
  const key=c=>SORT[c.dataset.card]||1e9;
  const sorted=cs.map((c,i)=>[c,i]).sort((a,b)=>key(a[0])-key(b[0])||a[1]-b[1]).map(x=>x[0]);
  if(sorted.some((c,i)=>c!==cs[i]))sorted.forEach(c=>sec.appendChild(c))})}
function decorate(){if(busy)return;busy=true;try{
 checklist();hideEmpty();applyOrder();
 const t=q('.q33-title');
 if(t){let b=q('.q39-ro',t);if(!b){b=document.createElement('button');b.type='button';b.className='q39-ro';b.setAttribute('data-q39','ro');t.appendChild(b)}
  const want=ro?'Done':'Reorder';if(b.textContent!==want)b.textContent=want}
 /* checklist */
 const list=q('.q33-todo .q33-list:not(.q33-dl)'),its=list?qa('.q33-it',list):[];
 its.forEach((it,i)=>{let g=q('.q39-mv',it);
  if(ro&&its.length>1){if(!g){g=document.createElement('span');g.className='q39-mv';g.innerHTML=ARR('up','down','to-do').replace(/^<span class="q39-mv">|<\/span>$/g,'');it.insertBefore(g,q('.q33-x',it))}
   q('[data-q39="up"]',g).disabled=i===0;q('[data-q39="down"]',g).disabled=i===its.length-1}
  else if(g)g.remove()});
 /* categories */
 const secs=qa(BL);
 secs.forEach((sec,i)=>{const h=q('.hub-sh',sec)||q('.q33-h',sec);if(!h)return;let g=q(':scope > .q39-mv',h);
  if(ro&&secs.length>1){if(!g){h.insertAdjacentHTML('beforeend',ARR('sup','sdown','category'));g=q(':scope > .q39-mv',h)}
   q('[data-q39="sup"]',g).disabled=i===0;q('[data-q39="sdown"]',g).disabled=i===secs.length-1}
  else if(g)g.remove();
  /* cards */
  const cs=qa(':scope > .hc',sec);
  cs.forEach((c,k)=>{const top=q('.hc-top',c);if(!top)return;let m=q(':scope > .q39-mv',top);
   if(ro&&cs.length>1){if(!m){const w=q('.hc-menuwrap',top);w.insertAdjacentHTML('beforebegin',ARR('cup','cdown','card'));m=q(':scope > .q39-mv',top)}
    q('[data-q39="cup"]',m).disabled=k===0;q('[data-q39="cdown"]',m).disabled=k===cs.length-1}
   else if(m)m.remove()})});
 fetchSort()}finally{busy=false}}
function fetchSort(){
 if(!A.client||!A.tripId||!q('.q33-hub .hc')||Date.now()<hold||Date.now()-lastF<2500)return;lastF=Date.now();
 try{Promise.resolve(A.client.from('quest_info').select('id,sort').eq('trip_id',A.tripId)).then(r=>{
  if(!r||r.error||!r.data||Date.now()<hold)return;let ch=false;r.data.forEach(x=>{const v=x.sort||0;if((SORT[x.id]||0)!==v){SORT[x.id]=v;ch=true}});
  if(ch){busy=true;try{applyOrder()}finally{busy=false}}}).catch(()=>{})}catch(e){}}
new MutationObserver(()=>{try{decorate()}catch(e){}}).observe(document.documentElement,{childList:true,subtree:true});
async function moveCard(btn,dir){
 const c=btn.closest('.hc'),sec=c&&c.parentNode;if(!c||!sec)return;
 const cs=qa(':scope > .hc',sec),i=cs.indexOf(c),j=i+dir;if(j<0||j>=cs.length)return;
 const ids=cs.map(x=>x.dataset.card);[ids[i],ids[j]]=[ids[j],ids[i]];
 const ch=[];ids.forEach((id,k)=>{if(SORT[id]!==k+1){SORT[id]=k+1;ch.push([id,k+1])}});
 hold=Date.now()+4000;decorate();
 try{const rs=await Promise.all(ch.map(([id,v])=>A.client.from('quest_info').update({sort:v}).eq('id',id)));
  if(rs.some(r=>r&&r.error))toast('Couldn’t save the new order')}catch(e){toast('Couldn’t save the new order')}}
function moveSec(btn,dir){
 const sec=btn.closest('.hub-sec,.q33-todo'),secs=qa(BL),i=secs.indexOf(sec),j=i+dir;if(j<0||j>=secs.length)return;
 const keys=secs.map(secKey);[keys[i],keys[j]]=[keys[j],keys[i]];
 try{localStorage.setItem(ordKey(),JSON.stringify(keys))}catch(e){}
 decorate()}
async function moveTodo(btn,dir){
 const it=btn.closest('.q33-it'),tk=it&&q('[data-q33="tick"]',it);if(!tk)return;
 const sib=dir<0?it.previousElementSibling:it.nextElementSibling;if(!sib||!sib.classList.contains('q33-it'))return;
 const sk=q('[data-q33="tick"]',sib);if(!sk)return;
 const id=tk.dataset.id,sid=sk.dataset.id,TD=window.__q33&&window.__q33.TD;if(!TD)return;
 const a=TD.rows.find(r=>r.id===id),b=TD.rows.find(r=>r.id===sid);if(!a||!b)return;
 let sa=a.sort,sb=b.sort;if(sa===sb)sb=sa+(dir<0?1:-1);
 a.sort=sb;b.sort=sa;TD.rows.sort((x,y)=>(x.sort||0)-(y.sort||0));render();
 try{const r1=await A.client.from('quest_todos').update({sort:a.sort}).eq('id',id);const r2=await A.client.from('quest_todos').update({sort:b.sort}).eq('id',sid);
  if((r1&&r1.error)||(r2&&r2.error))toast('Couldn’t save the new order')}catch(e){toast('Couldn’t save the new order')}}
window.addEventListener('click',e=>{const t=e.target&&e.target.closest?e.target.closest('[data-q39]'):null;if(!t){const l=q('.q39-addlist');if(l&&!l.hidden&&!(e.target.closest&&e.target.closest('.q39-addrow'))){l.hidden=true}return}
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const k=t.dataset.q39;if(k==='ro'){ro=!ro;decorate();return}if(t.disabled)return;
 if(k==='addmenu'){const l=q('.q39-addlist');if(l){l.hidden=!l.hidden;t.setAttribute('aria-expanded',String(!l.hidden))}return}
 if(k==='addsec'){const l=q('.q39-addlist');if(l)l.hidden=true;const bb=q('.q33-hub [data-act="hub-add"][data-sec="'+t.dataset.k+'"]');if(bb)bb.click();return}
 if(k==='addcl'){const l=q('.q39-addlist');if(l)l.hidden=true;try{localStorage.setItem(clKey(),'1')}catch(e){}decorate();const n=document.getElementById('q33_new');if(n){n.focus();try{n.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}}return}
 if(k==='rmcl'){try{localStorage.removeItem(clKey())}catch(e){}decorate();return}
 if(k==='up')moveTodo(t,-1);else if(k==='down')moveTodo(t,1);else if(k==='sup')moveSec(t,-1);else if(k==='sdown')moveSec(t,1);else if(k==='cup')moveCard(t,-1);else if(k==='cdown')moveCard(t,1)},true);
window.__q39={SORT};
})();

/* free-gap sheet: Starts / Ends become dropdowns */
(function(){let busy=false;
const pad=n=>String(n).padStart(2,'0');
function lab(v){try{return prettyTime(v)}catch(e){return v}}
function conv(el){const cur=el.value||'';const s=document.createElement('select');s.id=el.id;s.setAttribute('data-keep','');
 const set=new Set();let h='';if(el.id==='q31_en')h+='<option value="">No end</option>';else h+='<option value="">Pick a time</option>';
 for(let m=360;m<=1425;m+=15)set.add(pad(Math.floor(m/60))+':'+pad(m%60));
 if(cur)set.add(cur);
 [...set].sort().forEach(v=>{h+=`<option value="${v}">${lab(v)}</option>`});
 s.innerHTML=h;s.value=cur;el.replaceWith(s)}
function scan(){if(busy)return;busy=true;try{document.querySelectorAll('input[type="time"]#q31_st,input[type="time"]#q31_en').forEach(conv)}finally{busy=false}}
new MutationObserver(()=>{try{scan()}catch(e){}}).observe(document.documentElement,{childList:true,subtree:true});scan()})();

/* new things get a short outline; added-to-itinerary toast says where + a View cue */
(function(){
let nt=null,known=null,knownTrip=null,hlT=null;
const norm=x=>String(x||'').toLowerCase().replace(/[^a-z0-9ㄱ-힝]+/g,' ').trim();
const dd=d=>{try{return displayDate(d)}catch(e){return d}};
function highlight(id){
 if(!id)return false;
 const b=document.querySelector('[data-act="edit"][data-kind="plan"][data-id="'+id+'"]')||document.querySelector('[data-id="'+id+'"]');
 const row=b&&b.closest('.event,.cl-row,.q31-row');if(!row)return false;
 row.classList.add('q38-hl');try{row.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}
 clearTimeout(hlT);hlT=setTimeout(()=>{row.classList.remove('q38-hl');if(U.q38hl===id)U.q38hl=''},3500);return true}
function after(){
 try{
  const n=document.querySelector('.short-wrap[data-q37n="1"]');
  if(n&&!nt)nt=setTimeout(()=>{nt=null;U.q37new='';document.querySelectorAll('[data-q37n]').forEach(x=>x.removeAttribute('data-q37n'))},4500);
  if(A.tripId!==knownTrip){known=null;knownTrip=A.tripId}
  const ids=new Set(((D()||{}).plans||[]).map(p=>p.id));
  if(known&&U.tab==='trip'){const fresh=[...ids].filter(i=>!known.has(i));if(fresh.length===1&&!U.q38hl)U.q38hl=fresh[0]}
  known=ids;
  if(U.q38hl&&U.tab==='trip'){const id=U.q38hl;if(!highlight(id)){/* row not on screen */U.q38hl=''}}
 }catch(e){}}
{const _r=window.render;if(typeof _r==='function')window.render=function(){const r=_r.apply(this,arguments);after();return r}}
{const _tu=window.toastUndo;if(typeof _tu==='function')window.toastUndo=function(msg,fn){
 _tu.apply(this,arguments);
 try{if(/added to /i.test(String(msg))){const p=((D()||{}).plans||[]).slice(-1)[0];
  if(p&&p.date){const when=dd(p.date)+(p.start?' · '+prettyTime(p.start):'');
   toastEl.innerHTML='<span class="q38-tw">Added <b>'+esc(p.name)+'</b><br>'+esc(when)+'</span>'+(U.tab==='trip'?'':'<button type="button" class="toast-view" data-q38view="'+esc(p.id)+'">View</button>')+'<button type="button" class="toast-undo">Undo</button>';
   clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.classList.add('hidden');toastEl.classList.remove('act')},5500);return}}
  /* every other undo toast stays at least 3.5s */
  clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.classList.add('hidden');toastEl.classList.remove('act')},3500)}catch(e){}}}
window.addEventListener('click',e=>{
 const t=e.target&&e.target.closest?e.target:null;if(!t)return;
 const v=t.closest('[data-q38view]');
 if(v){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const p=(D().plans||[]).find(x=>x.id===v.dataset.q38view);if(!p)return;
  toastEl.classList.add('hidden');toastEl.classList.remove('act');U.date=p.date;U.tab='trip';U.q38hl=p.id;render();return}
 const dy=t.closest('[data-q37day]');
 if(dy){const w=dy.closest('.short-wrap'),c=w&&w.querySelector('.check-done'),id=c?c.dataset.id:'';
  const it=(D().shortlist||[]).find(x=>x.id===id);
  const p=it&&(D().plans||[]).find(x=>x.date===dy.dataset.q37day&&(norm(x.name)===norm(it.name)||(it.link&&x.link===it.link)));
  if(p)setTimeout(()=>{U.q38hl=p.id;render()},0)}
},true);
})();

/* free-gap sheet: only ideas that are not on the itinerary yet, a short list, and the time spelled out on every button */
(function(){
let busy=false;
const norm=x=>String(x||'').toLowerCase().replace(/[^a-z0-9ㄱ-힝]+/g,' ').trim();
const LIM=5;
function tm(){const e=document.getElementById('q31_st');const v=e&&e.value;if(!v)return '';try{return prettyTime(v)}catch(x){return v}}
function label(){const t=tm();document.querySelectorAll('#q31 .q31-idea b, #q31 .q31-type .primary').forEach(b=>{if(/^(Add|Swap)/.test(b.textContent)&&!/Swap/.test(b.textContent)){const w='Add'+(t?' at '+t:'');if(b.textContent!==w)b.textContent=w}})}
function tidy(){if(busy)return;const host=document.getElementById('q31');if(!host||!host.classList.contains('on'))return;busy=true;try{
 const box=host.querySelector('.q31-ideas');
 if(box&&!box.dataset.q38){
  const on=(window.__q37&&window.__q37.planOf)||null;
  [...box.querySelectorAll('.q31-idea')].forEach(r=>{const it=(D().shortlist||[]).find(i=>i.id===r.dataset.id);if(it&&on&&on(it).length)r.remove()});
  const rows=[...box.querySelectorAll('.q31-idea')];
  box.dataset.q38='1';
  if(rows.length>LIM){rows.slice(LIM).forEach(r=>r.classList.add('q38-more'));
   const b=document.createElement('button');b.type='button';b.className='q38-showmore';b.textContent='Show all '+rows.length+' ideas';b.setAttribute('data-q38sm','1');box.appendChild(b)}
  if(!rows.length&&!box.querySelector('.q31-none'))box.insertAdjacentHTML('afterbegin','<p class="q31-none">No ideas waiting. Type one above.</p>')}
 label()}finally{busy=false}}
new MutationObserver(()=>{try{tidy()}catch(e){}}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='q31_st')label()},true);
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-q38sm]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const box=b.parentNode;box.querySelectorAll('.q38-more').forEach(r=>r.classList.remove('q38-more'));b.remove()},true);
})();

/* attach: a small Take-a-photo button next to every Choose-a-file label (phones only) */
(function(){let busy=false;
function scan(){if(busy)return;busy=true;try{
 document.querySelectorAll('label.q34-pick, label.att-add, label.ie-up').forEach(l=>{
  if(l.nextElementSibling&&l.nextElementSibling.classList.contains('q38-cam'))return;
  const src=l.querySelector('input[type="file"]');if(!src)return;
  const c=document.createElement('label');c.className='q38-cam';c.title='Take a photo';c.setAttribute('aria-label','Take a photo');
  c.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><input type="file" accept="image/*" capture="environment" hidden data-q38cam>';
  l.after(c)})}finally{busy=false}}
document.addEventListener('change',e=>{const cam=e.target&&e.target.matches&&e.target.matches('[data-q38cam]')?e.target:null;if(!cam||!cam.files.length)return;
 const lab=cam.closest('.q38-cam'),src=lab&&lab.previousElementSibling&&lab.previousElementSibling.querySelector('input[type="file"]');if(!src)return;
 e.stopImmediatePropagation();
 try{const dt=new DataTransfer();[...cam.files].forEach(f=>dt.items.add(f));src.files=dt.files}catch(x){try{src.files=cam.files}catch(y){}}
 cam.value='';src.dispatchEvent(new Event('change',{bubbles:true}))},true);
new MutationObserver(()=>{try{scan()}catch(e){}}).observe(document.documentElement,{childList:true,subtree:true});scan()})();

/* Smart add sheet: photos and PDFs for existing cards are one small link away */
(function(){let busy=false;
function scan(){if(busy)return;busy=true;try{const tt=document.querySelector('.q28-sheet .q28-top strong');if(tt&&tt.textContent==='Quick Add')tt.textContent='Smart add';const h=document.querySelector('.q28-sheet .q28-hint');if(h&&!h.querySelector('[data-act="q34-open"]'))h.insertAdjacentHTML('beforeend',' <button type="button" class="q38-attlink" data-act="q34-open">📎 Attach photos to an existing card</button>')}finally{busy=false}}
new MutationObserver(()=>{try{scan()}catch(e){}}).observe(document.documentElement,{childList:true,subtree:true})})();
