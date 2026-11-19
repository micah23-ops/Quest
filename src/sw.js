/* Quest app shell cache. Holds app code and artwork only, never trip data or files. */
const V='quest-shell-v43';
const SHELL=['/', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png', '/art/land_plan.webp', '/art/land_short.webp', '/art/land_trip.webp', '/art/qt_buddies.webp', '/art/qt_done.webp', '/art/qt_suitcase.webp', '/art/qt_ticket.webp', '/art/trip_korea.webp', '/brand/quest-app-icon.svg', '/brand/quest-wordmark-forest.svg', '/brand/quest-wordmark-forest.png', '/core.js', '/extra.css', '/favicon.png', '/index.html', '/lib.js', '/manifest.webmanifest', '/more.css', '/style.css', '/v10.css', '/v10.js', '/v11.css', '/v11.js', '/v12.css', '/v12.js', '/v13.css', '/v13.js', '/v14.css', '/v15.css', '/v15.js', '/v16.css', '/v16.js', '/v17.css', '/v17.js', '/v18.css', '/v18.js', '/v19.css', '/v19.js', '/v2.css', '/v2.js', '/v20.css', '/v20.js', '/v21.css', '/v21.js', '/v22.css', '/v23.css', '/v24.css', '/v25.css', '/v26.css', '/v27.css', '/v28.css', '/v29.css', '/v30.css', '/v22.js', '/v23.js', '/v24.js', '/v25.js', '/v26.js', '/v27.js', '/v28.js', '/v29.js', '/v30.js', '/v31.js', '/v32.js', '/v33.js', '/v34.js', '/v34.css', '/v36.css', '/v36.js', '/v37.css', '/v37.js','/v38.js','/v38.css','/v39.js', '/v40.js','/v39.css', '/v40.css','/v41.js','/v41.css','/v42.js','/v42.css','/v43.js','/v44.js','/v44.css','/v45.js','/v46.js','/v46.css','/v47.js','/v48.css','/v49.js','/v49.css', '/v33.css', '/v32.css', '/v31.css', '/v3.css', '/v3.js', '/v4.css', '/v4.js', '/v5.css', '/v5.js', '/v6.css', '/v6.js', '/v7.css', '/v7.js', '/v8.css', '/v8.js', '/v9.css', '/v9.js', '/views.js'];
const CDN=['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(async c=>{
  await Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})));
  await Promise.all(CDN.map(u=>fetch(u,{mode:'no-cors'}).then(r=>c.put(u,r)).catch(()=>{})));
}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const OK=u=>u.origin===self.location.origin||/^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname);
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||r.headers.has('range'))return;const u=new URL(r.url);
  if(!OK(u)||/supabase\.(co|in)$/.test(u.hostname))return;
  e.respondWith((async()=>{const c=await caches.open(V);
    try{const net=await Promise.race([fetch(r),new Promise((_,j)=>setTimeout(()=>j(new Error('slow')),4000))]);
      if(net&&(net.ok||net.type==='opaque'))c.put(r,net.clone());return net}
    catch(err){const hit=await c.match(r,{ignoreSearch:true})||(r.mode==='navigate'?(await c.match('/index.html')||await c.match('/')):null);
      if(hit)return hit;return new Response('Offline',{status:503,statusText:'Offline'})}
  })())});
