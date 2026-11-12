/* v30: "Ask ChatGPT for ideas". Builds a prompt whose answer Quick Add can place exactly. */
(function(){
const Q=()=>window.__q28||{};
const st={mode:'ideas',extra:'',copied:false,open:false};
let host=null;
const fmt=d=>{try{return displayDate(d)}catch(e){return d}};
function prompt(){
 const t=D().trip,dates=tripDates(),from=dates[0],to=dates[dates.length-1],city=t.city||t.name||'my destination';
 const names=A.people.map(p=>first(p.name)).join(', '),n=A.people.length;
 const have=(D().shortlist||[]).map(i=>i.name).slice(0,60);
 const stuff=have.length?`We already have these, so don't repeat them: ${have.join('; ')}.`:'';
 const extra=st.extra.trim()?`What we're after: ${st.extra.trim()}.`:'';
 const cats='Food, Cafes, Experience, Sights, Shopping, Nightlife, Stay';
 const rules=`Only suggest real places that are open now. If you're not sure a place exists, leave it out. Use the name as it appears on Google Maps. Put the neighborhood in the second part.`;
 const head=`I'm planning a trip to ${city} from ${from} to ${to} with ${n>1?n+' people ('+names+')':'just me'}.`;
 if(st.mode==='plan')return `${head} ${stuff} ${extra}\n\nPlan each day (3 to 5 things a day, nearby places grouped together, with realistic travel time).\n\nReply with ONLY a list, one item per line, in exactly this format and nothing else (no headings, no numbering, no bullets, no intro or closing text):\nYYYY-MM-DD | HH:MM-HH:MM | Name | Neighborhood | Category | Why, in a few words\n\nUse 24-hour times. Dates must be between ${from} and ${to}. Category must be one of: ${cats}.\n${rules}`.replace(/ +\n/g,'\n').replace(/\s{2,}(?=\S)/g,m=>m.includes('\n')?m:' ');
 return `${head} ${stuff} ${extra}\n\nSuggest 15 things to do, a mix of categories.\n\nReply with ONLY a list, one item per line, in exactly this format and nothing else (no headings, no numbering, no bullets, no intro or closing text):\nName | Neighborhood | Category | Why, in a few words\n\nCategory must be one of: ${cats}.\n${rules}`.replace(/ +\n/g,'\n')}
function html(){
 const p=prompt();
 return `<div class="q30-back" data-q30="close"></div><div class="q30-sheet" role="dialog" aria-label="Ask ChatGPT for ideas"><div class="q30-top"><strong>Ask ChatGPT for ideas</strong><button type="button" class="q30-x" data-q30="close" aria-label="Close">✕</button></div>
<div class="q30-modes"><button type="button" class="q30-m${st.mode==='ideas'?' on':''}" data-q30="mode" data-v="ideas">Ideas</button><button type="button" class="q30-m${st.mode==='plan'?' on':''}" data-q30="mode" data-v="plan">Day-by-day plan</button></div>
<label class="q30-l">Anything specific? <span>(optional)</span><input id="q30_extra" data-keep value="${esc(st.extra)}" placeholder="cheap eats, rainy day, no spicy food" autocomplete="off"></label>
<div class="q30-steps"><div><b>1</b> Tap <strong>Ask in ChatGPT</strong>. The prompt is already filled in.</div><div><b>2</b> Copy its answer.</div><div><b>3</b> Come back and tap <strong>Paste its answer</strong>. Each item goes to the right place.${st.mode==='plan'?' Planned items come in as Tentative.':''}</div></div>
<textarea id="q30_prompt" readonly rows="6">${esc(p)}</textarea>
<div class="q30-foot"><button type="button" class="primary" data-q30="ask">Ask in ChatGPT</button><button type="button" class="primary alt" data-q30="paste">Paste its answer</button></div>
<div class="q30-sub"><button type="button" class="q30-lk" data-q30="copy">${st.copied?'Copied ✓':'Copy prompt instead'}</button><button type="button" class="q30-lk" data-q30="quick">Open Quick Add</button></div></div></div>`}
function paint(){if(!host){host=document.createElement('div');host.id='q30';document.body.appendChild(host)}
 host.className=st.open?'on':'';if(!st.open){host.innerHTML='';return}host.innerHTML=html()}
function update(){const t=document.getElementById('q30_prompt');if(t)t.value=prompt()}
async function copy(){const p=prompt();let ok=false;
 try{await navigator.clipboard.writeText(p);ok=true}catch(e){}
 if(!ok){const t=document.getElementById('q30_prompt');if(t){t.removeAttribute('readonly');t.focus();t.select();try{ok=document.execCommand('copy')}catch(e){}t.setAttribute('readonly','')}}
 st.copied=ok;paint();if(!ok)toast('Couldn’t copy. Press and hold the text to copy it.')}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='q30_extra'){st.extra=e.target.value;st.copied=false;update();const b=host&&host.querySelector('[data-q30=copy]');if(b)b.textContent='Copy prompt'}});
window.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-q30],[data-act="q30-ask"]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(b.dataset.act==='q30-ask'){st.open=true;st.copied=false;paint();return}
 const k=b.dataset.q30;
 if(k==='close'){st.open=false;paint();return}
 if(k==='mode'){st.mode=b.dataset.v;st.copied=false;paint();return}
 if(k==='copy'){copy();return}
 if(k==='ask'){const p=prompt(),u='https://chatgpt.com/?q='+encodeURIComponent(p);st.asked=true;
  if(u.length>7000){copy().then(()=>{window.open('https://chatgpt.com/','_blank','noopener');toast('Prompt copied. Paste it into ChatGPT.')});return}
  window.open(u,'_blank','noopener');toast('Opening ChatGPT. Copy its answer, then come back.');return}
 if(k==='paste'){(async()=>{let t='';try{t=await navigator.clipboard.readText()}catch(e){}
   st.open=false;paint();const q=Q();if(q.openSheet)q.openSheet(t||'');if(!t)toast('Paste the answer into the box');})();return}
 if(k==='quick'){st.open=false;paint();const q=Q();if(q.openSheet)q.openSheet('');}
},true);
/* the entry point, under the add box on the Ideas tab */
{const _sl=window.shortlist;if(typeof _sl==='function')window.shortlist=function(){
 const h=_sl.apply(this,arguments);if(typeof h!=='string')return h;
 const btn='<div class="q30-ask-row"><button type="button" class="q30-ask" data-act="q30-ask">✨ Ask ChatGPT for ideas</button></div>';
 const t=document.createElement('template');t.innerHTML=h;const top=t.content.querySelector('.short-top');
 if(!top)return h;const after=t.content.querySelector('.q28-pv[data-for="shortquick"]')||top;after.insertAdjacentHTML('afterend',btn);return t.innerHTML}}
})();
