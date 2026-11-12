/* v22: one-tap "Ask to join" + compact people list in settings (names as chips, a pen opens rename/remove) */
(function(){
/* 1) Ask to join: one tap sends it; the plan shows "Waiting for … / Cancel request" right away */
{const _ev=window.evCard;if(typeof _ev==='function')window.evCard=function(){const h=_ev.apply(this,arguments);return typeof h==='string'?h.replace('data-act="ask-join"','data-act="do-join"'):h}}
/* 2) People and sharing: chips instead of a text box + button per person */
{const _d=window.drawer;if(typeof _d==='function')window.drawer=function(){
 const html=_d.apply(this,arguments);if(!(typeof U!=='undefined'&&U.modal==='settings'))return html;
 const t=document.createElement('template');t.innerHTML=html;const c=t.content;
 const fields=[...c.querySelectorAll('.field')].filter(f=>f.querySelector('input[id^="pn_"]'));
 if(!fields.length)return html;
 const wrap=document.createElement('div');wrap.className='pchips';
 fields.forEach(f=>{const inp=f.querySelector('input[id^="pn_"]'),lab=f.querySelector('label');
  const joined=lab&&/^Joined/i.test(lab.textContent||'');const name=inp.getAttribute('value')||'';
  const chip=document.createElement('div');chip.className='pchip'+(joined?'':' pending');
  const head=document.createElement('div');head.className='pc-head';
  const nm=document.createElement('span');nm.className='pc-name';nm.textContent=name;nm.setAttribute('data-for',inp.id);
  const st=document.createElement('span');st.className='pc-st';st.textContent=joined?'':'not joined';
  const pen=document.createElement('button');pen.type='button';pen.className='pc-pen';pen.setAttribute('data-pen',inp.id);pen.setAttribute('aria-label','Edit '+name);pen.setAttribute('aria-expanded','false');pen.textContent='✎';
  head.appendChild(nm);if(!joined)head.appendChild(st);head.appendChild(pen);
  const edit=document.createElement('div');edit.className='pc-edit';edit.hidden=true;edit.appendChild(f);
  chip.appendChild(head);chip.appendChild(edit);wrap.appendChild(chip)});
 const eyebrow=c.querySelector('.eyebrow');if(eyebrow&&eyebrow.parentNode)eyebrow.parentNode.insertBefore(wrap,eyebrow.nextSibling);else c.insertBefore(wrap,c.firstChild);
 return t.innerHTML}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.pc-pen');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
 const chip=b.closest('.pchip'),ed=chip.querySelector('.pc-edit'),open=ed.hidden;
 document.querySelectorAll('.pchip.open').forEach(o=>{if(o!==chip){o.classList.remove('open');o.querySelector('.pc-edit').hidden=true;o.querySelector('.pc-pen').setAttribute('aria-expanded','false')}});
 ed.hidden=!open;chip.classList.toggle('open',open);b.setAttribute('aria-expanded',String(open));
 if(open){const i=ed.querySelector('input');if(i){i.focus();try{i.setSelectionRange(i.value.length,i.value.length)}catch(_){}}}},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.id||t.id.indexOf('pn_')!==0)return;const n=document.querySelector('.pc-name[data-for="'+t.id+'"]');if(n)n.textContent=t.value||'…'},true);
})();
