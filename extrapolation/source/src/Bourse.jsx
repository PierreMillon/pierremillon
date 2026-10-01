import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  linreg, weightedLinreg, iconBtn, btnStyle, SliderRow, SectionTitle, InfoBox, niceTicks, M,
} from "./PredictionExplorer.jsx";
import MARKETS from "./data/markets.json";
import BTC from "./data/btc.json";

// ---------- données ----------

const DAY = 86400000;
const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10);

// Bitcoin intégré : un cours par jour, sans trou, depuis BTC.start
const BTC_BASE = BTC.vals.map((v, i) => [isoDay(Date.parse(BTC.start) + i * DAY), v]);
const LIVE_KEY = "extrapolation_btc_live";

function loadLive() {
  try {
    const raw = JSON.parse(localStorage.getItem(LIVE_KEY) || "null");
    if (!raw || !Array.isArray(raw.pts) || raw.pts.length > 5000) return null;
    const pts = raw.pts.filter((p) => Array.isArray(p) && /^\d{4}-\d{2}-\d{2}$/.test(p[0])
      && typeof p[1] === "number" && isFinite(p[1]) && p[1] > 0);
    return { pts, source: typeof raw.source === "string" ? raw.source.slice(0, 40) : "", at: Number(raw.at) || 0 };
  } catch (e) { return null; }
}

// Complète l'historique intégré jusqu'à hier : Binance, sinon CoinGecko.
// Seuls des nombres sont lus dans les réponses.
async function fetchLive(lastDate) {
  const from = Date.parse(lastDate) + DAY;
  const today = Date.parse(isoDay(Date.now()));
  if (from >= today) return { pts: [], source: "" };
  try {
    const pts = [];
    let start = from;
    for (let guard = 0; guard < 6 && start < today; guard++) {
      const url = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=1000&startTime=" + start;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("binance " + res.status);
      const rows = await res.json();
      if (!Array.isArray(rows) || !rows.length) break;
      for (const r of rows) {
        const t = Number(r[0]);
        const close = Number(r[4]);
        if (isFinite(t) && t < today && isFinite(close) && close > 0) pts.push([isoDay(t), close]);
      }
      start = Number(rows[rows.length - 1][0]) + DAY;
    }
    if (pts.length) return { pts, source: "Binance BTCUSDT" };
  } catch (e) { /* on tente la source suivante */ }
  const days = Math.min(365, Math.ceil((today - from) / DAY) + 2);
  const res = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&interval=daily&days=" + days, { cache: "no-store" });
  if (!res.ok) throw new Error("coingecko " + res.status);
  const j = await res.json();
  const seen = new Set();
  const pts = [];
  for (const r of (j && Array.isArray(j.prices) ? j.prices : [])) {
    const t = Number(r[0]);
    const v = Number(r[1]);
    const d = isoDay(t);
    if (isFinite(t) && t >= from && t < today && isFinite(v) && v > 0 && !seen.has(d)) { seen.add(d); pts.push([d, v]); }
  }
  return { pts, source: "CoinGecko" };
}

// jour → semaine / mois : dernier cours de chaque période
function resample(pts, freq) {
  if (freq === "D") return pts;
  const out = [];
  const key = (d) => {
    if (freq === "M") return d.slice(0, 7);
    const t = Date.parse(d);
    return Math.floor((t / DAY + 3) / 7); // semaines lundi → dimanche
  };
  for (let i = 0; i < pts.length; i++) {
    const last = i === pts.length - 1 || key(pts[i + 1][0]) !== key(pts[i][0]);
    if (last) out.push(freq === "M" ? [pts[i][0].slice(0, 7), pts[i][1]] : pts[i]);
  }
  return out;
}

// ---------- méthodes : prédire les h pas suivants ----------

const BM = [
  { id: "naive", color: "#EDEAE3" },
  { id: "linreg", color: "#6FCF97" },
  { id: "weighted", color: "#BB86FC" },
  { id: "mean", color: "#F2994A" },
  { id: "holt", color: "#56CCF2" },
  { id: "momentum", color: "#5AA9E6" },
  { id: "cross", color: "#F2C94C" },
  { id: "ar", color: "#EB5757" },
];
const USER_COLOR = "#FF6B8B";
const CAPITAL = 10000;
const FEE = 0.001; // 0,1 % du montant échangé

// résout A x = b (3×3 au plus), null si singulier
function solve(A, b) {
  const n = b.length;
  const m = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
    if (Math.abs(m[p][c]) < 1e-12) return null;
    [m[c], m[p]] = [m[p], m[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = m[r][c] / m[c][c];
      for (let k = c; k <= n; k++) m[r][k] -= f * m[c][k];
    }
  }
  return m.map((row, i) => row[n] / row[i]);
}

