import asyncio, pathlib, sys, json
from playwright.async_api import async_playwright

MESURE = (pathlib.Path(__file__).parent / "contraste-mesure.js").read_text()
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8982/"
ECRANS = [("Accueil", None), ("Assistant", "assistant"), ("Catalogue", "catalogue"),
          ("Programme", "programme"), ("Courses", "courses"), ("Favoris", "favoris"),
          ("Foyer", "foyer"), ("Découvrir", "decouvrir")]

async def main():
    async with async_playwright() as pw:
        nav = await pw.chromium.launch(args=["--no-sandbox"])
        page = await nav.new_page(viewport={"width": 390, "height": 844})
        await page.add_init_script("try{localStorage.setItem('mf_guest','1');}catch(e){}")
        await page.goto(BASE, wait_until="load")
        await page.wait_for_timeout(4000)

        toutes, sur_image = {}, 0
        for nom, onglet in ECRANS:
            if onglet:
                await page.evaluate(f"""() => {{const b=document.querySelector('[data-tab="{onglet}"]'); if(b) b.click();}}""")
                await page.wait_for_timeout(1400)
            for r in await page.evaluate(MESURE):
                if r["conforme"]:
                    continue
                if r["surImage"]:
                    sur_image += 1
                    continue
                cle = (r["couleur"], r["fond"], r["taille"])
                e = toutes.setdefault(cle, {**r, "ecrans": set(), "exemples": set()})
                e["ecrans"].add(nom); e["exemples"].add(r["texte"][:34])

        # Le mode cuisine : plein écran, pas un onglet.
        await page.evaluate("""() => {const b=document.querySelector('[data-tab="catalogue"]'); if(b) b.click();}""")
        await page.wait_for_timeout(1200)
        ouvert = await page.evaluate("""() => {
            const c = document.querySelector('.card, .rcard, article'); if (!c) return 'pas de carte';
            c.click(); return 'fiche ouverte';}""")
        await page.wait_for_timeout(1800)
        lance = await page.evaluate("""() => {
            const b = [...document.querySelectorAll('button')].find(x => /mode cuisine|cuisiner|lancer la recette/i.test(x.textContent));
            if (!b) return 'bouton mode cuisine introuvable';
            b.click(); return 'mode cuisine lancé';}""")
        await page.wait_for_timeout(2000)
        actif = await page.evaluate("() => !!document.querySelector('.cook.on')")
        print(f'[mode cuisine] {ouvert} · {lance} · panneau actif : {actif}')
        if actif:
            for r in await page.evaluate(MESURE):
                if r["conforme"] or r["surImage"]:
                    if r["surImage"] and not r["conforme"]: sur_image += 1
                    continue
                cle = (r["couleur"], r["fond"], r["taille"])
                e = toutes.setdefault(cle, {**r, "ecrans": set(), "exemples": set()})
                e["ecrans"].add("Mode cuisine"); e["exemples"].add(r["texte"][:34])

        print(f'\n{len(toutes)} combinaisons couleur/fond sous le seuil WCAG AA')
        print(f'({sur_image} textes posés sur une image, écartés : la mesure n’y veut rien dire)\n')
        for e in sorted(toutes.values(), key=lambda x: x["ratio"]):
            etat = 'ILLISIBLE' if e["ratio"] < 2 else ('très faible' if e["ratio"] < 3 else 'faible')
            print(f'{e["ratio"]:5.2f}:1  (min {e["seuil"]})  {e["taille"]:>2}px{"  gras" if e["gras"] else "      "}  [{etat}]')
            print(f'        {e["couleur"]:22} sur {e["fond"]}')
            print(f'        écrans : {", ".join(sorted(e["ecrans"]))}')
            print(f'        ex. : {" · ".join(sorted(e["exemples"])[:3])}')
            print(f'        sélecteur : {e["ou"][:60]}\n')
        await nav.close()
asyncio.run(main())
