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

## Notes de contexte (pour ne rien perdre)

- "Tour" = les tourelles construites par le joueur (créneaux/cubes) ;
  "château"/"donjon" = la structure principale qui grandit/rétrécit.
  Vocabulaire à garder cohérent dans le code et les futures discussions.
