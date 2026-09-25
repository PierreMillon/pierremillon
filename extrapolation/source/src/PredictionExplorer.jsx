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
    label = "tendance linéaire";
  } else if (kind === 1) {
    const k = 0.008 + rand() * 0.01;
    trueFn = (t) => base + Math.exp(k * (t - X0)) * 0.4;
    label = "tendance accélérante, sans plafond connu";
  } else {
    const L = 6 + rand() * 6;
    const k = 0.03 + rand() * 0.02;
    const t0 = X0 + 90 + rand() * 60;
    trueFn = (t) => base + L / (1 + Math.exp(-k * (t - t0)));
    label = "tendance plafonnée (un « L » caché existe)";
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
  { id: "secant", label: "Sécante (2 points)", color: "#5AA9E6" },
  { id: "linreg", label: "Régression linéaire", color: "#6FCF97" },
  { id: "weighted", label: "Pondérée (récent > ancien)", color: "#BB86FC" },
  { id: "sigmoid", label: "Logistique (plafond L)", color: "#F2994A" },
];

const USER_COLORS = ["#FF6B8B", "#F2D45C", "#4FD1C5", "#E5E5E5"];

const INFO = {
  secant:
    "Droite qui passe par deux points seulement : le point de référence et le dernier point connu. Simple, mais très sensible au bruit : si l'un des deux points est « mal tombé », toute la prévision part de travers.",
  linreg:
    "Droite qui rend la plus petite possible la somme des carrés des écarts, sur toute la période choisie. Le bruit se compense, mais on suppose que la pente ne change jamais.",
  weighted:
    "Même idée que la régression linéaire, mais un point ancien pèse moins qu'un point récent (son poids est divisé par 2 à chaque demi-vie). Suit mieux un changement de rythme récent, au prix de plus de bruit.",
  sigmoid:
    "Courbe en S : elle accélère, puis ralentit sous un plafond L que l'on suppose. Très bonne si un plafond existe vraiment, trompeuse sinon — tout dépend du L choisi.",
  user:
    "Ta courbe passe exactement par tes points, reliés en douceur (interpolation cubique monotone : pas de bosse que tu n'as pas placée). Glisse un point pour le déplacer. Touche une zone vide du graphique pour ajouter un point. Le chiffre « passé » mesure l'écart moyen aux données : plus il est petit, mieux ta courbe colle à l'histoire.",
  score:
    "Écart moyen = moyenne des distances verticales entre une courbe et la vraie mécanique, une mesure tous les 2 ans. « Passé » : sur les données déjà connues. « Futur » : sur 2026 → 2126, visible seulement après la révélation.",
};

const HISTORY = [
  {
    v: "v2",
    date: "25/09/2026",
    text: "Tes propres courbes : points à glisser au doigt, ajout d'un point en touchant le graphique, plusieurs courbes. Petit ⓘ explicatif sur chaque méthode. Écart moyen de chaque courbe (passé, puis futur après révélation). La vraie mécanique se prolonge dans le futur. Graphique redessiné pour le tactile.",
  },
  {
    v: "v1",
    date: "",
    text: "Explorateur initial : série synthétique, 4 méthodes (sécante, régression, pondérée, logistique), bouton « Révéler la mécanique ».",
  },
];

function defaultUserPoints(historical) {
  const years = [1876, 1951, X_NOW];
  const pts = years.map((year) => ({ year, value: localMean(historical, year) }));
  const slope = (pts[2].value - pts[1].value) / (X_NOW - 1951);
  pts.push({ year: 2076, value: pts[2].value + slope * 50 });
  pts.push({ year: X1, value: pts[2].value + slope * 100 });
  return pts;
}

// ---------- component ----------

