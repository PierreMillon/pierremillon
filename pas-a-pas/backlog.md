# Backlog — Pas à Pas

Animer chaque transformation algébrique : les termes bougent, se touchent, s'annulent. Aucune étape sautée, pour voir qu'on transforme toujours le même objet mathématique.

Tri : priorité décroissante.

## Fait

- [x] Page d'essai avec 3 démos à exemples fixes et bouton « étape suivante »
- [x] Démo 1 : − devant une parenthèse (le −1 touche chaque terme)
- [x] Démo 2 : termes opposés qui s'annulent
- [x] Démo 3 : simplification d'une fraction par un facteur commun

## À faire

- [x] P1 — Distribution du −1 refaite après retour de Pierre : pas à pas
  déclenché au toucher, flèches en arc tracées lentement une par une,
  produits écrits un par un, calcul à part
- [x] P1 — Singapour : appui bref pose/retire, glisser dans les deux sens,
  animation souple, appui sur le 2e nombre = tout ranger, résultat qui
  reste affiché, flèche → pour la suite
- [x] P1 — Opposés : soustraction posée en colonne, 0 sous la barre
- [x] P1 — Chapitre Premiers : arbre de facteurs (toucher un nombre, puis
  ÷2 ÷3 ÷5 ÷7), premiers entourés, produit écrit à la fin
- [x] P1 — Distribuer / Factoriser : 2(○ + □) sans point, page finale avec
  toutes les écritures reliées par « = »
- [x] P1 — −×− : rotation dessinée (demi-cercle tracé par la pointe, angle
  affiché, tour complet à la fin)
- [x] P1 — Vérificateur de calculs au chargement : chaque étape recalculée
  (x, ○, □ au hasard), étape fausse signalée à l'écran. `fresh: true` sur
  une étape qui change volontairement la valeur (ex. × (−1))
- [ ] P1 — Retour sur la page d'essai : vitesse, lisibilité, clarté des explications
- [x] P1 — Démo « piège » : (x + 3) / 3 ≠ x, montrer pourquoi on ne peut pas simplifier
- [x] P2 — Démo dédiée « moins par moins = plus » : expliquée par une rotation à
  180° sur l'axe des réels (multiplier par −1 = tourner), séparée de la démo
  −( … ) qui ne fait que la citer comme phrase magique
- [x] P2 — Addition d'entiers façon Singapour, branchée sur `fxMeet`
  (option `blocks`) : au moment d'une fusion, un **cadre de dix** (2 rangées
  de 5 cases) apparaît et chaque nombre vient le remplir de jetons, puis
  tout se referme sur le résultat. Vérifié contre le programme MOE (P1) :
  ten frame + number bonds + stratégie « faire 10 », pas une ligne de
  carrés. Utilisé sur 2 + 5 (Opposés) et (−2) + (−1) (−( … )).
  Reste : nombres de signes contraires (annulation jeton à jeton).
- [x] P1 — Chapitre Singapour : défi « faire 10 » (glisser les jetons,
  1re dizaine avant la 2e), 3 réussites de suite = badge ✦ 10. Le badge
  conditionne l'affichage du cadre de dix sous les additions des autres
  démos. Premier badge de la vision long terme.
- [x] P2 — Défi soustraction façon Singapour (« retirer de 10 », ex. 13 − 5
  = 10 − 5 + 3), même badge ou badge suivant
- [x] P2 — Démo factorisation/distributivité avec des figures géométriques
  simples (ex. un rond + un carré = un groupe ; deux fois ce groupe = facteur
  2 devant), pensée pour être comprise sans lire le français, et réversible
  (factoriser ↔ distribuer, dans les deux sens)
- [ ] P2 — Mode jeu : l'élève choisit la transformation, l'animation valide ou montre l'erreur
- [x] P2 — Équations (même opération des deux côtés, ⇔ à la fin)
- [x] P2 — Plus d'exemples : double distributivité (Double), identité remarquable (Identité), avec page récapitulative
- [x] P2 — Ajouter au menu du portfolio (groupe maths)
- [ ] P3 — Saisie libre d'une expression — **écarté pour l'instant** (voir
  ../VISION.md « portée volontairement limitée ») : on reste sur peu
  d'exemples choisis à la main, pas un moteur de calcul formel

## Vision long terme (pas à construire maintenant)

- Système de badges : maîtriser une transformation à la main (glisser,
  toucher) débloque un badge qui permet ensuite de la faire d'un coup, sans
  repasser par le détail — la vitesse vient après la compréhension, pas
  avant.
- Ces badges font progresser à travers les ensembles de nombres, dans
  l'ordre : ℕ → ℤ → ℚ → ℝ → ℂ → quaternions → octonions (au minimum).
- Nouveau chapitre « méthodes de calcul » (bouton ou onglet à part) : des
  techniques de calcul mental décomposées pas à pas, avec les carrés façon
  Singapour comme unité visuelle commune. Exemple de référence, 16 + 27 :
  - décomposer en puissances de 10 : 10 + 6 + 20 + 7
  - décomposer 6 et 7 par rapport à 5 (les compléments à 5, pas à 10) :
    6 = 5 + 1, 7 = 5 + 2
  - regrouper les deux 5 : 5 + 5 = 10 → avec le 10 et le 20 déjà là, ça
    fait 3 × 10
  - il reste 1 + 2 = 3 à côté
  - assembler : 3×10 + 3 = 33
  - Le point pédagogique : très peu de faits à connaître par cœur (les
    sommes/compléments jusqu'à 5 seulement — compter jusqu'à 3 suffit,
    ex. « +4 » = « −1 par rapport à 5 »). Tout le reste est de la
    manipulation (regrouper, substituer, mettre en facteur), pas du calcul
    posé terme à terme (jamais un 7+6 fait directement).
  - Ce principe — décomposer, repérer ce qui se simplifie, regrouper — est
    le même « geste » que les démos d'algèbre existantes : quelques étapes
    toujours identiques, appliquées à des objets différents. Nom
    provisoire évoqué pour cette idée/l'appli entière : « l'Alchimiste »
    (transformer par étapes plutôt que calculer d'un bloc).
  - Explicitement pas un exposé théorique à lire : le but est de **montrer**
    ce que font mentalement les gens rapides en calcul, en l'animant au
    ralenti, en continu et fluide — pas des étapes discrètes qui
    s'enchaînent sèchement comme les démos actuelles, mais quelque chose
    qui donne l'impression de voir le raisonnement se dérouler dans la
    tête, en direct. Pensé pour le téléphone en priorité, pas comme un
    contenu théorique qu'on pourrait aussi bien lire sur papier.

## Migration future

- [ ] Déplacer vers son propre dépôt `pas-a-pas` + GitHub Pages
- [ ] Appliquer les règles communes des jeux HTML (voir ci-dessous)

## Conformité à la charte (../REGLES-JEUX.md)

Pas à Pas n'est pas un jeu au sens de la charte : pas d'échec possible, pas
de palier de difficulté, pas de session à rejouer. C'est un outil
d'animation pédagogique. Seule la partie technique de la charte
s'applique.

Déjà conforme : un seul fichier HTML sans build, `prefers-reduced-motion`
respecté, navigation clavier.

Écarts à corriger avant de sortir du statut « essai » :

- [ ] Pas installable en PWA
- [ ] Anglais absent (tout en français)
- [ ] Pas testé sur un format carré / téléphone pliant
- [ ] Aucune sauvegarde locale de la progression (à quelle démo on en est)
