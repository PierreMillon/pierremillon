# Vie 3D — backlog

Le jeu de la vie de Conway, mais dans un cube. Une cellule a 26 voisines
au lieu de 8, donc les règles de Conway (B3/S23) ne tiennent pas en
volume : tout s'éteint ou tout sature. On utilise les règles 3D connues,
notées survie-min / survie-max / naissance-min / naissance-max.

- **5766** — survie 5 à 7 voisines, naissance à **6 exactement** : la vie
  3D classique de Bays, celle qui donne des structures qui bougent sans
  exploser. Par défaut. (La v1 codait naissance 6 **ou 7** — une erreur de
  lecture de la notation E1E2F1F2, corrigée en v2 : sous la mauvaise règle
  le planeur de Bays n'existe pas.)
- **4555** — cristallise, formes anguleuses qui se figent.
- **5655** — nuages, masses qui ondulent.

Bords fermés, pas de tore : le cube visible **est** la limite du monde,
une cellule au bord a donc moins de voisines. Plus honnête visuellement
qu'un monde qui se reboucle sans qu'on le voie.

## Ce que c'est, et ce que ce n'est pas

**Ce n'est pas vraiment un jeu** : on ne peut pas perdre, il n'y a pas
d'objectif ni de score. C'est un bac à sable contemplatif — on sème, on
regarde, on recommence. Conformément à la consigne de `../CLAUDE.md`,
c'est dit explicitement ici : **seule la partie technique de la charte
s'applique pleinement**. Les sections conception de jeu (difficulté
progressive, lore, monétisation, multijoueur) ne sont pas pertinentes en
l'état.

## État

Fait :

- Cube de 3³ à 10³, taille au curseur (change la taille = nouveau tirage).
- Structure en fil de fer : les 12 arêtes du cube, plus un quadrillage
  sur les trois faces qui tournent le dos à la caméra — jamais devant les
  cellules.
- Cellules vivantes = petits cubes à peine remplis : l'arête porte
  l'information, le remplissage très faible laisse voir celles de
  derrière. Profondeur rendue par l'intensité (plus près = plus lumineux).
- Rotation au doigt (glissé), projection orthographique écrite à la main,
  sans bibliothèque.
- Toucher à deux temps : un cube vivant sous le doigt est **ôté** quel que
  soit son étage ; sinon on **pose** sur le plan de l'étage éclairé
  (curseur Étage).
- Tirage aléatoire, Vider, Pas à pas, Lecture/Pause, vitesse réglable
  (1 s → 100 ms par génération).
- Naissances mises en évidence une génération, morts laissées en fantôme
  une génération — on voit ce qui vient de changer.
- Compteurs génération / vivants, message « colonie éteinte ».
- Son facultatif : un bip court par génération, hauteur proportionnelle à
  la population (coupé par défaut).
- Français / anglais, bouton Historique, numéro de version dans le menu.
- Motifs prêts à poser (bouton ◈ Motifs) : trois natures mortes, deux
  oscillateurs de période 2 et le planeur de Bays (10 cellules, période 4,
  une case en diagonale par période). Poser un motif vide le cube, impose
  la règle 5766 et agrandit le cube si besoin ; le planeur est adossé au
  mur de départ pour avoir de la route devant lui.
- Sauvegarde locale du motif et des réglages (relue avec validation
  stricte `^[01]+$` et longueur attendue — une chaîne stockée n'est jamais
  interprétée).

## Conformité à la charte (../REGLES-JEUX.md)

Respecté :

- Une seule mécanique (naître/mourir selon le nombre de voisines) ; les
  règles, la taille et la vitesse sont des réglages, pas des systèmes
  empilés.
- Esthétique par défaut : fond noir, vert phosphore unique, tracé fin
  vectoriel. L'information passe par le contraste et l'intensité, jamais
  par une teinte seule.
- Un seul fichier HTML, sans build, sans dépendance.
- Téléphone d'abord : vérifié sans débordement ni défilement en 320×568,
  360×640, 390×844, 430×932 et 740×800 (pliable quasi carré).
- Zoom tactile et loupe iOS désactivés ; écran figé (pas de rebond, pas de
  tirage vers le bas) ; `touchmove` multi-doigts et `gesture*` bloqués.
- Sauvegarde locale en try/catch, conservée à travers les mises à jour.
- Script de mise à jour automatique présent dès le premier commit,
  `localStorage`/`sessionStorage` préfixés `vie-3d`.
- Batterie : la boucle de rendu s'arrête complètement en pause ; une image
  n'est calculée que si quelque chose a changé.
- Tuto par la pratique : au premier lancement le cube est déjà semé et en
  marche, l'étage éclairé montre où toucher.
- Français et anglais dès le premier jet.

Écarts assumés, à traiter :

- **Remplissage des cellules** : la charte demande des lignes plutôt que
  des formes pleines. Les cubes vivants ont un remplissage, mais
  volontairement très faible (5–13 % d'opacité) — demande explicite de
  Pierre de voir au travers. L'arête reste ce qui porte l'information.
- **Pas de PWA ni de hors-ligne complet** : pas de manifeste ni de service
  worker pour l'instant (le fichier est autonome, mais il faut le réseau
  au premier chargement). À ajouter — cache `vie-3d-vN` qui nettoie ses
  propres anciennes versions, comme prévu par `../CLAUDE.md`.
- **Pas de musique** : seulement un bip par génération. La « musique
  hypnotique » demandée par la charte reste à faire — piste : une nappe
  dont le timbre suit la population.
- **Pas de lore absurde**, pas de fausse pub, pas de multijoueur, pas de
  tests A/B : sans objet pour un bac à sable, à rouvrir si le projet
  devient un vrai jeu (par exemple : retrouver un motif cible en un
  minimum de coups).

## Comment les motifs ont été trouvés

Aucun n'est recopié de mémoire. Un chercheur écrit pour l'occasion lance
des milliers de petites soupes au hasard dans l'espace libre (sans murs),
normalise chaque génération (translation annulée, cellules triées) et
détecte une signature déjà vue : même signature au même endroit =
nature morte ou oscillateur, même signature décalée = planeur. Chaque
candidat retenu est ensuite **rejoué dans le moteur borné du jeu** pour
vérifier son comportement réel, murs compris.

Mesures obtenues : le planeur sort d'une soupe 5³ (28 familles sur 30 000
essais), vole 4 cases dans un cube 8³ et 6 cases dans un 10³ avant de se
défaire contre la paroi. C'est aussi la preuve que la règle corrigée est
la bonne : sous l'ancienne (naissance 6 ou 7), aucun planeur n'apparaît.

## Pistes

- Règle libre : deux curseurs survie et deux naissance, au lieu de trois
  préréglages.
- Historique de la population en petite courbe sous le cube.
- Rotation qui continue toute seule après un glissé rapide (inertie).