// Renvoie, pour chaque méthode, un tableau de h prédictions (pas 1..h).
function predictAll(vals, k, W, H, log, h) {
  const f = log ? Math.log : (x) => x;
  const g = log ? Math.exp : (x) => x;
  const win = [];
  for (let i = Math.max(0, k - W + 1); i <= k; i++) win.push({ year: i, value: f(vals[i]) });
  const n = win.length;
  const y = win.map((p) => p.value);
  const last = y[n - 1];
  const steps = Array.from({ length: h }, (_, j) => j + 1);
  const line = (a, b) => steps.map((j) => g(a + b * (k + j)));
  const flat = (v) => steps.map(() => g(v));
  const out = {};

  out.naive = steps.map(() => vals[k]);

  const lr = linreg(win);
  out.linreg = line(lr.intercept, lr.slope);
  const wr = weightedLinreg(win, k, H);
  out.weighted = line(wr.intercept, wr.slope);

  out.mean = flat(y.reduce((s, v) => s + v, 0) / n);

  // Holt : niveau + tendance lissés exponentiellement
  // départ : droite des moindres carrés sur la première moitié de la
  // fenêtre (une seule différence serait trop bruitée)
  const alpha = 2 / (n + 1);
  const beta = alpha;
  const half = win.slice(0, Math.max(2, Math.ceil(n / 2)));
  const h0 = linreg(half);
  let L = h0.intercept + h0.slope * win[0].year;
  let T = h0.slope;
  for (let i = 1; i < n; i++) {
    const L0 = L;
    L = alpha * y[i] + (1 - alpha) * (L + T);
    T = beta * (L - L0) + (1 - beta) * T;
  }
  out.holt = steps.map((j) => g(L + j * T));

  // momentum : la variation moyenne de la fenêtre continue
  const mom = n > 1 ? (last - y[0]) / (n - 1) : 0;
  out.momentum = steps.map((j) => g(last + j * mom));

  // moyennes croisées : pente entre le centre de la moyenne courte et
  // celui de la longue
  const ns = Math.max(2, Math.round(n / 4));
  const maS = y.slice(n - ns).reduce((s, v) => s + v, 0) / ns;
  const maL = y.reduce((s, v) => s + v, 0) / n;
  const gap = (n - ns) / 2 || 1;
  const cross = (maS - maL) / gap;
  out.cross = steps.map((j) => g(last + j * cross));

  // AR(2) sur les variations : d_t = c + φ1 d_(t-1) + φ2 d_(t-2)
  const d = [];
  for (let i = 1; i < n; i++) d.push(y[i] - y[i - 1]);
  let ar = null;
  if (d.length >= 6) {
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const b = [0, 0, 0];
    for (let i = 2; i < d.length; i++) {
      const x = [1, d[i - 1], d[i - 2]];
      for (let r = 0; r < 3; r++) {
        b[r] += x[r] * d[i];
        for (let c = 0; c < 3; c++) A[r][c] += x[r] * x[c];
      }
    }
    ar = solve(A, b);
  }
  if (ar && ar.every(isFinite)) {
    let d1 = d[d.length - 1];
    let d2 = d[d.length - 2];
    let v = last;
    out.ar = steps.map(() => {
      const dn = ar[0] + ar[1] * d1 + ar[2] * d2;
      d2 = d1; d1 = dn; v += dn;
      return g(v);
    });
  } else {
    out.ar = out.naive.slice();
  }
  return out;
}

// ---------- scores ----------

// Une manche : erreur moyenne en % sur les h pas, sens (à l'horizon h),
// et rendement d'une position acheteuse (+1) ou vendeuse à découvert (−1)
// prise selon le sens prédit.
function roundScore(pred, prev, actual) {
  const h = actual.length;
  let err = 0;
  for (let j = 0; j < h; j++) err += Math.abs(pred[j] - actual[j]) / actual[j];
  err = (err / h) * 100;
  const dp = pred[h - 1] - prev;
  const da = actual[h - 1] - prev;
  const pos = Math.abs(dp) < 1e-9 * Math.abs(prev) ? 0 : Math.sign(dp);
  const dir = pos === 0 || da === 0 ? null : pos === Math.sign(da);
  return { err, dir, pos, ret: actual[h - 1] / prev - 1 };
}

// Suit un capital de 10 000 $ manche après manche ; frais de 0,1 % du
// montant échangé à chaque changement de position.
function summarize(list) {
  if (!list.length) return { err: null, dir: null, capital: CAPITAL, n: 0 };
  let cap = CAPITAL;
  let pos = 0;
  for (const r of list) {
    cap -= cap * FEE * Math.abs(r.pos - pos);
    pos = r.pos;
    cap *= 1 + pos * r.ret;
    if (cap < 0) cap = 0;
  }
  const d = list.filter((r) => r.dir !== null);
  return {
    err: list.reduce((s, r) => s + r.err, 0) / list.length,
    dir: d.length ? (d.filter((r) => r.dir).length / d.length) * 100 : null,
    capital: cap,
    n: list.length,
  };
}

function holdCapital(list) {
  return summarize(list.map((r) => ({ ...r, pos: 1 }))).capital;
}

// ---------- jeu : deviner la hauteur d'un point ----------

// proximité : 100 % = pile sur le vrai cours, −1 point par % d'écart
function proximity(guess, actual) {
  return Math.max(0, 100 - (Math.abs(guess - actual) / actual) * 100);
}

// ---------- textes ----------

