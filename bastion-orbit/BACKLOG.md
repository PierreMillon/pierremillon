# Bastion Orbit — idées en attente

Ce fichier existe pour qu'aucune idée dite en passant ne se perde. Dès qu'une
nouvelle idée est mentionnée en conversation (même en une phrase, même pas
prête à être codée), elle est ajoutée ici avant d'être oubliée. Rien n'est
retiré quand une idée est implémentée — noter "→ fait en vX.Y" à la place.

## Engins de siège (ennemis qui se regroupent)

Si plusieurs ennemis se rassemblent au même endroit au lieu d'attaquer
séparément, ils construisent un engin de siège. Palier selon le nombre
d'ennemis regroupés :

- **2** — bouclier/tortue : invincibles tant qu'ils sont groupés sous le
  bouclier, mais ne peuvent pas attaquer pendant ce temps.
- **3** — arme de trait (grosse flèche / arbalète).
- **4** — trébuchet.
- **5** — tour de siège : avance, gagne en hauteur, permet d'attaquer le
  château directement par les airs une fois assez haute.

But : si on laisse les ennemis se regrouper trop longtemps sans intervenir,
la menace grandit — ça doit pousser à agir avant que le regroupement soit
complet, pas juste défendre passivement le mur.

## Sortie du joueur ("chevalier Bayard")

Pour contrer un engin de siège en construction, le joueur doit pouvoir
descendre du château avec des hommes et sortir attaquer spécifiquement cet
engin — sans peur et sans reproche, quitte à laisser le château moins
défendu pendant ce temps. Un vrai choix risque/récompense : rester sur les
remparts en sécurité, ou sortir pour étouffer la menace dans l'œuf.

Implique : un moyen de sortir de la boucle orbite/plateforme actuelle,
probablement une phase de jeu à part (descente + déplacement au sol vers
la cible), à concevoir.

## Huile bouillante

Depuis l'ajout de la plateforme (v0.5) qui dépasse le donjon, il y a de la
place pour percer des trous dans le rebord et y verser de l'huile
bouillante sur les ennemis en bas. Pas encore de mécanique, juste rendu
possible par la plateforme.

## Principe directeur : éviter la froideur mécanique

Dit en conversation sur Forge Line, valable pour les deux jeux : le défaut
classique des jeux de ce genre, c'est des ennemis trop prévisibles — tous à
la même vitesse, qui avancent en rang, qui attaquent chacun leur tour comme
dans les films de kung-fu où 40 sbires attendent poliment leur tour face au
héros. On veut l'inverse : un bazar organique, humain, imprévisible.

La méthode : pas une grosse IA compliquée à coder d'un coup, mais plein de
petites règles locales et simples qui s'appliquent à chaque ennemi
individuellement, et qui interagissent entre elles pour faire émerger des
comportements de groupe qu'on n'a jamais explicitement programmés. Exemple
donné : "si je suis proche d'un collègue, +1 attaque mais -1 vitesse."
(Ça rejoint directement l'idée des engins de siège ci-dessus — c'est
exactement ce genre de règle locale qui, empilée, fait émerger un
comportement de groupe complexe.)

Effet secondaire voulu, pas un risque à corriger : si le joueur reste
passif (ne sort pas attaquer, laisse les vagues s'accumuler), le système
doit pouvoir laisser les ennemis "attendre" et se regrouper en une attaque
massive plus tard plutôt que d'arriver au compte-goutte indéfiniment — ce
genre de moment surprenant et non scripté est le but recherché, pas un bug
à empêcher.

## Notes de contexte (pour ne rien perdre)

- "Tour" = les tourelles construites par le joueur (créneaux/cubes) ;
  "château"/"donjon" = la structure principale qui grandit/rétrécit.
  Vocabulaire à garder cohérent dans le code et les futures discussions.
