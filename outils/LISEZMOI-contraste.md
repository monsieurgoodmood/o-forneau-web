# Mesurer le contraste de chaque écran

```
python3 outils/contraste.py                      # sur le serveur local (port 8982)
python3 outils/contraste.py https://app.forneau.com/
```

Sort la liste des textes dont le contraste est sous le seuil **WCAG AA** — 4,5:1 en
courant, 3:1 en grand (≥ 24 px, ou ≥ 18,7 px gras). Zéro ligne = rien à corriger.

## Ce que l'outil fait, et pourquoi il le fait ainsi

Il ne regarde pas la couleur déclarée sur l'élément : il **remonte les ancêtres** jusqu'au
premier fond opaque, en composant les couches semi-transparentes au passage. C'est
nécessaire, parce qu'un texte n'est presque jamais posé sur un fond déclaré au même endroit
que lui.

Trois précautions, chacune née d'un faux résultat observé :

- **Les dégradés sont évalués sur leur pire étape.** C'est le pixel que quelqu'un va lire.
- **Un pseudo-élément ne compte que s'il recouvre vraiment.** Un filet de 24 × 2 px
  au-dessus d'un libellé d'onglet n'est pas son fond ; le compter comme tel faisait conclure
  à tort « vert sur or ».
- **Ce qui est masqué est ignoré** (`elementFromPoint`). Le mode cuisine est un panneau
  plein écran, et tout ce qu'il couvre reste dans le DOM : le mesurer imputait à un écran
  les fautes d'un autre.

**Un texte posé sur une photo est signalé à part, jamais compté en faute.** La mesure n'y
veut rien dire : il faut juger du voile. Pour le hero, le voile atteint 96 % d'opacité là où
la légende est posée — 17:1 pour le titre, 9,6:1 pour l'eyebrow.

## Ce que la première passe a trouvé (13/11/2026)

| Contraste | Où | Cause |
|---|---|---|
| **1,08:1** | « Précédent », mode cuisine | **Crème sur crème.** `.btn.ghost` pose `background:var(--card)` et la règle du mode cuisine ne redéfinissait que la couleur du texte. Collision de cascade. |
| 2,77 – 3,31:1 | libellés de navigation, avertissements | `--faint:#8A8B7E` trop clair |
| 2,83 – 3,38:1 | eyebrows, badges, « Autres idées » — 8 écrans | `--gold:#A9823E` sur crème |

**Correction de l'or sans toucher à l'identité** : `--gold` continue de peindre les boutons,
les dégradés et les filets ; seul le **texte** passe à `--goldText:#80622F`, le même or
assombri (teinte 38° conservée) jusqu'à 4,5:1 sur les quatre fonds de l'app. Les icônes
gardent `--gold` : elles relèvent du seuil 3:1 des éléments non textuels, qu'elles
respectent déjà.