export default function PredictionExplorer() {
  const [seed, setSeed] = useState(7);
  const [pointAIdx, setPointAIdx] = useState(0);
  const [halfLife, setHalfLife] = useState(20);
  const [capMultiplier, setCapMultiplier] = useState(1.6);
  const [active, setActive] = useState({
    secant: true, linreg: false, weighted: false, sigmoid: false,
  });
  const [revealTrue, setRevealTrue] = useState(false);
  const [curves, setCurves] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPt, setSelectedPt] = useState(null);
  const [info, setInfo] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const nextId = useRef(1);

  const { pts: historical, label: hiddenLabel, trueFn } = useMemo(
    () => generateSeries(seed),
    [seed]
  );

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

  const userFns = useMemo(() => {
    const out = {};
    curves.forEach((c) => { out[c.id] = monotoneInterp(c.points); });
    return out;
  }, [curves]);

  // Domaine vertical fixe pendant le glissé (ne dépend pas des courbes
  // de l'utilisateur), sinon les points « fuiraient » sous le doigt.
  const yDomain = useMemo(() => {
    const vals = historical.map((p) => p.value);
    let lo = Math.min(...vals);
    let hi = Math.max(...vals);
    const r = hi - lo || 1;
    lo -= 0.3 * r;
    hi += 1.2 * r;
    if (revealTrue) {
      for (let t = X_NOW; t <= X1; t += STEP) {
        hi = Math.max(hi, trueFn(t) + 0.1 * r);
        lo = Math.min(lo, trueFn(t) - 0.1 * r);
      }
    }
    return [lo, hi];
  }, [historical, revealTrue, trueFn]);

  const addCurve = useCallback(() => {
    if (curves.length >= USER_COLORS.length) return;
    const used = new Set(curves.map((c) => c.color));
    const color = USER_COLORS.find((c) => !used.has(c));
    const id = nextId.current++;
    setCurves([...curves, { id, name: "Courbe " + id, color, points: defaultUserPoints(historical) }]);
    setSelectedId(id);
    setSelectedPt(null);
  }, [curves, historical]);

  const removeCurve = useCallback((id) => {
    setCurves((prev) => prev.filter((c) => c.id !== id));
    setSelectedId((s) => (s === id ? null : s));
    setSelectedPt(null);
  }, []);

  const removeSelectedPoint = useCallback(() => {
    if (selectedPt == null) return;
    setCurves((prev) => prev.map((c) => {
      if (c.id !== selectedId || c.points.length <= 2) return c;
      return { ...c, points: c.points.filter((_, i) => i !== selectedPt) };
    }));
    setSelectedPt(null);
  }, [selectedId, selectedPt]);

  const newSeries = () => {
    setSeed((s) => s + 1);
    setCurves([]);
    setSelectedId(null);
    setSelectedPt(null);
    setRevealTrue(false);
  };

  const toggle = useCallback((id) => {
    setActive((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // écarts moyens
  const scores = useMemo(() => {
    const dataFn = (t) => {
      const p = historical.find((q) => q.year === t);
      return p ? p.value : trueFn(t);
    };
    const rows = [];
    METHODS.forEach((m) => {
      if (!active[m.id]) return;
      rows.push({
        id: m.id, label: m.label, color: m.color,
        past: meanAbs(models[m.id], dataFn, pointAYear, X_NOW),
        future: meanAbs(models[m.id], trueFn, X_NOW + STEP, X1),
      });
    });
    curves.forEach((c) => {
      const fn = userFns[c.id];
      const first = c.points[0].year;
      const last = c.points[c.points.length - 1].year;
      const pastFrom = Math.max(X0, Math.ceil(first / STEP) * STEP);
      const pastTo = Math.min(X_NOW, last);
      rows.push({
        id: "u" + c.id, label: c.name, color: c.color,
        past: pastTo >= pastFrom ? meanAbs(fn, dataFn, pastFrom, pastTo) : null,
        future: last > X_NOW ? meanAbs(fn, trueFn, X_NOW + STEP, Math.min(X1, last)) : null,
      });
    });
    return rows;
  }, [active, models, curves, userFns, historical, trueFn, pointAYear]);

  const bestFuture = revealTrue
    ? scores.filter((s) => s.future != null).sort((a, b) => a.future - b.future)[0]
    : null;

  const selectedCurve = curves.find((c) => c.id === selectedId);

  return (
    <div
      style={{
        fontFamily: "'Georgia', serif",
        background: "#12161d",
        color: "#EDEAE3",
        height: "100vh",
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
          padding: "8px 6px 4px",
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
              aria-label="Historique des versions"
              style={{ ...iconBtn, marginLeft: 8 }}
            >
              ⓘ
            </button>
          </span>
          <span style={{ fontSize: 10, color: "#5c6577", fontFamily: "monospace" }}>
            {pointAYear} → {X_NOW} → {X1}
          </span>
        </div>
        <Chart
          historical={historical}
          trueFn={trueFn}
          revealTrue={revealTrue}
          models={models}
          active={active}
          pointAYear={pointAYear}
          yDomain={yDomain}
          curves={curves}
          userFns={userFns}
          selectedId={selectedId}
          selectedPt={selectedPt}
          setSelectedPt={setSelectedPt}
          setCurves={setCurves}
        />
      </div>

      {/* CONTROLS — bottom half, scrollable */}
      <div style={{ flex: "1 1 auto", overflowY: "auto", padding: "10px 12px 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={newSeries} style={btnStyle("#EDEAE3", "#1c222c")}>
            ↻ Nouvelle série
          </button>
          <button
            onClick={() => setRevealTrue((r) => !r)}
            style={btnStyle(revealTrue ? "#12161d" : "#EDEAE3", revealTrue ? "#EDEAE3" : "#1c222c")}
          >
            {revealTrue ? "Masquer la mécanique" : "Révéler la mécanique"}
          </button>
        </div>

        {revealTrue && (
          <div style={{ fontSize: 11, color: "#8A93A3", fontFamily: "monospace", marginBottom: 10 }}>
            mécanique réelle : {hiddenLabel}
          </div>
        )}

        {/* MES COURBES */}
        <SectionTitle>
          Mes courbes
          <button onClick={() => setInfo(info === "user" ? null : "user")} style={iconBtn} aria-label="Explication">ⓘ</button>
        </SectionTitle>
        {info === "user" && <InfoBox>{INFO.user}</InfoBox>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {curves.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#1c222c", borderRadius: 8, padding: "6px 8px",
                border: "1px solid " + (c.id === selectedId ? c.color : "transparent"),
              }}
            >
              <button
                onClick={() => { setSelectedId(c.id); setSelectedPt(null); }}
                style={{ ...plainBtn, display: "flex", alignItems: "center", gap: 6 }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
                <span style={{ fontSize: 11.5, fontFamily: "monospace" }}>{c.name}</span>
              </button>
              <button onClick={() => removeCurve(c.id)} style={iconBtn} aria-label={"Supprimer " + c.name}>✕</button>
            </div>
          ))}
          {curves.length < USER_COLORS.length && (
            <button onClick={addCurve} style={{ ...btnStyle("#EDEAE3", "#1c222c"), flex: "0 0 auto" }}>
              + Ma courbe
            </button>
          )}
        </div>
        {selectedCurve ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 11, fontFamily: "monospace", color: "#8A93A3" }}>
            <span style={{ flex: 1 }}>
              {selectedPt != null
                ? "point " + selectedCurve.points[selectedPt].year.toFixed(0) + " sélectionné"
                : "glisse un point ● · touche le graphique pour en ajouter"}
            </span>
            {selectedPt != null && selectedCurve.points.length > 2 && (
              <button onClick={removeSelectedPoint} style={{ ...btnStyle("#EDEAE3", "#1c222c"), flex: "0 0 auto", padding: "5px 9px" }}>
                Retirer le point
              </button>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#8A93A3", marginBottom: 16 }}>
            Dessine ta propre prédiction, puis compare-la aux méthodes.
          </div>
        )}

        {/* MÉTHODES */}
        <SectionTitle>Méthodes</SectionTitle>
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
                <span style={{ fontSize: 11.5, fontFamily: "monospace", lineHeight: 1.2 }}>{m.label}</span>
              </label>
              <button
                onClick={() => setInfo(info === m.id ? null : m.id)}
                style={{ ...iconBtn, padding: "8px 8px", color: info === m.id ? m.color : "#8A93A3" }}
                aria-label={"Explication : " + m.label}
              >
                ⓘ
              </button>
            </div>
          ))}
        </div>
        {info && INFO[info] && info !== "user" && info !== "score" && <InfoBox>{INFO[info]}</InfoBox>}

        {/* ÉCARTS */}
        {scores.length > 0 && (
          <>
            <SectionTitle>
              Écart moyen
              <button onClick={() => setInfo(info === "score" ? null : "score")} style={iconBtn} aria-label="Explication">ⓘ</button>
            </SectionTitle>
            {info === "score" && <InfoBox>{INFO.score}</InfoBox>}
            <div style={{ fontFamily: "monospace", fontSize: 11.5, marginBottom: 16 }}>
              <div style={{ display: "flex", color: "#5c6577", padding: "0 0 4px" }}>
                <span style={{ flex: 1 }} />
                <span style={{ width: 62, textAlign: "right" }}>passé</span>
                <span style={{ width: 62, textAlign: "right" }}>futur</span>
              </div>
              {scores.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", padding: "3px 0" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, marginRight: 7 }} />
                  <span style={{ flex: 1 }}>
                    {s.label}
                    {bestFuture && bestFuture.id === s.id ? " ★" : ""}
                  </span>
                  <span style={{ width: 62, textAlign: "right" }}>{fmt(s.past)}</span>
                  <span style={{ width: 62, textAlign: "right", color: revealTrue ? "#EDEAE3" : "#5c6577" }}>
                    {revealTrue ? fmt(s.future) : "?"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SliderRow
            label={"Point de référence — année " + pointAYear}
            min={0}
            max={historical.length - 5}
            value={pointAIdx}
            onChange={setPointAIdx}
          />
          <SliderRow
            label={"Mémoire (pondérée) — demi-vie " + halfLife + " ans"}
            min={2}
            max={100}
            value={halfLife}
            onChange={setHalfLife}
            disabled={!active.weighted}
          />
          <SliderRow
            label={"Plafond supposé — ×" + capMultiplier.toFixed(1) + " l'amplitude"}
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
              <span style={{ fontSize: 14, fontWeight: 600 }}>Historique</span>
              <button onClick={() => setShowHistory(false)} style={iconBtn} aria-label="Fermer">✕</button>
            </div>
            {HISTORY.map((h) => (
              <div key={h.v} style={{ marginBottom: 12, fontFamily: "monospace", fontSize: 11.5, lineHeight: 1.45 }}>
                <div style={{ color: "#F2994A" }}>{h.v}{h.date ? " · " + h.date : ""}</div>
                <div style={{ color: "#C9C5BC" }}>{h.text}</div>
              </div>
            ))}
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
  historical, trueFn, revealTrue, models, active, pointAYear, yDomain,
  curves, userFns, selectedId, selectedPt, setSelectedPt, setCurves,
}) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [size, setSize] = useState({ w: 300, h: 200 });
  const drag = useRef(null);
  const tap = useRef(null);

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

  const selectedCurve = curves.find((c) => c.id === selectedId);

  const onPointDown = (e, idx) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: selectedId, idx };
    setSelectedPt(idx);
  };

  const onPointMove = (e) => {
    const dg = drag.current;
    if (!dg) return;
    const { x, y } = local(e);
    setCurves((prev) => prev.map((c) => {
      if (c.id !== dg.id) return c;
      const pts = c.points.slice();
      const prevPt = pts[dg.idx - 1];
      const nextPt = pts[dg.idx + 1];
      const minY = prevPt ? prevPt.year + STEP : X0;
      const maxY = nextPt ? nextPt.year - STEP : X1;
      const year = Math.round(Math.min(maxY, Math.max(minY, ix(x))));
      const value = Math.min(yHi, Math.max(yLo, iy(y)));
      pts[dg.idx] = { year, value };
      return { ...c, points: pts };
    }));
  };

  const onPointUp = () => { drag.current = null; };

  const onBgDown = (e) => {
    const p = local(e);
    tap.current = { ...p, t: Date.now() };
  };

  const onBgUp = (e) => {
    const start = tap.current;
    tap.current = null;
    if (!start || !selectedCurve) return;
    const p = local(e);
    if (Math.hypot(p.x - start.x, p.y - start.y) > 10 || Date.now() - start.t > 500) return;
    const year = Math.round(ix(p.x));
    const value = iy(p.y);
    if (year < X0 || year > X1) return;
    if (selectedCurve.points.some((q) => Math.abs(q.year - year) < 4)) return;
    const pts = [...selectedCurve.points, { year, value }].sort((a, b) => a.year - b.year);
    setCurves((prev) => prev.map((c) => (c.id === selectedCurve.id ? { ...c, points: pts } : c)));
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

        {/* axes et grille */}
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

          <path d={histPath} fill="none" stroke="#EDEAE3" strokeWidth="1.6" />

          {revealTrue && (
            <path d={path(trueFn, X0, X1)} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="2 2" />
          )}

          {METHODS.filter((m) => active[m.id]).map((m) => (
            <g key={m.id}>
              <path d={path(models[m.id], pointAYear, X_NOW)} fill="none" stroke={m.color} strokeWidth="1.8" />
              <path d={path(models[m.id], X_NOW, X1)} fill="none" stroke={m.color} strokeWidth="1.8" strokeDasharray="6 4" />
            </g>
          ))}

          {curves.map((c) => {
            const fn = userFns[c.id];
            const first = c.points[0].year;
            const last = c.points[c.points.length - 1].year;
            const sel = c.id === selectedId;
            return (
              <path
                key={c.id}
                d={path(fn, first, last, 1)}
                fill="none"
                stroke={c.color}
                strokeWidth={sel ? 2.4 : 1.6}
                strokeOpacity={sel ? 1 : 0.6}
              />
            );
          })}
        </g>

        {/* points déplaçables de la courbe sélectionnée */}
        {selectedCurve && selectedCurve.points.map((p, i) => (
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
              fill={i === selectedPt ? selectedCurve.color : "#12161d"}
              stroke={selectedCurve.color} strokeWidth="2"
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
