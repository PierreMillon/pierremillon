# Backlog — Tables de multiplication

Les tables du premier chapitre du Soroban (../soroban/), sorties dans leur
propre page et étendues (demande de Pierre) : même principe — trouver la
case ou écrire le résultat, compteur d'erreurs pour travailler au maximum
ce qu'on ne sait pas — avec les tables jusqu'à 20, et un chapitre à part
pour les carrés (jusqu'à 20) et les cubes (jusqu'à 10).

Tri : priorité décroissante.

## Fait

- [x] v1 — Chapitre 1, tables : grille 2–9 coupée par la diagonale
  (36 cases) et grille 11–20 de × 2 à × 9 (80 cases, choix de Pierre)
- [x] v1 — Chapitre 2, à part : carrés de 2² à 20², cubes de 2³ à 10³
- [x] v1 — Trouver la case / Écrire le résultat (pavé de chiffres, ou
  clavier sur ordinateur), ↻ pour recommencer la grille
- [x] v1 — Compteur d'erreurs par case (coin rouge), cases ratées tirées
  plus souvent ; en « Trouver », une mauvaise case compte aussi une erreur
  sur la case touchée ; « Erreurs n » : ne refaire que les cases ratées
- [x] v1 — Répétition espacée reprise du Soroban (case sue grisée, revient
  au bout de 2, 4, 8… grilles)
- [x] v1 — Doublons de 2–9 reliés par un trait ; tables faciles (2, 5,
  diagonale) en opacité légère ; ✓ sur une partie quand ses deux grilles
  sont réussies sans erreur
- [x] v1 — Ajouté au menu du portfolio (groupe maths, après Soroban)
- [x] v2 — Plus de rappel du résultat sous le nombre après une réponse
  (« 17² = 289 », ni après une erreur) : la case remplie ou rouge suffit

## À faire

- [ ] P1 — Retour de Pierre sur téléphone : taille des cases de la grille
  11–20 en portrait, lisibilité des carrés et cubes (seul Pierre peut le
  faire)

## Conformité à la charte (../REGLES-JEUX.md)

Ce n'est pas vraiment un jeu : pas d'échec possible, c'est un outil
d'entraînement. Seule la partie technique de la charte s'applique.

Déjà conforme : un seul fichier HTML sans build, esthétique oscilloscope,
français et anglais, sauvegarde locale en try/catch avec validation stricte
(seulement des clés de cases connues et des entiers), zoom tactile et loupe
iOS désactivés, écran figé, mise à jour automatique, bouton Historique,
service worker « réseau d'abord » (cache `tables-vN`, nettoie ses propres
anciennes versions), aucune boucle d'animation quand rien ne respire.

Écarts restants :

- [ ] Installation (PWA) à vérifier sur téléphone
