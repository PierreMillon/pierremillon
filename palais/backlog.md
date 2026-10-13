# Backlog — Palais (palais de mémoire)

Un palais à dessiner et à parcourir, dans l'ambiance de Helix: Descent N
Ascent (Badass Mongoose), pour y ranger ses cours de maths phrase par
phrase, formule par formule — et les reparcourir en entier ou dans le
désordre.

Tri : priorité décroissante. Pour l'instant : **page d'essai du rendu**
(étape 1), pas encore le jeu. Lien dans le menu du portfolio (demande de Pierre).

## Fiche de style (tirée des captures envoyées par Pierre)

- Vue de dessus, caméra fixe, un écran par salle ; le fond de la salle
  (mur, trône, arche) est vu de face, comme un Zelda vu de dessus
- Encre noire très détaillée, façon planche de manga : trait tremblé,
  pointillés, trame, pinceau sec, hachures croisées
- Ombres portées en traits horizontaux serrés aux bords effilochés
- Voile gris de papier, vignettage plus sombre sur les bords (pas du noir
  et blanc strict)
- Grandes masses noires (ronces, machinerie) autour d'un sol clair éclairé
- Architecture ancienne (dallages, briques, arches, niches, labyrinthes,
  spirales, plaques ◇) mêlée de biomécanique (tuyaux à brides, gaines
  annelées, tentacules) et de ronces à épines
- Personnage : petite créature blanche, tête ronde à deux pointes, grands
  yeux noirs en amande ; petites bouffées de fumée en marchant ; son double
  est noir
- Interface quasi absente : grappe de quatre cercles à symboles

## Fait

- [x] v1 — Page d'essai : une salle en portrait dessinée par le code
  (dallage, plaques ◇, mur de briques à arche et niches, tuyaux, gaine,
  colonnes, spirale, ronces, ombres en traits, vignettage), petite créature
  qui marche, plaque ◇ = bout de papier avec une phrase de cours, ◐ inverse
  noir et blanc et révèle la ligne cachée ; variantes A (dense) / B (sobre)
- [x] v2 — Variante B par défaut (choix de Pierre) ; dessin plus fait main
  (traits au pinceau effilés qui débordent, hachures irrégulières,
  éclaboussures, pinceau sec, fibres du papier) ; personnage en vrai 3D
  (three.js copié dans vendor/, rendu à l'encre : trame, hachures, contour),
  qui se tourne et marche
- [x] v3 — Tenue façon Mathilda (Léon) : robe courte, coupe au carré noire
  à frange, ras-de-cou noir (demande de Pierre)
- [x] v9 — Billets ouverts au bouton « ? » (plus en marchant), « ? » au-dessus
  du personnage sur une zone ; bouton ↻ retiré
- [x] v8 — Joystick virtuel : apparaît là où l'on pose le doigt, direction et
  vitesse selon le glissé ; simple touche = aller au point touché
- [x] v7 — Écriture des formules nette (belle police), taches d'encre
  autour seulement, billets en papier abîmé ; textures pierre / papier,
  traits de structure à la règle, encre qui diffuse dans le papier ; les
  17 formules choisies par Pierre rangées dans les trois pièces et le livre
- [x] v6 — Couloir en S inversé entre hall et bibliothèque (6 cadres =
  questions / formules), livre « L'héritage de Pythagore » (6 pages),
  chemin calculé sur une grille
- [x] Page formules.html : 65 formules tirées des cours de Pierre
  (licence-math, exercices-l1-math, fiche-de-math-gael), à cocher ; le
  résultat se copie pour Claude
- [x] v5 — Bibliothèque à droite du hall (passage), diriger au doigt
  appuyé, obstacles, respiration et petite danse au repos, une seule
  version du dessin (la plus dense), boutons A/B et i retirés (historique
  via l'étiquette en haut à gauche), trait plus irrégulier, crasse et
  usure ; plaques = nom de la formule, formule tracée à la plume en mode
  noir
- [x] v4 — Retour au personnage de la v2 (demande de Pierre)
- [x] v1 — Lien ajouté au menu du portfolio (demande de Pierre), groupe des jeux

## À faire

- [ ] P1 — Retour de Pierre sur téléphone : rendu du personnage 3D (taille,
  oreilles, trame), densité du trait (seul Pierre peut le faire)
- [ ] P2 — Étape 2 : déplacement et passage d'un écran à l'autre par les
  bords ; escaliers qui descendent / montent (Descent N Ascent)
- [ ] P2 — Pièces maîtresses dessinées à la main par Pierre (trône, porte,
  statues), photographiées puis intégrées (choix « les deux » : code pour
  la base, dessins de Pierre pour quelques pièces)
- [ ] P3 — Étape 3 : plaques ◇ = lieux de mémoire, inversion pour vérifier
- [ ] P3 — Étape 4 : construire son palais en posant des pièces de décor
- [ ] P3 — Étape 5 : écrire ses cours dans les plaques (qui parle : prof,
  élève, moi), visite dans l'ordre ou au hasard, export / import
- [ ] P4 — Les salles sues par cœur se « dégradent » comme dans Helix
  (illustration → grille → blanc)

## Conformité à la charte (../REGLES-JEUX.md)

Ce sera un outil de mémoire plus qu'un jeu (pas d'échec possible) : seule
la partie technique de la charte s'appliquera. Pour l'instant c'est une
page d'essai.

Déjà conforme : un seul fichier HTML sans build (plus three.js copié dans
vendor/, licence MIT), hors ligne (service
worker « réseau d'abord », cache `palais-vN`), portrait (choix de Pierre),
zoom tactile et loupe iOS désactivés, écran figé, mise à jour automatique,
version et historique (bouton i), réglage sauvegardé en `localStorage`
(try/catch), boucle d'animation : pleine vitesse quand le personnage bouge, ~30 i/s au
repos (respiration, danse), arrêtée quand la page est cachée.

Écarts :

- [ ] Style encre noir et blanc au lieu du vert phosphore par défaut —
  choix assumé, demandé par Pierre (référence Helix)
- [ ] Pas encore d'anglais (texte de la page d'essai en français)
- [ ] Pas de musique (seulement des sons courts)
