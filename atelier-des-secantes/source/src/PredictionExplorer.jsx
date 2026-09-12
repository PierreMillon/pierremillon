import React, { useState, useMemo, useCallback } from "react";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

// ---------- math helpers ----------

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
  const startYear = 1826;
  const endYear = 2026;
  const step = 2;
  const n = Math.floor((endYear - startYear) / step) + 1;

  const kind = Math.floor(rand() * 3);
  const base = 20 + rand() * 10;
  const noiseAmp = 0.6 + rand() * 0.8;

  let trueFn;
  let label;
  if (kind === 0) {
    const slope = 0.01 + rand() * 0.02;
    trueFn = (t) => base + slope * (t - startYear);
    label = "tendance linéaire";
  } else if (kind === 1) {
    const k = 0.008 + rand() * 0.01;
    trueFn = (t) => base + Math.exp(k * (t - startYear)) * 0.4;
    label = "tendance accélérante, sans plafond connu";
  } else {
    const L = 6 + rand() * 6;
    const k = 0.03 + rand() * 0.02;
    const t0 = startYear + 90 + rand() * 60;
    trueFn = (t) => base + L / (1 + Math.exp(-k * (t - t0)));
    label = "tendance plafonnée (un « L » caché existe)";
  }

  const pts = [];
  for (let i = 0; i < n; i++) {
    const year = startYear + i * step;
    const trueVal = trueFn(year);
    const noise = (rand() - 0.5) * 2 * noiseAmp;
    pts.push({ year, value: trueVal + noise, trueVal });
  }
  return { pts, label };
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

// ---------- component ----------

const METHODS = [
  { id: "secant", label: "Sécante (2 points)", color: "#5AA9E6" },
  { id: "linreg", label: "Régression linéaire", color: "#6FCF97" },
  { id: "weighted", label: "Pondérée (récent > ancien)", color: "#BB86FC" },
  { id: "sigmoid", label: "Logistique (plafond L)", color: "#F2994A" },
];

export default function PredictionExplorer() {
  const [seed, setSeed] = useState(7);
  const [pointAIdx, setPointAIdx] = useState(0);
  const [halfLife, setHalfLife] = useState(20);
  const [capMultiplier, setCapMultiplier] = useState(1.6);
  const [active, setActive] = useState({
    secant: true, linreg: false, weighted: false, sigmoid: false,
  });
  const [revealTrue, setRevealTrue] = useState(false);

  const { pts: historical, label: hiddenLabel } = useMemo(
    () => generateSeries(seed),
    [seed]
  );

  const currentYear = historical[historical.length - 1].year;
  const futureEnd = currentYear + 100;
  const step = 2;

  const pointAYear = historical[pointAIdx].year;
  const fitRange = useMemo(
    () => historical.filter((p) => p.year >= pointAYear),
    [historical, pointAYear]
  );

  const models = useMemo(() => {
    const currentVal = historical[historical.length - 1].value;
    const aVal = historical[pointAIdx].value;
    const out = {};

    const secSlope = (currentVal - aVal) / (currentYear - pointAYear || 1);
    out.secant = (t) => currentVal + secSlope * (t - currentYear);

    const lr_ = linreg(fitRange);
    out.linreg = (t) => lr_.intercept + lr_.slope * t;

    const wr_ = weightedLinreg(fitRange, currentYear, halfLife);
    out.weighted = (t) => wr_.intercept + wr_.slope * t;

    const maxVal = Math.max(...fitRange.map((p) => p.value));
    const minVal = Math.min(...fitRange.map((p) => p.value));
    const L = (maxVal - minVal) * capMultiplier + 0.5;
    out.sigmoid = fitLogistic(fitRange, L);

    return out;
  }, [historical, pointAIdx, pointAYear, currentYear, fitRange, halfLife, capMultiplier]);

  const chartData = useMemo(() => {
    const rows = [];
    for (let year = 1826; year <= futureEnd; year += step) {
      const histPoint = historical.find((p) => Math.abs(p.year - year) < 0.01);
      const row = { year };
      row.historical = histPoint ? histPoint.value : null;
      row.trueVal = revealTrue && histPoint ? histPoint.trueVal : null;

      METHODS.forEach((m) => {
        const inFitRange = year >= pointAYear && year <= currentYear;
        const inForecast = year >= currentYear && year <= futureEnd;
        row[m.id + "_fit"] = active[m.id] && inFitRange ? models[m.id](year) : null;
        row[m.id + "_forecast"] = active[m.id] && inForecast ? models[m.id](year) : null;
      });
      rows.push(row);
    }
    return rows;
  }, [historical, futureEnd, pointAYear, currentYear, active, models, revealTrue]);

  const toggle = useCallback((id) => {
    setActive((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // build line elements as a flat array (not wrapped in Fragments) so Recharts sees them directly
  const methodLines = [];
  METHODS.forEach((m) => {
    if (!active[m.id]) return;
    methodLines.push(
      <Line
        key={m.id + "-fit"}
        type="monotone"
        dataKey={m.id + "_fit"}
        stroke={m.color}
        strokeWidth={1.8}
        dot={false}
        isAnimationActive={false}
        connectNulls
      />
    );
    methodLines.push(
      <Line
        key={m.id + "-forecast"}
        type="monotone"
        dataKey={m.id + "_forecast"}
        stroke={m.color}
        strokeWidth={1.8}
        strokeDasharray="6 4"
        dot={false}
        isAnimationActive={false}
        connectNulls
      />
    );
  });

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
          padding: "8px 6px 0",
          borderBottom: "1px solid #2a313d",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 8px 4px" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>L'atelier des sécantes</span>
          <span style={{ fontSize: 10, color: "#5c6577", fontFamily: "monospace" }}>
            {pointAYear} → {currentYear} → {futureEnd}
          </span>
        </div>
        <ResponsiveContainer width="100%" height="88%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 10, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#2a313d" strokeDasharray="2 4" />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1826, "dataMax"]}
              tick={{ fill: "#8A93A3", fontSize: 9, fontFamily: "monospace" }}
              stroke="#3a4250"
              tickCount={6}
            />
            <YAxis
              tick={{ fill: "#8A93A3", fontSize: 9, fontFamily: "monospace" }}
              stroke="#3a4250"
              width={34}
            />
            <Tooltip
              contentStyle={{
                background: "#0f131a",
                border: "1px solid #3a4250",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "monospace",
              }}
              labelStyle={{ color: "#EDEAE3" }}
            />
            <ReferenceLine x={currentYear} stroke="#5c6577" strokeDasharray="3 3" />
            <ReferenceLine x={pointAYear} stroke="#5c6577" strokeDasharray="1 3" />

            <Line
              type="monotone"
              dataKey="historical"
              stroke="#EDEAE3"
              strokeWidth={1.6}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
            {revealTrue && (
              <Line
                type="monotone"
                dataKey="trueVal"
                stroke="#ffffff"
                strokeOpacity={0.5}
                strokeWidth={1.2}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            )}
            {methodLines}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* CONTROLS — bottom half, scrollable */}
      <div style={{ flex: "1 1 auto", overflowY: "auto", padding: "10px 12px 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={() => setSeed((s) => s + 1)} style={btnStyle("#EDEAE3", "#1c222c")}>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {METHODS.map((m) => (
            <label
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "#1c222c",
                borderRadius: 8,
                padding: "8px 9px",
                cursor: "pointer",
                border: active[m.id] ? "1px solid " + m.color : "1px solid transparent",
              }}
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
          ))}
        </div>

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
