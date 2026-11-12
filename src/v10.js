/* v10: settings colour/theme are previewed, then Save (or Cancel to undo) */
window.themePreview=t=>{U.pendTheme=t;document.documentElement.dataset.theme=t};
function settingsRevert(){if(U.pend){for(const id in U.pend){const p=A.people.find(x=>x.id===id);if(p)p.color=U.pend[id]}}U.pend=null;if(U.pendTheme){document.documentElement.dataset.theme=getTheme();U.pendTheme=null}}
root.addEventListener('click',e=>{if(U.modal!=='settings')return;const b=e.target.closest('[data-act]');
if(b&&b.dataset.act==='set-color'){const p=A.people.find(x=>x.id===b.dataset.person);if(!p)return;e.stopImmediatePropagation();U.pend=U.pend||{};if(!(p.id in U.pend))U.pend[p.id]=p.color;p.color=b.dataset.c;render();return}
if((b&&b.dataset.act==='close')||e.target.id==='overlay')settingsRevert()},true);
root.addEventListener('submit',e=>{if(U.modal!=='settings')return;if(U.pendTheme)setTheme(U.pendTheme);U.pend=null;U.pendTheme=null;setTimeout(()=>toast('Saved ✓'),80)},true);
{const _d=window.drawer;window.drawer=()=>{let h=_d();if(U.modal==='settings'&&!U.dsheet){h=h.replace('<button type="submit" class="primary">Save</button>','<button type="submit" class="primary">Save changes</button>');if(U.pend||U.pendTheme)h=h.replace('<div class="footer">','<p class="helper" style="margin:8px 0 0">Previewing. Tap Save changes to keep it, or Cancel to undo.</p><div class="footer">')}return h}}
