const CACHE = "forneau-v6";
const CORE = ["./", "index.html", "app.js", "recipes_more.js", "manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Ne jamais intercepter le cross-origin (Supabase, Google Fonts, CDN) : le navigateur gère.
  if (url.origin !== self.location.origin) return;

  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  const isCode = /\.(js|webmanifest)$/.test(url.pathname);

  // HTML + code applicatif : network-first (toujours la dernière version en ligne, cache en secours hors-ligne).
  if (isHTML || isCode) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match("index.html")))
    );
    return;
  }

  // Reste (images, styles, assets same-origin) : cache-first (rapidité + offline sur les recettes vues).
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
