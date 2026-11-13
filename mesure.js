/* Mesure d'audience — Ô Forneau !
 *
 * Objectif : savoir ce que les gens font de l'app. Quels écrans, quelles recettes, quels
 * filtres, combien de temps, où ils s'arrêtent.
 *
 * ─── Pourquoi le consentement passe AVANT, et pas après ───────────────────────────────
 *
 * GA4 n'est pas une mesure d'audience exemptée au sens de la CNIL : il pose un identifiant
 * et envoie l'adresse IP à Google. En Europe, cela exige un consentement PRÉALABLE
 * (article 5.3 de la directive ePrivacy, article 82 de la loi Informatique et Libertés).
 * On ne charge donc pas gtag.js tant que la personne n'a pas accepté — pas « on charge et
 * on bloque les cookies », pas « on mesure en attendant la réponse » : rien ne part.
 *
 * Refuser doit coûter exactement un clic, comme accepter. Les deux boutons ont le même
 * poids visuel : une bannière qui rend le refus plus difficile est un dark pattern, et la
 * CNIL sanctionne précisément cela.
 *
 * Le choix est gardé six mois dans le navigateur, puis la question est reposée.
 *
 * ─── Ce qu'on ne mesure jamais ────────────────────────────────────────────────────────
 *
 * Aucune donnée qui identifie quelqu'un ne part chez Google : ni e-mail, ni prénom, ni
 * identifiant de compte, ni contenu écrit par l'utilisateur (commentaire, nom de créateur
 * proposé). Les événements portent des slugs de recette et des noms d'écran. L'adresse IP
 * est anonymisée par GA4 et la collecte de signaux publicitaires est désactivée.
 */
