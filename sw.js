const CACHE = "forneau-v15";
const CORE = ["./", "index.html", "app.js", "i18n.js", "mesure.js", "push.js", "recipes_more.js", "manifest.webmanifest"];

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

// ── Notifications push ────────────────────────────────────────────────────────────────
// Charge utile JSON produite par la fonction `notifier` : {title, body, route, envoi, modele,
// recette, icon}. `tag` = modèle : deux « idées du soir » successives se remplacent au lieu
// de s'empiler.
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: "Ô Forneau", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Ô Forneau", {
    body: d.body || "", icon: d.icon || "icon-192.png", badge: "icon-192.png", lang: d.lang,
    tag: d.modele || "forneau", renotify: false,
    data: { route: d.route || "/", envoi: d.envoi || "", modele: d.modele || "", recette: d.recette || "" },
  }));
});

// Le lien profond de l'app (/recipe/<slug>, /frigo, …) devient l'adresse du site (#/recette/…).
function urlDepuisRoute(route) {
  let r = String(route || "/").replace(/^\/recipe\//, "/recette/");
  return new URL("./", self.location.href).href.replace(/\/$/, "") + "/#" + (r.startsWith("/") ? r : "/" + r);
}

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const d = e.notification.data || {};
  const q = "?notif=" + encodeURIComponent(d.envoi || "") + "&modele=" + encodeURIComponent(d.modele || "") + "&recette=" + encodeURIComponent(d.recette || "");
  const cible = urlDepuisRoute(d.route).replace("/#", "/" + q + "#");
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(liste => {
    for (const c of liste) {
      if (new URL(c.url).origin === self.location.origin && "navigate" in c) return c.navigate(cible).then(w => w && w.focus());
    }
    return clients.openWindow(cible);
  }));
});
