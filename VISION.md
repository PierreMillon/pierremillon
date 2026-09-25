# Vision — Pas à Pas & Bulles Sonores

Synthèse de ce qui a été dit en conversation, pour ne rien perdre au fil
des messages. Document partagé aux deux projets — chaque backlog garde ses
tâches concrètes, celui-ci garde l'esprit d'ensemble.

## Le problème de départ

À l'écrit, on saute des étapes — c'est là que naissent les erreurs
d'inattention (inverser une fraction, oublier de distribuer un signe).
Ce qu'on appelle des étourderies est souvent une **pratique magique** :
un geste devenu automatique dont on a perdu la justification. Le but des
deux projets est de rendre visible, lentement, ce qui se passe entre
chaque ligne — puis, une fois compris, de permettre d'aller vite en
connaissance de cause.

## Deux modalités, un même geste

- **Pas à Pas** = *voir*. Une transformation s'anime, étape par étape,
  sans rien sauter. La ligne du haut montre la formule « écrite
  normalement » (avec sa phrase magique, non rigoureuse mais vraie comme
  résultat) ; la ligne du bas ne triche jamais.
- **Bulles Sonores** = *faire*. Les mêmes transformations, mais
  manipulées au doigt. Exemple donné en conversation : deux bulles de
  signe opposé qu'on glisse l'une vers l'autre s'annulent et deviennent
  positives — le geste physique EST l'opération, pas une métaphore
  dessus.

Les deux vont converger : les termes d'une équation (Pas à Pas) devenant
des bulles déplaçables (Bulles Sonores) — glisser 3<i>x</i> au numérateur
sur 3<i>x</i> au dénominateur pour les faire fusionner et disparaître, par
exemple. Pas construit maintenant, mais c'est la direction.

## Le principe alchimique

Décomposer → repérer ce qui se simplifie → regrouper. Ce même geste en 3-4
étapes se retrouve partout : algèbre (Pas à Pas), calcul mental (16 + 27
décomposé en puissances de 10 et compléments à 5, méthode des carrés de
Singapour), factorisation (figures géométriques universelles, sans texte).
Peu de faits à retenir par cœur — presque tout devient manipulation.
Nom évoqué pour cet esprit, voire pour l'appli entière : **l'Alchimiste**.

## Le système de badges

Une transformation faite à la main (glisser, toucher, suivre chaque
étape) débloque un badge. Une fois le badge acquis, on peut faire
l'opération d'un coup — la vitesse vient après la compréhension, jamais
avant. Un exercice réussi à la main sur Bulles Sonores débloque le badge
correspondant.

Les badges font progresser à travers les ensembles de nombres, dans
l'ordre : **ℕ → ℤ → ℚ → ℝ → ℂ → quaternions → octonions** (au minimum).
Le premier maillon concret déjà identifié : « moins par moins = plus »
expliqué par une rotation à 180° sur l'axe des réels.

## Esthétique commune

Oscilloscope / vieux moniteur : fond noir, tracé vert phosphore, police
monospace — jamais d'ivoire ni de blanc, sur ces deux projets seulement
(le reste du portfolio garde son style éditorial). Fixé par défaut pour
tout nouveau jeu dans `REGLES-JEUX.md` et `CLAUDE.md`.

## Ce que ce n'est pas

Pas un cours théorique à lire. L'objectif exprimé : montrer ce qui se
passe « dans la tête » de quelqu'un de rapide en calcul — en animation
continue et fluide, au ralenti, pas en étapes qui s'enchaînent sèchement.
Pensé pour le téléphone en priorité.

## Portée volontairement limitée

Pas de moteur de calcul formel, pas de saisie libre d'une expression
quelconque — beaucoup trop complexe pour l'instant, et pas le but. Chaque
démo reste un **petit nombre d'exemples choisis à la main**, codés en dur,
qui marchent bien et démontrent proprement une notion précise. Peu
d'exemples, peu de code : c'est un choix, pas une limitation provisoire à
lever au plus vite.

## Portée actuelle vs. vision

Ce qui existe aujourd'hui (une démo −( … ) avec écran scindé, un
prototype de bulles tactiles sans but) n'est qu'un premier maillon.
Chaque backlog (`pas-a-pas/backlog.md`, `bulles-sonores/backlog.md`) liste
les tâches concrètes ; ce document sert à relire l'intention d'ensemble
avant de trancher une nouvelle fonctionnalité.

## Badges partagés

Chaque projet garde ses badges chez lui, mais les publie aussi dans le
`localStorage` du domaine sous une clé commune `pm_badges_<projet>`
(liste de noms séparés par des virgules), pour qu'un autre projet puisse
les lire et les afficher. Premier lien : le badge ✦ 10 de Pas à Pas
(`pasapas_badge_dix`, « faire 10 ») apparaît dans Soroban sur le niveau
« + avec 10 » — c'est le même geste, le complément à 10. Soroban publie
les siens sous `pm_badges_soroban`.
