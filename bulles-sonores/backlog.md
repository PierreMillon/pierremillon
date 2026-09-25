# Backlog — Bulles Sonores

Prototype de sensation tactile (depuis la v3) : des bulles molles à
glisser, pincer, couper, fusionner, qui chantent quand elles se touchent.
**Pas un jeu pour l'instant** : pas d'échec possible ni de partie
rejouable — seule la partie technique de la charte s'applique (voir
plus bas). Les v1–v2 (jeu type Simon, puis jeu de fusion) sont abandonnées.

Tri : priorité décroissante.

## Fait

- [x] v1–v2 — Jeu de mémoire type Simon, puis jeu de fusion (abandonnés)
- [x] v3–v5 — Prototype de sensation plein écran : glisser, pincer pour séparer, appui maintenu = coupe en deux, double-tap = grossit, double-tap maintenu = grossit en continu
- [x] v6 — Physique confiée à Rapier (`@dimforge/rapier2d-compat@0.14.0`)
- [x] v7 — Tenue élastique, pincer dans l'axe des doigts, fusion, son coupé en quittant, loupe iOS bloquée, style Oscilloscope seul
- [x] v8 — Bulles molles (anneau de points Rapier + ressorts + pression interne, modèle de Matyka / JellyCar), volume conservé (plus de réapparition), note par taille (pentatonique) et contacts qui chantent, hors ligne (Rapier copié dans `vendor/` + service worker), PWA, batterie (boucle arrêtée au repos), français / anglais, letterbox au-delà du carré
- [x] Ajouté au menu du portfolio (XIII)

## À faire

- [ ] P1 — Tester la v8 sur iPhone : sensation bille d'eau, pincer, fusion, notes, pas de loupe ni de son en quittant, installation sur l'écran d'accueil (Pierre)
- [ ] P2 — Régler la matière d'après le ressenti (constantes `K_EDGE`, `K_PRESS`, `K_SHAPE`, `C_WOBBLE`, `DRIVE_K` en tête du script)
- [ ] P3 — Si ça devient un jeu : lui donner un but, puis reprendre la partie « jeu » de la charte

## Abandonné (jeu Simon, v1)

Réglage de vitesse de dérive, mode « oreille », entraînement sans vies,
timbres au choix, mélodies connues — sans objet depuis le passage au
prototype de sensation.

## Migration future

- [ ] Déplacer vers son propre dépôt `bulles-sonores` + GitHub Pages

## Conformité à la charte (../REGLES-JEUX.md)

Pas un jeu pour l'instant : seule la partie technique s'applique.

Conforme :

- [x] Une seule mécanique (manipuler des bulles), style oscilloscope seul
- [x] Un seul `index.html` sans build (+ moteur Rapier dans `vendor/`, copie
  à l'identique du paquet npm, licence Apache-2.0)
- [x] Hors ligne complet (service worker, moteur servi avec la page)
- [x] Installable en PWA (manifeste + service worker)
- [x] Mise à jour automatique (vérification ETag), aucune sauvegarde à perdre
  (seule la langue est gardée, en `localStorage` dans un try/catch)
- [x] Batterie : boucle d'animation arrêtée au repos et en arrière-plan
- [x] Français et anglais
- [x] Letterbox au-delà du carré ; testé en 390×844 (Playwright)
- [x] Zoom, loupe et rebond de page bloqués ; son débloqué au premier geste

Écarts restants :

- [ ] Pas testé en vrai sur un format carré / téléphone pliant
- [ ] Parties « jeu » (lore, fin à 100 %, multijoueur, fausse pub, retours
  et tests A/B) : sans objet tant que ce n'est pas un jeu
