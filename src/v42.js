/* v42: "Compact free time" lives in Settings (under Itinerary layout), not on the itinerary page */
(function(){
const on=()=>{try{return localStorage.getItem('quest_gc')==='1'}catch(e){return false}};
function paint(){
 const box=document.querySelector('.drawer .q37-lay');if(!box)return;
 let r=box.querySelector('.q42-row');
 const html=`<button type="button" class="q42-gt${on()?' on':''}" data-act="q31-gaps" aria-pressed="${on()}">${on()?'✓ ':''}Compact free time</button><small>Shows each free gap as one short card</small>`;
 if(!r){r=document.createElement('div');r.className='q42-row';box.appendChild(r)}
 if(r.dataset.s!==String(on())){r.dataset.s=String(on());r.innerHTML=html}}
{const _r=window.render;if(typeof _r==='function')window.render=function(){const x=_r.apply(this,arguments);try{paint()}catch(e){}return x}}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.q42-gt'))setTimeout(()=>{try{paint()}catch(e){}},60)},false);
try{new MutationObserver(()=>{try{paint()}catch(e){}}).observe(document.body,{childList:true,subtree:true})}catch(e){}
})();
