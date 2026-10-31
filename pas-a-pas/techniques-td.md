# Techniques des TD — feuille de route de Pas à Pas

Relevé des techniques de calcul des TD de L1 de Pierre (Google Drive,
lus le 31/10/2026). Chaque ligne = un futur chapitre à étapes (ou une
étape d'un chapitre), avec l'exemple tiré du TD et l'ensemble minimal.
À relire quand de nouveaux TD arrivent sur le Drive.

## Réflexes (transversaux, à faire en premier)

- **Comparer A et B : étudier B − A** — A ≤ B ⇔ B − A ≥ 0, puis signe
- **Comparer deux positifs par leurs carrés** — √3 + √5 ? √2 + √6
- **Tout d'un côté, même dénominateur, tableau de signes** — 2/(x²−4x+3) − 1 > 0
- **Faire apparaître un carré (≥ 0)** — x/y + y/x − 2 = (x−y)²/(xy)
- **Domaine d'abord** (ln, racine, dénominateur), puis calcul
- **Simplifier avant de calculer / dériver** — √(x√(x√x)) = x^{7/8}
- **Factoriser par la plus petite puissance / le terme dominant** — (2¹⁰⁰−2⁹⁹)/(2¹⁰¹+2⁹⁹) = 1/5
- **Ajouter et retrancher (+c − c) / multiplier par c/c** — forme canonique, conjuguée
- **Changement de variable** — X = eˣ, x², |x|, x + 1/x
- **Coefficient sans tout développer** — terme en x⁹ de (2x−5)¹²
- **Somme et produit des racines** — x² − Sx + P

## TD 01 — Fractions, binomiaux, puissances, radicaux (corrigé + énoncé)
- **Décomposer en facteurs premiers pour trouver le PPCM** — 90=2·3²·5, 35=5·7, 126=2·3²·7 ⇒ dénominateur commun 630 — ℚ
- **Simplifier avant d'additionner** — 123/270 → 41/90 — ℚ
- **Quotient de fractions en une étape** (« extrêmes sur moyens ») — (a/b)/(c/d) = ad/(bc) — ℚ
- **Factoriser les dénominateurs littéraux** — x²+2xy = x(x+2y), x²−4y² = (x−2y)(x+2y) — ℝ
- **Dénominateur commun nommé D, puis factorisation par paquets** — a²x²−1−a²+x² = (a²+1)(x²−1) — ℝ
- **Simplifier n!/(p!(n−p)!) en écrivant la grande factorielle jusqu'à la petite** — 51!/(4!·47!) = 48·49·50·51/4! — ℕ
- **Factoriser une somme de factorielles** — 13!+12! = 12!(13+1) — ℕ
- **Multiplier par la plus grande factorielle pour chasser les dénominateurs** — 2/7!+6/8!+18/9! = n/7! ⇒ 144+54+18 = 72n — ℕ
- **Écrire (n−8)! = (n−9)!·(n−8)** — pour résoudre 4·C(n,8) = C(n,9) — ℕ
- **Formule de Pascal par mise au même dénominateur** — C(n,p)+C(n,p+1) = C(n+1,p+1) — ℕ
- **Séparer pairs et impairs dans un produit** — 1·3·…(2n−1) = (2n)!/(2ⁿn!) — ℕ
- **Factoriser par la plus petite puissance** — (2¹⁰⁰−2⁹⁹)/(2¹⁰¹+2⁹⁹) = 1/5 — ℚ
- **Règles des puissances (d'une puissance, d'un produit)** — 6¹²/12⁶ = 6⁶/2⁶ = 3⁶ — ℚ
- **Quantité conjuguée** — 1/(3+√5) = (3−√5)/4 — ℝ
- **Conjuguée en deux temps** — 1/(√5−√3+√2) : on multiplie par (√5−√3)−√2, puis par 6+2√15 — ℝ
- **Passer au carré pour simplifier une différence de racines (en surveillant le signe)** — A² = 6−2√(9−5) = 2, et A<0 donc A = −√2 — ℝ
- **Puissances fractionnaires et racines cubiques via les facteurs premiers** — ∛(14·36·49·81) = 2·3²·7 = 126 — ℝ

## TD 02 — Trinôme
- **Factoriser par x ou par une constante avant de résoudre** — 15(x²−3x+2) : racines évidentes 1 et 2 — ℝ
- **Forme canonique** — 2x²−12x+25 = 2(x−3)²+7 — ℝ
- **Discriminant et racines** — Δ = 361 = 19² — ℝ
- **Factoriser avec les racines** — 6x²−x−5 = (x−1)(6x+5) — ℝ
- **Identités remarquables à l'envers** — 9x²−6x+1 = (3x−1)² ; 9x²−1 = (3x−1)(3x+1) — ℝ
- **Somme et produit des racines** — x²−Sx+P avec S = 13, P = 42 → 6 et 7 — ℝ
- **Fonction symétrique des racines** — 1/α²+1/β² = (S²−2P)/P² — ℝ
- **A² = B² ⇔ A = ±B** — (x−1)⁴ = (x²−4x+1)² — ℝ
- **Changement de variable X = x², x³, √x ou (x−a)** — x⁶−25x³+24 → X²−25X+24 — ℝ
- **Équation réciproque : poser X = x+1/x** — x²+1/x² = X²−2 — ℝ
- **Trinôme en x avec paramètre y** — −3x²−5xy+12y² : Δ = (13y)² — ℝ
- **Δ factorisé comme différence de carrés** — Δ = [2(3m+1)−2(m+3)][2(3m+1)+2(m+3)] — ℝ
- **Réduire les puissances avec la relation de la racine** — α² = α+3 ⇒ α⁴ = 7α+12 — ℝ
- **Montrer qu'un nombre est racine en développant** — x = √3+√2 : x⁴−10x²+1 = 0 — ℝ
- **Système somme/produit** — x+y = 3, xy = −4 → X²−3X−4 = 0 — ℝ

## TD 03 — exp, ln
- **Décomposer dans la base des ln de nombres premiers** — ln(72) = 3ln2+2ln3 — ℝ
- **e^{a ln b} = bᵃ** — e^{−2ln3} = 1/9 — ℝ
- **Somme de ln qui télescope** — ln(2/1)+ln(3/2)+…+ln(100/99) = ln 100 — ℝ
- **Règles de calcul des exponentielles** — eˣ·e^{−2x} = e^{−x} — ℝ
- **Domaine d'abord, puis réunir les ln** — ln x + ln(x+8) = ln 9 ⇔ x(x+8) = 9 — ℝ
- **Poser X = eˣ et multiplier par e^{2x}** — e^{2x}+6e^{−2x} = 7 → X²−7X+6 = 0 — ℝ
- **Multiplier haut et bas par e^{−x}** — eˣ/(eˣ+1) = 1/(1+e^{−x}) — ℝ
- **Écrire a^b = e^{b ln a}** — √2^{√32} = e^{√32·ln√2} — ℝ
- **Parité par la conjuguée sous le ln** — ln(−x+√(x²+1)) = −ln(x+√(x²+1)) — ℝ
- **Simplifier sous le ln** — ln((x²−1)/(x−1)²) = ln((x+1)/(x−1)) — ℝ

## TD 04 — Dérivation
- **Dérivée d'un produit / de trois facteurs** — (fgh)' = f'gh+fg'h+fgh' — ℝ
- **Formule de Leibniz d'ordre 2** — (fg)'' = f''g+2f'g'+fg'' — ℝ
- **Dérivée d'un quotient puis multiplication par 2√x en haut et en bas** — ((3x+2)/√x)' = (3x−2)/(2x√x) — ℝ
- **Dérivée d'une composée** — (√u)' = u'/(2√u), (eᵘ)' = u'eᵘ, (ln u)' = u'/u — ℝ
- **Simplifier avant de dériver** — √(x√(x√x)) = x^{7/8} — ℝ
- **Dériver xˣ en passant par l'exponentielle** — xˣ = e^{x ln x} ⇒ (ln x+1)xˣ — ℝ
- **Dérivée de la réciproque** — (arctan)' = 1/(1+tan²(arctan x)) = 1/(1+x²) — ℝ
- **Dérivée logarithmique** — L(fg) = L(f)+L(g), L(f^α) = αL(f) — ℝ
- **Remplacer 1/cos² par 1+tan²** — sin x(1+1/cos²x) = sin x(2+tan²x) — ℝ

## TD5 — Développements, sommes
- **Développer en regroupant par monômes** — somme de 4 carrés = 16x²+36y²+4z² — ℝ
- **Factoriser un coefficient avant le cube** — (x√2−3√8)³ = (√2(x−6))³ — ℝ
- **Somme de deux cubes** — a³+b³ = (a+b)(a²−ab+b²) — ℝ
- **Factorisation par groupement** — 1−x−y+xy = (1−x)(1−y) — ℝ
- **Binôme de Newton : coefficient d'un terme** — terme en x⁹ de (2x−5)¹² : C(12,9)·2⁹·(−5)³ — ℝ
- **Newton à l'envers** — Σ C(n,k)(−x)ᵏ(1+x)ⁿ⁻ᵏ = 1 — ℝ
- **aⁿ+bⁿ en fonction de S et P** — a³+b³ = S³−3PS — ℝ
- **Somme géométrique** — Σ_{k=0}^{n−1} 2ᵏ = 2ⁿ−1 — ℝ
- **Poser X = x⁵, puis raison −X, avec le cas X = −1 à part** — x⁵−x¹⁰+… — ℝ
- **Sortir un facteur de la somme** — Σ 2ᵏ5^{10−k} = 5¹⁰ Σ (2/5)ᵏ — ℝ
- **Linéarité, puis Σk et Σk²** — Σ(3k+1)² = 9Σk²+6Σk+Σ1 — ℝ
- **Réduire avec une relation polynomiale** — a³ = a²−1 ⇒ (a+2)³ = 7a²+12a+7 — ℝ
- **Élever au cube une différence de racines cubiques** — A³ = 4−3A ⇒ A = 1 — ℝ

## TD 06 — Intégration
- **Reconnaître u'uⁿ, u'/u, u'eᵘ** — 2x/(x²−4)³ → −1/(x²−4)² — ℝ
- **Faire apparaître le numérateur dans le dénominateur** — (−6x+1)/(2x+3) = −3+10/(2x+3) — ℝ
- **Intégration par parties** — ∫ln x = x ln x − x — ℝ
- **IPP deux fois (polynôme × trig / exp)** — ∫x² cos x = x² sin x + 2x cos x − 2 sin x — ℝ
- **Double IPP qui revient sur l'intégrale de départ** — ∫cos(2x)e^{5x} = (5cos 2x + 2 sin 2x)e^{5x}/29 — ℝ
- **Décomposition en éléments simples (identification ou « prendre x = 1 »)** — 1/(x(x+1)²) = 1/x − 1/(x+1) − 1/(x+1)² — ℝ
- **Linéariser cos²** — cos²x = (1+cos 2x)/2 — ℝ
- **Linéariser un produit par Euler** — sin 2x cos 3x = ½sin 5x − ½sin x — ℂ

## Analyse 1 TD1 — Inégalités
- **Signe d'un trinôme** — Δ < 0 : signe de a partout — ℝ
- **Se ramener à « … > 0 » et faire un tableau de signes** — 2/(x²−4x+3) − 1 = (−x²+4x−1)/(x²−4x+3) — ℝ
- **Une puissance impaire garde le signe** — (4−x)³ a le signe de 4−x — ℝ
- **Élever au carré deux membres positifs** — √(x²−1) < 2−x ⇒ x < 5/4 — ℝ
- **Écrire sin−cos sous forme d'un seul sinus** — sin x − cos x = √2 sin(x−π/4) — ℝ
- **Encadrer une somme ou un produit terme à terme** — −3y ∈ [−6, 15] — ℝ
- **Constante + reste entre 0 et 1** — (2x+3y)/(x+y) = 2 + y/(x+y) — ℝ
- **Fonction auxiliaire et étude de ses variations** — g(x) = x − sin x, g' = 1 − cos x ≥ 0 — ℝ
- **Changement de variable t = √(1+x)** — t ≤ (t²+1)/2 ⇔ (t−1)² ≥ 0 — ℝ
- **Majorer ou minorer le dénominateur** — x³+√x ≤ 2x³ — ℝ
- **Faire apparaître un carré : x/y + y/x − 2 = (x−y)²/(xy)** — idem pour l'inégalité arithmético-géométrique √(xy) ≤ (x+y)/2 — ℝ
- **Ajouter 1 à chaque fraction (Nesbitt)** — a/(b+c) + 1 = (a+b+c)/(b+c) — ℝ

## TD2 Analyse 1 — Valeur absolue, partie entière
- **|u| < R ⇔ −R < u < R** — |x+1| < 1 ⇔ −2 < x < 0 — ℝ
- **|A| = |B| ⇔ A = ±B** — |6x²+x−1| = |2x²−x+1| — ℝ
- **Inégalité triangulaire par les carrés** — (|x|+|y|)² − (x+y)² = 2(|xy| − xy) — ℝ
- **Inégalité triangulaire renversée** — |a+b| ≥ |b| − |a| — ℝ
- **Ajouter et retrancher le même terme** — |1+x| + |−x−y| + |y| ≥ |1| — ℝ
- **Poser X = |x|** — 2x² − 7|x| − 4 < 0 → 2X² − 7X − 4 — ℝ
- **Changer de variables a = x−1, b = y−1** — |xy−1| = |a+b+ab| — ℝ
- **Différence de carrés factorisée** — (1+xy)² − (x+y)² = (1−x²)(1−y²) — ℝ
- **Partie entière + partie fractionnaire, avec cas {x} < ½ ou ≥ ½** — ⌊2x⌋ = 2⌊x⌋ ou 2⌊x⌋+1 — ℤ/ℝ
- **Encadrement caractéristique de ⌊x⌋** — x − 1 < E(x) ≤ x ⇒ E(x)/x → 1 — ℝ
- **⌈x⌉ = −⌊−x⌋** — en multipliant l'encadrement par −1 — ℤ/ℝ

Remarques : titres internes inversés entre « TD5 Développements – sommes » (titre interne TD 6) et « TD 06 – Intégration » (titre interne TD5). Aucun TD ne fait de télescopage 1/(k(k+1)) ni de changement d'indice : seul le télescopage de ln (TD 03).