(() => {
  'use strict';

  // ── Réglage ───────────────────────────────────────────────────────────────────────
  // L'identifiant de mesure GA4, de la forme G-XXXXXXXXXX. Tant qu'il est vide, tout le
  // module reste inerte : aucune bannière, aucune requête. C'est voulu — on ne demande pas
  // un consentement pour une mesure qui n'existe pas encore.
  const ID_MESURE = window.MF_GA4_ID || '';

  const CLE = 'mf_consent';
  const DUREE = 182 * 24 * 3600 * 1000; // six mois

  // ── Mémoire du choix ──────────────────────────────────────────────────────────────
  function choix() {
    try {
      const b = localStorage.getItem(CLE);
      if (!b) return null;
      const d = JSON.parse(b);
      if (!d || Date.now() - d.t > DUREE) return null;
      return d.ok === true;
    } catch (_) { return null; }
  }
  function garder(ok) {
    try { localStorage.setItem(CLE, JSON.stringify({ ok, t: Date.now() })); } catch (_) {}
  }

  // ── File d'attente ────────────────────────────────────────────────────────────────
  // Les événements émis avant la réponse sont gardés en mémoire : si la personne accepte,
  // on ne perd pas sa première visite ; si elle refuse, la file est jetée sans rien envoyer.
  let pret = false;
  let file = [];

  function charger() {
    if (pret || !ID_MESURE) return;
    pret = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
    gtag('config', ID_MESURE, {
      anonymize_ip: true,
      allow_google_signals: false,          // pas de signaux publicitaires
      allow_ad_personalization_signals: false,
      send_page_view: false,                // l'app est une seule page : on les envoie nous-mêmes
    });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID_MESURE);
    document.head.appendChild(s);

    const attendait = file; file = [];
    for (const [nom, p] of attendait) envoyer(nom, p);
  }

  function envoyer(nom, params) {
    if (!ID_MESURE) return;
    if (!pret) { if (file.length < 60) file.push([nom, params]); return; }
    try { gtag('event', nom, params || {}); } catch (_) {}
  }

  // ── API publique ──────────────────────────────────────────────────────────────────
  window.MFMesure = {
    /** Un événement nommé, avec des paramètres non identifiants. */
    suivre(nom, params) { envoyer(nom, nettoyer(params)); },

    /** Un écran affiché. L'app est une page unique : GA4 ne les voit pas seul. */
    ecran(nom, extra) {
      if (nom === ecranCourant) return;
      finirEcran();
      ecranCourant = nom;
      debutEcran = Date.now();
      profondeur = 0;
      envoyer('page_view', Object.assign({
        page_title: nom, page_location: location.href, page_path: '/' + nom,
      }, nettoyer(extra)));
    },

    /** Le choix actuel : true accepté, false refusé, null pas encore répondu. */
    consentement: choix,

    /** Rouvre la question (lien « Gérer la mesure d'audience » des mentions légales). */
    redemander() { try { localStorage.removeItem(CLE); } catch (_) {} banniere(); },
  };

  // Les paramètres sont filtrés : rien qui ressemble à une identité ne part.
  const INTERDITS = /e?mail|prenom|nom|user|uid|token|phone|tel|adresse|password/i;
  function nettoyer(p) {
    const out = {};
    for (const k in (p || {})) {
      if (INTERDITS.test(k)) continue;
      const v = p[k];
      if (v == null) continue;
      out[k] = typeof v === 'string' ? v.slice(0, 100) : v;
    }
    return out;
  }

  // ── Temps passé par écran ─────────────────────────────────────────────────────────
  let ecranCourant = null, debutEcran = 0, profondeur = 0;
  function finirEcran() {
    if (!ecranCourant || !debutEcran) return;
    const ms = Date.now() - debutEcran;
    // Sous deux secondes, c'est un passage, pas une lecture : inutile de le compter.
    if (ms >= 2000) {
      envoyer('temps_ecran', {
        ecran: ecranCourant,
        secondes: Math.round(ms / 1000),
        engagement_time_msec: Math.min(ms, 30 * 60 * 1000),
        profondeur_max: profondeur,
      });
    }
    debutEcran = 0;
  }

  // ── Instrumentation automatique ───────────────────────────────────────────────────
  // Tout élément portant data-ga="nom" est suivi au clic, avec ses data-ga-* en
  // paramètres. Un nouveau bouton se mesure donc sans toucher à ce fichier.
  function brancher() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-ga]');
      if (el) {
        const p = {};
        for (const a of el.attributes) {
          if (a.name.startsWith('data-ga-')) p[a.name.slice(8).replace(/-/g, '_')] = a.value;
        }
        envoyer(el.dataset.ga, nettoyer(p));
        return;
      }
      // Les départs vers la boutique comptent : c'est le lien entre l'app et le chiffre.
      const a = e.target.closest('a[href]');
      if (a && a.host && a.host !== location.host) {
        envoyer('clic_sortant', { domaine: a.host, chemin: a.pathname.slice(0, 80) });
      }
    }, true);

    // Profondeur de lecture, par paliers, une seule fois chacun.
    const paliers = [25, 50, 75, 100];
    addEventListener('scroll', () => {
      const h = document.documentElement;
      const max = h.scrollHeight - innerHeight;
      if (max <= 0) return;
      const pct = Math.min(100, Math.round((h.scrollTop / max) * 100));
      for (const p of paliers) {
        if (pct >= p && profondeur < p) { profondeur = p; envoyer('lecture', { ecran: ecranCourant, pourcent: p }); }
      }
    }, { passive: true });

    // Le temps du dernier écran doit partir même si l'onglet est fermé.
    addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') finirEcran(); });
    addEventListener('pagehide', finirEcran);
  }

  // ── Bannière ──────────────────────────────────────────────────────────────────────
  function banniere() {
    if (document.getElementById('mfconsent')) return;
    const d = document.createElement('div');
    d.id = 'mfconsent';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'Mesure d’audience');
    d.innerHTML =
      '<p class="mct">Nous aimerions mesurer l’usage de l’application — quels écrans servent, ' +
      'ce qui bloque — pour l’améliorer. Rien qui vous identifie n’est transmis, et vous pouvez ' +
      'refuser sans perdre la moindre fonction.</p>' +
      '<div class="mcx">' +
      '<button type="button" class="mcb" id="mcNon">Refuser</button>' +
      '<button type="button" class="mcb mcok" id="mcOui">Accepter</button>' +
      '</div>' +
      '<a class="mcl" href="/legal/privacy.html">Notre politique de confidentialité</a>';
    document.body.appendChild(d);
    requestAnimationFrame(() => d.classList.add('on'));
    const fermer = (ok) => { garder(ok); d.classList.remove('on'); setTimeout(() => d.remove(), 240); if (ok) charger(); else file = []; };
    d.querySelector('#mcOui').addEventListener('click', () => fermer(true));
    d.querySelector('#mcNon').addEventListener('click', () => fermer(false));
  }

  // ── Départ ────────────────────────────────────────────────────────────────────────
  function demarrer() {
    if (!ID_MESURE) return;      // inerte tant qu'aucune propriété n'est configurée
    brancher();
    const c = choix();
    if (c === true) charger();
    else if (c === null) setTimeout(banniere, 1200);  // laisser voir l'app d'abord
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
