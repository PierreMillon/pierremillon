# Forge Line — notes de conception

Journal des décisions et des idées, dans l'ordre où elles arrivent.
**Règle : on met à jour, on ne supprime jamais.** Une idée faite reste
tracée (marquée faite) ; une idée mise de côté reste tracée (marquée
« plus tard ») ; rien ne doit se perdre au fil de la discussion.

Format condensé — l'idée, pas la formulation exacte.

## 🚧 En cours

- (rien en cours — voir "à faire" ci-dessous)

## 📋 À faire (demandé, pas encore fait)

- Le joueur a une "santé" visuelle : à chaque fois qu'il est attaqué par
  un ennemi (le but des ennemis reste le château/la ligne, pas le joueur,
  mais s'ils l'attaquent quand même ça compte), il ne rétrécit pas mais sa
  couleur vire progressivement du jaune au rouge (~10 paliers), avec un
  flash rouge au moment du coup. Chaque palier réduit sa vitesse de tir de
  5%. Régénération : zones tampon marquées au sol près de la base — en
  rester dans une, la vie remonte (+1 point flottant affiché) au rythme
  d'environ 1 point/0,5s.

## 💭 Idées à explorer plus tard (pas encore décidées)

- (aucune en attente pour l'instant)

## ✅ Décisions prises

- **Rendu** : 2D isométrique, pas de vraie 3D — reste léger. Profondeur
  simulée par un tri des calques (objets plus bas à l'écran = plus proches,
  dessinés par-dessus).
- **Éclairage** : pas de lumière dynamique (coûteux en 3D réelle) — teintes
  fixes par face des pavés isométriques, façon éclairage figé.
- **Mouvement** : joueur/ennemis/projectiles en coordonnées libres (pixels
  écran), pas contraints à une grille. Le placement des tours réintroduit
  une grille, mais seulement pour ça (voir "En cours").
- **Ennemis** : spawn aléatoire en haut d'écran, descente verticale avec
  ondulation organique (pas un alignement sur la grille). Deux rôles :
  *rushers* (foncent vers la ligne du bas) et *attackers* (ciblent la tour
  la plus proche pour l'occuper/la détruire).
- **Vagues** : salves irrégulières (1, parfois 2-3 d'un coup), délai
  variable entre décisions, certains ennemis hésitent avant de s'avancer —
  effet "ils réfléchissent", pas un tapis roulant. Chaque vague est 20%
  plus forte que la précédente (PV ennemis, croissance exponentielle).
- **Tours** : pas de barre de vie séparée — leur hauteur EST leur vie,
  elles rétrécissent en encaissant et disparaissent à 0 (sans bruit).
  Obstacles solides : joueur et ennemis ne peuvent pas les traverser.
  Flash translucide bref quand elles encaissent un coup (pas une
  transparence permanente). Mêmes projectiles que le joueur, même rythme
  (1 tir/s).
- **Économie** : or gagné uniquement en tuant un ennemi (1 or/kill, pas de
  revenu passif, rien si l'ennemi atteint la ligne).
- **Son** : bruitages synthétisés en Web Audio API (aucun fichier) — tir
  sec, impact plus aigu/sourd, clank métallique à la construction, coup de
  marteau grave quand une tour encaisse, silence à la destruction.
  L'audio doit être débloqué au tout premier geste utilisateur (sinon
  muet toute la partie sur mobile).
- **Interface** : plein écran avec bandeau haut (menu ☰ en haut à gauche +
  numéro de version cliquable en haut à droite) et bandeau bas (stats).
  Le menu haut-gauche est prévu pour naviguer vers les autres jeux
  (Bastion Orbit) et pour des réglages debug.
- **Écran de défaite** : petite carte centrée (le jeu reste visible
  derrière, pas un voile plein écran). Bouton "regarder une pub pour
  continuer" (fonctionnel — pardonne les brèches — mais pas de vraie
  vidéo branchée) et bouton "recommencer à zéro".
- **Workflow** : discussion d'abord, prototype jouable en un seul fichier
  HTML, production seulement si le concept plaît — pour économiser les
  tokens. Chaque changement testé (Playwright si besoin) puis poussé sur
  GitHub Pages directement (pas de longue attente en review).
- **Grille de construction (v13, corrigée)** : la v11 avait remplacé la
  grille isométrique par une grille carrée invisible, sur la base d'un
  test d'espacement (mesuré tous les 60px) qui semblait irrégulier.
  Correction reçue : ce n'était pas voulu. Refait un test fin (tous les
  1px) qui a montré que l'irrégularité était un artefact du test grossier
  — la grille en losange fonctionne bien nativement (chaque case voisine
  touche la précédente par un bord complet, en zigzag vertical régulier,
  normal pour un quadrillage en losange). Grille isométrique restaurée.
- **Bug corrigé (v12)** : les ennemis "sautaient" visiblement au moment
  où ils commençaient à bouger (juste après l'apparition, ou après une
  hésitation). Cause : la position de départ ne correspondait pas à la
  formule utilisée pour le mouvement (ondulation gauche-droite), donc le
  premier calcul de position produisait un saut au lieu d'un glissement
  continu. Corrigé en calculant la position initiale avec la même
  formule — vérifié : saut nul.
- **Équilibrage (v12)** : vitesse des ennemis -20%, vitesse de tir des
  tours +20% (le joueur garde son propre rythme de tir).
- **Thème Vikings (v13)** : bande d'eau bleue tout en haut de la carte
  (la plage), bateau viking centré dessus — icône reprise à l'identique
  du sprite `boat-icon.png` du jeu Knight Wars (autre projet du
  portfolio). Les ennemis apparaissent groupés au pied du bateau plutôt
  que dispersés sur toute la largeur, comme s'ils en débarquaient. Le
  reste de la carte (sous la plage) reste le château fort à défendre.

## 📜 Historique des versions (résumé)

- v1 : prototype initial (déplacement, tours, vagues)
- v2 : contrôles tactiles (joystick, double-tap), style beige
- v3 : plein écran, mouvement organique, projectiles en sphères
- v4 : tri des calques par profondeur
- v5 : déplacement libre plein écran (fin de la grille de placement d'origine)
- v6 : numéro de version cliquable, lien menu vers Bastion Orbit
- v7 : correctif d'un plantage bloquant dès le 1er ennemi
- v8 : nettoyage du menu
- v9 : vagues organiques, tours-murs (collision), or au kill, bruitages,
  écran de défaite repensé
- v10 : or/kill réduit à 1, correctif audio (débloqué au 1er geste)
- v11 : grille de construction (carrée — à revoir, voir 🚧 ci-dessus)
- v12 : correctif du saut visuel des ennemis au démarrage du mouvement,
  vitesse ennemis -20%, vitesse de tir des tours +20%
- v13 : grille isométrique restaurée (le carré était une fausse bonne
  idée), thème Vikings (bateau, plage)
