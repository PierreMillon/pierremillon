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

## Règles des jeux HTML

- Un seul `index.html` autonome, sans build
- Palette et polices du portfolio (ivoire, Cormorant Garamond, Jost)
- Mobile d'abord : largeur téléphone, gouttière 16px, pas de défilement horizontal
- Données des démos séparées du moteur d'animation
- Respect de `prefers-reduced-motion`
- Navigation clavier (flèches) et boutons
- Lien « ← Portfolio » en haut
