# Backlog — Extrapolation

Explorateur de méthodes d'extrapolation : une courbe de données (série
aléatoire, ou dessinée au doigt), quatre méthodes qui la prolongent
jusqu'en 2126, et leur écart moyen. Détails techniques et build :
`source/README.md`.

Tri : priorité décroissante.

## Fait

- [x] v1 — Série synthétique à mécanique cachée, 4 méthodes, « Révéler la mécanique »
- [x] v2 — Graphique SVG tactile, petit ⓘ explicatif par méthode, écart moyen
- [x] v3 — Une seule courbe de données : aléatoire ou dessinée
  (« ✎ Dessiner ma courbe »), points glissés au doigt, méthodes et écart
  moyen recalculés en direct, curseur de bruit
- [x] v4 — Zoom tactile et loupe iOS bloqués (viewport, `touch-action`,
  `user-select`, `touch-callout`, `gesture*`, `touchstart/end` sur le graphique)
- [x] v4 — Script de mise à jour automatique (clés `extrapolation_*`)
- [x] v4 — Sauvegarde locale (courbe dessinée, réglages, langue), relue
  champ par champ, jamais interprétée
- [x] v4 — Français / anglais (bouton EN/FR, langue du téléphone par défaut)
- [x] v4 — Installable (manifest, icône écran d'accueil), astuce dans l'Historique
- [x] v4 — Format téléphone centré sur tablette / ordinateur, zones sûres iPhone
- [x] v5 — L'échelle verticale ne saute plus au lâcher d'un point (gardée
  tant que les données y tiennent)
- [x] v5 — Ligne du point de référence glissable sur le graphique (triangle en bas)
- [x] v6 — La courbe dessinée va jusqu'en 2126 : la partie future (pointillé)
  est la « vérité » à deviner, colonne « futur » calculée dessus

## À faire

- [ ] P1 — Retour de Pierre sur téléphone : glissé des points, taille des
  cibles, lisibilité du tableau d'écart

## Conformité à la charte (../REGLES-JEUX.md)

Ce n'est pas vraiment un jeu : pas d'échec possible, pas de session à
rejouer — c'est un outil pédagogique, comme `../pas-a-pas/`. Seule la
partie technique de la charte s'applique.

- Smartphone d'abord, letterbox ailleurs : oui
- Hors ligne : oui une fois chargée (aucun appel serveur hormis la
  vérification de mise à jour) ; pas de service worker, donc pas de
  premier chargement hors ligne — choix commun au portfolio
- Sauvegarde locale en try/catch, conservée à travers les mises à jour : oui
- Mise à jour automatique : oui, silencieuse (rien à perdre, l'état est sauvegardé)
- PWA installable : oui (manifest) ; l'explication est dans l'Historique,
  pas en intro
- Français et anglais : oui
- Injections : la sauvegarde est relue champ par champ (nombres bornés,
  booléens), rien n'est évalué
- Écart assumé : **un build Vite (React)** au lieu d'un seul fichier HTML
  sans build — hérité de la v1 ; le résultat reste un `index.html` + un JS
- Écart assumé : **pas d'esthétique oscilloscope** (bleu nuit, plusieurs
  couleurs) — les quatre méthodes doivent se distinguer par la couleur,
  et le trait (plein / pointillé) double l'information
