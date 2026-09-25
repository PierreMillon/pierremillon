import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ---------- math helpers ----------

const X0 = 1826;
const X_NOW = 2026;
const X1 = 2126;
const STEP = 2;

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSeries(seed) {
  const rand = mulberry32(seed);
  const n = Math.floor((X_NOW - X0) / STEP) + 1;

  const kind = Math.floor(rand() * 3);
  const base = 20 + rand() * 10;
  const noiseAmp = 0.6 + rand() * 0.8;

  let trueFn;
  let label;
  if (kind === 0) {
    const slope = 0.01 + rand() * 0.02;
    trueFn = (t) => base + slope * (t - X0);
    label = "linear";
  } else if (kind === 1) {
    const k = 0.008 + rand() * 0.01;
    trueFn = (t) => base + Math.exp(k * (t - X0)) * 0.4;
    label = "exp";
  } else {
    const L = 6 + rand() * 6;
    const k = 0.03 + rand() * 0.02;
    const t0 = X0 + 90 + rand() * 60;
    trueFn = (t) => base + L / (1 + Math.exp(-k * (t - t0)));
    label = "logistic";
  }

  const pts = [];
  for (let i = 0; i < n; i++) {
    const year = X0 + i * STEP;
    const noise = (rand() - 0.5) * 2 * noiseAmp;
    pts.push({ year, value: trueFn(year) + noise });
  }
  return { pts, label, trueFn };
}

