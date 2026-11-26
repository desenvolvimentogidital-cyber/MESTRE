/* MandaFazer PWA: online-first, no caching of account data. */
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||request.mode!=="navigate"||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(request).catch(()=>new Response(
    '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MandaFazer</title><body style="font-family:system-ui;padding:32px"><h1>Sem conexão</h1><p>Conecte-se à internet para acessar o MandaFazer.</p><button onclick="location.reload()">Tentar novamente</button></body></html>',
    {status:503,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}}
  )));
});
