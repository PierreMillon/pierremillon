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
- [ ] P2 — Mode jeu : l'élève choisit la transformation, l'animation valide ou montre l'erreur
- [ ] P2 — Plus d'exemples : double distributivité, identités remarquables, équations (même opération des deux côtés)
- [ ] P2 — Ajouter au menu du portfolio (groupe maths)
- [ ] P3 — Saisie libre d'une expression (moteur de calcul formel, gros chantier)

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
