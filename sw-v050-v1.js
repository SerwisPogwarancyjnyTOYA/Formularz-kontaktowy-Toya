const CACHE='pgw-v050v1-shell';
const CORE=[
  './','./index.html','./app.css','./app.js','./config.js','./client-suite.css','./client-suite.js','./manifest.webmanifest',
  './data/i18n-v050-v1.json','./data/client-capabilities-v050-v1.json',
  './data/devices.json','./data/drawings.json','./data/parts.json',
  './data/drive-drawings-map.generated-v97.json','./data/drive-drawings-patch-v98.json','./data/drive-drawings-patch-v050v1.json'
];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.allSettled(CORE.map(async url=>{
    const response=await fetch(new Request(url,{cache:'reload'}));
    if(response.ok)await cache.put(url,response);
  }));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  const dataRequest=/\/data\/|\.json$/i.test(url.pathname);
  if(dataRequest){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request);
        if(response.ok)(await caches.open(CACHE)).put(event.request,response.clone());
        return response;
      }catch{
        return (await caches.match(event.request))||new Response(JSON.stringify({offline:true,error:'NOT_CACHED'}),{status:503,headers:{'content-type':'application/json'}});
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    try{
      const response=await fetch(event.request);
      if(response.ok)(await caches.open(CACHE)).put(event.request,response.clone());
      return response;
    }catch{
      return (await caches.match('./index.html'))||Response.error();
    }
  })());
});
