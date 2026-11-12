const areas=['Gangnam','Sinnonhyeon','Hongdae','Yeonnam','Hapjeong','Seongsu','Banpo','Yeouido','Myeongdong','Anguk','Insadong','Itaewon','Ikseon-dong','Apgujeong','Sinsa','Jamsil','Dongdaemun','Bukchon','Mapo','Euljiro','Namsan','Gangbuk','Gwangjang','Busan'];const categories=['Restaurant','Activity','Cafe','Shopping','Beauty','Class','Sightseeing','Nightlife','Other'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=v=>{try{let u=new URL(v);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
const uuid=()=>crypto.randomUUID();const cap=s=>s?s[0].toUpperCase()+s.slice(1):'';
const isoDay=d=>d.toISOString().slice(0,10);
const displayDate=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
const showDur=(s,e)=>e?`${s}–${e}`:s||'Anytime';
const stamp=t=>{let m=String(t||'').match(/^(\d{1,2}):(\d{2})$/);return m?(Number(m[1])*60+Number(m[2])):null};
const minutes=t=>{let x=Math.max(0,t);return `${String(Math.floor(x/60)%24).padStart(2,'0')}:${String(x%60).padStart(2,'0')}`};
const prettyTime=t=>{if(!t)return'Anytime';let m=stamp(t);if(m==null)return t;let h=Math.floor(m/60);return `${h%12||12}${m%60?':'+String(m%60).padStart(2,'0'):''}${h>=12?'pm':'am'}`};
const toMinutes=(h,min,amp)=>{let n=Number(h);if(amp)n=(n%12)+(amp.toLowerCase()==='pm'?12:0);else if(n>=1&&n<=7)n+=12;return n*60+Number(min||0)};
function readLocation(str){const tokens=str.split(/\s+/);let clean=str.trim();let area='';for(const a of [...areas].sort((a,b)=>b.length-a.length)){let re=new RegExp(`(?:\\b(?:in|at|near)\\s+)?\\b${a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i');if(re.test(clean)){area=a;clean=clean.replace(re,'').replace(/\s+[-–,]\s*$/,'').trim();break}}return {name:clean.replace(/\s{2,}/g,' ').trim(),area}}
function parseQuick(s){s=s.trim();if(!s)return null;const u=s.match(/https?:\/\/\S+/);let link=u?u[0]:'';if(u)s=s.replace(u[0],'').trim();let p=s.match(/^(?:([0-2]?\d)(?::([0-5]\d))?\s*(am|pm)?)(?:\s*[-–]\s*([0-2]?\d)(?::([0-5]\d))?\s*(am|pm)?)?\s+(.+)$/i);if(p&&!(p[2]||p[3]||p[4]||p[6]))p=null;let start='',end='',name=s;if(p){let sh=Number(p[1]);if(sh<24){let ea=p[6],sa=p[3]||ea;let a=toMinutes(p[1],p[2],sa);if(p[4]){let b=toMinutes(p[4],p[5],ea||p[3]);if(b<=a)b+=12*60;end=minutes(b)}else end=minutes(a+60);start=minutes(a);name=p[7]}}let x=readLocation(name);return {...x,name:x.name||name||'New activity',start,end,link}}
const sortTime=(a,b)=>(stamp(a.start)??-1)-(stamp(b.start)??-1);