const BT = {
  fr: {
    m: {
      naive: "Naïf (= dernier cours)",
      linreg: "Régression linéaire",
      weighted: "Pondérée",
      mean: "Moyenne mobile",
      holt: "Lissage exponentiel",
      momentum: "Momentum",
      cross: "Moyennes croisées",
      ar: "Autorégression AR(2)",
      user: "Toi",
      hold: "Acheter et garder",
    },
    info: {
      intro:
        "Le cours s'arrête, puis un repère « ? » apparaît plus loin dans le temps. Touche le graphique à la hauteur où tu penses que sera le cours à ce moment-là (tu peux glisser avant de lâcher). Le vrai cours apparaît, avec ta proximité en % : 100 % = pile dessus, 90 % = 10 % d'écart.",
      naive:
        "Le cours au repère = le dernier cours affiché. Ça a l'air bête, mais sur un marché c'est la référence la plus dure à battre.",
      linreg:
        "Droite des moindres carrés sur la fenêtre, prolongée jusqu'au repère. Moyenne le bruit, mais réagit lentement à un retournement.",
      weighted:
        "Régression où les points récents pèsent plus (demi-vie réglable). Suit un retournement plus vite, au prix de plus de bruit.",
      mean:
        "Moyenne des cours de la fenêtre. Suppose que le prix revient vers sa moyenne (« retour à la moyenne ») : l'inverse d'une tendance.",
      holt:
        "Lissage exponentiel de Holt : un niveau et une pente, mis à jour à chaque pas en donnant plus de poids au récent (α = β = 2 / (fenêtre + 1), départ calé sur la première moitié de la fenêtre). La prévision prolonge le dernier niveau avec la dernière pente.",
      momentum:
        "« Ce qui a monté continue de monter » : la variation moyenne sur la fenêtre est prolongée. C'est exactement la sécante entre le premier et le dernier point de la fenêtre.",
      cross:
        "Moyenne courte (¼ de la fenêtre) contre moyenne longue (toute la fenêtre). Courte au-dessus de la longue = signal de hausse. La pente prévue est l'écart entre les deux, divisé par la distance entre leurs centres.",
      ar:
        "Autorégression d'ordre 2 : la prochaine variation est prédite à partir des deux précédentes, par moindres carrés sur la fenêtre (d = c + φ₁·d₋₁ + φ₂·d₋₂). La brique de base des modèles ARIMA.",
      log:
        "Les méthodes travaillent sur le logarithme du prix : une tendance devient une croissance en pourcentage plutôt qu'en valeur. Plus naturel pour un prix qui se compose, surtout Bitcoin.",
      backtest:
        "Chaque méthode est rejouée sur toute la série, sans jamais voir le futur (test « walk-forward »), avec l'écart maximum comme horizon. Erreur moyenne, sens juste, et fonds fictif de 10 000 $ (achat ou vente à découvert selon le sens prédit, 0,1 % de frais) face à « acheter et garder ».",
      data:
        "Historique Bitcoin intégré (Coin Metrics, jusqu'au 23/05/2026), complété en direct jusqu'à hier depuis Binance (ou CoinGecko) quand le téléphone a du réseau. Sans réseau, la page marche avec l'historique intégré. S&P 500 : mensuel uniquement (Robert Shiller).",
      paste:
        "Colle une colonne de cours (un par ligne, du plus ancien au plus récent). Une date devant est acceptée : « 2024-01, 123.4 » ou « 02/01/2024;123,4 ». Seuls les nombres sont lus.",
    },
    freq: { D: "Jour", W: "Semaine", M: "Mois" },
    unit: { D: "j", W: "sem.", M: "mois" },
    custom: "Mes valeurs (collées)",
    paste: "Coller",
    pasteOk: "Utiliser",
    pasteCancel: "Annuler",
    pasteErr: "Il faut au moins 30 nombres positifs.",
    tap: "touche la hauteur du « ? »",
    next: "Suivant →",
    replay: "↻ Nouvelle partie",
    roundOf: (i, n) => "Point " + i + " / " + n,
    finished: "Partie terminée",
    rounds: "Points par partie",
    gap: (g, u) => "Écart jusqu'à — " + g + " " + u,
    later: (g, u) => "+" + g + " " + u,
    window: (w, u) => "Fenêtre (méthodes) — " + w + " " + u,
    halfLife: (h, u) => "Demi-vie (pondérée) — " + h + " " + u,
    visible: (v, u) => "Affichés — " + v + " " + u,
    logLabel: "Calcul en % (logarithme)",
    proxi: "proximité",
    you: "Toi",
    average: "Moyenne",
    compare: "Les méthodes, au même repère",
    methods: "Méthodes (pour le test)",
    backtest: "Tester sur toute la série",
    backtestTitle: (n) => "Test sur " + n + " prédictions",
    err: "erreur",
    dir: "sens",
    cap: "fonds",
    beats: "> naïf",
    update: "↻ Mettre à jour",
    dataUntil: (d, s) => "données jusqu'au " + d + " · " + s,
    loading: "mise à jour…",
    offline: "hors ligne : historique intégré",
    source: "Sources : ",
    disclaimer: "Outil pour apprendre, pas un conseil d'investissement. Les performances passées ne préjugent pas des performances futures.",
    actual: "réel",
    beatNaive: "Tu fais mieux que « rien ne bouge » ✓",
    lostNaive: "« Rien ne bouge » fait mieux que toi : normal, c'est la référence la plus dure à battre.",
  },
  en: {
    m: {
      naive: "Naive (= last price)",
      linreg: "Linear regression",
      weighted: "Weighted",
      mean: "Moving average",
      holt: "Exponential smoothing",
      momentum: "Momentum",
      cross: "Moving-average cross",
      ar: "Autoregression AR(2)",
      user: "You",
      hold: "Buy and hold",
    },
    info: {
      intro:
        "The price stops, then a « ? » marker appears further in time. Tap the chart at the height where you think the price will be at that moment (you can drag before letting go). The real price appears, with your closeness in %: 100% = spot on, 90% = 10% off.",
      naive:
        "Price at the marker = last price shown. Looks silly, but on a market it is the hardest benchmark to beat.",
      linreg:
        "Least-squares line over the window, extended to the marker. Averages out noise, but reacts slowly to a reversal.",
      weighted:
        "Regression where recent points weigh more (adjustable half-life). Follows a reversal faster, at the cost of more noise.",
      mean:
        "Average price over the window. Assumes the price returns to its average (« mean reversion »): the opposite of a trend.",
      holt:
        "Holt's exponential smoothing: a level and a slope, updated at every step with more weight on recent data (α = β = 2 / (window + 1), started from the first half of the window). The forecast extends the last level with the last slope.",
      momentum:
        "« What went up keeps going up »: the average change over the window is extended. It is exactly the secant between the first and last points of the window.",
      cross:
        "Short average (¼ of the window) against long average (whole window). Short above long = rising signal. The forecast slope is the gap between them divided by the distance between their centres.",
      ar:
        "Order-2 autoregression: the next change is predicted from the two previous ones, by least squares over the window (d = c + φ₁·d₋₁ + φ₂·d₋₂). The basic building block of ARIMA models.",
      log:
        "The methods work on the logarithm of the price: a trend becomes a percentage growth rather than an amount. More natural for a compounding price, especially Bitcoin.",
      backtest:
        "Each method is replayed over the whole series, never seeing the future (a « walk-forward » test), with the maximum gap as horizon. Mean error, right direction, and a virtual $10,000 fund (long or short depending on the predicted direction, 0.1% fees) against « buy and hold ».",
      data:
        "Built-in Bitcoin history (Coin Metrics, up to 23/05/2026), topped up live to yesterday from Binance (or CoinGecko) when the phone is online. Offline, the page runs on the built-in history. S&P 500: monthly only (Robert Shiller).",
      paste:
        "Paste a column of prices (one per line, oldest first). A leading date is accepted: « 2024-01, 123.4 » or « 02/01/2024;123,4 ». Only numbers are read.",
    },
    freq: { D: "Day", W: "Week", M: "Month" },
    unit: { D: "d", W: "wk", M: "mo" },
    custom: "My values (pasted)",
    paste: "Paste",
    pasteOk: "Use",
    pasteCancel: "Cancel",
    pasteErr: "At least 30 positive numbers are needed.",
    tap: "tap the height of the « ? »",
    next: "Next →",
    replay: "↻ New game",
    roundOf: (i, n) => "Point " + i + " / " + n,
    finished: "Game over",
    rounds: "Points per game",
    gap: (g, u) => "Gap up to — " + g + " " + u,
    later: (g, u) => "+" + g + " " + u,
    window: (w, u) => "Window (methods) — " + w + " " + u,
    halfLife: (h, u) => "Half-life (weighted) — " + h + " " + u,
    visible: (v, u) => "Shown — " + v + " " + u,
    logLabel: "Compute in % (logarithm)",
    proxi: "closeness",
    you: "You",
    average: "Average",
    compare: "The methods, at the same marker",
    methods: "Methods (for the test)",
    backtest: "Test on the whole series",
    backtestTitle: (n) => "Test over " + n + " predictions",
    err: "error",
    dir: "dir.",
    cap: "fund",
    beats: "> naive",
    update: "↻ Update",
    dataUntil: (d, s) => "data up to " + d + " · " + s,
    loading: "updating…",
    offline: "offline: built-in history",
    source: "Sources: ",
    disclaimer: "A learning tool, not investment advice. Past performance does not predict future performance.",
    actual: "actual",
    beatNaive: "You beat « nothing moves » ✓",
    lostNaive: "« Nothing moves » beats you: normal, it is the hardest benchmark to beat.",
  },
};

