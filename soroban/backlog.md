# Backlog — Soroban

Un boulier japonais au doigt : une perle du haut vaut 5, quatre du bas
valent 1. Pensé d'abord pour Pierre, pour retravailler ses bases de
calcul. C'est le support naturel des compléments à 5 et à 10 de
../VISION.md (« 16 + 27 » décomposé par rapport à 5).

Intention (réponses de Pierre) : tout à terme, mais **manipuler en
priorité**, puis **résoudre des opérations**. Gestes : toucher **et**
glisser.

Tri : priorité décroissante.

## Fait

- [x] v1 — 5 tiges (0 à 99 999), perles en fil de fer vert phosphore
- [x] v1 — Toucher une perle la bascule ; la glisser la pousse dans le sens du doigt
- [x] v1 — Nombre affiché + décomposition du dernier chiffre touché (7 = 5 + 2)
- [x] v1 — Son de perle (Web Audio), état sauvegardé, remise à zéro

## À faire

- [ ] P1 — Retour de Pierre sur la manipulation : taille des perles, glissé, son
- [ ] P1 — Résoudre une opération : une addition affichée (ex. 16 + 27),
  on la fait soi-même sur le boulier, la page valide le résultat
- [ ] P2 — Montrer au ralenti une opération faite par le boulier lui-même
  (compléments à 5 et à 10 visibles perle par perle), puis la refaire à la main
- [ ] P2 — Soustraction, puis multiplication simple
- [ ] P3 — Relier aux badges de ../VISION.md (une opération faite à la main
  débloque sa version rapide)
- [ ] P3 — Ajouter au menu du portfolio (groupe maths) quand c'est prêt

## Conformité à la charte (../REGLES-JEUX.md)

Pour l'instant ce n'est pas un jeu : pas d'échec possible, pas de session
à rejouer. C'est un outil de manipulation. Seule la partie technique de
la charte s'applique — à revoir quand le mode « résoudre une opération »
arrivera.

Déjà conforme : un seul fichier HTML sans build, esthétique oscilloscope,
hors ligne (hors police Google Fonts, qui retombe sur une police
monospace système), sauvegarde locale en try/catch avec validation stricte
(seulement 5 chiffres acceptés), zoom tactile et loupe iOS désactivés,
mise à jour automatique, bouton Historique, `prefers-reduced-motion`
respecté.

Écarts restants :

- [ ] Pas installable en PWA
- [ ] Anglais absent (tout en français)
- [ ] Pas testé sur un format carré / téléphone pliant
- [ ] Pas de navigation clavier sur les perles
