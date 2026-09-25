# Règles — jeux mobiles

Charte commune à tous les jeux du catalogue perso. Un jeu ne doit pas
forcément tout cocher dès le prototype, mais toute décision qui s'en
écarte doit être un choix conscient, pas un oubli.

## Conception

- **Une seule mécanique** par jeu. Pas d'empilement de systèmes.
- **Design** : flat design, low poly, pixel art ou fil de fer — un style
  simple et assumé, pas de réalisme.
- **Esthétique par défaut : oscilloscope / vieux moniteur.** Fond noir (ou
  quasi noir), tracé fin en vert phosphore (une seule couleur dominante,
  pas de dégradé), lignes vectorielles plutôt que des formes pleines —
  l'esprit des tout premiers écrans à tube, construits sur un
  oscilloscope. C'est le style des derniers jeux faits par Pierre ; à
  utiliser par défaut pour un nouveau jeu, sauf raison contraire (un autre
  style listé ci-dessus reste possible si le jeu s'y prête mieux). Pensé
  pour rester lisible avec tout profil de handicap visuel : le fort
  contraste noir/vert porte l'information, jamais une teinte seule.
- **Lore** sur fond d'humour et de culture absurde.
- **Accessibilité de la difficulté** : un enfant de 3 ans doit pouvoir
  jouer et s'amuser dès la première minute ; terminer le jeu à 100%
  demande une maîtrise de niveau expert.
- **Affiner en retirant**, jamais en empilant : quand un jeu a trop de
  mécaniques, on en supprime plutôt que d'en ajouter une de plus.
- **Gérer la difficulté en retirant des mécaniques**, pas en ajoutant des
  systèmes de compensation.
- **Tuto par la pratique** : une mécanique s'apprend en la faisant, sans
  texte explicatif long. Un geste, un retour clair, on comprend.
- **Effets sonores et visuels "juicy"** : chaque action a un retour
  sensoriel satisfaisant (particules, léger squash, son court).
- **Musique hypnotique**, pas envahissante.

## Plateforme et technique

- **Smartphone uniquement** pour l'instant. Portage vers d'autres formats
  plus tard, si budget. Sur les autres formats (tablette, ordinateur), le
  jeu reste affiché tel que sur smartphone (letterbox), pas de mise en
  page repensée.
- **Adaptatif aux téléphones pliants** au format plutôt carré — pas
  seulement un ratio 9:16 classique.
- **Un seul fichier HTML**, aussi léger que possible, sans build si
  possible.
- **Mode hors ligne complet** : aucun appel serveur nécessaire pour jouer.
- **Sauvegarde locale uniquement** (`localStorage` ou équivalent, toujours
  dans un try/catch), jamais de compte ni de serveur.
- **Sauvegarde conservée à travers les mises à jour automatiques** à
  distance — une mise à jour ne doit jamais effacer une partie.
- **Mise à jour automatique**, avec un bouton de confirmation affiché dès
  le début si la mise à jour change quelque chose d'important (pas
  silencieuse par défaut si ça change les règles du jeu).
- **Multijoueur sans serveur** (pair à pair local — même écran, Bluetooth
  ou WebRTC direct — à trancher par jeu).
- **Installable en PWA** depuis le navigateur, expliqué en intro (« ajoute
  à ton écran d'accueil »).
- **Optimisation batterie** : éviter les boucles de rendu inutiles, réduire
  le taux de rafraîchissement quand rien ne bouge.

## Sécurité

- **Vérifier les injections** dans tout ce qui touche à la sauvegarde de
  partie (import/export d'un code de save, presse-papier) — ne jamais
  interpréter une chaîne collée comme du code ou une macro.

## Langues

- **Français et anglais**, dès le premier jet si possible.

## Monétisation

- **Fausse pub** pour débloquer une difficulté supplémentaire, toutes les
  24h ou toutes les semaines — un habillage, pas un vrai appel publicitaire
  au départ.
- **Vraies pubs** en option plus tard, avec un achat unique pour les
  retirer.

## Process de conception

- **Retours de non-joueurs et tests A/B** proposés en option dans le menu,
  avant de trancher une direction.
- **Tester avec une communauté intéressée**, pas seulement en solo.

## Support et évolution

- **Assistance joueurs limitée aux bugs** du jeu tel qu'il est. Une
  demande de changement trop éloignée du jeu de base devient un nouveau
  jeu, pas une modification du premier.

## Distribution

- **Catalogue personnel** de tous les jeux sur une page dédiée.
- **RGPD** : conformité affichée depuis la page principale du catalogue de
  jeux, pas à redire dans chaque jeu.
- Passer par une plateforme tierce pour la visibilité d'abord, les stores
  ensuite.
