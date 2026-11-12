/* v5: ask-to-join on plans, ghost cards for pending requests, trip name in settings */
function reqOf(p){return (D().requests||[]).filter(r=>r.plan_id===p.id).map(r=>r.member_id)}
function dropReq(pid,mid){const d=D();d.requests=(d.requests||[]).filter(r=>!(r.plan_id===pid&&r.member_id===mid));A.client.from('quest_plan_requests').delete().eq('plan_id',pid).eq('member_id',mid).then(r=>{if(r&&r.error)console.warn(r.error)})}
async function sendJoinReq(pid){U.armedJoin=null;const d=D(),row={plan_id:pid,member_id:A.me,trip_id:A.tripId};d.requests=d.requests||[];d.requests.push(row);render();const r=await A.client.from('quest_plan_requests').insert(row);if(r.error){d.requests=d.requests.filter(x=>x!==row);render();toast('Couldn’t send that: '+r.error.message)}else toast('Asked to join. They’ll see it on their plan.')}
function acceptReq(pid,mid){const p=D().plans.find(x=>x.id===pid);if(!p)return;let who=[...new Set([...p.who,mid])];if(who.length>=A.people.length)who=[];dropReq(pid,mid);mut(()=>{p.who=who});toast(first(pName(mid))+' is in')}
function ghostCard(p,col){const c=pCol(col),mine=col===A.me,iAmIn=p.who.includes(A.me),owners=p.who.map(id=>first(pName(id))).join(' + ');
const msg=mine?`Waiting for ${owners} to say yes`:`${first(pName(col))} wants to join`;
const acts=mine?`<button type="button" class="mv" data-act="req-cancel" data-id="${p.id}" data-m="${col}">Cancel request</button>`:(iAmIn?`<button type="button" class="mv acc" data-act="req-accept" data-id="${p.id}" data-m="${col}">Accept</button><button type="button" class="mv" data-act="req-decline" data-id="${p.id}" data-m="${col}">Decline</button>`:'');
return `<div class="event ghost" style="--gc:${c[1]};background:${c[0]}"><div class="ev-main static"><div class="event-title">${esc(p.name)}</div><div class="event-sub"><span>${esc(showDur(prettyTime(p.start),prettyTime(p.end)))}</span><span>${esc(owners)}’s plan</span></div><div class="ghost-msg">${esc(msg)}</div>${acts?`<div class="ev-join">${acts}</div>`:''}</div></div>`}
{const _ev=window.evCard;window.evCard=(p,dup,col)=>{const all=isAll(p),reqs=reqOf(p);
if(col&&!all&&reqs.includes(col)&&!p.who.includes(col))return ghostCard(p,col);
let h=_ev(p,dup);const editing=h.includes('class="event editing');
if(!editing&&!all&&p.who.length>1){h=h.replace(/style="background:[^"]*"/,'style=""').replace('class="event ','class="event shared ')}
if(!editing&&all&&A.people.length>1)h=h.replace(/(<div class="event-sub"><span>[^<]*<\/span>)/,'$1<span>Everyone</span>');
if(!editing&&!all&&!dup&&A.me&&!p.who.includes(A.me)&&!reqs.includes(A.me)){const armed=U.armedJoin===p.id;h=h.replace(/<\/div>\s*$/,`<div class="ev-join"><button type="button" class="mv ${armed?'armed':''}" data-act="${armed?'do-join':'ask-join'}" data-id="${p.id}">${armed?'Tap again to ask':'Ask to join'}</button></div></div>`)}
return h}}
function groupedEvents(day){const d=D(),list=d.plans.filter(x=>x.date===day).sort(sortTime);if(!list.length)return `<div class="day-empty">Nothing planned yet. Type something above to add it.</div>`;
const endOf=p=>{const s=stamp(p.start);if(s==null)return null;const e=stamp(p.end);return e!=null&&e>s?e:s+60};let blocks=[];for(const p of list){const s=stamp(p.start),last=blocks[blocks.length-1];if(last&&s!=null&&last.start!=null&&s<last.end){last.items.push(p);last.end=Math.max(last.end,endOf(p))}else blocks.push({start:s,end:s==null?null:endOf(p),items:[p]})}
const N=A.people.length,multi=N>1,wide=N>3?' wide':'';
const cols=items=>`<div class="grid-n${wide}" style="--n:${N}">${A.people.map(pp=>`<div>${items.filter(p=>p.who.includes(pp.id)||(reqOf(p).includes(pp.id)&&!isAll(p))).map(p=>evCard(p,p.who.includes(pp.id)&&A.people.find(x=>p.who.includes(x.id)).id!==pp.id,pp.id)).join('')}</div>`).join('')}</div>`;
const head=multi?`<div class="slot colhead"><div class="slot-time"></div><div class="grid-n${wide}" style="--n:${N}">${A.people.map(p=>`<div class="col-name" style="background:${pCol(p.id)[0]};color:${pCol(p.id)[2]}">${esc(first(p.name))}</div>`).join('')}</div></div>`:'';
let prev=null;return `<div class="agenda${wide}">`+head+blocks.map(b=>{let gap='';if(b.start!=null&&prev!=null&&b.start-prev>=25)gap=`<div class="tiny-gap"><span></span><span>${prettyTime(minutes(prev))}–${prettyTime(minutes(b.start))} · free <button class="edit-link" style="font-size:10px;color:#a2ada4" data-act="gap-plan" data-date="${day}" data-time="${minutes(prev)}">+ add</button></span></div>`;prev=b.end;const shared=b.items.filter(isAll),solo=b.items.filter(p=>!isAll(p));let content=shared.map(p=>evCard(p)).join('');if(solo.length)content+=multi?cols(solo):solo.map(p=>evCard(p)).join('');return gap+`<div class="slot"><div class="slot-time">${b.start!=null?prettyTime(minutes(b.start)):'Anytime'}</div><div class="slot-body">${content}</div></div>`}).join('')+`</div>`}
/* load requests with the trip, and listen for changes */
function watchReq(){if(window.__rq===A.tripId)return;if(window.__rqCh)A.client.removeChannel(window.__rqCh);window.__rq=A.tripId;window.__rqCh=A.client.channel('quest_req_'+A.tripId).on('postgres_changes',{event:'*',schema:'public',table:'quest_plan_requests'},remote).subscribe()}
{const _lt=window.loadTrip;window.loadTrip=async()=>{const ok=await _lt();if(ok){const r=await A.client.from('quest_plan_requests').select('*').eq('trip_id',A.tripId);D().requests=r.error?[]:(r.data||[]);watchReq()}return ok}}
/* trip name lives in settings too */
{const _d=window.drawer;window.drawer=()=>{let h=_d();if(U.modal==='settings')h=h.replace('<button type="button" class="ghost" data-act="share">','<button type="button" class="ghost" data-act="trip-settings">Edit trip name and dates</button><button type="button" class="ghost" data-act="share">');return h}}
root.addEventListener('click',e=>{if(e.target.closest('a[href]'))return;const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;
if(a==='ask-join'){U.armedJoin=id;render();setTimeout(()=>{if(U.armedJoin===id){U.armedJoin=null;render()}},3000)}
else if(a==='do-join')sendJoinReq(id);
else if(a==='req-accept')acceptReq(id,b.dataset.m);
else if(a==='req-decline'){dropReq(id,b.dataset.m);render();toast('Declined')}
else if(a==='req-cancel'){dropReq(id,b.dataset.m);render();toast('Request cancelled')}
});
