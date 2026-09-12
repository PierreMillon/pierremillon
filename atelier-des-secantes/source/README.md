# L'atelier des sécantes

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
et son nom, pour comparer chaque méthode à la réalité qu'elle essaie de
deviner.

**https://pierremillon.github.io/pierremillon/atelier-des-secantes/**

## Stack

React + Recharts, build Vite. Vit comme sous-dossier du portfolio
(`pierremillon/pierremillon`), qui déploie tout le dépôt tel quel sans
étape de build — donc pas de build automatique en CI pour ce projet
précis. Après une modification, il faut reconstruire à la main et
recopier le résultat :

```sh
npm install
npm run build
cp -r dist/* ../
```

(depuis ce dossier `source/`, en supposant qu'il est bien placé dans
`atelier-des-secantes/source/` du portfolio — `dist/` copié un niveau
au-dessus écrase `index.html` et `assets/` à côté de `source/`.)

## Développement local

```sh
npm install
npm run dev
```
