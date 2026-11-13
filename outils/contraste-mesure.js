/* Mesure le contraste WCAG de CHAQUE texte visible de la page, sur son vrai fond.
 *
 * Le fond n'est presque jamais sur l'élément lui-même : on remonte les ancêtres jusqu'au
 * premier fond opaque, en composant les couches semi-transparentes au passage. Un dégradé
 * est évalué sur SA PIRE étape — c'est le pixel que quelqu'un va lire. */
(() => {
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const lire = (s) => {
    const m = s && s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  // Composition alpha d'une couche sur un fond déjà résolu.
  const sur = (dessus, dessous) => dessus.rgb.map((c, i) => Math.round(c * dessus.a + dessous[i] * (1 - dessus.a)));

  // Toutes les couleurs d'un dégradé, pour en garder la pire.
  const etapes = (img) => {
    const out = [];
    const re = /rgba?\([^)]+\)/g; let m;
    while ((m = re.exec(img))) { const c = lire(m[0]); if (c) out.push(c); }
    return out;
  };

  // Un texte posé sur une photo n'a pas de « couleur de fond » : la mesure ne veut rien
  // dire, et compter ces cas en fautes ferait corriger des écrans qui vont bien. On les
  // signale à part. Détection : une image de fond en url(), ou un <img> d'un ancêtre qui
  // recouvre effectivement la zone du texte.
  function surUneImage(el, r) {
    let n = el;
    while (n && n !== document.body.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage.includes('url(')) return true;
      for (const img of n.querySelectorAll ? n.querySelectorAll('img, picture, canvas, video, svg') : []) {
        const ri = img.getBoundingClientRect();
        if (ri.width > 2 && ri.height > 2 &&
            ri.left <= r.left + 1 && ri.right >= r.right - 1 &&
            ri.top <= r.top + 1 && ri.bottom >= r.bottom - 1) return true;
      }
      n = n.parentElement;
    }
    return false;
  }

  function fondDe(el) {
    const couches = [];
    let n = el;
    while (n && n !== document.documentElement.parentNode) {
      const s = getComputedStyle(n);
      // Les pseudo-éléments portent souvent le voile qui rend un texte lisible.
      for (const pseudo of ['::before', '::after']) {
        const ps = getComputedStyle(n, pseudo);
        if (!ps || ps.content === 'none') continue;
        // Seulement si le pseudo-élément RECOUVRE vraiment l'élément. Un filet de 24x2 px
        // au-dessus d'un libellé d'onglet n'est pas son fond : le compter comme tel faisait
        // conclure à tort « vert sur or » et aurait fait corriger un écran qui va bien.
        const rn = n.getBoundingClientRect();
        const pw = parseFloat(ps.width), ph = parseFloat(ps.height);
        if (!(pw >= rn.width * 0.8 && ph >= rn.height * 0.8)) continue;
        if (ps.backgroundImage && ps.backgroundImage !== 'none' && etapes(ps.backgroundImage).length)
          couches.push({ degrade: etapes(ps.backgroundImage) });
        const pc = lire(ps.backgroundColor);
        if (pc && pc.a > 0) couches.push({ couleur: pc });
      }
      const img = s.backgroundImage;
      if (img && img !== 'none' && etapes(img).length) couches.push({ degrade: etapes(img) });
      const c = lire(s.backgroundColor);
      if (c && c.a > 0) {
        couches.push({ couleur: c });
        if (c.a === 1) break;            // opaque : inutile de remonter plus haut
      }
      n = n.parentElement;
    }
    let pires = [[255, 255, 255]];       // le navigateur peint du blanc sous tout
    for (const couche of couches.reverse()) {
      if (couche.couleur) pires = pires.map((f) => sur(couche.couleur, f));
      else pires = couche.degrade.flatMap((c) => pires.map((f) => sur(c, f)));
    }
    return pires;
  }

  const resultats = [];
  const vu = new Set();
  for (const el of document.querySelectorAll('*')) {
    // Un texte propre à l'élément, pas celui de ses enfants.
    const propre = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!propre) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    // Ignorer ce qui est recouvert : le mode cuisine est un panneau plein écran, et tout
    // ce qu'il masque reste dans le DOM. Le mesurer ferait imputer à un écran les fautes
    // d'un autre. `elementFromPoint` dit qui est réellement visible à cet endroit.
    const cx = Math.min(Math.max(r.left + Math.min(r.width, 40) / 2, 1), innerWidth - 1);
    const cy = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1);
    const dessus = document.elementFromPoint(cx, cy);
    if (!dessus || (dessus !== el && !el.contains(dessus) && !dessus.contains(el))) continue;
    const couleur = lire(s.color);
    if (!couleur) continue;

    const taille = parseFloat(s.fontSize), gras = +s.fontWeight >= 700;
    const grand = taille >= 24 || (gras && taille >= 18.66);
    const seuil = grand ? 3 : 4.5;

    // Un texte translucide se compose lui aussi sur son fond.
    const image = surUneImage(el, r);
    const fonds = fondDe(el);
    let pire = Infinity, pireFond = null;
    for (const f of fonds) {
      const avant = couleur.a < 1 ? sur(couleur, f) : couleur.rgb;
      const c = ratio(avant, f);
      if (c < pire) { pire = c; pireFond = f; }
    }
    const cle = s.color + '|' + pireFond.join(',') + '|' + Math.round(taille);
    if (vu.has(cle)) continue;
    vu.add(cle);
    resultats.push({
      texte: propre.slice(0, 54), ratio: Math.round(pire * 100) / 100, seuil,
      conforme: pire >= seuil, surImage: image, taille: Math.round(taille), gras,
      couleur: s.color, fond: 'rgb(' + pireFond.join(',') + ')',
      ou: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
    });
  }
  return resultats;
})()
