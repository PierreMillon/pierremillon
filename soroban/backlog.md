# Backlog — Soroban

Un boulier japonais au doigt : une perle du haut vaut 5, quatre du bas
valent 1. Pensé d'abord pour Pierre, pour retravailler ses bases de
calcul. C'est le support naturel des compléments à 5 et à 10 de
../VISION.md (« 16 + 27 » décomposé par rapport à 5).

Intention (réponses de Pierre) : tout à terme, mais **manipuler en
priorité**, puis **résoudre des opérations**. Gestes : toucher **et**
glisser. Toucher : organique, souple, avec de la résistance.

Tri : priorité décroissante.

## Fait

- [x] v1 — 5 tiges (0 à 99 999), perles en fil de fer vert phosphore
- [x] v1 — Toucher une perle la bascule ; la glisser la pousse dans le sens du doigt
- [x] v1 — Nombre affiché + décomposition du dernier chiffre touché (7 = 5 + 2)
- [x] v1 — Son de perle, état sauvegardé, remise à zéro
- [x] v2 — Perles en ressorts : résistance au départ, cran qui fait basculer,
  retour élastique si on lâche trop tôt, léger écrasement à l'arrivée
- [x] v2 — Son de bois plus doux, petite vibration (Android seulement)
- [x] v2 — Zoom vraiment bloqué sur iOS (pincement, double-tap, glissement de page)
- [x] v2 — Résoudre une opération : poser A, puis ajouter / retirer B, la page valide
- [x] v2 — « Voir au ralenti » : le boulier fait l'opération geste par geste
  (direct, complément à 5, complément à 10, retenue, emprunt), puis rend la
  main pour la refaire
- [x] v2 — Soustraction, et multiplication d'un nombre à 2 chiffres par un
  chiffre (produits partiels ajoutés au bon rang)
- [x] v2 — Badges : 7 niveaux (+ direct, + avec 5, + avec 10, − direct,
  − avec 5, − avec 10, ×). Un exercice réussi à la main sans avoir regardé
  la démo gagne le badge, qui débloque « D'un coup »
