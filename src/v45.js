/* v45: expense sheet gets its own Amount box. Typing "Dinner 1200" in the title still fills it. */
(function(){
if(window.__q45)return;window.__q45=1;
const Q=()=>window.__qst;
const st=f=>{const q=Q(),x=q&&q.X;return x?(f==='main'?x.main:x.staged[+f]):null};
function inject(){const h=document.getElementById('qst');if(!h||!Q()||!Q().X)return;
 h.querySelectorAll('.qst-form').forEach(root=>{const f=root.dataset.form,s=st(f);if(!s)return;
  const r2=root.querySelector('.qst-r2');if(!r2)return;const pv=r2.querySelector('[data-pv]');
  const ti=root.querySelector('.qst-title');if(ti)ti.placeholder='What was it? e.g. Dinner 1200';
  let ai=r2.querySelector('.q45-amt');
  if(s.mode==='itemize'){if(ai)ai.remove();if(pv)pv.style.display='';return}
  if(pv)pv.style.display='none';
  if(!ai){ai=document.createElement('input');ai.className='qst-in qst-amt q45-amt';ai.dataset.f=f;ai.dataset.k='amount';ai.setAttribute('inputmode','decimal');ai.placeholder='Amount';ai.setAttribute('aria-label','Amount');ai.setAttribute('autocomplete','off');r2.appendChild(ai);ai.value=s.amount||''}
  else if(document.activeElement!==ai)ai.value=s.amount||''})}
let hostObs=null;
function watch(){const h=document.getElementById('qst');if(!h){hostObs=null;return}if(hostObs&&hostObs.h===h)return;
 const o=new MutationObserver(()=>{try{inject()}catch(e){}});o.observe(h,{childList:true});hostObs={h,o};try{inject()}catch(e){}}
new MutationObserver(watch).observe(document.body,{childList:true});watch();
let prev='';
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.k==='title'&&t.closest&&t.closest('#qst')){const s=st(t.dataset.f);prev=s?s.amount||'':''}},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.closest||!t.closest('#qst'))return;const k=t.dataset.k;if(k!=='title'&&k!=='amount')return;
 const root=t.closest('.qst-form'),s=st(t.dataset.f);if(!root||!s)return;const ai=root.querySelector('.q45-amt');
 if(k==='title'){if(!ai)return;if(!s.amount&&prev){ai.value=prev;ai.dispatchEvent(new Event('input',{bubbles:true}))}else if(document.activeElement!==ai)ai.value=s.amount||''}
 else if(t.classList.contains('q45-amt')){const ti=root.querySelector('.qst-title');if(!ti)return;const m=ti.value.match(/^(.*?)\s+[₱$€£¥₩]?\s?\d[\d,]*(?:\.\d+)?$/);if(m&&m[1].trim()){prev=t.value;ti.value=m[1].trim();ti.dispatchEvent(new Event('input',{bubbles:true}))}}
},false);
})();
