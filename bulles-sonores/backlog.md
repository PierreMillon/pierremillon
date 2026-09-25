# Backlog — Bulles Sonores

Jeu musique + logique : des bulles-notes flottent, le jeu joue une mélodie, on éclate les bulles dans le même ordre (type Simon).

Tri : priorité décroissante.

## Fait

- [x] Prototype jouable : gamme de do, bulles qui dérivent, 3 vies, record local
- [x] Mélodies surtout par pas conjoints (plus chantables)
- [x] Bouton « Afficher les notes » (do, ré, mi…)

## À faire

- [ ] P1 — Tester sur iPhone : son au premier toucher, taille des bulles, pas de zoom
- [ ] P1 — Réglage de la vitesse de dérive (facile / normal / difficile)
- [ ] P2 — Mode « oreille » : bulles toutes de la même couleur, seul le son guide
- [ ] P2 — Mode entraînement sans vies
- [ ] P2 — Ajouter au menu du portfolio (X)
- [ ] P3 — Timbres différents (piano, cloche, bulle)
- [ ] P3 — Mélodies connues à reconnaître (Au clair de la lune…)

## Migration future

- [ ] Déplacer vers son propre dépôt `bulles-sonores` + GitHub Pages
- [ ] Appliquer les règles communes des jeux HTML (voir ci-dessous)

## Règles des jeux HTML

- Un seul `index.html` autonome, sans build
- Palette et polices du portfolio (ivoire, Cormorant Garamond, Jost)
- Mobile d'abord : largeur téléphone, gouttière 16px, pas de défilement horizontal
- Tactile : `pointerdown`, pas de zoom au double tap
- Son démarré seulement après un geste (contrainte iOS)
- `localStorage` toujours dans un try/catch
- Lien « ← Portfolio » en haut
- Respect de `prefers-reduced-motion`
