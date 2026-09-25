# Extrapolation

Un explorateur interactif de méthodes d'extrapolation. Une série
temporelle synthétique (1826-2026) est générée avec une mécanique
cachée — tendance linéaire, exponentielle sans plafond, ou logistique
avec un plafond caché — et quatre méthodes de prédiction peuvent être
comparées sur les 100 années suivantes :

- **Sécante** : droite passant par deux points seulement.
- **Régression linéaire** : ajustement aux moindres carrés sur toute
  la période choisie.
- **Pondérée** : comme la régression linéaire, mais les points récents
  pèsent plus que les anciens (demi-vie réglable).
- **Logistique** : ajustement à une courbe en S avec un plafond
  supposé (multiple réglable de l'amplitude observée).

Un bouton « Révéler la mécanique » affiche la vraie courbe génératrice
(prolongée jusqu'en 2126) et son nom, pour comparer chaque méthode à la
réalité qu'elle essaie de deviner.

**Dessiner ma courbe** : au lieu d'une série aléatoire, on peut
dessiner soi-même les données (1826-2026). La courbe passe par des
points que l'on glisse au doigt ; toucher une zone vide ajoute un point.
Les points sont reliés par une interpolation cubique monotone
(Fritsch–Carlson), avec un curseur de bruit optionnel. Les quatre
méthodes et le tableau d'écart moyen se recalculent en direct sur la
courbe dessinée. Chaque méthode a un petit ⓘ explicatif.

Français / anglais, état sauvegardé en local (`extrapolation_state`),
mise à jour automatique (script inline dans `index.html`), installable
(`public/manifest.webmanifest`). Backlog : `../backlog.md`.

**https://pierremillon.github.io/pierremillon/extrapolation/**

## Stack

React, graphique en SVG fait main (tactile), build Vite. Vit comme sous-dossier du portfolio
(`pierremillon/pierremillon`), qui déploie tout le dépôt tel quel sans
étape de build — donc pas de build automatique en CI pour ce projet
précis. Après une modification, il faut reconstruire à la main et
recopier le résultat :

```sh
npm install
npm run build
rm -rf ../assets
cp -r dist/* ../
```

(depuis ce dossier `source/`, en supposant qu'il est bien placé dans
`extrapolation/source/` du portfolio — `dist/` copié un niveau
au-dessus écrase `index.html` et `assets/` à côté de `source/`.)

## Développement local

```sh
npm install
npm run dev
```
