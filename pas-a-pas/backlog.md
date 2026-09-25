# Backlog — Pas à Pas

Animer chaque transformation algébrique : les termes bougent, se touchent, s'annulent. Aucune étape sautée, pour voir qu'on transforme toujours le même objet mathématique.

Tri : priorité décroissante.

## Fait

- [x] Page d'essai avec 3 démos à exemples fixes et bouton « étape suivante »
- [x] Démo 1 : − devant une parenthèse (le −1 touche chaque terme)
- [x] Démo 2 : termes opposés qui s'annulent
- [x] Démo 3 : simplification d'une fraction par un facteur commun

## À faire

- [ ] P1 — Retour sur la page d'essai : vitesse, lisibilité, clarté des explications
- [ ] P1 — Démo « piège » : (x + 3) / 3 ≠ x, montrer pourquoi on ne peut pas simplifier
- [ ] P2 — Démo dédiée « moins par moins = plus » : expliquée par une rotation à
  180° sur l'axe des réels (multiplier par −1 = tourner), séparée de la démo
  −( … ) qui ne fait que la citer comme phrase magique
- [ ] P2 — Démo addition d'entiers façon « méthode de Singapour » : chaque
  nombre est une ligne de carrés (5 = une ligne de 5 carrés), on assemble
  deux lignes bout à bout pour voir la somme — base avant même l'algèbre,
  premier maillon de la charte badges → ensembles de nombres. Le visuel de
  blocs doit apparaître au moment précis d'une fusion (réutiliser le
  mécanisme `fxMeet` déjà en place pour regrouper des termes), pas comme
  une démo isolée à part.
- [ ] P2 — Démo factorisation/distributivité avec des figures géométriques
  simples (ex. un rond + un carré = un groupe ; deux fois ce groupe = facteur
  2 devant), pensée pour être comprise sans lire le français, et réversible
  (factoriser ↔ distribuer, dans les deux sens)
- [ ] P2 — Mode jeu : l'élève choisit la transformation, l'animation valide ou montre l'erreur
- [ ] P2 — Plus d'exemples : double distributivité, identités remarquables, équations (même opération des deux côtés)
- [x] P2 — Ajouter au menu du portfolio (groupe maths)
- [ ] P3 — Saisie libre d'une expression (moteur de calcul formel, gros chantier)

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
