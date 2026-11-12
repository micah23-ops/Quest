/* v32: UX pass. One add box per tab (Quick Add), compact Ideas rows, who-for follows the view */
(function(){
const OPEN=new Set();
const apply=()=>{
 document.querySelectorAll('.short-wrap').forEach(w=>{const c=w.querySelector('.check-done');const id=c&&c.dataset.id;w.classList.toggle('q32-open',!!(id&&OPEN.has(id)))})};
{const _r=window.render;if(typeof _r==='function')window.render=function(){try{
 if(window.__q31&&U.screen==='trip'||U.tab==='trip'){const s=window.__q31&&window.__q31.scope();if(!U.q35who){U.who=(s==='mine'&&A.me)?A.me:((window.__q31&&window.__q31.chips().length===1)?window.__q31.chips()[0]:'all');U.whoSel=U.who==='all'?[]:[U.who]}}}catch(e){}
 const r=_r.apply(this,arguments);try{apply()}catch(e){}return r}}
document.addEventListener('click',e=>{
 const body=e.target&&e.target.closest?e.target.closest('.short-wrap .sl-body'):null;
 if(!body||e.target.closest('a,button,input'))return;
 const w=body.closest('.short-wrap'),c=w.querySelector('.check-done'),id=c&&c.dataset.id;if(!id)return;
 if(OPEN.has(id))OPEN.delete(id);else OPEN.add(id);w.classList.toggle('q32-open')});
window.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('.q26 [data-who]'):null;if(b)U.q35who=true;if(e.target&&e.target.closest&&e.target.closest('[data-act="quick-add"]'))setTimeout(()=>{U.q35who=false},400)},true);
/* "Paste a list or photos" link under the add boxes */
const link='<div class="q32-qa"><button type="button" data-act="q32-qa">Paste a list</button><button type="button" data-act="q34-open">📎 Attach photos</button></div>';
{const _sl=window.shortlist;if(typeof _sl==='function')window.shortlist=function(){const h=_sl.apply(this,arguments);if(typeof h!=='string'||h.includes('q32-qa'))return h;
 return h.replace('<div class="q30-ask-row">',()=>link.replace('q32-qa"','q32-qa inl"')+'<div class="q30-ask-row">')}}
{const _t=window.trip;if(typeof _t==='function')window.trip=function(){const h=_t.apply(this,arguments);if(typeof h!=='string'||h.includes('q32-qa'))return h;
 const t=document.createElement('template');t.innerHTML=h;const q=t.content.querySelector('.quickline');if(!q)return h;q.insertAdjacentHTML('afterend',link);return t.innerHTML}}
window.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-act="q32-qa"]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const i=document.getElementById('shortquick')||document.getElementById('quick');const q=window.__q28;if(q&&q.openSheet)q.openSheet(i&&i.value?i.value:'')},true);
/* Ideas groups (By area / Category) fold open and shut; many ideas start folded so it is not overwhelming */
const SH={};
const foldApply=()=>{const gs=document.querySelectorAll('.area-group');if(!gs.length)return;
 const n=document.querySelectorAll('.short-wrap').length;
 gs.forEach(g=>{const h=g.querySelector('.area-head .area-name'),k=h?h.textContent.trim():'';
  const shut=k in SH?SH[k]:false;g.classList.toggle('q35-shut',!!shut)})};
document.addEventListener('click',e=>{const h=e.target&&e.target.closest?e.target.closest('.area-head'):null;if(!h)return;
 const g=h.closest('.area-group'),nm=h.querySelector('.area-name'),k=nm?nm.textContent.trim():'';if(!g)return;
 const shut=!g.classList.contains('q35-shut');SH[k]=shut;g.classList.toggle('q35-shut',shut)});
{const _r2=window.render;window.render=function(){const r=_r2.apply(this,arguments);try{foldApply();  document.querySelectorAll('.dots[data-act="edit"]').forEach(b=>{if(b.dataset.pen)return;b.dataset.pen='1';b.setAttribute('aria-label','Edit');b.title='Edit';b.innerHTML='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'})}catch(e){}return r}}
})();
