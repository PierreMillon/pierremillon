# Backlog — Bulles Sonores

Jeu musique + logique : des bulles-notes flottent, le jeu joue une mélodie, on éclate les bulles dans le même ordre (type Simon).

Tri : priorité décroissante.

## Fait

- [x] Prototype jouable : gamme de do, bulles qui dérivent, 3 vies, record local
- [x] Mélodies surtout par pas conjoints (plus chantables)
- [x] Bouton « Afficher les notes » (do, ré, mi…)
- [x] v5 — Prototype de sensation plein écran : glisser, pincer pour séparer, appui maintenu = coupe en deux, double-tap = grossit, double-tap maintenu = grossit en continu
- [x] v6 — Physique confiée à Rapier (`@dimforge/rapier2d-compat@0.14.0`, jsDelivr) au lieu du code maison, gestes inchangés

## À faire

- [ ] P1 — Tester la v6 (Rapier) sur iPhone : sensation de glace, rebonds, poussée d'une bulle tenue — test Playwright automatique non terminé avant le push

- [ ] P1 — Tester sur iPhone : son au premier toucher, taille des bulles, pas de zoom
- [ ] P1 — Réglage de la vitesse de dérive (facile / normal / difficile)
- [ ] P2 — Mode « oreille » : bulles toutes de la même couleur, seul le son guide
- [ ] P2 — Mode entraînement sans vies
- [x] P2 — Ajouter au menu du portfolio (XIII)
- [ ] P3 — Timbres différents (piano, cloche, bulle)
- [ ] P3 — Mélodies connues à reconnaître (Au clair de la lune…)

## Migration future

- [ ] Déplacer vers son propre dépôt `bulles-sonores` + GitHub Pages
- [ ] Appliquer les règles communes des jeux HTML (voir ci-dessous)

## Conformité à la charte (../REGLES-JEUX.md)

Déjà conforme : une seule mécanique, un seul fichier HTML sans build,
sauvegarde locale en try/catch, son débloqué au premier geste.

Écarts à corriger avant de sortir du statut « essai » :

- [ ] Design : bulles actuellement glossy/réalistes — choisir un style
  assumé (flat, low poly, pixel ou fil de fer) plutôt qu'un entre-deux
- [ ] Aucun lore — même minimal, sur le ton absurde
- [ ] Pas de fin ni de palier « maîtrise experte » définis (le jeu monte à
  l'infini) — penser un objectif de complétion à 100%
- [ ] Pas installable en PWA (pas de manifest, pas de service worker)
- [ ] Pas de mode multijoueur sans serveur
- [ ] Pas de fausse pub de déblocage de difficulté
- [ ] Anglais absent (tout en français)
- [ ] Boucle de rendu (`requestAnimationFrame`) tourne en continu même à
  l'écran d'accueil, y compris quand l'onglet est masqué — à couper pour
  la batterie
- [ ] Pas testé sur un format carré / téléphone pliant
- [ ] Hors ligne incomplet : le moteur Rapier (~580 Ko compressé) est chargé
  depuis jsDelivr — le copier dans le dépôt ou le mettre en cache via un
  service worker
- [ ] Pas de bouton de retours / test A/B dans un menu (il n'y a pas de
  menu du tout pour l'instant)
