# Jeu médiéval à vie autonome — notes de conception

Journal des décisions et des idées, dans l'ordre où elles arrivent.
**Règle : on met à jour, on ne supprime jamais.** Une idée faite reste
tracée (marquée faite) ; une idée mise de côté reste tracée (marquée
« plus tard ») ; rien ne doit se perdre au fil de la discussion.

Même convention que `NOTES.md` de Forge Line et `BACKLOG.md` de Bastion
Orbit. Ce fichier est la mémoire du projet entre deux conversations —
il n'y a pas de mémoire automatique d'une session à l'autre.

**Statut au 2026-09-09 : rien de codé.** Conception seulement.

---

## Le concept

Un univers médiéval en **vie autonome**. On donne des règles à chaque
personnage et on regarde ce qui se passe. Jeu **contemplatif** : le
joueur observe plus qu'il n'agit.

Rendu voulu : **esprit terminal**, fond noir, tout dessiné en vert.

Bastion Orbit a déjà exactement ce style, disponible en jeu et activé
par défaut depuis sa v0.60 : style « Filaire pur (vert) », teinte de
trait `#46ffa0`, texte `#8ffcc4`, fond des panneaux `#071812`, traits
atténués `rgba(70,255,160,0.4)`. À reprendre tel quel plutôt que le
réinventer.

---

## Le nom — pas encore tranché

### L'anecdote de départ

Point de départ donné par Pierre : le créateur de Dragon Quest aurait dit
qu'un bon nom de jeu, c'est deux mots — le premier commençant par un D,
le deuxième un peu mystérieux.

