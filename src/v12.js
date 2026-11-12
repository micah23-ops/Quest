/* v12: cleaner header, bigger titles, smarter quick-add (day words, link-only titles) */
/* compact header: logo + back + details. Trip name/dates live in Trip details. */
window.header=()=>`<header class="masthead mini"><div class="mast-left"><button class="back-btn" data-act="go-trips" aria-label="All trips">‹</button><img class="mlogo" src="mascot/logo.png" alt="Quest" width="100" height="39"></div><div class="mast-right"><button class="small-btn" data-act="details">Trip details</button><button class="icon-btn" title="People, sharing and backup" data-act="settings" aria-label="People, sharing and backup">⚙</button></div></header>`;
{const _dc=window.detailsCard;window.detailsCard=()=>{const t=D().trip,n=A.people.length,meta=[t.city,t.from?fmtRange(t.from,t.to):'',n+' traveler'+(n===1?'':'s')].filter(Boolean).join(' · ');
return `<div class="dtrip"><div><b>${esc(t.name||t.city||'Untitled trip')}</b><span>${esc(meta)}</span></div><button type="button" class="edit-link" data-act="trip-settings">edit</button></div>`+_dc()}}
/* title from a bare link */
window.titleFromUrl=u=>{try{const x=new URL(u),host=x.hostname.replace(/^www\./,'');let seg=x.pathname.split('/').filter(Boolean).reverse().map(s=>{try{return decodeURIComponent(s)}catch(e){return s}}).find(s=>/[a-z]{3}/i.test(s)&&!/^[\w-]{20,}$/.test(s)&&!/^\d/.test(s));
if(seg){seg=seg.replace(/\.[a-z0-9]{2,4}$/i,'').replace(/[-_+]+/g,' ').replace(/\s+/g,' ').trim();if(seg.length>2)return seg.replace(/\b[a-z]/g,c=>c.toUpperCase())}
const h=host.split('.');const lab=h.length>1?h[h.length-2]:h[0];return lab.charAt(0).toUpperCase()+lab.slice(1)}catch(e){return 'New activity'}};
{const _pq=window.parseQuick;window.parseQuick=s=>{const r=_pq(s);if(r&&r.link&&r.name==='New activity')r.name=titleFromUrl(r.link);return r}}
/* day words: today, tomorrow, weekday names, "nov 18", "11/18" */
const WD=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'],MO=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
window.dayWords=s=>{s=String(s||'');const days=tripDates();if(!days.length)return null;const now=new Date(),today=iso(now),tom=iso(new Date(now.getFullYear(),now.getMonth(),now.getDate()+1));
const cut=(re,date)=>{const rest=s.replace(re,' ').replace(/\s+/g,' ').trim();return {date:days.includes(date)?date:U.date,rest}};
let m;
if((m=s.match(/(^|\s)tomorrow(?=\s|$)/i)))return cut(/(^|\s)tomorrow(?=\s|$)/i,tom);
if((m=s.match(/(^|\s)today(?=\s|$)/i)))return cut(/(^|\s)today(?=\s|$)/i,today);
const mon=s.match(new RegExp(`(^|\\s)(?:on\\s+)?(${MO.join('|')})[a-z]*\\.?\\s+(\\d{1,2})(?=\\s|$|,)`,'i'))||null;
if(mon){const mi=MO.indexOf(mon[2].toLowerCase()),dd=Number(mon[3]);const hit=days.find(d=>Number(d.slice(5,7))===mi+1&&Number(d.slice(8,10))===dd);if(hit)return {date:hit,rest:s.replace(mon[0],' ').replace(/\s+/g,' ').trim()}}
const sl=s.match(/(^|\s)(\d{1,2})\/(\d{1,2})(?=\s|$)/);if(sl){const hit=days.find(d=>Number(d.slice(5,7))===Number(sl[2])&&Number(d.slice(8,10))===Number(sl[3]));if(hit)return {date:hit,rest:s.replace(sl[0],' ').replace(/\s+/g,' ').trim()}}
const wk=s.match(new RegExp(`(^|\\s)(?:on\\s+)?(${WD.join('|')}|${WD.map(w=>w.slice(0,3)).join('|')})(?=\\s|$)`,'i'));
if(wk){const w=wk[2].toLowerCase(),short=w.length===3,idx=WD.findIndex(x=>x===w||x.slice(0,3)===w);
if(!short||/on\s/i.test(wk[0])||/^\s*\d/.test(s.slice(wk.index+wk[0].length))){const after=days.filter(d=>d>=U.date),pool=after.concat(days),hit=pool.find(d=>new Date(d+'T12:00:00').getDay()===idx);
if(hit)return {date:hit,rest:s.replace(wk[0],' ').replace(/\s+/g,' ').trim()}}}
return null};
{const _aq=window.addQuick;window.addQuick=()=>{const i=$('#quick');if(i){const r=dayWords(i.value);if(r&&r.rest){i.value=r.rest;U.date=r.date}}return _aq()}}
/* itinerary placeholder shows time + duration */
{const _t=window.trip;window.trip=()=>_t().replace('placeholder="Type a plan, like 2pm cafe Seongsu"','placeholder="Try 10am-12pm brunch at Resto"')}
/* shortlist: completed items live in a collapsed section at the bottom */
{const _sl=window.shortlist;window.shortlist=()=>{U.showDone=true;const t=document.createElement('template');t.innerHTML=_sl();const c=t.content;
const tg=c.querySelector('[data-act="toggle-done"]');if(tg)tg.remove();
const done=[...c.querySelectorAll('.short-wrap.done')];
if(done.length){const sec=document.createElement('section');sec.className='archive completed';const open=!!U.compOpen;
sec.innerHTML=`<button type="button" class="arch-toggle" data-act="toggle-completed" aria-expanded="${open}">${open?'▾':'▸'} Completed <span class="muted">(${done.length})</span></button>`;
if(open){const box=document.createElement('div');box.className='comp-rows';done.forEach(d=>box.appendChild(d));sec.appendChild(box)}else done.forEach(d=>d.remove());
const arch=c.querySelector('section.archive');if(arch)arch.parentNode.insertBefore(sec,arch);else c.appendChild(sec)}
return t.innerHTML}}
root.addEventListener('click',e=>{const b=e.target.closest('[data-act="toggle-completed"]');if(b){e.stopImmediatePropagation();U.compOpen=!U.compOpen;render()}},true);
/* planning: starter categories, clearer add row, link-only titles */
{const _po=window.parseOpt;window.parseOpt=s=>{const r=_po(s);if(r&&r.link&&(r.name==='New option'||/^[\w-]+(\.[\w-]+)+$/.test(r.name)))r.name=titleFromUrl(r.link);return r}}
{const _pl=window.planning;window.planning=()=>{let h=_pl();h=h.replace(/placeholder="Paste a link or name \| notes"/g,'placeholder="Add an idea or paste a link"');
if(!D().groups.length)h=h.replace('<div class="addgroup">',`<div class="seed"><span>Start with:</span>${['Restaurants','Places to stay','Activities','Cafes'].map(n=>`<button type="button" class="seed-chip" data-act="seed-group" data-name="${n}">+ ${n}</button>`).join('')}</div><div class="addgroup">`);return h}}
root.addEventListener('click',e=>{const b=e.target.closest('[data-act="seed-group"]');if(b){e.stopImmediatePropagation();const n=b.dataset.name;mut(()=>D().groups.push({id:uuid(),name:n,options:[]}));toast(n+' added')}},true);
/* friendlier empty states */
{const _g=window.groupedEvents;window.groupedEvents=d=>_g(d).replace('Nothing planned yet. Type something above to add it.','Nothing planned yet. What sounds fun?')}
