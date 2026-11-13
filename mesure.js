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

    autorise = true;
    const attendait = file; file = [];
    for (const [nom, p] of attendait) envoyer(nom, p);
  }

  // Drapeau vivant, relu à CHAQUE envoi. `pret` dit seulement que gtag est chargé ; il ne
  // dit pas que la personne est toujours d'accord. Sans ce drapeau, un refus prononcé après
  // une acceptation ne prenait effet qu'au rechargement suivant : la mesure continuait.
  let autorise = false;

  function envoyer(nom, params) {
    if (!ID_MESURE) return;
    if (!autorise) { if (!pret && file.length < 60) file.push([nom, params]); return; }
    try { gtag('event', nom, params || {}); } catch (_) {}
  }

  /** Coupe la mesure sur-le-champ : plus un événement, et le consentement est révoqué
   *  auprès de gtag, qui efface alors ses identifiants. */
  function couper() {
    autorise = false;
    file = [];
    if (pret) { try { gtag('consent', 'update', { analytics_storage: 'denied' }); } catch (_) {} }
    // Les cookies posés par gtag sont supprimés : un refus doit effacer, pas seulement taire.
    try {
      for (const c of document.cookie.split(';')) {
        const n = c.split('=')[0].trim();
        if (/^_ga/.test(n)) {
          document.cookie = n + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          document.cookie = n + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + location.hostname;
        }
      }
    } catch (_) {}
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
      // JAMAIS `location.href`. Supabase dépose le jeton de session dans le fragment
      // d'URL après un lien de confirmation (#access_token=…) : envoyer l'adresse brute
      // aurait transmis ce jeton à Google. On reconstruit une adresse propre à partir de
      // l'origine, du chemin, et du nom d'écran — jamais du fragment ni de la requête.
      envoyer('page_view', Object.assign({
        page_title: nom,
        page_location: location.origin + location.pathname + '#/' + nom,
        page_path: '/' + nom,
      }, nettoyer(extra)));
    },

    /** Le choix actuel : true accepté, false refusé, null pas encore répondu. */
    consentement: choix,

    /** Rouvre la question (lien « Gérer la mesure d'audience » des mentions légales). */
    redemander() { try { localStorage.removeItem(CLE); } catch (_) {} couper(); banniere(); },
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
  //
  // On ne marque pas les boutons un par un : l'app étiquette déjà ses éléments
  // interactifs avec des attributs `data-*` qui NOMMENT l'action (data-fav, data-diet,
  // data-open, data-course, data-star…). On s'en sert comme vocabulaire. Conséquence
  // voulue : un bouton ajouté demain est mesuré sans qu'on touche à ce fichier, et on ne
  // se réveille pas dans six mois avec la moitié de l'app non instrumentée.
  //
  // Tout part sous UN SEUL nom d'événement, `clic`, avec l'action en paramètre. GA4
  // plafonne à 500 noms d'événements distincts par propriété ; un nom par bouton y
  // courrait tout droit, et rendrait les rapports illisibles au passage.
  const ACTIONS = ['ga', 'addtag', 'aopt', 'auth', 'authprompt', 'cdel', 'check', 'course',
    'delphoto', 'diet', 'fav', 'fcount', 'ffam', 'fmode', 'go', 'goal', 'k', 'kc', 'macro',
    'meal', 'mf', 'msex', 'open', 'own', 'pf', 'photofull', 'psex', 'repas', 'report',
    'repphoto', 'sort', 'star', 'tab', 'untag',
    // Relevés sur le DOM vivant, pas dans la source : ils sont posés dynamiquement.
    'close', 'fnutri'];

  // La VALEUR d'un attribut ne part que si elle appartient au vocabulaire de l'app.
  //
  // Relevé dans la source : `data-untag` et `data-addtag` portent l'ingrédient TAPÉ par la
  // personne, `data-course` aussi, et `data-photofull` l'adresse de sa photo. Les envoyer
  // ferait sortir une donnée personnelle par une porte qu'on n'avait pas regardée.
  // `data-cdel`, `data-report`, `data-delphoto` et `data-repphoto` portent l'identifiant
  // d'un contenu d'utilisateur : inutile à la mesure, et il désigne quelqu'un.
  //
  // Liste BLANCHE, donc : ce qui n'y figure pas voit son action comptée et sa valeur
  // jetée. Un attribut ajouté demain est muet par défaut — c'est le bon sens de la
  // défaillance.
  const VALEURS_SURES = new Set(['ga', 'tab', 'go', 'diet', 'meal', 'sort', 'goal', 'macro',
    'repas', 'fmode', 'ffam', 'psex', 'msex', 'aopt', 'k', 'kc', 'pf', 'mf', 'fnutri',
    'auth', 'authprompt', 'fcount', 'own', 'check', 'star', 'close', 'open', 'fav']);

  // L'étiquette visible d'un bouton est écrite par nous — sauf dans les zones de contenu
  // d'utilisateur (commentaires, photos), qu'on ne lit jamais.
  const ZONES_UTILISATEUR = '.avis, #avisList, #avisGallery, .cmt, .photo, textarea, input';
  function etiquette(el) {
    if (el.closest(ZONES_UTILISATEUR)) return null;
    const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ');
    if (!t || t.length > 40) return null;
    // Lettres, chiffres, ponctuation douce : rien qui ressemble à une adresse ou un numéro.
    if (!/^[\p{L}\p{N} '’·,:()+%°.-]+$/u.test(t)) return null;
    if (/@|\d{5,}/.test(t)) return null;
    return t;
  }

  function brancher() {
    document.addEventListener('click', (e) => {
      const brut = e.target instanceof Element ? e.target : null;
      if (!brut) return;

      // 1. Un départ vers l'extérieur. Le lien vers une poêle est LE signal commercial :
      //    il relie l'usage de l'app au chiffre de la boutique.
      const a = brut.closest('a[href]');
      if (a && a.host && a.host !== location.host) {
        const produit = /forneau\.com$/i.test(a.host) && a.pathname.startsWith('/products/')
          ? a.pathname.split('/products/')[1].split(/[/?#]/)[0] : null;
        envoyer(produit ? 'clic_produit' : 'clic_sortant', {
          ecran: ecranCourant, domaine: a.host,
          ...(produit ? { produit } : { chemin: a.pathname.slice(0, 80) }),
          recette: contexteRecette(a),
        });
        return;
      }

      // 2. Une action nommée par l'app elle-même.
      //
      // C'est l'élément le PLUS PROCHE qui gagne, pas le premier nom de la liste. Les
      // cartes recette portent `data-open` et contiennent le bouton favori `data-fav` :
      // chercher action par action attribuait le favori à l'ouverture de la carte, et le
      // geste le plus intéressant disparaissait dans son conteneur.
      let el = brut, cle = null;
      while (el && el !== document.documentElement) {
        cle = ACTIONS.find((k) => el.hasAttribute('data-' + k));
        if (cle) break;
        el = el.parentElement;
      }
      if (cle) {
        const p = { ecran: ecranCourant, action: cle };
        const v = el.getAttribute('data-' + cle);
        // Deux conditions, pas une : la valeur doit être du vocabulaire de l'app ET
        // l'élément ne doit pas se trouver dans une zone de contenu d'utilisateur.
        if (v && VALEURS_SURES.has(cle) && !el.closest(ZONES_UTILISATEUR)) {
          p.valeur = v.slice(0, 60);
        }
        // data-ga-* reste possible pour préciser un cas particulier.
        for (const at of el.attributes) {
          if (at.name.startsWith('data-ga-')) p[at.name.slice(8).replace(/-/g, '_')] = at.value;
        }
        const lab = etiquette(el);
        if (lab) p.etiquette = lab;
        const rec = contexteRecette(el);
        if (rec) p.recette = rec;
        envoyer(cle === 'ga' ? (v || 'clic') : 'clic', nettoyer(p));
        return;
      }

      // 3. Tout autre élément interactif : on le compte quand même, sinon un bouton sans
      //    attribut devient un angle mort — et c'est toujours celui-là qui pose question.
      const b = brut.closest('button, [role="button"], a[href], summary, label');
      if (!b) return;
      const lab = etiquette(b);
      envoyer('clic', nettoyer({
        ecran: ecranCourant, action: 'autre',
        valeur: b.id || null, etiquette: lab, recette: contexteRecette(b),
      }));
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

  /// Quelle recette est à l'écran, ou sous le doigt ? Sans ce rattachement, « a cliqué sur
  /// Ajouter aux courses » ne dit pas POUR QUOI, et le chiffre ne sert à rien.
  function contexteRecette(el) {
    const carte = el.closest('[data-open]');
    if (carte) return carte.getAttribute('data-open');
    // La fiche ouverte porte son identifiant dans le DOM : le module de mesure n'a pas à
    // connaître les variables internes de l'app, et ne cassera donc pas si elles bougent.
    const detail = document.querySelector('#detail.on');
    return (detail && detail.dataset.slug) || null;
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
    const fermer = (ok) => { garder(ok); d.classList.remove('on'); setTimeout(() => d.remove(), 240); if (ok) charger(); else couper(); };
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
