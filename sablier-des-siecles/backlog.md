# Le Sablier des Siècles — backlog

Site vitrine d'un jeu de société d'histoire (5-15 ans) : présentation du
jeu, boutique (partie marchande) et pages de découverte des époques
(partie non marchande, gratuite).

**Ce n'est pas un jeu** au sens de la charte : c'est un site, pas une
session rejouable. Seule la partie technique de la charte s'applique.

## Fait (v1)

- Onglet « Le jeu » : concept, règles en 4 étapes, deux niveaux de cartes
  (5-8 ans / 9-15 ans), contenu de la boîte
- Onglet « Boutique » : 4 produits, panier (quantités, livraison offerte
  dès 40 €), validation **de démonstration** — aucun champ de paiement,
  aucune donnée envoyée
- Onglet « Découvrir » : 12 époques, 3 anecdotes + mini-quiz chacune,
  progression sauvegardée en local
- Bouton ⓘ → Historique, numéro de version dans l'en-tête

## À faire

- Illustrations réelles du jeu (photos de la boîte, des cartes)
- Vrai paiement si le jeu existe un jour (prestataire externe, jamais de
  saisie de carte dans la page)
- Version anglaise
- Plus d'époques (Mayas, Aztèques, Mali médiéval, Japon des samouraïs…)
- Faire relire les anecdotes par un enseignant d'histoire

## Conformité à la charte (../REGLES-JEUX.md)

- ✅ Un seul `index.html`, sans build, sans appel serveur
- ✅ Sauvegarde locale (`localStorage` namespacé `sablier_`, try/catch),
  données relues filtrées (pas de clé ou quantité inconnue)
- ✅ Mise à jour automatique (ETag, clés `pm_pageVersion_sablier-des-siecles`)
- ✅ Zoom tactile et loupe iOS désactivés, page figée
- ⚠️ Écart assumé : la zone de contenu défile (en interne, sans rebond,
  `overscroll-behavior: contain`) — un site marchand a trop de texte pour
  tenir sur un écran ; la page elle-même ne bouge jamais
- ⚠️ Écart assumé : style flat design clair (papier / bleu / orange) au
  lieu de l'oscilloscope — public 5-15 ans et parents, site commercial
- ❌ Pas de service worker / hors ligne ni de PWA installable
- ❌ Pas de version anglaise
