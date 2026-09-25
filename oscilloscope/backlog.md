# Backlog — Oscilloscope (page de test)

Page de référence pour l'apparence « oscilloscope réaliste » que les jeux
pourront reprendre. Pas un jeu : pas d'échec, pas de session. Seule la
partie technique de la charte s'applique.

## Fait

- [x] Faisceau dont la luminosité dépend de sa vitesse (sommets brillants,
  fronts du carré presque invisibles)
- [x] Rémanence du phosphore, halo, cœur presque blanc, bruit du faisceau
- [x] Graticule 10 × 8 gravé devant l'écran, verre bombé, lunette
- [x] 4 signaux (sinus, carré, Lissajous, rosace), 4 réglages sauvegardés
- [x] FR / EN, historique, mise à jour automatique

- [x] v2 : trois styles — Vectoriel (Vectrex/Asteroids, police tracée),
  Terminal (texte phosphore, balayage, scintillement), Musique (cube dessiné
  par le son en X-Y, audible)

## À faire

- [ ] P1 — Choisir le style retenu pour les jeux (retour de Pierre)

- [ ] P2 — Extraire le rendu en petit module réutilisable par les jeux
- [ ] P3 — Couleurs de phosphore alternatives (P7 bleu/jaune, P4 blanc)

## Conformité à la charte (../REGLES-JEUX.md)

Conforme : un seul fichier HTML, hors ligne, sauvegarde locale namespacée,
FR/EN, zoom tactile désactivé, `prefers-reduced-motion` (figures figées).

Écarts : pas installable en PWA ; pas encore dans le menu du portfolio
(page de test).
