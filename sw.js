const CACHE = "forneau-v13";
const CORE = ["./", "index.html", "app.js", "i18n.js", "mesure.js", "recipes_more.js", "manifest.webmanifest"];

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
    }).catch(() => secours(req)))
  );
});

// Hors-ligne, une image jamais vue n'est pas dans le cache. On renvoyait `index.html` :
// le navigateur recevait du HTML avec le type text/html à la place d'une image, soit une
// icône cassée et une réponse qui mentait sur son contenu. On renvoie maintenant la
// vignette d'attente de la charte (crème, filet vert) pour une image, et un échec franc
// pour le reste — un échec visible vaut mieux qu'une réponse fausse.
const VIGNETTE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3">`
  + `<rect width="4" height="3" fill="#F7F3EA"/>`
  + `<rect x="0.08" y="0.08" width="3.84" height="2.84" fill="none" stroke="#2F4F3A" stroke-width="0.04" opacity="0.25"/>`
  + `</svg>`;

function secours(req) {
  const image = req.destination === "image" || /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(new URL(req.url).pathname);
  if (image) {
    return new Response(VIGNETTE, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
    });
  }
  return new Response("", { status: 504, statusText: "Hors ligne" });
}