function linreg(points) {
  const nn = points.length;
  const mx = points.reduce((s, p) => s + p.year, 0) / nn;
  const my = points.reduce((s, p) => s + p.value, 0) / nn;
  let num = 0, den = 0;
  for (const p of points) {
    num += (p.year - mx) * (p.value - my);
    den += (p.year - mx) * (p.year - mx);
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

function weightedLinreg(points, currentYear, halfLife) {
  const lambda = Math.log(2) / Math.max(halfLife, 1);
  const w = points.map((p) => Math.exp(-lambda * (currentYear - p.year)));
  const sw = w.reduce((a, b) => a + b, 0);
  const mx = points.reduce((s, p, i) => s + w[i] * p.year, 0) / sw;
  const my = points.reduce((s, p, i) => s + w[i] * p.value, 0) / sw;
  let num = 0, den = 0;
  points.forEach((p, i) => {
    num += w[i] * (p.year - mx) * (p.value - my);
    den += w[i] * (p.year - mx) * (p.year - mx);
  });
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

function fitLogistic(points, L) {
  const xs = points.map((p) => p.year);
  const ys = points.map((p) => p.value);
  const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const yMin = Math.min(...ys);

  let k = 0.03;
  let x0 = xMean;
  const lr = 0.4;
  const eps = 1e-3;

  const loss = (k_, x0_) => {
    let s = 0;
    for (let i = 0; i < xs.length; i++) {
      const pred = yMin + L / (1 + Math.exp(-k_ * (xs[i] - x0_)));
      const d = pred - ys[i];
      s += d * d;
    }
    return s / xs.length;
  };

  for (let iter = 0; iter < 400; iter++) {
    const l0 = loss(k, x0);
    const gk = (loss(k + eps, x0) - l0) / eps;
    const gx0 = (loss(k, x0 + eps) - l0) / eps;
    k -= lr * gk * 0.001;
    x0 -= lr * gx0 * 2;
    if (k < 0.001) k = 0.001;
    if (k > 1) k = 1;
  }
  return (t) => yMin + L / (1 + Math.exp(-k * (t - x0)));
}

// Interpolation cubique monotone (Fritsch–Carlson) : la courbe passe par
// chaque point sans créer de bosse que l'utilisateur n'a pas placée.
function monotoneInterp(pts) {
  const n = pts.length;
  const xs = pts.map((p) => p.year);
  const ys = pts.map((p) => p.value);
  if (n === 1) return () => ys[0];
  const d = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  const m = new Array(n);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (t) => {
    if (t <= xs[0]) return ys[0];
    if (t >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && t > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const u = (t - xs[i]) / h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i]
      + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}

function meanAbs(fn, ref, from, to) {
  let s = 0, c = 0;
  for (let t = from; t <= to; t += STEP) { s += Math.abs(fn(t) - ref(t)); c++; }
  return c ? s / c : null;
}

function localMean(historical, year) {
  const near = historical.filter((p) => Math.abs(p.year - year) <= 6);
  return near.reduce((s, p) => s + p.value, 0) / near.length;
}

// ---------- constants ----------

const METHODS = [
  { id: "secant", color: "#5AA9E6" },
  { id: "linreg", color: "#6FCF97" },
  { id: "weighted", color: "#BB86FC" },
  { id: "sigmoid", color: "#F2994A" },
];

const DRAW_COLOR = "#FF6B8B";
const DRAW_YEARS = [1826, 1866, 1906, 1946, 1986, 2026];

// Bruit fixe (même tirage à chaque fois) pour la courbe dessinée :
// le curseur « Bruit » ne fait qu'en régler l'amplitude.
const FIXED_NOISE = (() => {
  const r = mulberry32(99);
  return Array.from({ length: Math.floor((X_NOW - X0) / STEP) + 1 }, () => (r() - 0.5) * 2);
})();

const T = {
  fr: {
    m: {
      secant: "Sécante (2 points)",
      linreg: "Régression linéaire",
      weighted: "Pondérée (récent > ancien)",
      sigmoid: "Logistique (plafond L)",
    },
    kind: {
      linear: "tendance linéaire",
      exp: "tendance accélérante, sans plafond connu",
      logistic: "tendance plafonnée (un « L » caché existe)",
    },
    info: {
      secant:
        "Droite qui passe par deux points seulement : le point de référence et le dernier point connu. Simple, mais très sensible au bruit : si l'un des deux points est « mal tombé », toute la prévision part de travers.",
      linreg:
        "Droite qui rend la plus petite possible la somme des carrés des écarts, sur toute la période choisie. Le bruit se compense, mais on suppose que la pente ne change jamais.",
      weighted:
        "Même idée que la régression linéaire, mais un point ancien pèse moins qu'un point récent (son poids est divisé par 2 à chaque demi-vie). Suit mieux un changement de rythme récent, au prix de plus de bruit.",
      sigmoid:
        "Courbe en S : elle accélère, puis ralentit sous un plafond L que l'on suppose. Très bonne si un plafond existe vraiment, trompeuse sinon — tout dépend du L choisi.",
      draw:
        "Les données sont maintenant ta courbe. Glisse un point ● pour la déformer : les méthodes se recalculent en direct. Touche une zone vide (avant 2026) pour ajouter un point. Les deux extrémités ne bougent que verticalement. Le curseur « Bruit » ajoute des petites irrégularités, comme dans des vraies mesures.",
      score:
        "Écart moyen = moyenne des distances verticales, une mesure tous les 2 ans. « Passé » : écart de la méthode aux données, sur la période choisie (elle colle bien ou pas). « Futur » : écart à la vraie mécanique sur 2026 → 2126, seulement pour une série aléatoire, après la révélation.",
    },
    history: "Historique",
    close: "Fermer",
    explain: "Explication",
    yourCurve: "ta courbe · ",
    randomSeries: "↻ Série aléatoire",
    restart: "✎ Recommencer",
    draw: "✎ Dessiner ma courbe",
    reveal: "Révéler la mécanique",
    hide: "Masquer la mécanique",
    mechanic: "mécanique réelle : ",
    myCurve: "Ma courbe",
    pointSel: (y) => "point " + y + " sélectionné",
    hint: "glisse un point ● · touche le graphique pour en ajouter",
    removePt: "Retirer le point",
    noise: "Bruit — ±",
    methods: "Méthodes",
    score: "Écart moyen",
    past: "passé",
    future: "futur",
    ref: (y) => "Point de référence — année " + y,
    memory: (h) => "Mémoire (pondérée) — demi-vie " + h + " ans",
    cap: (c) => "Plafond supposé — ×" + c + " l'amplitude",
    otherLang: "EN",
    install: "Astuce : « Partager → Sur l'écran d'accueil » pour l'installer comme une appli.",
  },
  en: {
    m: {
      secant: "Secant (2 points)",
      linreg: "Linear regression",
      weighted: "Weighted (recent > old)",
      sigmoid: "Logistic (ceiling L)",
    },
    kind: {
      linear: "linear trend",
      exp: "accelerating trend, no known ceiling",
      logistic: "capped trend (a hidden « L » exists)",
    },
    info: {
      secant:
        "A straight line through only two points: the reference point and the last known point. Simple, but very sensitive to noise: if either point is an outlier, the whole forecast goes off.",
      linreg:
        "The straight line that makes the sum of squared errors as small as possible over the chosen period. Noise averages out, but the slope is assumed never to change.",
      weighted:
        "Same idea as linear regression, but old points weigh less than recent ones (their weight halves every half-life). Follows a recent change of pace better, at the cost of more noise.",
      sigmoid:
        "An S-curve: it speeds up, then slows down under an assumed ceiling L. Great if a ceiling really exists, misleading otherwise — it all depends on the chosen L.",
      draw:
        "The data is now your curve. Drag a point ● to reshape it: the methods update live. Tap an empty spot (before 2026) to add a point. Both ends only move vertically. The « Noise » slider adds small irregularities, like real measurements.",
      score:
        "Mean error = average vertical distance, measured every 2 years. « Past »: distance from the method to the data over the chosen period (does it fit?). « Future »: distance to the actual mechanism over 2026 → 2126, random series only, after revealing.",
    },
    history: "History",
    close: "Close",
    explain: "Explanation",
    yourCurve: "your curve · ",
    randomSeries: "↻ Random series",
    restart: "✎ Start over",
    draw: "✎ Draw my curve",
    reveal: "Reveal the mechanism",
    hide: "Hide the mechanism",
    mechanic: "actual mechanism: ",
    myCurve: "My curve",
    pointSel: (y) => "point " + y + " selected",
    hint: "drag a point ● · tap the chart to add one",
    removePt: "Remove point",
    noise: "Noise — ±",
    methods: "Methods",
    score: "Mean error",
    past: "past",
    future: "future",
    ref: (y) => "Reference point — year " + y,
    memory: (h) => "Memory (weighted) — half-life " + h + " years",
    cap: (c) => "Assumed ceiling — ×" + c + " the range",
    otherLang: "FR",
    install: "Tip: « Share → Add to Home Screen » to install it like an app.",
  },
};

const HISTORY = [
  {
    v: "v4",
    date: "25/09/2026",
    fr: "Version anglaise (bouton EN/FR). Courbe dessinée et réglages gardés d'une visite à l'autre. Plus de zoom ni de loupe au toucher. Installable sur l'écran d'accueil. Mise à jour automatique. Format téléphone centré sur grand écran.",
    en: "English version (EN/FR button). Drawn curve and settings kept between visits. No more zoom or magnifier on touch. Installable on the home screen. Automatic updates. Phone layout centred on large screens.",
  },
  {
    v: "v3",
    date: "25/09/2026",
    fr: "Une seule courbe de données : aléatoire, ou dessinée par toi (« ✎ Dessiner ma courbe »). Les méthodes et l'écart moyen se calculent toujours sur cette courbe, en direct pendant que tu glisses les points. Curseur de bruit. Remplace les « courbes perso » de la v2.",
    en: "A single data curve: random, or drawn by you (« ✎ Draw my curve »). Methods and mean error are always computed on that curve, live while you drag the points. Noise slider. Replaces the v2 « custom curves ».",
  },
  {
    v: "v2",
    date: "25/09/2026",
    fr: "Courbes perso à points déplaçables, petit ⓘ explicatif par méthode, écart moyen, vraie mécanique prolongée dans le futur, graphique tactile.",
    en: "Custom curves with draggable points, small ⓘ explanation per method, mean error, actual mechanism extended into the future, touch chart.",
  },
  {
    v: "v1",
    date: "",
    fr: "Explorateur initial : série synthétique, 4 méthodes (sécante, régression, pondérée, logistique), bouton « Révéler la mécanique ».",
    en: "Initial explorer: synthetic series, 4 methods (secant, regression, weighted, logistic), « Reveal the mechanism » button.",
  },
];

// ---------- sauvegarde locale ----------

const SAVE_KEY = "extrapolation_state";

// Relit la sauvegarde en vérifiant chaque champ : une valeur inattendue
// est ignorée (valeur par défaut), jamais interprétée.
function loadSaved() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch (e) { raw = null; }
  if (!raw || typeof raw !== "object") raw = {};
  const num = (v, lo, hi, d) => (typeof v === "number" && isFinite(v) && v >= lo && v <= hi ? v : d);
  const maxIdx = Math.floor((X_NOW - X0) / STEP) - 4;
  let drawPts = null;
  if (Array.isArray(raw.drawPts) && raw.drawPts.length >= 2 && raw.drawPts.length <= 60) {
    const pts = raw.drawPts.map((p) => ({ year: num(p && p.year, X0, X_NOW, NaN), value: num(p && p.value, -1e6, 1e6, NaN) }));
    const ok = pts.every((p, i) => !isNaN(p.year) && !isNaN(p.value) && (i === 0 || p.year > pts[i - 1].year))
      && pts[0].year === X0 && pts[pts.length - 1].year === X_NOW;
    if (ok) drawPts = pts;
  }
  const active = { secant: true, linreg: true, weighted: false, sigmoid: false };
  if (raw.active && typeof raw.active === "object") {
    METHODS.forEach((m) => { if (typeof raw.active[m.id] === "boolean") active[m.id] = raw.active[m.id]; });
  }
  let lang = raw.lang === "fr" || raw.lang === "en" ? raw.lang : null;
  if (!lang) {
    const nav = (typeof navigator !== "undefined" && navigator.language) || "fr";
    lang = nav.toLowerCase().startsWith("fr") ? "fr" : "en";
  }
  return {
    seed: Math.round(num(raw.seed, 0, 1e9, 7)),
    pointAIdx: Math.round(num(raw.pointAIdx, 0, maxIdx, 0)),
    halfLife: Math.round(num(raw.halfLife, 2, 100, 20)),
    capMultiplier: num(raw.capMultiplier, 1.1, 4, 1.6),
    noise: num(raw.noise, 0, 3, 0),
    active,
    drawPts,
    lang,
  };
}

// ---------- component ----------

export default function PredictionExplorer() {
  const saved = useMemo(loadSaved, []);
  const [seed, setSeed] = useState(saved.seed);
  const [pointAIdx, setPointAIdx] = useState(saved.pointAIdx);
  const [halfLife, setHalfLife] = useState(saved.halfLife);
  const [capMultiplier, setCapMultiplier] = useState(saved.capMultiplier);
  const [active, setActive] = useState(saved.active);
  const [revealTrue, setRevealTrue] = useState(false);
  const [drawPts, setDrawPts] = useState(saved.drawPts); // null = série aléatoire
  const [noise, setNoise] = useState(saved.noise);
  const [lang, setLang] = useState(saved.lang);
  const [selectedPt, setSelectedPt] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [info, setInfo] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const t = T[lang];
  const drawn = drawPts != null;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // sauvegarde (pas pendant un glissé : on écrit une fois au lâcher)
  useEffect(() => {
    if (dragging) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        seed, pointAIdx, halfLife, capMultiplier, active, drawPts, noise, lang,
      }));
    } catch (e) { /* stockage indisponible : on continue sans */ }
  }, [seed, pointAIdx, halfLife, capMultiplier, active, drawPts, noise, lang, dragging]);

  const random = useMemo(() => generateSeries(seed), [seed]);
  const drawFn = useMemo(() => (drawn ? monotoneInterp(drawPts) : null), [drawn, drawPts]);

  const historical = useMemo(() => {
    if (!drawn) return random.pts;
    return FIXED_NOISE.map((z, i) => {
      const year = X0 + i * STEP;
      return { year, value: drawFn(year) + z * noise };
    });
  }, [drawn, random, drawFn, noise]);

  const pointAYear = historical[pointAIdx].year;
  const fitRange = useMemo(
    () => historical.filter((p) => p.year >= pointAYear),
    [historical, pointAYear]
  );

  const models = useMemo(() => {
    const currentVal = historical[historical.length - 1].value;
    const aVal = historical[pointAIdx].value;
    const out = {};

    const secSlope = (currentVal - aVal) / (X_NOW - pointAYear || 1);
    out.secant = (t) => currentVal + secSlope * (t - X_NOW);

    const lr_ = linreg(fitRange);
    out.linreg = (t) => lr_.intercept + lr_.slope * t;

    const wr_ = weightedLinreg(fitRange, X_NOW, halfLife);
    out.weighted = (t) => wr_.intercept + wr_.slope * t;

    const maxVal = Math.max(...fitRange.map((p) => p.value));
    const minVal = Math.min(...fitRange.map((p) => p.value));
    const L = (maxVal - minVal) * capMultiplier + 0.5;
    out.sigmoid = fitLogistic(fitRange, L);

    return out;
  }, [historical, pointAIdx, pointAYear, fitRange, halfLife, capMultiplier]);

  // Domaine vertical : figé pendant un glissé, sinon les points
  // « fuiraient » sous le doigt ; recalculé au lâcher.
  const frozenDomain = useRef(null);
  const liveDomain = useMemo(() => {
    const vals = historical.map((p) => p.value);
    let lo = Math.min(...vals);
    let hi = Math.max(...vals);
    const r = hi - lo || 4;
    lo -= 0.4 * r;
    hi += 1.2 * r;
    if (revealTrue && !drawn) {
      for (let t = X_NOW; t <= X1; t += STEP) {
        hi = Math.max(hi, random.trueFn(t) + 0.1 * r);
        lo = Math.min(lo, random.trueFn(t) - 0.1 * r);
      }
    }
    return [lo, hi];
  }, [historical, revealTrue, drawn, random]);
  if (!dragging) frozenDomain.current = liveDomain;
  const yDomain = frozenDomain.current;

  const startDrawing = () => {
    setDrawPts(DRAW_YEARS.map((year) => ({ year, value: localMean(historical, year) })));
    setRevealTrue(false);
    setSelectedPt(null);
    setInfo("draw");
  };

  const newSeries = () => {
    setSeed((s) => s + 1);
    setDrawPts(null);
    setSelectedPt(null);
    setRevealTrue(false);
    if (info === "draw") setInfo(null);
  };

  const removeSelectedPoint = () => {
    if (selectedPt == null || selectedPt === 0 || selectedPt === drawPts.length - 1) return;
    setDrawPts(drawPts.filter((_, i) => i !== selectedPt));
    setSelectedPt(null);
  };

  const toggle = useCallback((id) => {
    setActive((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const scores = useMemo(() => {
    const dataAt = new Map(historical.map((p) => [p.year, p.value]));
    const dataFn = (t) => dataAt.get(t);
    return METHODS.filter((m) => active[m.id]).map((m) => ({
      id: m.id, color: m.color,
      past: meanAbs(models[m.id], dataFn, pointAYear, X_NOW),
      future: drawn ? null : meanAbs(models[m.id], random.trueFn, X_NOW + STEP, X1),
    }));
  }, [active, models, historical, pointAYear, drawn, random]);

  const showFuture = revealTrue && !drawn;
  const bestPast = scores.slice().sort((a, b) => a.past - b.past)[0];
  const bestFuture = showFuture ? scores.slice().sort((a, b) => a.future - b.future)[0] : null;
  const canRemove = drawn && selectedPt != null && selectedPt > 0 && selectedPt < drawPts.length - 1;

  return (
    <div
      style={{
        fontFamily: "'Georgia', serif",
        background: "#12161d",
        color: "#EDEAE3",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* CHART — top half */}
      <div
        style={{
          flex: "0 0 46%",
          background: "#1c222c",
          padding: "max(8px, env(safe-area-inset-top)) 6px 4px",
          borderBottom: "1px solid #2a313d",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 8px 4px" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Extrapolation
            <button
              onClick={() => setShowHistory(true)}
              aria-label={t.history}
              style={{ ...iconBtn, marginLeft: 8 }}
            >
              ⓘ
            </button>
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              aria-label={lang === "fr" ? "English" : "Français"}
              style={{ ...iconBtn, fontSize: 10, fontFamily: "monospace", border: "1px solid #3a4250", borderRadius: 4, padding: "1px 5px", marginLeft: 4 }}
            >
              {t.otherLang}
            </button>
          </span>
          <span style={{ fontSize: 10, color: "#5c6577", fontFamily: "monospace" }}>
            {drawn ? t.yourCurve : ""}{pointAYear} → {X_NOW} → {X1}
          </span>
        </div>
        <Chart
          historical={historical}
          trueFn={showFuture ? random.trueFn : null}
          models={models}
          active={active}
          pointAYear={pointAYear}
          yDomain={yDomain}
          drawPts={drawPts}
          drawFn={drawFn}
          setDrawPts={setDrawPts}
          selectedPt={selectedPt}
          setSelectedPt={setSelectedPt}
          setDragging={setDragging}
        />
      </div>

      {/* CONTROLS — bottom half, scrollable */}
      <div style={{ flex: "1 1 auto", overflowY: "auto", padding: "10px 12px max(24px, env(safe-area-inset-bottom))" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={newSeries} style={btnStyle("#EDEAE3", "#1c222c")}>
            {t.randomSeries}
          </button>
          {drawn ? (
            <button onClick={startDrawing} style={btnStyle("#EDEAE3", "#1c222c")}>
              {t.restart}
            </button>
          ) : (
            <button onClick={startDrawing} style={btnStyle(DRAW_COLOR, "#1c222c")}>
              {t.draw}
            </button>
          )}
        </div>

        {!drawn && (
          <button
            onClick={() => setRevealTrue((r) => !r)}
            style={{ ...btnStyle(revealTrue ? "#12161d" : "#EDEAE3", revealTrue ? "#EDEAE3" : "#1c222c"), width: "100%", marginBottom: 10 }}
          >
            {revealTrue ? t.hide : t.reveal}
          </button>
        )}

        {showFuture && (
          <div style={{ fontSize: 11, color: "#8A93A3", fontFamily: "monospace", marginBottom: 10 }}>
            {t.mechanic}{t.kind[random.label]}
          </div>
        )}

        {drawn && (
          <>
            <SectionTitle>
              {t.myCurve}
              <button onClick={() => setInfo(info === "draw" ? null : "draw")} style={iconBtn} aria-label={t.explain}>ⓘ</button>
            </SectionTitle>
            {info === "draw" && <InfoBox>{t.info.draw}</InfoBox>}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 11, fontFamily: "monospace", color: "#8A93A3" }}>
              <span style={{ flex: 1 }}>
                {selectedPt != null && drawPts[selectedPt]
                  ? t.pointSel(drawPts[selectedPt].year)
                  : t.hint}
              </span>
              {canRemove && (
                <button onClick={removeSelectedPoint} style={{ ...btnStyle("#EDEAE3", "#1c222c"), flex: "0 0 auto", padding: "5px 9px" }}>
                  {t.removePt}
                </button>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <SliderRow
                label={t.noise + noise.toFixed(1)}
                min={0}
                max={30}
                value={Math.round(noise * 10)}
                onChange={(v) => setNoise(v / 10)}
              />
            </div>
          </>
        )}

        {/* MÉTHODES */}
        <SectionTitle>{t.methods}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          {METHODS.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#1c222c",
                borderRadius: 8,
                border: active[m.id] ? "1px solid " + m.color : "1px solid transparent",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 0 8px 9px", cursor: "pointer", flex: 1 }}
              >
                <input
                  type="checkbox"
                  checked={active[m.id]}
                  onChange={() => toggle(m.id)}
                  style={{ accentColor: m.color, width: 15, height: 15, flexShrink: 0 }}
                />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontFamily: "monospace", lineHeight: 1.2 }}>{t.m[m.id]}</span>
              </label>
              <button
                onClick={() => setInfo(info === m.id ? null : m.id)}
                style={{ ...iconBtn, padding: "8px 8px", color: info === m.id ? m.color : "#8A93A3" }}
                aria-label={t.explain + " : " + t.m[m.id]}
              >
                ⓘ
              </button>
            </div>
          ))}
        </div>
        {METHODS.some((m) => m.id === info) && <InfoBox>{t.info[info]}</InfoBox>}

        {/* ÉCARTS */}
        {scores.length > 0 && (
          <>
            <SectionTitle>
              {t.score}
              <button onClick={() => setInfo(info === "score" ? null : "score")} style={iconBtn} aria-label={t.explain}>ⓘ</button>
            </SectionTitle>
            {info === "score" && <InfoBox>{t.info.score}</InfoBox>}
            <div style={{ fontFamily: "monospace", fontSize: 11.5, marginBottom: 16 }}>
              <div style={{ display: "flex", color: "#5c6577", padding: "0 0 4px" }}>
                <span style={{ flex: 1 }} />
                <span style={{ width: 62, textAlign: "right" }}>{t.past}</span>
                {!drawn && <span style={{ width: 62, textAlign: "right" }}>{t.future}</span>}
              </div>
              {scores.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", padding: "3px 0" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, marginRight: 7 }} />
                  <span style={{ flex: 1 }}>{t.m[s.id]}</span>
                  <span style={{ width: 62, textAlign: "right" }}>
                    {fmt(s.past)}{scores.length > 1 && bestPast.id === s.id ? " ★" : ""}
                  </span>
                  {!drawn && (
                    <span style={{ width: 62, textAlign: "right", color: showFuture ? "#EDEAE3" : "#5c6577" }}>
                      {showFuture ? fmt(s.future) + (scores.length > 1 && bestFuture.id === s.id ? " ★" : "") : "?"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SliderRow
            label={t.ref(pointAYear)}
            min={0}
            max={historical.length - 5}
            value={pointAIdx}
            onChange={setPointAIdx}
          />
          <SliderRow
            label={t.memory(halfLife)}
            min={2}
            max={100}
            value={halfLife}
            onChange={setHalfLife}
            disabled={!active.weighted}
          />
          <SliderRow
            label={t.cap(capMultiplier.toFixed(1))}
            min={11}
            max={40}
            value={Math.round(capMultiplier * 10)}
            onChange={(v) => setCapMultiplier(v / 10)}
            disabled={!active.sigmoid}
          />
        </div>
      </div>

      {showHistory && (
        <div
          onClick={() => setShowHistory(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1c222c", border: "1px solid #3a4250", borderRadius: 10,
              padding: "14px 16px", maxWidth: 420, width: "100%", maxHeight: "80vh", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{t.history}</span>
              <button onClick={() => setShowHistory(false)} style={iconBtn} aria-label={t.close}>✕</button>
            </div>
            {HISTORY.map((h) => (
              <div key={h.v} style={{ marginBottom: 12, fontFamily: "monospace", fontSize: 11.5, lineHeight: 1.45 }}>
                <div style={{ color: "#F2994A" }}>{h.v}{h.date ? " · " + h.date : ""}</div>
                <div style={{ color: "#C9C5BC" }}>{h[lang]}</div>
              </div>
            ))}
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#8A93A3", borderTop: "1px solid #2a313d", paddingTop: 10 }}>
              {t.install}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- chart (SVG tactile) ----------

const M = { top: 8, right: 10, bottom: 18, left: 34 };

function niceTicks(lo, hi, count) {
  const raw = (hi - lo) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((k) => k * mag).find((s) => s >= raw);
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(+v.toFixed(6));
  return out;
}

function Chart({
  historical, trueFn, models, active, pointAYear, yDomain,
  drawPts, drawFn, setDrawPts, selectedPt, setSelectedPt, setDragging,
}) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [size, setSize] = useState({ w: 300, h: 200 });
  const drag = useRef(null);
  const tap = useRef(null);

  // Loupe iOS au double-tap / appui long sur le graphique : seul un
  // preventDefault sur les événements tactiles bruts l'empêche ; les
  // événements pointer, eux, continuent d'arriver.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const stop = (e) => e.preventDefault();
    ["touchstart", "touchend", "dblclick", "contextmenu"].forEach((t) =>
      el.addEventListener(t, stop, { passive: false }));
    return () => ["touchstart", "touchend", "dblclick", "contextmenu"].forEach((t) =>
      el.removeEventListener(t, stop));
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pw = Math.max(10, size.w - M.left - M.right);
  const ph = Math.max(10, size.h - M.top - M.bottom);
  const [yLo, yHi] = yDomain;
  const sx = (t) => M.left + ((t - X0) / (X1 - X0)) * pw;
  const sy = (v) => M.top + ((yHi - v) / (yHi - yLo)) * ph;
  const ix = (px) => X0 + ((px - M.left) / pw) * (X1 - X0);
  const iy = (py) => yHi - ((py - M.top) / ph) * (yHi - yLo);

  const path = (fn, from, to, step = STEP) => {
    let d = "";
    for (let t = from; t <= to + 1e-9; t += step) {
      d += (d ? "L" : "M") + sx(t).toFixed(1) + "," + sy(fn(t)).toFixed(1);
    }
    return d;
  };

  const local = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointDown = (e, idx) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = idx;
    setSelectedPt(idx);
    setDragging(true);
  };

  const onPointMove = (e) => {
    const idx = drag.current;
    if (idx == null) return;
    const { x, y } = local(e);
    setDrawPts((prev) => {
      const pts = prev.slice();
      const last = pts.length - 1;
      // les extrémités 1826 et 2026 ne bougent que verticalement
      let year = pts[idx].year;
      if (idx > 0 && idx < last) {
        const minY = pts[idx - 1].year + STEP;
        const maxY = pts[idx + 1].year - STEP;
        year = Math.round(Math.min(maxY, Math.max(minY, ix(x))));
      }
      const value = Math.min(yHi, Math.max(yLo, iy(y)));
      pts[idx] = { year, value };
      return pts;
    });
  };

  const onPointUp = () => {
    drag.current = null;
    setDragging(false);
  };

  const onBgDown = (e) => {
    tap.current = { ...local(e), t: Date.now() };
  };

  const onBgUp = (e) => {
    const start = tap.current;
    tap.current = null;
    if (!start || !drawPts) return;
    const p = local(e);
    if (Math.hypot(p.x - start.x, p.y - start.y) > 10 || Date.now() - start.t > 500) return;
    const year = Math.round(ix(p.x));
    if (year <= X0 || year >= X_NOW) return;
    if (drawPts.some((q) => Math.abs(q.year - year) < 4)) return;
    const pts = [...drawPts, { year, value: iy(p.y) }].sort((a, b) => a.year - b.year);
    setDrawPts(pts);
    setSelectedPt(pts.findIndex((q) => q.year === year));
  };

  const yTicks = niceTicks(yLo, yHi, 5);
  const xTicks = [1850, 1900, 1950, 2000, 2050, 2100];
  const histPath = historical
    .map((p, i) => (i ? "L" : "M") + sx(p.year).toFixed(1) + "," + sy(p.value).toFixed(1))
    .join("");

  return (
    <div ref={wrapRef} style={{ flex: 1, minHeight: 0, position: "relative" }}>
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        style={{ display: "block", touchAction: "none", userSelect: "none" }}
      >
        <defs>
          <clipPath id="plot">
            <rect x={M.left} y={M.top} width={pw} height={ph} />
          </clipPath>
        </defs>

        {yTicks.map((v) => (
          <g key={"y" + v}>
            <line x1={M.left} x2={M.left + pw} y1={sy(v)} y2={sy(v)} stroke="#2a313d" strokeDasharray="2 4" />
            <text x={M.left - 4} y={sy(v) + 3} textAnchor="end" fill="#8A93A3" fontSize="9" fontFamily="monospace">{v}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <g key={"x" + t}>
            <line x1={sx(t)} x2={sx(t)} y1={M.top} y2={M.top + ph} stroke="#2a313d" strokeDasharray="2 4" />
            <text x={sx(t)} y={M.top + ph + 12} textAnchor="middle" fill="#8A93A3" fontSize="9" fontFamily="monospace">{t}</text>
          </g>
        ))}
        <rect
          x={M.left} y={M.top} width={pw} height={ph}
          fill="transparent" stroke="#3a4250"
          onPointerDown={onBgDown}
          onPointerUp={onBgUp}
        />

        <g clipPath="url(#plot)" style={{ pointerEvents: "none" }}>
          <rect x={sx(X_NOW)} y={M.top} width={sx(X1) - sx(X_NOW)} height={ph} fill="#ffffff" opacity="0.025" />
          <line x1={sx(X_NOW)} x2={sx(X_NOW)} y1={M.top} y2={M.top + ph} stroke="#5c6577" strokeDasharray="3 3" />
          <line x1={sx(pointAYear)} x2={sx(pointAYear)} y1={M.top} y2={M.top + ph} stroke="#5c6577" strokeDasharray="1 3" />

          {drawFn && (
            <path d={path(drawFn, X0, X_NOW, 1)} fill="none" stroke={DRAW_COLOR} strokeWidth="2.4" strokeOpacity="0.55" />
          )}
          <path d={histPath} fill="none" stroke="#EDEAE3" strokeWidth="1.6" />

          {trueFn && (
            <path d={path(trueFn, X0, X1)} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="2 2" />
          )}

          {METHODS.filter((m) => active[m.id]).map((m) => (
            <g key={m.id}>
              <path d={path(models[m.id], pointAYear, X_NOW)} fill="none" stroke={m.color} strokeWidth="1.8" />
              <path d={path(models[m.id], X_NOW, X1)} fill="none" stroke={m.color} strokeWidth="1.8" strokeDasharray="6 4" />
            </g>
          ))}
        </g>

        {drawPts && drawPts.map((p, i) => (
          <g
            key={i}
            onPointerDown={(e) => onPointDown(e, i)}
            onPointerMove={onPointMove}
            onPointerUp={onPointUp}
            onPointerCancel={onPointUp}
            style={{ cursor: "grab" }}
          >
            <circle cx={sx(p.year)} cy={sy(p.value)} r="20" fill="transparent" />
            <circle
              cx={sx(p.year)} cy={sy(p.value)} r={i === selectedPt ? 7.5 : 6}
              fill={i === selectedPt ? DRAW_COLOR : "#12161d"}
              stroke={DRAW_COLOR} strokeWidth="2"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ---------- small UI bits ----------

function fmt(v) {
  return v == null ? "—" : v.toFixed(2);
}

const iconBtn = {
  background: "none",
  border: "none",
  color: "#8A93A3",
  fontSize: 13,
  cursor: "pointer",
  padding: "0 4px",
  fontFamily: "inherit",
};

const plainBtn = {
  background: "none",
  border: "none",
  color: "#EDEAE3",
  padding: 0,
  cursor: "pointer",
};

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A93A3", fontFamily: "monospace", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
      {children}
    </div>
  );
}

function InfoBox({ children }) {
  return (
    <div style={{ fontSize: 11.5, lineHeight: 1.45, fontFamily: "monospace", color: "#C9C5BC", background: "#161b23", borderLeft: "2px solid #F2994A", padding: "7px 9px", marginBottom: 10, borderRadius: 4 }}>
      {children}
    </div>
  );
}

function btnStyle(fg, bg) {
  return {
    background: bg,
    color: fg,
    border: "1px solid #3a4250",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    fontFamily: "monospace",
    cursor: "pointer",
    flex: 1,
  };
}

function SliderRow({ label, min, max, value, onChange, disabled }) {
  return (
    <div style={{ opacity: disabled ? 0.4 : 1 }}>
      <div style={{ fontSize: 11.5, marginBottom: 4, fontFamily: "monospace" }}>{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#F2994A" }}
      />
    </div>
  );
}