**Vérification faite (recherche web, 2026-09-09) : cette règle n'a pas
été retrouvée.** Les interviews accessibles de Yuji Horii parlent de la
création de Dragon Quest, de sa philosophie, des remakes — jamais de
cette règle de nommage. Sources consultées :
[Game Developer — 25 Years of Dragon Quest](https://www.gamedeveloper.com/business/25-years-of-i-dragon-quest-i-an-interview-with-yuji-horii),
[Game Informer — Yuji Horii's Journey](https://gameinformer.com/exclusive-interview/2025/11/19/yuji-horiis-journey-to-making-dragon-quest-as-told-by-the-man).

Traitée comme une bonne intuition, pas comme un fait établi. Elle colle
de toute façon aux trois derniers titres du portfolio : un mot concret
suivi d'un mot abstrait (Knight Wars, Bastion Orbit, Forge Line).

### Candidats et classement

Classement établi le 2026-09-09, après les propositions de Pierre :

1. **Dwelve Hollow** — proposé par Pierre, recommandé.
   `Dwelve` n'existe pas en anglais standard : c'est un mot-valise entre
   **dwell** (habiter, demeurer) et **delve** (fouiller, creuser) — soit
   littéralement le jeu (des gens qui habitent, un joueur qui fouille ce
   qu'ils font). Le mot inventé est un atout, pas un défaut : c'est le
   « mot mystérieux » de la règle, il ne renvoie à rien d'existant, et le
   dépôt serait le seul résultat de recherche. `Hollow` (le creux, le
   vallon) porte une inquiétude discrète sans forcer.
   Seul risque : être lu comme une faute de frappe de `Delve`.
2. **Dun Whisper** — la proposition « Dune Whisper » de Pierre, corrigée.
   Un *dun* est un fort de terre celtique, une enceinte sur une butte :
   même sonorité que *Dune*, sens exactement médiéval, et surtout plus de
   collision avec Frank Herbert (problème réel sur un dépôt public :
   *Dune* est illisible sans faire penser à autre chose).
3. **Dusk Willow** — le saule au crépuscule. Le plus joli, le moins
   spécifique.

### Écartés

- **District Mellow** (proposé par Pierre) — `District` est administratif
  et moderne, un mot de cadastre et pas de royaume ; `Mellow` appartient
  au vocabulaire des années 70. Ensemble : nom de playlist lo-fi.
- **Dolmen Vigil**, **Dun Vesper**, **Delve Hollow**, **Dusk Vellum**,
  **Drift Marrow** — mes propositions du premier tour. Toutes tiraient
  vers le grave et le solennel. Écartées pour la raison ci-dessous.

### L'observation qui a fait basculer le choix

Les trois deuxièmes mots proposés par Pierre sont *whisper*, *hollow*,
*mellow*. **Aucun n'est menaçant.** Il ne cherche pas un mot sombre, il
cherche un mot doux et bas — cohérent avec un jeu contemplatif où l'on
regarde sans agir. Ses propositions sont plus justes que les miennes sur
ce point ; toute nouvelle proposition doit suivre cette oreille-là (et
apparemment aussi le son -ow, présent dans les trois).

---

## Ce qui existe déjà dans les trois derniers jeux

Analyse du code, pas de la mémoire — lue dans les dépôts
`PierreMillon/knight-wars`, `PierreMillon/Forge-Line`,
`PierreMillon/Bastion-Orbit` le 2026-09-09.

### Knight Wars — IA de décision, au tour par tour

Dans `runAI()`. Chaque royaume évalue tous ses coups possibles et garde
le meilleur score :

- avantage brut = force de l'attaquant − force du défenseur ;
- bonus s'il achève un royaume déjà à terre (≤ 2 territoires) ;
- malus d'exposition : attaquer vide toujours le territoire de départ
  (force ramenée à 1, victoire ou défaite), donc on pénalise le fait de
  laisser un flanc nu face à un voisin fort.

Par-dessus, **quatre personnalités** qui ne changent que quatre nombres
(`aggressionDelta`, `mistakeDelta`, `exposureWeight`, `finishOffBonus`) :
les Prudents, les Enragés, les Marchands, les Stratèges. Même moteur,
comportements pourtant lisibles à l'œil en jouant.

Trois détails qui font la différence :

- **taux d'erreur volontaire** (`mistakeRate`) — l'IA renonce parfois au
  bon coup, sinon elle est inhumaine ;
- **plancher de viabilité** (`MIN_VIABLE_ADV = -1`) — jamais d'attaque
  mathématiquement perdue d'avance, un garde-fou sous le réglage
  d'agressivité, ajouté après un retour en jeu (« l'ennemi fait des
  attaques sûres de perdre, c'est absurde ») ;
- **attaques chaînées** — après une conquête, l'IA repart de ce
  territoire-là, comme le ferait un joueur.

Deux mécanismes de difficulté à retenir :

- un **cliquet d'escalade** (`escalated()`) sur les longues parties, dont
  la force est dosée par la difficulté — sinon tous les paliers
  convergeaient vers la même IA redoutable au bout de ~80 tours ;
- au palier le plus facile (« Gueux »), les IA ne peuvent
  **structurellement jamais** attaquer l'humain, mais continuent de se
  battre entre elles : illusion de guerre entière plutôt que des IA
  visiblement gelées.

Le tout calibré par simulation de masse, pas à l'intuition.

### Forge Line — IA d'essaim, temps réel

**Le plus proche de ce qu'on veut faire.** Le principe est écrit noir sur
blanc dans son `NOTES.md` : *éviter la froideur mécanique* — pas une
grosse IA d'un coup, mais plein de petites règles locales par ennemi qui
interagissent entre elles et font émerger des comportements de groupe non
programmés explicitement.

Ce qui tourne réellement (`spawnEnemy()`, `driftTowardPreferred()`,
`pickTargetTower()`, `pickSoldierBehavior()`, `updateSoldiers()`) :

- **mémoire collective statistique** — la carte découpée en 8 colonnes,
  chaque mort et chaque percée comptée ; les nouveaux ennemis tirent leur
  colonne préférée pondérée par ce qui a déjà réussi. Ce n'est pas un
  plan concerté, mais ça se lit comme une stratégie ;
- **imitation** — 30 % copient directement le dernier qui a atteint le
  château rapidement ;
- **engagement individuel** (`commitment`, entre 0 et 1) — les peu engagés
  retirent une nouvelle colonne préférée toutes les quelques secondes :
  l'illusion que certains changent d'avis en cours de route ;
- **oscillation de vitesse propre à chacun** (`pacePhase` / `paceRate`),
  désynchronisée — personne n'avance au même rythme, pas de tapis roulant ;
- **hésitation** au débarquement, et **attente en groupe** (`groupWait`)
  libérée d'un coup dès qu'assez de monde s'est rassemblé ;
- **siège abandonné** au bout d'un certain temps (`SIEGE_GIVEUP_MS`) pour
  ne pas camper indéfiniment sur une tour trop renforcée ;
- **fuite pour se soigner**, une seule fois dans la vie du personnage ;
- **rôles tirés à la naissance** : attaquant, harceleur, rusher — la part
  de harceleurs dépend du `playerAggroScore`, un score qui monte à chaque
  coup porté par le joueur et redescend doucement (le joueur agressif
  attire les emmerdeurs) ;
- **ciblage par faiblesse** — `pickTargetTower()` vise la tour la plus près
  de tomber à portée (`weakness*2 - d/range`), pas la plus proche.

Et des **soldats alliés autonomes** : à intervalles réguliers, chacun
retire son comportement au sort — se battre, garder le joueur, se
planquer, se soigner, réparer — pondéré par son grade (les gradés sont
plus prudents) et ses points de vie.

### Bastion Orbit — la vie autonome

Le plus proche du projet côté **vie de village**.

Les villageois ont six modes (`peaceful`, `sheltering`, `sallying`,
`fighting`, `fleeing_church`, `fleeing_castle`). En temps de paix, trois
sous-états tirés au sort : ~10 % errent près de chez eux, ~10 %
**déménagent** dans une autre maison, le reste va **danser sur la place**.

À la première attaque : panique générale, tout le monde à l'abri, puis
mobilisation par lots de trois, **triés par distance à l'ennemi** — un
tiers partent se battre, les autres fuient vers l'église ou le château.

La princesse erre, se rapproche du seigneur dès cinq ennemis proches,
répare deux fois plus vite à deux, et sert d'appât prioritaire.

Le plus intéressant : les **engins de siège émergents**. Deux ennemis qui
stagnent au même endroit forment une tortue, trois une arbalète, quatre
un trébuchet, cinq une tour de siège. Personne ne l'a scripté — c'est le
regroupement qui le déclenche. L'équipage reste vivant et régénère la
machine, donc le tir à distance ne suffit jamais : il faut sortir du
château.

Autre émergence non scriptée : ~40 % des ennemis prennent les routes
(plus rapides), les autres restent en tout-terrain. Résultat visible à
l'écran : de l'encerclement, sans une ligne de code d'encerclement.

Enfin, un **simulateur headless** (`sim/balance-sim.js`) avec trois
politiques de joueur (naïf, correct, bon), utilisé comme test de
régression (`--check`). Calé sur deux modèles publiés :

- le **canal de flow** (Csíkszentmihályi ; thèse *Flow in Games* de Jenova
  Chen) — le fun est l'équilibre entre défi et compétence ;
- la **difficulté en dents de scie**, reprise de l'AI Director de
  Left 4 Dead (Michael Booth, GDC 2009) — un pic ne se ressent comme un
  pic que s'il y a eu un vrai répit avant. Appliqué concrètement : une
  vague sur cinq a son effectif réduit de 30 %.

---

## Les principes retenus pour ce jeu

Décidés le 2026-09-09, tirés de l'analyse ci-dessus.

1. **Aucune IA centrale.** Des règles locales par personnage, et on
   regarde ce que ça donne. C'est déjà la doctrine écrite dans les
   carnets de Forge Line et de Bastion Orbit.
2. **Un état + une horloge de re-tirage.** Le motif commun aux soldats de
   Forge Line et aux villageois de Bastion Orbit : chaque personnage a un
   comportement courant et le retire au sort périodiquement, pondéré par
   sa situation.
3. **Des paramètres de personnalité, pas des branches de code.** Quatre ou
   cinq nombres par personnage, comme les quatre royaumes de Knight Wars.
4. **De la mémoire partagée.** Les colonnes de Forge Line montrent qu'un
   simple compteur suffit à faire croire à une stratégie de groupe.
5. **Des seuils de regroupement.** Le meilleur moment des trois jeux :
   deux paysans au même endroit deviennent autre chose. C'est là que naît
   ce qu'on n'a pas écrit.
6. **Un simulateur headless dès le début.** Dans un jeu contemplatif, on
   ne peut pas juger l'équilibre à l'œil — il faut pouvoir faire tourner
   mille années de village en trois secondes.

---

## À faire (pas encore commencé)

- Trancher le nom (voir classement ci-dessus).
- Créer le dépôt GitHub dédié — Pierre a annoncé vouloir le faire
  lui-même. Note : Bastion Orbit et Forge Line sont servis depuis des
  sous-dossiers de `pierremillon.github.io/pierremillon/`, donc un
  sous-dossier de ce dépôt reste une option cohérente avec l'existant.
- Reprendre la palette filaire verte de Bastion Orbit (valeurs plus haut).
- Ajouter l'entrée au menu du site perso (`index.html` à la racine).