// ---------- valeurs collées ----------

function parsePasted(text) {
  const out = [];
  const lines = String(text).split(/\r?\n/).slice(0, 5000);
  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    let tokens = l.split(/[;\t]+|\s+/).filter(Boolean);
    if (tokens.length === 1 && l.includes(",") && !/^\d+,\d+$/.test(l)) tokens = l.split(",");
    const last = tokens[tokens.length - 1].replace(",", ".").replace(/[^\d.eE+-]/g, "");
    const v = Number(last);
    if (!isFinite(v) || v <= 0) continue;
    const label = tokens.length > 1 ? tokens[0].slice(0, 12).replace(/[^\w\-/.]/g, "") : String(out.length + 1);
    out.push([label, v]);
  }
  return out;
}

// ---------- sauvegarde ----------

const SAVE_KEY = "extrapolation_bourse3";

function loadSaved() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch (e) { raw = null; }
  if (!raw || typeof raw !== "object") raw = {};
  const num = (v, lo, hi, d) => (typeof v === "number" && isFinite(v) && v >= lo && v <= hi ? Math.round(v) : d);
  const active = { naive: true, linreg: true, weighted: false, mean: false, holt: true, momentum: true, cross: false, ar: false };
  if (raw.active && typeof raw.active === "object") {
    BM.forEach((m) => { if (typeof raw.active[m.id] === "boolean") active[m.id] = raw.active[m.id]; });
  }
  let custom = null;
  if (Array.isArray(raw.custom) && raw.custom.length >= 30 && raw.custom.length <= 5000) {
    const pts = raw.custom.filter((p) => Array.isArray(p) && typeof p[0] === "string" && typeof p[1] === "number" && isFinite(p[1]) && p[1] > 0)
      .map((p) => [p[0].slice(0, 12), p[1]]);
    if (pts.length >= 30) custom = pts;
  }
  const ids = ["btc", "sp500"].concat(custom ? ["custom"] : []);
  return {
    seriesId: ids.includes(raw.seriesId) ? raw.seriesId : "btc",
    freq: ["D", "W", "M"].includes(raw.freq) ? raw.freq : "W",
    G: num(raw.G, 1, 24, 8),
    W: num(raw.W, 3, 120, 20),
    H: num(raw.H, 1, 120, 8),
    V: num(raw.V, 12, 365, 60),
    N: [10, 25, 50].includes(raw.N) ? raw.N : 10,
    log: raw.log !== false,
    active,
    custom,
  };
}

// ---------- composant ----------

