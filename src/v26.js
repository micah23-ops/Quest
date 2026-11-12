/* v26: roomier quick-add (Tentative / Just a note tucked behind "More"), compact edit-form options */
(function(){
const save=()=>{A.dirty=true;clearTimeout(A.deb);A.deb=setTimeout(push,350)};
/* quick add bar */
{const _qb=window.quickBar;if(typeof _qb==='function')window.quickBar=function(){
 const h=_qb.apply(this,arguments);
 const m=h.match(/<div class="quick-hint">[\s\S]*?<\/div>/),hint=m?m[0]:'';
 const who=[['all','All'],...A.people.map(p=>[p.id,first(p.name)])].map(([id,n])=>`<button type="button" class="${U.who===id?'sel':''}" data-who="${id}">${esc(n)}</button>`).join('');
 const open=true,t=!!U.q23t,n=!!U.q26n,tag=[t?'Tentative':'',n?'Note':''].filter(Boolean).join(' + ');
 return `<div class="quickline q26"><input id="quick" data-keep autocomplete="off" placeholder="1pm-2pm flower class Gangnam" aria-label="Quick add a plan"/><button class="primary" data-act="quick-add">Add</button><div class="q26-row"><div class="who-select" role="group" aria-label="Who is going">${who}</div></div>${open?`<div class="q26-opts"><label class="q26-chip${t?' on':''}"><input type="checkbox" id="q23_tent" data-keep ${t?'checked':''}><span>Tentative</span></label><label class="q26-chip${n?' on':''}"><input type="checkbox" id="q26_note" data-keep ${n?'checked':''}><span>Just a note</span></label></div>`:''}</div>${hint}`}}
window.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-act="q26-more"]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();U.q26open=!U.q26open;
 const q=document.getElementById('quick'),v=q?q.value:'';render();const q2=document.getElementById('quick');if(q2&&v)q2.value=v},true);
document.addEventListener('change',e=>{
 if(!e.target)return;
 if(e.target.id==='q23_tent'||e.target.id==='q26_note'){if(e.target.id==='q26_note')U.q26n=e.target.checked;
  const q=document.getElementById('quick'),v=q?q.value:'';render();const q2=document.getElementById('quick');if(q2&&v)q2.value=v}});
{const _aq=window.addQuick;if(typeof _aq==='function')window.addQuick=function(){
 const t=!!U.q23t,nt=!!U.q26n,n0=D().plans.length;
 const r=_aq.apply(this,arguments);
 const pl=D().plans;
 if((t||nt)&&pl.length>n0){U.q23t=false;U.q26n=false;pl.slice(n0).forEach(p=>{if(t)p.tent=true;if(nt){p.note=true;p.end=''}});save();render()}
 return r}}

/* edit form: Tentative and Just a note become small chips under "More options" */
{const _pf=window.planForm;if(typeof _pf==='function')window.planForm=function(p){
 let h=_pf.apply(this,arguments);if(typeof h!=='string'||!p)return h;
 const re=/<div class="q23-tg">[\s\S]*?<\/div>(?=\s*<)/;
 if(!re.test(h))return h;
 const chips=`<details class="q26-det"${p.tent||p.note?' open':''}><summary>More options</summary><div class="q26-opts"><label class="q26-chip${p.tent?' on':''}"><input type="checkbox" id="e_${p.id}_tent" data-keep ${p.tent?'checked':''}><span>Tentative</span></label><label class="q26-chip${p.note?' on':''}"><input type="checkbox" id="e_${p.id}_note" data-keep ${p.note?'checked':''}><span>Just a note</span></label></div><p class="q26-help">Tentative shows lighter for everyone. A note is a reminder that does not block time unless you add an end time.</p></details>`;
 return h.replace(re,()=>chips)}}
})();
