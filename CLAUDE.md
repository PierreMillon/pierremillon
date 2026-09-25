# Instructions pour Claude — dépôt pierremillon

Portfolio personnel (`pierremillon/pierremillon`), déployé tel quel sur
GitHub Pages depuis `main` (`.github/workflows/deploy-pages.yml`), sans
étape de build — sauf `extrapolation/` qui a son propre build (voir
`extrapolation/source/README.md`).

## Tout nouveau jeu ou page d'essai

**Toujours lire `REGLES-JEUX.md` avant de créer un nouveau projet de jeu
et s'y conformer.** C'est la charte de conception fixée par Pierre — une
mécanique, style visuel assumé, hors ligne, sauvegarde locale, PWA,
accessibilité, etc.

Un nouveau projet (jeu ou page d'essai) :

- vit dans son propre dossier à la racine (ex. `bulles-sonores/`), un seul
  `index.html` autonome quand c'est possible
- a un `backlog.md` dans son dossier, avec une section « Conformité à la
  charte (../REGLES-JEUX.md) » qui liste honnêtement ce qui est fait et
  les écarts restants — ne pas recopier la charte, y renvoyer
- n'est pas ajouté au menu de `index.html` tant qu'il n'est pas prêt
- si ce n'est pas vraiment un jeu (pas d'échec possible, pas de session
  rejouable — ex. un outil pédagogique comme `pas-a-pas/`), le dire
  explicitement dans le backlog : seule la partie technique de la charte
  s'applique alors

## Fusion des PR

Pierre teste en réel sur son téléphone via GitHub Pages, qui ne déploie
que depuis `main`. Donc : **toujours fusionner la PR directement après le
push**, sans attendre une demande explicite — ne pas la laisser en
brouillon en attente. S'il y a un conflit ou un échec CI, le signaler
plutôt que de fusionner en l'état.

## Historique utile

- `bastion-orbit/` et `forge-line/` ont été extraits vers leurs propres
  dépôts. Avant extraction, `forge-line/NOTES.md` et
  `bastion-orbit/BACKLOG.md` contenaient déjà des conventions de jeu
  (workflow prototype → Playwright → push direct, son en Web Audio API
  débloqué au premier geste, principe d'IA par règles locales plutôt que
  scriptée) — consultables via `git log --all` si besoin de contexte.