export default function Bourse({ lang }) {
  const saved = useMemo(loadSaved, []);
  const [seriesId, setSeriesId] = useState(saved.seriesId);
  const [freq, setFreq] = useState(saved.freq);
  const [custom, setCustom] = useState(saved.custom);
  const [G, setG] = useState(saved.G);
  const [W, setW] = useState(saved.W);
  const [HL, setHL] = useState(saved.H);
  const [V, setV] = useState(saved.V);
  const [N, setN] = useState(saved.N);
  const [log, setLog] = useState(saved.log);
  const [active, setActive] = useState(saved.active);
  const [live, setLive] = useState(loadLive);
  const [liveState, setLiveState] = useState("idle");
  const [round, setRound] = useState(null); // { k, gap }
  const [guess, setGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]); // une ligne par point joué
  const [info, setInfo] = useState("intro");
  const [pasting, setPasting] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteErr, setPasteErr] = useState(false);
  const [backtest, setBacktest] = useState(null);
  const t = BT[lang];

  // ----- série affichée -----
  const effFreq = seriesId === "btc" ? freq : "M";
  const btcDaily = useMemo(() => {
    if (!live || !live.pts.length) return BTC_BASE;
    const lastBase = BTC_BASE[BTC_BASE.length - 1][0];
    return BTC_BASE.concat(live.pts.filter((p) => p[0] > lastBase));
  }, [live]);
  const pts = useMemo(() => {
    if (seriesId === "custom" && custom) return custom;
    if (seriesId === "sp500") return MARKETS.find((m) => m.id === "sp500").pts;
    return resample(btcDaily, freq);
  }, [seriesId, custom, btcDaily, freq]);
  const vals = useMemo(() => pts.map((p) => p[1]), [pts]);
  const labels = useMemo(() => pts.map((p) => p[0]), [pts]);
  const n = vals.length;
  const u = t.unit[effFreq];
  const btcLast = btcDaily[btcDaily.length - 1][0];

  // ----- mise à jour en direct (Bitcoin), au plus toutes les 6 h -----
  const updateLive = async (force) => {
    if (liveState === "loading") return;
    if (!force && live && Date.now() - live.at < 6 * 3600 * 1000) return;
    setLiveState("loading");
    try {
      const got = await fetchLive(BTC_BASE[BTC_BASE.length - 1][0]);
      const merged = { pts: got.pts.length ? got.pts : (live ? live.pts : []), source: got.source || (live ? live.source : ""), at: Date.now() };
      setLive(merged);
      try { localStorage.setItem(LIVE_KEY, JSON.stringify(merged)); } catch (e) { /* ignore */ }
      setLiveState("idle");
    } catch (e) {
      setLiveState("error");
    }
  };
  useEffect(() => {
    if (seriesId === "btc") updateLive(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesId]);

  // ----- partie : chaque point = une date et un écart tirés au hasard -----
  const randomRound = () => {
    const gap = 1 + Math.floor(Math.random() * G);
    const lo = Math.min(n - 1 - gap, Math.max(W + 2, Math.min(V, n - 1 - gap)));
    const hi = n - 1 - gap;
    const k = lo + Math.floor(Math.random() * Math.max(1, hi - lo + 1));
    return { k: Math.max(1, Math.min(k, n - 1 - gap)), gap: Math.max(1, Math.min(gap, n - 2)) };
  };
  const newGame = () => {
    setRound(randomRound());
    setResults([]);
    setGuess(null);
    setRevealed(false);
  };
  const nextPoint = () => {
    setRound(randomRound());
    setGuess(null);
    setRevealed(false);
  };

  useEffect(() => {
    newGame();
    setBacktest(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesId, effFreq, custom, G, N]);

  useEffect(() => { setBacktest(null); }, [W, HL, log, btcDaily]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ seriesId, freq, G, W, H: HL, V, N, log, active, custom }));
    } catch (e) { /* ignore */ }
  }, [seriesId, freq, G, W, HL, V, N, log, active, custom]);

  const rd = round || { k: Math.max(1, n - 2), gap: 1 };
  const k = Math.min(rd.k, n - 1 - rd.gap);
  const gap = rd.gap;
  const actual = vals[k + gap];
  const preds = useMemo(() => predictAll(vals, k, W, HL, log, gap), [vals, k, W, HL, log, gap]);
  const finished = results.length >= N;

  // le doigt se lève : on fige la réponse et on révèle
  const commit = (g) => {
    if (revealed || finished) return;
    const row = { user: proximity(g, actual) };
    BM.forEach((m) => { row[m.id] = proximity(preds[m.id][gap - 1], actual); });
    setGuess(g);
    if (info === "intro") setInfo(null);
    setResults((r) => [...r, row]);
    setRevealed(true);
  };

  const avg = useMemo(() => {
    const out = {};
    ["user", ...BM.map((m) => m.id)].forEach((id) => {
      out[id] = results.length ? results.reduce((s, r) => s + r[id], 0) / results.length : null;
    });
    return out;
  }, [results]);

  const runBacktest = () => {
    const lists = {};
    BM.forEach((m) => { lists[m.id] = []; });
    for (let i = Math.max(2, W - 1); i + G <= n - 1; i += G) {
      const p = predictAll(vals, i, W, HL, log, G);
      const act = vals.slice(i + 1, i + 1 + G);
      BM.forEach((m) => lists[m.id].push(roundScore(p[m.id], vals[i], act)));
    }
    const rows = {};
    BM.forEach((m) => { rows[m.id] = summarize(lists[m.id]); });
    rows.hold = { err: null, dir: null, capital: holdCapital(lists.naive), n: lists.naive.length };
    setBacktest({ n: lists.naive.length, rows });
  };

  const usePasted = () => {
    const p = parsePasted(pasteText);
    if (p.length < 30) { setPasteErr(true); return; }
    setCustom(p);
    setSeriesId("custom");
    setPasting(false);
    setPasteErr(false);
  };

  const last = results[results.length - 1];
  const selStyle = { ...btnStyle("#EDEAE3", "#1c222c"), appearance: "none", WebkitAppearance: "none", padding: "7px 8px" };

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#12161d", color: "#EDEAE3", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* GRAPHIQUE */}
      <div style={{ flex: "0 0 48%", background: "#1c222c", padding: "4px 6px 4px", borderBottom: "1px solid #2a313d", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 8px 4px", fontFamily: "monospace", fontSize: 10, color: "#5c6577" }}>
          <span style={{ color: "#8A93A3" }}>{t.roundOf(Math.min(results.length + (revealed ? 0 : 1), N), N)}</span>
          <span>{revealed ? labels[k] + " → " + labels[k + gap] : t.later(gap, u)}</span>
        </div>
        <MarketChart
          vals={vals}
          labels={labels}
          k={k}
          gap={gap}
          G={G}
          V={V}
          guess={guess}
          setGuess={setGuess}
          commit={commit}
          revealed={revealed}
          hint={t.tap}
          laterLabel={t.later(gap, u)}
        />
      </div>

      {/* RÉSULTAT + CONTRÔLES */}
      <div className="scroll" style={{ flex: "1 1 auto", overflowY: "auto", overscrollBehavior: "contain", padding: "10px 12px max(24px, env(safe-area-inset-bottom))" }}>
        {revealed && last ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "monospace", fontSize: 30, color: proxColor(last.user), lineHeight: 1 }}>
                {last.user.toFixed(1)} %
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#8A93A3", marginTop: 4 }}>
                {t.proxi} · {t.actual} {fmtPrice(actual)} · {t.you.toLowerCase()} {fmtPrice(guess)}
              </div>
            </div>
            {finished ? (
              <button onClick={newGame} style={{ ...btnStyle("#12161d", "#EDEAE3"), flex: "0 0 auto" }}>{t.replay}</button>
            ) : (
              <button onClick={nextPoint} style={{ ...btnStyle("#12161d", "#EDEAE3"), flex: "0 0 auto", padding: "10px 16px" }}>{t.next}</button>
            )}
          </div>
        ) : (
          info === "intro" && <InfoBox>{t.info.intro}</InfoBox>
        )}

        {finished && (
          <div style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 12, color: "#EDEAE3" }}>
            <div style={{ fontSize: 13, marginBottom: 4 }}>{t.finished}</div>
            <div>{t.m.user} : {avg.user.toFixed(1)} % {t.average.toLowerCase()}</div>
            <div style={{ color: "#8A93A3" }}>{t.m.naive} : {avg.naive.toFixed(1)} %</div>
            <div style={{ color: avg.user > avg.naive ? "#6FCF97" : "#EB5757", marginTop: 4 }}>
              {avg.user > avg.naive ? t.beatNaive : t.lostNaive}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
          <select value={seriesId} onChange={(e) => setSeriesId(e.target.value)} aria-label="série" style={{ ...selStyle, flex: 1 }}>
            <option value="btc">Bitcoin (BTC)</option>
            <option value="sp500">S&P 500</option>
            {custom && <option value="custom">{t.custom}</option>}
          </select>
          <select
            value={effFreq}
            onChange={(e) => setFreq(e.target.value)}
            disabled={seriesId !== "btc"}
            aria-label="pas"
            style={{ ...selStyle, flex: "0 0 auto", opacity: seriesId !== "btc" ? 0.5 : 1 }}
          >
            {["D", "W", "M"].map((f) => <option key={f} value={f}>{t.freq[f]}</option>)}
          </select>
          <button onClick={() => { setPasting(!pasting); setPasteErr(false); }} style={{ ...selStyle, flex: "0 0 auto" }}>{t.paste}</button>
          <button onClick={() => setInfo(info === "intro" ? null : "intro")} style={iconBtn} aria-label="ⓘ">ⓘ</button>
        </div>
        {revealed && info === "intro" && <InfoBox>{t.info.intro}</InfoBox>}

        {seriesId === "btc" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 10.5, color: "#8A93A3", marginBottom: 10 }}>
            <span style={{ flex: 1 }}>
              {liveState === "loading" ? t.loading
                : liveState === "error" && !(live && live.pts.length) ? t.offline + " (" + btcLast + ")"
                : t.dataUntil(btcLast, live && live.pts.length ? live.source : "Coin Metrics")}
            </span>
            <button onClick={() => updateLive(true)} style={{ ...iconBtn, fontSize: 10.5, fontFamily: "monospace" }}>{t.update}</button>
            <button onClick={() => setInfo(info === "data" ? null : "data")} style={iconBtn} aria-label="ⓘ">ⓘ</button>
          </div>
        )}
        {info === "data" && <InfoBox>{t.info.data}</InfoBox>}

        {pasting && (
          <div style={{ marginBottom: 10 }}>
            <InfoBox>{t.info.paste}</InfoBox>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={5}
              maxLength={200000}
              style={{ width: "100%", background: "#0f131a", color: "#EDEAE3", border: "1px solid #3a4250", borderRadius: 6, fontFamily: "monospace", fontSize: 16, padding: 8, userSelect: "text", WebkitUserSelect: "text" }}
              placeholder={"2024-01, 101.2\n2024-02, 103.5\n…"}
            />
            {pasteErr && <div style={{ color: USER_COLOR, fontSize: 11, fontFamily: "monospace", margin: "4px 0" }}>{t.pasteErr}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={usePasted} style={btnStyle("#12161d", "#EDEAE3")}>{t.pasteOk}</button>
              <button onClick={() => setPasting(false)} style={btnStyle("#EDEAE3", "#1c222c")}>{t.pasteCancel}</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "8px 0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: 11.5 }}>
            <span style={{ flex: 1 }}>{t.rounds}</span>
            {[10, 25, 50].map((v) => (
              <button
                key={v}
                onClick={() => setN(v)}
                style={{ ...btnStyle(N === v ? "#12161d" : "#EDEAE3", N === v ? "#EDEAE3" : "#1c222c"), flex: "0 0 auto", padding: "5px 10px" }}
              >
                {v}
              </button>
            ))}
          </div>
          <SliderRow label={t.gap(G, u)} min={1} max={24} value={G} onChange={setG} />
          <SliderRow label={t.visible(V, u)} min={12} max={365} value={V} onChange={setV} />
        </div>

        {/* MÉTHODES */}
        <SectionTitle>{t.methods}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          {BM.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", background: "#1c222c", borderRadius: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 0 8px 9px", flex: 1 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontFamily: "monospace", lineHeight: 1.2 }}>{t.m[m.id]}</span>
              </span>
              <button
                onClick={() => setInfo(info === m.id ? null : m.id)}
                style={{ ...iconBtn, padding: "8px 8px", color: info === m.id ? m.color : "#8A93A3" }}
                aria-label={t.m[m.id]}
              >
                ⓘ
              </button>
            </div>
          ))}
        </div>
        {BM.some((m) => m.id === info) && <InfoBox>{t.info[info]}</InfoBox>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "8px 0 16px" }}>
          <SliderRow label={t.window(W, u)} min={3} max={120} value={W} onChange={setW} />
          <SliderRow label={t.halfLife(HL, u)} min={1} max={120} value={HL} onChange={setHL}  />
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: 11.5 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, cursor: "pointer" }}>
              <input type="checkbox" checked={log} onChange={() => setLog(!log)} style={{ accentColor: "#F2994A", width: 15, height: 15 }} />
              {t.logLabel}
            </label>
            <button onClick={() => setInfo(info === "log" ? null : "log")} style={iconBtn} aria-label="ⓘ">ⓘ</button>
          </div>
          {info === "log" && <InfoBox>{t.info.log}</InfoBox>}
        </div>

        {/* BACKTEST */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <button onClick={runBacktest} style={btnStyle("#EDEAE3", "#1c222c")}>{t.backtest}</button>
          <button onClick={() => setInfo(info === "backtest" ? null : "backtest")} style={iconBtn} aria-label="ⓘ">ⓘ</button>
        </div>
        {info === "backtest" && <InfoBox>{t.info.backtest}</InfoBox>}
        {backtest && (
          <>
            <SectionTitle>{t.backtestTitle(backtest.n)}</SectionTitle>
            <ScoreTable ids={[...BM.map((m) => m.id), "hold"]} rows={backtest.rows} t={t} />
          </>
        )}

        <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#5c6577", lineHeight: 1.5, marginTop: 8 }}>
          {t.source}Coin Metrics, Binance / CoinGecko, Robert Shiller. {t.disclaimer}
        </div>
      </div>
    </div>
  );
}

