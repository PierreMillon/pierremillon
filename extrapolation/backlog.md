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

- [x] v7 — Onglet Bourse : vrais cours mensuels embarqués (hors ligne),
  prédiction du mois suivant au doigt, méthodes naïve / sécante /
  régression / pondérée / moyenne mobile, erreur en % et sens juste,
  calcul en % (log), test walk-forward sur toute la série, valeurs collées

- [x] v8 — Bourse : Bitcoin (jour / semaine / mois, historique intégré
  Coin Metrics + complément en direct Binance / CoinGecko) et S&P 500 ;
  autres valeurs retirées
- [x] v8 — Méthodes : lissage exponentiel (Holt), momentum, moyennes
  croisées, AR(2) — toutes disponibles d'un coup, chacune avec son ⓘ
- [x] v8 — Horizon 1 à 12 pas, prédiction par points à glisser ;
  prédictions des méthodes cachées avant « Valider »
- [x] v8 — Parties de 10 / 25 / 50 manches ; score : erreur %, sens juste,
  fonds fictif 10 000 $ (achat + vente à découvert, 0,1 % de frais),
  « bat le naïf ? », comparaison à « acheter et garder »
- [x] v8 — Écran figé (page sans défilement ni rebond, seuls les panneaux
  de réglages défilent)

Choix de Pierre (questionnaire du 25/09) : priorité aux méthodes, pas de
temps au choix, une seule valeur (Bitcoin) + S&P gardé, horizon 1 ou
plusieurs pas, données en direct, dollars, toutes les méthodes d'un coup,
prédictions cachées avant validation, parties réglables, 10 000 $ de
départ, reste un onglet d'Extrapolation.

## À faire

- [ ] P1 — Retour de Pierre sur téléphone : glissé des points, taille des
  cibles, lisibilité du tableau d'écart, onglet Bourse
- [ ] P1 — Vérifier sur le téléphone que la mise à jour en direct de
  Bitcoin marche (Binance / CoinGecko n'ont pas pu être testés depuis
  l'environnement de build, bloqués) : la ligne sous la série doit
  afficher « données jusqu'au <hier> · Binance BTCUSDT »
- [ ] P2 — Les erreurs moyennes en % sur Bitcoin sont dominées par
  2010-2011 (cours de quelques cents, variations énormes) : proposer de
  commencer le test à une date choisie
- [ ] P3 — Plus tard : autres valeurs (CAC 40, actions) une fois une
  source ouverte trouvée

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
