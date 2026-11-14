/* Notifications push du site et de la PWA Ô Forneau (Web Push, clés VAPID).
 *
 * Même doctrine que l'app : on pose NOTRE question d'abord (à partir de la deuxième visite,
 * ou dès le premier favori), et seul un oui déclenche la demande du navigateur. Consentement
 * distinct de la mesure d'audience, révocable dans « Mon compte » et ici même.
 *
 * Le navigateur reçoit la notification via le service worker (sw.js) ; en la touchant, il
 * ouvre l'écran concerné (#/recette/…, #/frigo, …) et signale l'ouverture.
 *
 * Profil d'usage envoyé au serveur (si et seulement si activé) : compteurs par fonction,
 * favoris, frigo, courses, régimes choisis — ce que l'app garde déjà en local. Rien d'autre.
 */
(function () {
  'use strict';
  var VAPID = window.MF_VAPID || '';
  if (!VAPID || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;

  var CLE = 'mf_notif', CLE_CATS = 'mf_notif_cats', CLE_VISITES = 'mf_visites', CLE_SYNC = 'mf_notif_sync', CLE_USAGE = 'mf_usage';
  var L = (document.documentElement.getAttribute('lang') || 'fr').slice(0, 2);
  var FN = (window.SB_URL || 'https://kbxguxcfcsyhktjyeihu.supabase.co') + '/functions/v1/push-inscrire';
  var M = function (e, p) { try { window.MFMesure && window.MFMesure.suivre(e, p); } catch (_) {} };

  var TXT = {
    fr: { t: 'Être prévenu quand c’est utile ?', x: 'Une idée pour ce soir, une recette qui va avec votre frigo ou vos favoris, les nouveautés. Une par jour au plus, jamais la nuit, et vous choisissez les sujets.', oui: 'Activer', non: 'Pas maintenant', s: 'Notifications', sx: 'Une par jour au plus, jamais entre 21 h et 9 h.', soir: 'Une idée pour ce soir et le week-end', perso: 'D’après mon frigo, mes favoris, ce que je cuisine', nouveautes: 'Nouvelles recettes', acces: 'Mon accès et mon essai', refus: 'Le navigateur a refusé les notifications. Autorisez-les dans ses réglages, puis réactivez ici.', ok: 'C’est noté.' },
    en: { t: 'Get a heads-up when it’s useful?', x: 'An idea for tonight, a recipe that matches your fridge or favourites, new recipes. At most one a day, never at night, and you choose the topics.', oui: 'Turn on', non: 'Not now', s: 'Notifications', sx: 'At most one a day, never between 9 pm and 9 am.', soir: 'An idea for tonight and the weekend', perso: 'Based on my fridge, favourites and what I cook', nouveautes: 'New recipes', acces: 'My access and trial', refus: 'The browser declined notifications. Allow them in its settings, then turn them on again here.', ok: 'Noted.' },
    de: { t: 'Bescheid bekommen, wenn es nützlich ist?', x: 'Eine Idee für heute Abend, ein Rezept passend zu Kühlschrank oder Favoriten, neue Rezepte. Höchstens eine am Tag, nie nachts, und Sie wählen die Themen.', oui: 'Aktivieren', non: 'Jetzt nicht', s: 'Benachrichtigungen', sx: 'Höchstens eine am Tag, nie zwischen 21 und 9 Uhr.', soir: 'Eine Idee für heute Abend und das Wochenende', perso: 'Nach Kühlschrank, Favoriten und dem, was ich koche', nouveautes: 'Neue Rezepte', acces: 'Mein Zugang und meine Testphase', refus: 'Der Browser hat Benachrichtigungen abgelehnt. Erlauben Sie sie in den Einstellungen und aktivieren Sie sie hier erneut.', ok: 'Notiert.' },
    it: { t: 'Essere avvisati quando è utile?', x: 'Un’idea per stasera, una ricetta adatta al vostro frigo o ai preferiti, le novità. Al massimo una al giorno, mai di notte, e scegliete voi gli argomenti.', oui: 'Attivare', non: 'Non ora', s: 'Notifiche', sx: 'Al massimo una al giorno, mai tra le 21 e le 9.', soir: 'Un’idea per stasera e il fine settimana', perso: 'In base a frigo, preferiti e a ciò che cucino', nouveautes: 'Nuove ricette', acces: 'Il mio accesso e la prova', refus: 'Il browser ha rifiutato le notifiche. Autorizzatele nelle impostazioni e riattivatele qui.', ok: 'Preso nota.' },
    nl: { t: 'Een seintje krijgen als het nuttig is?', x: 'Een idee voor vanavond, een recept dat past bij uw koelkast of favorieten, nieuwe recepten. Hoogstens één per dag, nooit ’s nachts, en u kiest de onderwerpen.', oui: 'Inschakelen', non: 'Niet nu', s: 'Meldingen', sx: 'Hoogstens één per dag, nooit tussen 21 en 9 uur.', soir: 'Een idee voor vanavond en het weekend', perso: 'Op basis van mijn koelkast, favorieten en wat ik kook', nouveautes: 'Nieuwe recepten', acces: 'Mijn toegang en proefperiode', refus: 'De browser heeft meldingen geweigerd. Sta ze toe in de instellingen en schakel ze hier opnieuw in.', ok: 'Genoteerd.' },
    es: { t: '¿Avisarle cuando sea útil?', x: 'Una idea para esta noche, una receta acorde con su nevera o sus favoritos, las novedades. Como mucho una al día, nunca de noche, y usted elige los temas.', oui: 'Activar', non: 'Ahora no', s: 'Notificaciones', sx: 'Como mucho una al día, nunca entre las 21 h y las 9 h.', soir: 'Una idea para esta noche y el fin de semana', perso: 'Según mi nevera, mis favoritos y lo que cocino', nouveautes: 'Nuevas recetas', acces: 'Mi acceso y mi prueba', refus: 'El navegador rechazó las notificaciones. Permítalas en sus ajustes y vuelva a activarlas aquí.', ok: 'Anotado.' },
    pt: { t: 'Ser avisado quando for útil?', x: 'Uma ideia para esta noite, uma receita a condizer com o seu frigorífico ou favoritos, as novidades. No máximo uma por dia, nunca à noite, e é você que escolhe os temas.', oui: 'Ativar', non: 'Agora não', s: 'Notificações', sx: 'No máximo uma por dia, nunca entre as 21 h e as 9 h.', soir: 'Uma ideia para esta noite e o fim de semana', perso: 'Com base no meu frigorífico, favoritos e no que cozinho', nouveautes: 'Novas receitas', acces: 'O meu acesso e período de teste', refus: 'O navegador recusou as notificações. Autorize-as nas definições e reative-as aqui.', ok: 'Anotado.' },
  };
  var t = TXT[L] || TXT.fr;

  // ── Mémoire locale ────────────────────────────────────────────────────────────────
  function lire(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } }
  function ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  function choix() { var c = lire(CLE, null); if (!c || Date.now() - c.t > 365 * 86400e3) return null; return c.ok === true; }
  function garder(ok) { ecrire(CLE, { ok: ok, t: Date.now() }); }
  var CATS = ['soir', 'perso', 'nouveautes', 'acces'];
  function categories() { var c = lire(CLE_CATS, {}); var o = {}; CATS.forEach(function (k) { o[k] = c[k] !== false; }); return o; }

  // Compteurs d'usage : onglets visités, gestes faits. Locaux, envoyés seulement si activé.
  var usage = lire(CLE_USAGE, { compteurs: {}, cuisinees: [], vues: [] });
  function compter(k) { usage.compteurs[k] = (usage.compteurs[k] || 0) + 1; usage.derniere_activite = new Date().toISOString(); ecrire(CLE_USAGE, usage); }
  function empiler(liste, slug) { var l = (usage[liste] || []).filter(function (x) { return x !== slug; }); l.push(slug); usage[liste] = l.slice(-30); ecrire(CLE_USAGE, usage); }
  addEventListener('hashchange', function () {
    var ch = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/');
    if (ch[0] === 'recette' && ch[1]) empiler('vues', ch[1]);
    else if (['frigo', 'assistant', 'favoris', 'programme', 'courses', 'foyer', 'compte'].indexOf(ch[0]) >= 0) compter(ch[0] === 'assistant' ? 'frigo' : ch[0]);
  });
  document.addEventListener('click', function (e) {
    var el = e.target instanceof Element ? e.target : null; if (!el) return;
    if (el.closest('[data-fav]')) compter('favoris');
    if (el.closest('#addtag, [data-addtag], #pantryGo')) compter('frigo');
    if (el.closest('#addCart, #toCart2, [data-course]')) compter('courses');
    if (el.closest('#cookStart, [data-cook], .cookbtn')) compter('cuisine');
    if (el.closest('#cookNext') && document.querySelector('#cookNext') && /Termin|Done|Fertig|Fatto|Klaar|Listo|Pronto/i.test(el.textContent || '')) {
      var d = document.querySelector('#detail'); if (d && d.dataset.slug) empiler('cuisinees', d.dataset.slug);
    }
  }, true);

  function profil() {
    var favs = lire('favs', []), pantry = lire('pantry', []), cart = lire('cart', []), prog = lire('prog', {}), foyer = lire('foyer', {});
    var regimes = [];
    try { regimes = Array.from(document.querySelectorAll('[data-diet].on')).map(function (b) { return b.getAttribute('data-diet'); }); } catch (_) {}
    return {
      compteurs: usage.compteurs || {}, favoris: favs.slice(-30), cuisinees: usage.cuisinees || [], vues: usage.vues || [],
      frigo: pantry.slice(0, 60), courses: cart.slice(0, 60), regimes: regimes.slice(0, 10),
      programme: !!(prog && prog.goal) || (usage.compteurs.programme || 0) > 0,
      foyer: foyer && foyer.mode === 'famille' ? Math.min(12, foyer.count || 2) : 1,
      heure_habituelle: new Date().getHours(), derniere_activite: usage.derniere_activite,
    };
  }

  // ── Serveur ───────────────────────────────────────────────────────────────────────
  function appeler(corps) {
    var h = { 'content-type': 'application/json' };
    if (window.SB_KEY) h.apikey = window.SB_KEY;
    return fetch(FN, { method: 'POST', headers: h, body: JSON.stringify(corps), keepalive: true }).then(function (r) { return r.json(); }).catch(function () { return null; });
  }
  function b64(s) { var p = '='.repeat((4 - s.length % 4) % 4); var b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); var u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }

  function inscrire(action) {
    return navigator.serviceWorker.ready.then(function (reg) {
      return reg.pushManager.getSubscription().then(function (s) { return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) }); });
    }).then(function (sub) {
      var j = sub.toJSON();
      var nb = (window.R && window.R.length) || (window.MORE_RECIPES && window.MORE_RECIPES.length) || undefined;
      return appeler({
        action: action || 'inscrire', jeton: sub.endpoint, plateforme: 'web', web: { p256dh: j.keys.p256dh, auth: j.keys.auth },
        langue: L, fuseau_min: -new Date().getTimezoneOffset(), categories: categories(), profil: profil(), catalogue: nb,
      }).then(function () { ecrire(CLE_SYNC, Date.now()); });
    });
  }

  function activer() {
    return Notification.requestPermission().then(function (p) {
      var ok = p === 'granted';
      garder(ok);
      M(ok ? 'notif_autorisee' : 'notif_refusee', { ou: ok ? 'web' : 'navigateur' });
      if (ok) return inscrire('inscrire').then(function () { return true; });
      return false;
    });
  }
  function desactiver() {
    garder(false);
    M('notif_reglage', { valeur: 'desactive' });
    return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      if (!sub) return;
      appeler({ action: 'desinscrire', jeton: sub.endpoint });
      return sub.unsubscribe();
    }).catch(function () {});
  }
  function reglerCategorie(k, v) {
    var c = lire(CLE_CATS, {}); c[k] = v; ecrire(CLE_CATS, c);
    M('notif_reglage', { valeur: k + ':' + (v ? 'on' : 'off') });
    if (choix() === true) inscrire('profil');
  }

  // ── Bannière ──────────────────────────────────────────────────────────────────────
  function banniere() {
    if (document.getElementById('mfnotif') || document.getElementById('mfconsent')) return;   // jamais deux questions à la fois
    var d = document.createElement('div');
    d.id = 'mfnotif'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', t.s);
    d.innerHTML = '<p class="mct"><strong>' + t.t + '</strong><br>' + t.x + '</p>' +
      '<div class="mcx"><button type="button" class="mcb" id="mnNon">' + t.non + '</button>' +
      '<button type="button" class="mcb mcok" id="mnOui">' + t.oui + '</button></div>';
    document.body.appendChild(d);
    requestAnimationFrame(function () { d.classList.add('on'); });
    var fermer = function () { d.classList.remove('on'); setTimeout(function () { d.remove(); }, 240); };
    d.querySelector('#mnOui').addEventListener('click', function () { fermer(); activer().then(function (ok) { if (!ok) toast(t.refus); }); });
    d.querySelector('#mnNon').addEventListener('click', function () { garder(false); M('notif_refusee', { ou: 'web' }); fermer(); });
  }
  function toast(m) { try { if (window.toast) return window.toast(m); } catch (_) {} try { alert(m); } catch (_) {} }

  // ── Réglages dans « Mon compte » ──────────────────────────────────────────────────
  function bloc() {
    var body = document.getElementById('authBody');
    if (!body || body.querySelector('#mnReglages')) return;
    var on = choix() === true, c = categories();
    var w = document.createElement('div');
    w.id = 'mnReglages'; w.className = 'authform'; w.style.marginTop = '14px';
    w.innerHTML = '<label class="consent" style="align-items:center"><input type="checkbox" id="mnOn"' + (on ? ' checked' : '') + '/><span><strong>' + t.s + '</strong><br><span style="color:var(--muted);font-size:13px">' + t.sx + '</span></span></label>' +
      '<div id="mnCats" style="margin-left:26px' + (on ? '' : ';display:none') + '">' +
      CATS.map(function (k) { return '<label class="consent"><input type="checkbox" data-cat="' + k + '"' + (c[k] ? ' checked' : '') + '/><span>' + t[k] + '</span></label>'; }).join('') + '</div>';
    body.appendChild(w);
    w.querySelector('#mnOn').addEventListener('change', function (e) {
      if (e.target.checked) activer().then(function (ok) { if (!ok) { e.target.checked = false; toast(t.refus); } else { w.querySelector('#mnCats').style.display = ''; toast(t.ok); } });
      else desactiver().then(function () { w.querySelector('#mnCats').style.display = 'none'; });
    });
    w.querySelectorAll('[data-cat]').forEach(function (cb) { cb.addEventListener('change', function () { reglerCategorie(cb.getAttribute('data-cat'), cb.checked); }); });
  }
  window.MFPush = { activer: activer, desactiver: desactiver, categorie: reglerCategorie, etat: choix, redemander: function () { try { localStorage.removeItem(CLE); } catch (_) {} banniere(); } };

  // ── Départ ────────────────────────────────────────────────────────────────────────
  function demarrer() {
    var visites = (lire(CLE_VISITES, 0) || 0) + 1; ecrire(CLE_VISITES, visites);
    // Une notification touchée ouvre le site avec ?notif=<id> : on le signale, puis on nettoie.
    try {
      var q = new URLSearchParams(location.search);
      if (q.get('notif')) {
        appeler({ action: 'ouverte', envoi: q.get('notif') });
        M('notif_ouverte', { valeur: q.get('modele') || '', recette: q.get('recette') || '' });
        q.delete('notif'); q.delete('modele'); q.delete('recette');
        history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
      }
    } catch (_) {}
    var c = choix();
    if (c === true) {
      if (Notification.permission !== 'granted') { garder(false); }
      else if (Date.now() - (lire(CLE_SYNC, 0) || 0) > 20 * 3600e3) inscrire('profil');
    } else if (c === null && Notification.permission !== 'denied') {
      var favs = lire('favs', []);
      if (visites >= 2 || favs.length) setTimeout(banniere, 25000);     // après la mesure, et après usage
    }
    var obs = new MutationObserver(bloc);
    var ab = document.getElementById('authBody');
    if (ab) { obs.observe(ab, { childList: true }); bloc(); }
    else document.addEventListener('DOMContentLoaded', function () { var b = document.getElementById('authBody'); if (b) { obs.observe(b, { childList: true }); bloc(); } });
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