function colorOf(id) {
  if (id === "user") return USER_COLOR;
  if (id === "hold") return "#8A93A3";
  return BM.find((m) => m.id === id).color;
}

// vert si proche, orange moyen, rouge loin
function proxColor(p) {
  return p >= 95 ? "#6FCF97" : p >= 85 ? "#F2C94C" : p >= 70 ? "#F2994A" : "#EB5757";
}

function fmtPrice(v) {
  if (v == null) return "—";
  return v >= 1000 ? Math.round(v).toLocaleString("fr-FR") : v >= 100 ? v.toFixed(0) : v.toPrecision(3);
}

function fmtCap(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e4) return (v / 1e3).toFixed(0) + "k";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "k";
  return v.toFixed(0);
}

function ScoreTable({ ids, rows, t }) {
  const naiveErr = rows.naive ? rows.naive.err : null;
  const errIds = ids.filter((id) => rows[id] && rows[id].err != null);
  const bestErr = errIds.slice().sort((a, b) => rows[a].err - rows[b].err)[0];
  const bestCap = ids.slice().sort((a, b) => rows[b].capital - rows[a].capital)[0];
  return (
    <div style={{ fontFamily: "monospace", fontSize: 11, marginBottom: 14 }}>
      <div style={{ display: "flex", color: "#5c6577", padding: "0 0 4px" }}>
        <span style={{ flex: 1 }} />
        <span style={{ width: 58, textAlign: "right" }}>{t.err}</span>
        <span style={{ width: 40, textAlign: "right" }}>{t.dir}</span>
        <span style={{ width: 54, textAlign: "right" }}>{t.cap} $</span>
        <span style={{ width: 44, textAlign: "right" }}>{t.beats}</span>
      </div>
      {ids.map((id) => {
        const r = rows[id];
        if (!r) return null;
        const beats = id === "naive" || id === "hold" || r.err == null || naiveErr == null ? "" : r.err < naiveErr ? "✓" : "✗";
        return (
          <div key={id} style={{ display: "flex", alignItems: "center", padding: "3px 0" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: colorOf(id), marginRight: 6, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.m[id]}</span>
            <span style={{ width: 58, textAlign: "right" }}>
              {r.err == null ? "—" : r.err.toFixed(1) + "%"}{bestErr === id ? "★" : ""}
            </span>
            <span style={{ width: 40, textAlign: "right" }}>{r.dir == null ? "—" : r.dir.toFixed(0) + "%"}</span>
            <span style={{ width: 54, textAlign: "right", color: r.capital >= CAPITAL ? "#6FCF97" : "#EB5757" }}>
              {fmtCap(r.capital)}{bestCap === id ? "★" : ""}
            </span>
            <span style={{ width: 44, textAlign: "right" }}>{beats}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- graphique ----------

function MarketChart({ vals, labels, k, gap, G, V, guess, setGuess, commit, revealed, hint, laterLabel }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [size, setSize] = useState({ w: 300, h: 200 });
  const [dragging, setDragging] = useState(false);
  const frozen = useRef(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const stop = (e) => e.preventDefault();
    const types = ["touchstart", "touchend", "dblclick", "contextmenu"];
    types.forEach((ty) => el.addEventListener(ty, stop, { passive: false }));
    return () => types.forEach((ty) => el.removeEventListener(ty, stop));
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const i0 = Math.max(0, k - V + 1);
  const span = k - i0 + 1;
  // Le futur est à la même échelle que le passé : le repère est vraiment
  // à « gap » pas de la fin. La zone couvre l'écart maximum G, pour que la
  // place du repère dise quelque chose.
  const xMax = k + Math.max(G, gap) * 1.08 + 0.5;
  const fx = (j) => k + j;
  const xT = fx(gap);

  // Échelle : uniquement le passé visible avant la réponse (rien ne trahit
  // le vrai cours) ; élargie après la révélation si besoin.
  const live = useMemo(() => {
    const vs = vals.slice(i0, k + 1);
    let lo = Math.min(...vs);
    let hi = Math.max(...vs);
    const r = hi - lo || hi * 0.1 || 1;
    lo -= 0.6 * r;
    hi += 0.6 * r;
    if (revealed) {
      const extra = vals.slice(k + 1, k + 1 + gap);
      if (guess != null) extra.push(guess);
      extra.forEach((v) => { lo = Math.min(lo, v - 0.08 * r); hi = Math.max(hi, v + 0.08 * r); });
    }
    return [Math.max(lo, 0), hi];
  }, [vals, i0, k, gap, revealed, guess]);
  if (!dragging || !frozen.current) frozen.current = live;
  const [yLo, yHi] = frozen.current;

  const pw = Math.max(10, size.w - M.left - M.right);
  const ph = Math.max(10, size.h - M.top - M.bottom);
  const sx = (i) => M.left + ((i - i0) / (xMax - i0)) * pw;
  const sy = (v) => M.top + ((yHi - v) / (yHi - yLo)) * ph;
  const iy = (py) => yHi - ((py - M.top) / ph) * (yHi - yLo);

  const valueAt = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return Math.max(yLo, Math.min(yHi, iy(e.clientY - r.top)));
  };
  const onDown = (e) => {
    if (revealed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setGuess(valueAt(e));
  };
  const onMove = (e) => { if (dragging) setGuess(valueAt(e)); };
  const onUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    commit(valueAt(e));
  };

  let d = "";
  for (let i = i0; i <= k; i++) d += (d ? "L" : "M") + sx(i).toFixed(1) + "," + sy(vals[i]).toFixed(1);
  let dFut = "M" + sx(k).toFixed(1) + "," + sy(vals[k]).toFixed(1);
  for (let j = 1; j <= gap; j++) dFut += "L" + sx(fx(j)).toFixed(1) + "," + sy(vals[k + j]).toFixed(1);

  const yTicks = niceTicks(yLo, yHi, 4);
  const stepT = Math.max(1, Math.ceil(span / 3));
  const xTicks = [];
  for (let i = k; i >= i0 + stepT * 0.5; i -= stepT) xTicks.push(i);
  const fmtTick = (v) => (Math.abs(v) >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + "k" : +v.toPrecision(3));
  const actual = vals[k + gap];

  return (
    <div ref={wrapRef} style={{ flex: 1, minHeight: 0 }}>
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        style={{ display: "block", touchAction: "none", userSelect: "none", cursor: revealed ? "default" : "crosshair" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => setDragging(false)}
      >
        <defs>
          <clipPath id="mplot"><rect x={M.left} y={M.top} width={pw} height={ph} /></clipPath>
        </defs>
        {yTicks.map((v) => (
          <g key={"y" + v}>
            <line x1={M.left} x2={M.left + pw} y1={sy(v)} y2={sy(v)} stroke="#2a313d" strokeDasharray="2 4" />
            <text x={M.left - 4} y={sy(v) + 3} textAnchor="end" fill="#8A93A3" fontSize="9" fontFamily="monospace">{fmtTick(v)}</text>
          </g>
        ))}
        {revealed && xTicks.filter((i) => Math.abs(sx(i) - sx(xT)) > 62).map((i) => (
          <text key={"x" + i} x={sx(i)} y={M.top + ph + 12} textAnchor="middle" fill="#8A93A3" fontSize="9" fontFamily="monospace">{labels[i]}</text>
        ))}
        <text x={sx(xT)} y={M.top + ph + 12} textAnchor={sx(xT) > size.w - 34 ? "end" : "middle"} fill="#F2C94C" fontSize="9" fontFamily="monospace">{revealed ? labels[k + gap] : laterLabel}</text>
        <rect x={M.left} y={M.top} width={pw} height={ph} fill="transparent" stroke="#3a4250" />

        <g clipPath="url(#mplot)" style={{ pointerEvents: "none" }}>
          <rect x={sx(k + 0.3)} y={M.top} width={sx(xMax) - sx(k + 0.3)} height={ph} fill="#ffffff" opacity="0.03" />
          <path d={d} fill="none" stroke="#EDEAE3" strokeWidth="1.5" />

          {/* le repère : une verticale à la date à deviner */}
          <line x1={sx(xT)} x2={sx(xT)} y1={M.top} y2={M.top + ph} stroke="#F2C94C" strokeWidth="1.2" strokeDasharray="3 4" />
          {!revealed && guess == null && (
            <>
              <text x={sx(xT)} y={M.top + 16} textAnchor="middle" fill="#F2C94C" fontSize="15" fontFamily="monospace">?</text>
              <text x={M.left + 6} y={M.top + 13} textAnchor="start" fill="#8A93A3" fontSize="10" fontFamily="monospace">{hint}</text>
            </>
          )}

          {revealed && (
            <>
              <path d={dFut} fill="none" stroke="#EDEAE3" strokeWidth="1.6" strokeDasharray="2 2" />
              {guess != null && (
                <line x1={sx(xT)} x2={sx(xT)} y1={sy(guess)} y2={sy(actual)} stroke={USER_COLOR} strokeWidth="1.5" />
              )}
              <circle cx={sx(xT)} cy={sy(actual)} r="5.5" fill="#EDEAE3" />
            </>
          )}

          {guess != null && (
            <>
              {!revealed && <line x1={M.left} x2={M.left + pw} y1={sy(guess)} y2={sy(guess)} stroke={USER_COLOR} strokeWidth="0.8" strokeDasharray="2 4" opacity="0.7" />}
              <circle cx={sx(xT)} cy={sy(guess)} r={revealed ? 5 : 7.5} fill={revealed ? "none" : "#12161d"} stroke={USER_COLOR} strokeWidth="2.4" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
