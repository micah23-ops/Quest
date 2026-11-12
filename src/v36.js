/* v36 - deleting a plan that several (but not all) people share: Remove me / Delete for everyone */
(function(){
const planOf=id=>(D().plans||[]).find(p=>p.id===id);
const multi=p=>p&&p.who&&p.who.length>=2&&p.who.length<(A.people||[]).length&&p.who.includes(A.me);
function ask(p){
 const old=document.getElementById('q36');if(old)old.remove();
 const el=document.createElement('div');el.id='q36';
 el.innerHTML=`<div class="q36-card" role="dialog" aria-label="Delete plan"><strong>${esc(p.name||'This plan')}</strong><p>This plan is shared with ${p.who.filter(x=>x!==A.me).map(x=>esc(first(pName(x)))).join(', ')}.</p><button type="button" class="primary" data-q36="me">Remove me from it</button><button type="button" class="q36-d" data-q36="all">Delete for everyone</button><button type="button" class="q36-c" data-q36="x">Cancel</button></div>`;
 document.body.appendChild(el);
 el.addEventListener('click',e=>{const b=e.target.closest('[data-q36]');if(!b&&e.target!==el)return;e.stopPropagation();const a=b?b.dataset.q36:'x';el.remove();
  if(a==='me'){const prev=p.who.slice();U.modal=null;mut(()=>{p.who=p.who.filter(x=>x!==A.me)});toastUndo('Removed you from this plan',()=>mut(()=>{p.who=prev}))}
  else if(a==='all'){const snap=Object.assign({},p);U.modal=null;mut(()=>{D().plans=D().plans.filter(x=>x.id!==p.id)});toastUndo('Deleted for everyone',()=>mut(()=>{D().plans.push(snap)}))}
 })}
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-act="del-plan"],[data-act="delete-plan"]');if(!b)return;
 const p=planOf(b.dataset.id||U.modalId);if(!multi(p))return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();ask(p)},true);
})();
