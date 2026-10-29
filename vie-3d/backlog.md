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

- Cube de 0³ à 10³, taille au curseur (change la taille = nouveau tirage).
  Le côté 0 est le cas dégénéré assumé : un monde sans aucune case. Rien
  n'est dessiné — pas même la boîte, puisqu'il n'y a pas de monde à
  délimiter : un écran noir et la raison écrite dessus. Rien ne peut y
  naître, la génération n'avance même plus et la boucle de rendu
  s'arrête (rien à calculer).
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
- Compteurs génération / vivants. Pas de message « colonie éteinte » :
  quand tout meurt, le cube vide et le compteur Vivants à 0 le disent
  déjà. La seule mention au centre est celle du cube de côté 0, sans
  laquelle l'écran noir serait inexplicable.
- Son facultatif, indexé sur ce qui CHANGE et non sur la population : une
  voix claire pour les naissances, une grave pour les morts, chacune
  d'autant plus forte et haute qu'elles sont nombreuses. Silence strict
  quand rien ne bouge — nature morte, cube figé, cube vide (vérifié : 0
  son émis sur 5 générations d'une nature morte). Coupé par défaut.
- Français / anglais, bouton Historique, numéro de version dans le menu.
- Motifs prêts à poser (bouton ◈ Motifs) : trois natures mortes, deux
  oscillateurs de période 2 et le planeur de Bays (10 cellules, période 4,
  une case en diagonale par période). Poser un motif vide le cube, impose
  la règle 5766 et agrandit le cube si besoin ; le planeur est adossé au
  mur de départ pour avoir de la route devant lui.
- **Galeries de cycles** (dans le panneau ◈ Motifs), chaque figure
  dessinée en miniature avec la même projection que le grand cube, pour
  qu'on choisisse en voyant plutôt qu'en lisant un nombre. Les miniatures
  ne sont calculées qu'en approchant de l'écran, et la galerie du 4³ se
  dévoile par paquets de 96 — sinon l'ouverture du panneau traînerait et
  des centaines de canevas resteraient en mémoire pour rien.
  - **Cube 3³, les 23 cycles non vides** : liste complète et démontrée.
  - **Cube 4³, 784 cycles** : récolte, pas preuve (voir plus bas).
  - Poser une figure force la taille du cube correspondante et la règle
    5766 : ce sont des cycles **de ce cube-là**, leur équilibre dépend
    des murs.
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

## Ce qui est démontré sur les petits cubes

Le cube est **borné**, donc le nombre d'états est fini et toute partie
finit forcément par boucler : il n'existe aucun comportement infini dans
ce jeu. Pour les trois plus petites tailles, on peut même tout énumérer.

- **1³** (2 états, tous testés) : désert absolu. Une cellule seule a zéro
  voisine donc meurt, et il en faudrait 6 pour en faire naître une.
- **2³** (256 états, tous testés) : 5 cellules ou moins → extinction ;
  6 cellules → le cube se remplit à 8 et se fige ; 7 ou 8 → stable tel
  quel. Deux formes stables en tout, aucun oscillateur.
- **3³** (134 217 728 états, tous parcourus en 16,8 s) : **24 cycles
  distincts** à symétrie près (les 48 rotations et reflets du cube) —
  17 natures mortes (dont le cube vide ; la plus petite non vide fait
  7 cellules) et 7 oscillateurs de période 2. **Aucune période ≥ 3
  n'existe en 3³**, c'est prouvé par épuisement et pas seulement « pas
  trouvé ». Seuls 396 états sur 134 millions sont sur un cycle, soit
  0,0003 % : presque tout est transitoire.

## Le cube 4³ : comment on a vu beaucoup plus

4³ fait 2⁶⁴ états — l'énumération complète resterait hors de portée même
en y passant des dizaines de milliers d'années. On ne peut donc que
chercher. Mais on peut chercher **beaucoup** mieux qu'au hasard, et c'est
ce qui a été fait, sur quatre leviers :

1. **Un moteur une dizaine de fois plus rapide.** L'état entier d'un cube
   4³ tient dans deux entiers 32 bits (quatre couches de 16 cases), et le
   nombre de voisines ne se compte plus case par case : deux tables
   précalculées (`inl`, `cross`, 64 Ko chacune) donnent d'un coup les
   voisines dans la couche et dans la couche d'à côté. Une génération =
   64 lectures de table. Mesuré : 621 millions de configurations balayées
   en 107 s, là où le moteur naïf aurait demandé des heures.
2. **Une borne démontrée, qui évite d'explorer pour rien.** Survivre
   demande 5 voisines, naître en demande 6 : **toute configuration de 5
   cellules ou moins meurt en un coup**, dans n'importe quelle taille de
   cube. Ce n'est pas une observation, c'est une conséquence directe de la
   règle. L'énumération exhaustive commence donc à 6 — et les 8 303 633
   configurations de 0 à 5 cellules, testées quand même par acquit de
   conscience, meurent bien toutes.
3. **Les sous-espaces symétriques, énumérés en entier.** Les
   configurations invariantes par un sous-groupe des 48 symétries du cube
   forment un espace minuscule : 2^(nombre d'orbites) au lieu de 2⁶⁴. En
   parcourant les 61 sous-groupes dont le quotient tient en 23 orbites, on
   énumère **complètement** 17 889 747 configurations en 45 s. C'est là
   que vivent la plupart des oscillateurs — ce levier à lui seul a fourni
   plus de cent cycles que le hasard n'avait pas trouvés.
4. **L'échantillonnage massif**, moitié soupes libres, moitié soupes
   contraintes à être symétriques (bien plus fécondes) : 20 millions de
   tirages en 69 s.

Résultat : **784 cycles distincts** à symétrie près — 711 figés, 73 de
période 2, et toujours aucune période ≥ 3 (un planeur, lui, a besoin de
plus de place : il en faut 8³ pour le voir voler).

Exhaustif vérifié au passage : toutes les configurations de 6 cellules
(74 974 368) et de 7 cellules (621 216 192) ont été testées sans
exception.

**Ce catalogue n'est pas clos, et le dire est important** : la dernière
nouveauté est apparue à la 19 943 420ᵉ soupe sur 20 millions. La courbe
ne s'aplatit pas — chercher plus longtemps trouverait encore. Le 3³ est
une preuve, le 4³ est une récolte.

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
- Pousser la récolte du 4³ plus loin (la courbe monte encore) et, surtout,
  trouver un critère pour **classer** les cycles autrement que par taille :
  à partir de 400 vignettes, la galerie demande un fil conducteur.
- Chercher un oscillateur de période ≥ 3 : aucun n'a été trouvé en 3³
  (prouvé impossible) ni en 4³ (jamais vu). Question ouverte : à partir de
  quelle taille de cube en existe-t-il ?
