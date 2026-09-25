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

**Esthétique par défaut d'un nouveau jeu : oscilloscope / vieux moniteur**
— fond noir, tracé vectoriel fin en vert phosphore, pas de formes pleines
ni de dégradé. C'est le style des derniers jeux de Pierre ; s'en écarter
est un choix à justifier, pas un oubli (détails dans `REGLES-JEUX.md`).

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
- a un bouton « Historique » (ou ⓘ discret) accessible depuis l'écran
  principal, qui ouvre la liste des versions — une ligne par version avec
  ce qui a changé. À mettre à jour à chaque modification poussée sur ce
  projet, jamais laissé en retard par rapport au code
- **désactive systématiquement le zoom tactile et la loupe iOS** (déjà
  demandé pour le jeu d'avion, à refaire à chaque fois) :
  - `<meta name="viewport" content="... user-scalable=no, maximum-scale=1">`
  - `touch-action: manipulation;` (ou `none` si des gestes multi-doigts
    personnalisés sont gérés à la main, comme dans Bulles Sonores) sur le
    corps de page et les éléments interactifs — empêche le double-tap zoom
    et le pincer-zoomer
  - `-webkit-user-select: none; user-select: none;` (empêche la sélection
    de texte qui déclenche la loupe de grossissement)
  - `-webkit-touch-callout: none;` (empêche le menu/la loupe à l'appui long)
- **se comporte comme une application, écran figé** : jamais de défilement
  ni de rebond, on ne peut pas tirer la page vers le bas (vide en haut sur
  iPhone). `html, body { height: 100%; overflow: hidden;
  overscroll-behavior: none; }`, `body { position: fixed; inset: 0; }`,
  mise en page en flex qui tient dans la hauteur de l'écran (tailles
  calculées selon la place), `touchmove` et `gesturestart/change/end`
  bloqués en JS (iOS ignore `user-scalable=no` pour le pincement)
- **a le script de mise à jour automatique**, copié de `index.html`
  (vérification `fetch(..., {cache:'no-store'})` + comparaison d'ETag,
  `localStorage`/`sessionStorage` namespacés au nom du projet pour ne pas
  entrer en collision avec les autres pages du même domaine, rechargement
  silencieux). Sans lui, Pierre teste une version périmée sans le savoir —
  c'est arrivé une fois sur `pas-a-pas/` et `bulles-sonores/`, faute de
  l'avoir ajouté dès leur création. Toujours présent dès le premier commit
  d'un nouveau projet, jamais un ajout tardif.

## Fusion des PR

Pierre teste en réel sur son téléphone via GitHub Pages, qui ne déploie
que depuis `main`. Donc : **toujours fusionner la PR directement après le
push**, sans attendre une demande explicite — ne pas la laisser en
brouillon en attente. S'il y a un conflit ou un échec CI, le signaler
plutôt que de fusionner en l'état.

**Pas d'Artifact claude.ai pour tester l'application** : Pierre teste
sur le site hébergé, pas ailleurs. Un Artifact seulement quand il demande
explicitement une page de test à part (ex. l'effet oscilloscope).

## Historique utile

- `bastion-orbit/` et `forge-line/` ont été extraits vers leurs propres
  dépôts. Avant extraction, `forge-line/NOTES.md` et
  `bastion-orbit/BACKLOG.md` contenaient déjà des conventions de jeu
  (workflow prototype → Playwright → push direct, son en Web Audio API
  débloqué au premier geste, principe d'IA par règles locales plutôt que
  scriptée) — consultables via `git log --all` si besoin de contexte.
