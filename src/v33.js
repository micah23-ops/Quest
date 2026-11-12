/* v33: Essentials, the 4th tab. Trip details hub (Group | Mine) + "Before you go" checklist.
   Ticked items sink into a collapsed "Done" list. */
(function(){
const TAB='info';
const TD={rows:[],trip:null,ch:null,chTrip:null,openDone:false};
const hubTab=()=>U.hubTab||'group';
const mineOk=r=>r.scope==='group'||(A.user&&r.owner_id===A.user.id);
/* ---- nav ---- */
if(!NAV.find(n=>n[0]===TAB)){
 const ic='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="3"/></svg>';
 const i=NAV.findIndex(n=>n[0]==='bill');NAV.splice(i<0?NAV.length:i,0,[TAB,ic,'Essentials'])}
/* ---- data ---- */
async function load(){
 if(!A.client||!A.tripId)return;
 try{const r=await A.client.from('quest_todos').select('*').eq('trip_id',A.tripId).order('sort');
  if(!r.error){TD.rows=r.data||[];TD.trip=A.tripId}}catch(e){}
 sub();if(U.tab===TAB)render()}
function sub(){
 if(!A.client||TD.chTrip===A.tripId||!A.client.channel)return;
 try{if(TD.ch)A.client.removeChannel(TD.ch);TD.chTrip=A.tripId;
  TD.ch=A.client.channel('quest_todos_'+A.tripId).on('postgres_changes',{event:'*',schema:'public',table:'quest_todos',filter:'trip_id=eq.'+A.tripId},()=>load()).subscribe()}catch(e){}}
let lastTrip=null;
{const _r=window.render;window.render=function(){
 if(A.tripId&&U.screen==='trip'&&lastTrip!==A.tripId){lastTrip=A.tripId;setTimeout(load,0)}
 if(U.tab===TAB)U.detailsOpen=true;
 return _r.apply(this,arguments)}}
/* ---- screen ---- */
const mine=()=>hubTab()==='mine';
const items=()=>TD.rows.filter(r=>r.scope===hubTab()&&mineOk(r));
function todoHtml(){
 const all=items(),open=all.filter(r=>!r.done),done=all.filter(r=>r.done).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)));
 const li=r=>`<label class="q33-it${r.done?' done':''}"><input type="checkbox" data-q33="tick" data-id="${r.id}" ${r.done?'checked':''}><span>${esc(r.title)}</span><button type="button" class="q33-x" data-q33="del" data-id="${r.id}" aria-label="Delete ${esc(r.title)}">✕</button></label>`;
 return `<section class="q33-todo panel"><div class="q33-h"><h3>Before you go</h3><small>${open.length?open.length+' to do':'All done'}</small></div>
<div class="q33-add"><input id="q33_new" data-keep autocomplete="off" placeholder="Add a to-do" aria-label="Add a to-do"><button type="button" class="primary" data-q33="add">Add</button></div>
<div class="q33-list">${open.map(li).join('')||'<p class="q33-none">Nothing left. Nice.</p>'}</div>
${done.length?`<button type="button" class="q33-dtog" data-q33="toggle" aria-expanded="${TD.openDone}">${TD.openDone?'▾':'▸'} Done (${done.length})</button>${TD.openDone?`<div class="q33-list q33-dl">${done.map(li).join('')}</div>`:''}`:''}</section>`}
function infoScreen(){
 const dc=typeof window.detailsCard==='function'?window.detailsCard():'';
 return `<div class="q33-wrap"><div class="q33-title"><h2>Essentials</h2><p>${mine()?'Private. Only you can see this, including files.':'Everyone on the trip can see and edit this.'}</p></div>${hubSwitch()}${todoHtml()}<div class="q33-hub">${dc}</div></div>`}
/* the hub already draws its own Group | Mine switch inside its body, so the checklist follows the same switch */
function hubSwitch(){const t=hubTab();return `<div class="hub-tabs q33-sw" role="tablist"><button type="button" role="tab" aria-selected="${t==='group'}" class="${t==='group'?'on':''}" data-act="hub-tab" data-t="group">Group</button><button type="button" role="tab" aria-selected="${t==='mine'}" class="${t==='mine'?'on':''}" data-act="hub-tab" data-t="mine">Mine <span aria-hidden="true">🔒</span></button></div>`}
{const _b=window.bill;window.bill=function(){return U.tab===TAB?infoScreen():_b.apply(this,arguments)}}
/* ---- actions ---- */
async function add(){
 const i=document.getElementById('q33_new'),t=(i&&i.value||'').trim();if(!t){toast('Type a to-do first');return}
 if(!A.user){toast('Sign in to add a to-do');return}
 const row={id:uuid(),trip_id:A.tripId,scope:hubTab(),owner_id:A.user.id,title:t.slice(0,160),done:false,sort:Date.now(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
 TD.rows.push(row);i.value='';render();
 const r=await A.client.from('quest_todos').insert({id:row.id,trip_id:row.trip_id,scope:row.scope,owner_id:row.owner_id,title:row.title,sort:row.sort});
 if(r&&r.error){TD.rows=TD.rows.filter(x=>x.id!==row.id);render();toast('Couldn’t save: '+r.error.message)}
 else setTimeout(()=>{const n=document.getElementById('q33_new');if(n)n.focus()},50)}
async function tick(id,on){
 const r=TD.rows.find(x=>x.id===id);if(!r)return;r.done=on;r.updated_at=new Date().toISOString();render();
 const u=await A.client.from('quest_todos').update({done:on,done_by:on&&A.user?A.user.id:null,updated_at:r.updated_at}).eq('id',id);
 if(u&&u.error){r.done=!on;render();toast('Couldn’t save: '+u.error.message)}}
async function del(id){
 const r=TD.rows.find(x=>x.id===id);if(!r)return;TD.rows=TD.rows.filter(x=>x.id!==id);render();
 toastUndo('Deleted “'+r.title+'”',async()=>{TD.rows.push(r);render();await A.client.from('quest_todos').insert({id:r.id,trip_id:r.trip_id,scope:r.scope,owner_id:r.owner_id,title:r.title,done:r.done,sort:r.sort})});
 await A.client.from('quest_todos').delete().eq('id',id)}
window.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-q33]'):null;if(!b)return;
 const k=b.dataset.q33;
 if(k==='tick'){e.stopPropagation();tick(b.dataset.id,b.checked);return}
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(k==='add')add();else if(k==='del')del(b.dataset.id);else if(k==='toggle'){TD.openDone=!TD.openDone;render()}},true);
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='q33_new'&&e.key==='Enter'){e.preventDefault();add()}});
window.__q33={TD,load};
})();