- [x] v2 — Ajouté au menu du portfolio (groupe maths)
- [x] v2 — Méthode vérifiée par un test exhaustif (toutes les additions et
  soustractions jusqu'à 999, toutes les multiplications du mode ×)

- [x] v3 — Son réparé sur iPhone (déblocage en fin de toucher, mode
  silencieux contourné via `navigator.audioSession`, fréquences audibles
  sur un haut-parleur de téléphone), et plus doux
- [x] v3 — Guidage : perles à bouger en surbrillance, étape du calcul en
  haut, technique en bas, erreur signalée gentiment
- [x] v3 — Réussite : pause d'une seconde, puis félicitations qui restent
  jusqu'à « Suivant », avec les techniques utilisées
- [x] v3 — Division (on retire le diviseur par paquets), puissances
  (multiplier = ajouter plusieurs fois), racines carrées (on retire (10t)²
  puis (20t + u) × u) — plans vérifiés exhaustivement

- [x] v4 — Division avec reste, racine approchée à un chiffre après la
  virgule (on pose N × 100, on calcule la racine entière, on divise par 10)
- [x] v4 — Lien avec Pas à Pas : le badge ✦ 10 (« faire 10 ») s'affiche sur
  le niveau « + avec 10 » ; Soroban publie ses badges sous
  `pm_badges_soroban` (convention décrite dans ../VISION.md)
- [x] v4 — Service worker « réseau d'abord » (comme Pas à Pas) : hors ligne
  une fois ouvert, police comprise

- [x] v5 — Boulier de taille fixe (plus de zoom / dézoom tout seul pendant
  une opération : textes, niveaux et boutons ont une place réservée)
- [x] v5 — Sons beaucoup plus graves ; perle qui glisse toujours de façon
  continue (même avec « Réduire les animations ») ; légende « chiffre par
  chiffre » retirée ; français par défaut

- [x] v6 — Badges-outils (règles fixées avec Pierre) : chaque badge gagné
  devient un bouton en bas ; appuyé, il fait en accéléré animé les gestes
  qu'il connaît et s'arrête au premier geste inconnu. Chaque badge inclut
  ceux d'avant. Tous les badges gagnés sont affichés. Une réussite suffit
  pour gagner un badge, même après le ralenti. Remplace « D'un coup »
- [x] v6 — Réussite en bandeau en haut : le boulier reste visible

- [x] v7 — Réponses de Pierre (2e série de questions) : menu ☰ (bac à
  sable, langue, historique, effacer les badges en deux appuis, compteur
  de perles déplacées depuis toujours — tous les gestes, badges et ralenti
  compris) ; petits nombres d'abord (3 réussites → 2 chiffres, 6 → 3) ;
  son encore plus grave ; paysage en deux colonnes avec autant de tiges
  que possible (tige ≥ 56 px), 5 en portrait. Gardés tels quels, à sa
  demande : vitesse du ralenti (0,85 s) et des badges (0,26 s), passage au
  niveau suivant après un badge, erreur = message + surbrillance, cran

- [x] v8 — Perle tenue qui suit le doigt dans les deux sens, pousse ses
  voisines, qui reviennent avec elle pendant le même geste ; chiffre mis à
  jour en direct. Son recréé après un retour sur la page (iOS le laissait
  « interrompu »). « Réinitialiser la progression » : badges, paliers et
  compteur. Perles à bouger qui clignotent vraiment (minuteur JS, pas une
  animation CSS coupée par « Réduire les animations »)

- [x] v9 — Entraînement libre (∞) : questions sans fin tirées parmi les
  niveaux dont on a le badge ; on appuie sur les badges, et on fait à la
  main ce qu'aucun badge ne couvre. Choix confirmé : tirer la perle du bas
  d'un groupe ne fait descendre qu'elle (comme un vrai soroban)

- [x] v10 — Un seul chemin (choix de Pierre) : niveaux débloqués dans
  l'ordre, seuls les niveaux gagnés et le prochain sont visibles (les
  suivants gardent leur place, invisibles : taille du boulier constante).
  Un badge ne fait que des techniques déjà gagnées. Entraînement libre en
  tête des niveaux

## À faire

- [ ] P1 — Retour de Pierre sur téléphone : le son s'entend-il sur iPhone ?
  force du cran, rebond, clarté du guidage (seul Pierre peut le faire)

## Écarté

- Méthode japonaise traditionnelle de la division (quotient posé à gauche
  du dividende) : demanderait 7 à 9 tiges, donc des perles trop petites
  pour le doigt sur un téléphone, pour une idée déjà montrée par la
  division « par paquets ». Même esprit que ../VISION.md, « portée
  volontairement limitée ».

## Conformité à la charte (../REGLES-JEUX.md)

Ce n'est pas vraiment un jeu : pas d'échec possible, pas de session
rejouable au sens de la charte, les badges servent de progression. C'est
un outil de manipulation. Seule la partie technique de la charte
s'applique.

Déjà conforme : un seul fichier HTML sans build, esthétique oscilloscope,
français et anglais, sauvegarde locale en try/catch avec validation stricte
(état = 5 chiffres, badges = noms de niveaux connus, rien d'autre
accepté), zoom tactile et loupe iOS désactivés, mise à jour automatique,
bouton Historique, `prefers-reduced-motion` respecté, perles utilisables
au clavier (Tab, Entrée, flèches), affichage testé en format carré
(700 × 720), boucle d'animation arrêtée dès que rien ne bouge.

Écarts restants :

- [x] Hors ligne solide : la page d'accueil du portfolio ne désinscrit plus
  que ses propres service workers (portée racine) et ne vide plus les
  caches des projets ; le service worker du Soroban nettoie lui-même ses
  anciennes versions
- [ ] Installation (PWA) à vérifier sur téléphone
