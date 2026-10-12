# Backlog — Tables de multiplication

Les tables du premier chapitre du Soroban (../soroban/), sorties dans leur
propre page et étendues (demande de Pierre) : même principe — trouver la
case ou écrire le résultat, compteur d'erreurs pour travailler au maximum
ce qu'on ne sait pas — avec les tables jusqu'à 20, et un chapitre à part
pour les carrés (jusqu'à 20) et les cubes (jusqu'à 10).

Tri : priorité décroissante.

## Fait

- [x] v1 — Chapitre 1, tables : grille 2–9 coupée par la diagonale
  (36 cases) et grille 11–20 de × 2 à × 9 (80 cases, choix de Pierre ; 12–19 depuis v4)
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
- [x] v3 — Puissances de 2 (2¹ à 2¹⁰ = 1024), dans le chapitre des carrés
  et cubes (bouton 2ⁿ)
- [x] v4 — « Les deux » : alterne trouver la case (résultat donné) et
  choisir le résultat parmi quatre (case allumée) ; grille 12–19 (lignes 11
  et 20 retirées, demande de Pierre) ; boutons du haut sans « × » ni trait,
  glisser à gauche / à droite pour changer de partie ; carrés et cubes
  notés x² et x³
- [x] v5 — Un seul exercice (boutons Trouver / Écrire / Les deux retirés) :
  chaque question tire au hasard l'un des deux sens (toucher la case du
  résultat donné, ou choisir parmi 4 le résultat de la case allumée), jamais
  trois fois de suite le même
- [x] v6 — Case allumée : on tape le résultat au pavé (plus de 4 choix),
  sans touche « OK » — validé dès qu'on a tapé autant de chiffres que la
  réponse ; numéro de version affiché dans le menu

## À faire

- [ ] P1 — Retour de Pierre sur téléphone : taille des cases de la grille
  12–19 en portrait, lisibilité des carrés et cubes (seul Pierre peut le
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
