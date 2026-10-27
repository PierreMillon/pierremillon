# Ludo Aventura — backlog

Site du jeu de société Ludo Aventura (5-15 ans) : un jeu d'aventure où
l'on accomplit des missions en répondant à des cartes questions (lecture,
écriture, calcul, nombres et lettres). Une carte = une question.

**Ce n'est pas un jeu** au sens de la charte : c'est un site, pas une
session rejouable. Seule la partie technique de la charte s'applique.

## Fait (v2)

- Nom : **Ludo Aventura** (sans tiret)
- Onglets en haut : Le jeu, Règles, Acheter, Tables, Découvrir
- Accueil sans les règles ; page Règles vide en attente du fichier de Pierre
- Page Tables : tables de multiplication de 1 à 10 avec réponses

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

- **Règles** : les intégrer quand Pierre fournit le fichier
- **Une page par carte question** (demandé pour plus tard, pas encore commencé)
- Décider si l'onglet Découvrir (époques historiques) reste lié au jeu

- Illustrations réelles du jeu (photos de la boîte, des cartes)
- Vrai paiement si le jeu existe un jour (prestataire externe, jamais de
  saisie de carte dans la page)
- Version anglaise
- Plus d'époques (Mayas, Aztèques, Mali médiéval, Japon des samouraïs…)
- Faire relire les anecdotes par un enseignant d'histoire

## Conformité à la charte (../REGLES-JEUX.md)

- ✅ Un seul `index.html`, sans build, sans appel serveur
- ✅ Sauvegarde locale (`localStorage` namespacé `ludoaventura_`, try/catch),
  données relues filtrées (pas de clé ou quantité inconnue)
- ✅ Mise à jour automatique (ETag, clés `pm_pageVersion_ludo-aventura`)
- ✅ Zoom tactile et loupe iOS désactivés, page figée
- ⚠️ Écart assumé : la zone de contenu défile (en interne, sans rebond,
  `overscroll-behavior: contain`) — un site marchand a trop de texte pour
  tenir sur un écran ; la page elle-même ne bouge jamais
- ⚠️ Écart assumé : style flat design clair (papier / bleu / orange) au
  lieu de l'oscilloscope — public 5-15 ans et parents, site commercial
- ❌ Pas de service worker / hors ligne ni de PWA installable
- ❌ Pas de version anglaise
