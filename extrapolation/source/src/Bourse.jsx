import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  linreg, weightedLinreg, fmt, iconBtn, btnStyle, SliderRow, SectionTitle, InfoBox, niceTicks, M,
} from "./PredictionExplorer.jsx";
import MARKETS from "./data/markets.json";

// ---------- méthodes de prédiction du point suivant ----------

const BM = [
  { id: "naive", color: "#EDEAE3" },
  { id: "secant", color: "#5AA9E6" },
  { id: "linreg", color: "#6FCF97" },
  { id: "weighted", color: "#BB86FC" },
  { id: "mean", color: "#F2994A" },
];
const USER_COLOR = "#FF6B8B";

// Prédit vals[k + 1] à partir des W derniers points (k compris).
// En mode « % » (log), les méthodes travaillent sur ln(prix) : une
// tendance devient une croissance en pourcentage.
function predictAll(vals, k, W, H, log) {
  const f = log ? Math.log : (x) => x;
  const g = log ? Math.exp : (x) => x;
  const win = [];
  for (let i = Math.max(0, k - W + 1); i <= k; i++) win.push({ year: i, value: f(vals[i]) });
  const n = win.length;
  const last = win[n - 1].value;
  const first = win[0].value;
  const lr = linreg(win);
  const wr = weightedLinreg(win, k, H);
  return {
    naive: vals[k],
    secant: g(last + (n > 1 ? (last - first) / (n - 1) : 0)),
    linreg: g(lr.intercept + lr.slope * (k + 1)),
    weighted: g(wr.intercept + wr.slope * (k + 1)),
    mean: g(win.reduce((s, p) => s + p.value, 0) / n),
  };
}

// erreur relative en %, et « sens juste » (hausse / baisse bien devinée)
function roundScore(pred, prev, actual) {
  const err = (Math.abs(pred - actual) / actual) * 100;
  const dp = pred - prev;
  const da = actual - prev;
  const dir = Math.abs(dp) < 1e-9 * Math.abs(prev) || da === 0 ? null : Math.sign(dp) === Math.sign(da);
  return { err, dir };
}

function summarize(list) {
  if (!list.length) return { err: null, dir: null, n: 0 };
  const err = list.reduce((s, r) => s + r.err, 0) / list.length;
  const d = list.filter((r) => r.dir !== null);
  return { err, dir: d.length ? (d.filter((r) => r.dir).length / d.length) * 100 : null, n: list.length };
}

// ---------- textes ----------

const BT = {
  fr: {
    m: {
      naive: "Naïf (= dernier cours)",
      secant: "Sécante",
      linreg: "Régression linéaire",
      weighted: "Pondérée",
      mean: "Moyenne mobile",
      user: "Toi",
    },
    info: {
      intro:
        "Vrais cours mensuels. Touche ou glisse sur le graphique pour placer ton point ● là où tu penses que sera le cours le mois suivant, puis « Valider ». Les méthodes prédisent aussi. On compare l'erreur moyenne (en %) et le « sens juste » : la part des fois où la hausse ou la baisse a été bien devinée.",
      naive:
        "Le mois prochain = ce mois-ci. Ça a l'air bête, mais sur des prix de marché c'est la référence la plus dure à battre : une méthode qui ne fait pas mieux que ça n'apporte rien. Elle ne prédit jamais de sens, donc pas de « sens juste ».",
      secant:
        "Droite entre le premier et le dernier point de la fenêtre, prolongée d'un mois. Suit la tendance, mais dépend de deux points seulement.",
      linreg:
        "Droite des moindres carrés sur la fenêtre, prolongée d'un mois. Moyenne le bruit, mais réagit lentement à un retournement.",
      weighted:
        "Régression où les mois récents pèsent plus (demi-vie réglable). Suit un retournement plus vite, au prix de plus de bruit.",
      mean:
        "Moyenne des cours de la fenêtre. Suppose que le prix revient vers sa moyenne (« retour à la moyenne ») : l'inverse d'une tendance.",
      log:
        "Les méthodes travaillent sur le logarithme du prix : une tendance devient une croissance en pourcentage (+1 % par mois) plutôt qu'en valeur (+10 $ par mois). Plus naturel pour un prix qui se compose sur des décennies.",
      backtest:
        "Chaque méthode est rejouée sur toute la série, mois après mois, sans jamais voir le futur (on appelle ça un test « walk-forward »). C'est la façon honnête de juger une méthode : sur des centaines de prédictions, pas sur une seule.",
      paste:
        "Colle une colonne de cours (un par ligne, du plus ancien au plus récent). Une date devant est acceptée : « 2024-01, 123.4 » ou « 02/01/2024;123,4 ». Seuls les nombres sont lus, rien d'autre n'est interprété.",
    },
    series: "Série",
    custom: "Mes valeurs (collées)",
    paste: "Coller",
    pasteOk: "Utiliser",
    pasteCancel: "Annuler",
    pasteErr: "Il faut au moins 20 nombres positifs.",
    validate: "Valider",
    next: "Mois suivant →",
    otherDate: "↻ Autre date",
    end: "Fin de la série",
    guess: "ta prédiction",
    actual: "réel",
    round: (n) => n + (n > 1 ? " prédictions" : " prédiction"),
    score: "Score de la partie",
    err: "erreur",
    dir: "sens juste",
    methods: "Méthodes",
    window: (w) => "Fenêtre — " + w + " mois",
    halfLife: (h) => "Demi-vie (pondérée) — " + h + " mois",
    visible: (v) => "Affichés — " + v + " mois",
    logLabel: "Calcul en % (logarithme)",
    backtest: "Tester sur toute la série",
    backtestTitle: (n) => "Test sur " + n + " mois",
    source: "Source : ",
    disclaimer: "Outil pour apprendre les méthodes, pas un conseil d'investissement. Les performances passées ne préjugent pas des performances futures.",
    months: "mois",
  },
  en: {
    m: {
      naive: "Naive (= last price)",
      secant: "Secant",
      linreg: "Linear regression",
      weighted: "Weighted",
      mean: "Moving average",
      user: "You",
    },
    info: {
      intro:
        "Real monthly prices. Tap or drag on the chart to place your point ● where you think the price will be next month, then « Check ». The methods predict too. We compare the mean error (in %) and the « right direction »: how often the rise or fall was guessed correctly.",
      naive:
        "Next month = this month. Looks silly, but on market prices it is the hardest benchmark to beat: a method that does no better adds nothing. It never predicts a direction, so it has no « right direction » score.",
      secant:
        "A line through the first and last points of the window, extended one month. Follows the trend, but depends on only two points.",
      linreg:
        "Least-squares line over the window, extended one month. Averages out noise, but reacts slowly to a reversal.",
      weighted:
        "Regression where recent months weigh more (adjustable half-life). Follows a reversal faster, at the cost of more noise.",
      mean:
        "Average price over the window. Assumes the price returns to its average (« mean reversion »): the opposite of a trend.",
      log:
        "The methods work on the logarithm of the price: a trend becomes a percentage growth (+1% per month) rather than an amount (+$10 per month). More natural for a price that compounds over decades.",
      backtest:
        "Each method is replayed over the whole series, month after month, never seeing the future (a « walk-forward » test). That is the honest way to judge a method: over hundreds of predictions, not just one.",
      paste:
        "Paste a column of prices (one per line, oldest first). A leading date is accepted: « 2024-01, 123.4 » or « 02/01/2024;123,4 ». Only numbers are read, nothing else is interpreted.",
    },
    series: "Series",
    custom: "My values (pasted)",
    paste: "Paste",
    pasteOk: "Use",
    pasteCancel: "Cancel",
    pasteErr: "At least 20 positive numbers are needed.",
    validate: "Check",
    next: "Next month →",
    otherDate: "↻ Other date",
    end: "End of the series",
    guess: "your prediction",
    actual: "actual",
    round: (n) => n + (n > 1 ? " predictions" : " prediction"),
    score: "Game score",
    err: "error",
    dir: "direction",
    methods: "Methods",
    window: (w) => "Window — " + w + " months",
    halfLife: (h) => "Half-life (weighted) — " + h + " months",
    visible: (v) => "Shown — " + v + " months",
    logLabel: "Compute in % (logarithm)",
    backtest: "Test on the whole series",
    backtestTitle: (n) => "Test over " + n + " months",
    source: "Source: ",
    disclaimer: "A tool to learn the methods, not investment advice. Past performance does not predict future performance.",
    months: "months",
  },
};

// ---------- valeurs collées ----------

// Lit uniquement des nombres : une ligne = un cours (le dernier nombre de
// la ligne), une éventuelle date devant sert d'étiquette. Rien n'est évalué.
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

const SAVE_KEY = "extrapolation_bourse";

function loadSaved() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch (e) { raw = null; }
  if (!raw || typeof raw !== "object") raw = {};
  const num = (v, lo, hi, d) => (typeof v === "number" && isFinite(v) && v >= lo && v <= hi ? Math.round(v) : d);
  const active = { naive: true, secant: false, linreg: true, weighted: false, mean: false };
  if (raw.active && typeof raw.active === "object") {
    BM.forEach((m) => { if (typeof raw.active[m.id] === "boolean") active[m.id] = raw.active[m.id]; });
  }
  let custom = null;
  if (Array.isArray(raw.custom) && raw.custom.length >= 20 && raw.custom.length <= 5000) {
    const pts = raw.custom.filter((p) => Array.isArray(p) && typeof p[0] === "string" && typeof p[1] === "number" && isFinite(p[1]) && p[1] > 0)
      .map((p) => [p[0].slice(0, 12), p[1]]);
    if (pts.length >= 20) custom = pts;
  }
  const ids = MARKETS.map((m) => m.id).concat(custom ? ["custom"] : []);
  return {
    seriesId: ids.includes(raw.seriesId) ? raw.seriesId : "sp500",
    W: num(raw.W, 2, 60, 12),
    H: num(raw.H, 1, 60, 6),
    V: num(raw.V, 12, 240, 48),
    log: raw.log === true,
    active,
    custom,
  };
}

// ---------- composant ----------

export default function Bourse({ lang }) {
  const saved = useMemo(loadSaved, []);
  const [seriesId, setSeriesId] = useState(saved.seriesId);
  const [custom, setCustom] = useState(saved.custom);
  const [W, setW] = useState(saved.W);
  const [H, setH] = useState(saved.H);
  const [V, setV] = useState(saved.V);
  const [log, setLog] = useState(saved.log);
  const [active, setActive] = useState(saved.active);
  const [k, setK] = useState(null);
  const [guess, setGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [rounds, setRounds] = useState([]);
  const [info, setInfo] = useState("intro");
  const [pasting, setPasting] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteErr, setPasteErr] = useState(false);
  const [backtest, setBacktest] = useState(null);
  const [dragging, setDragging] = useState(false);
  const t = BT[lang];

  const series = useMemo(() => {
    if (seriesId === "custom" && custom) {
      return { id: "custom", name: "", unit: "", source: "—", pts: custom };
    }
    return MARKETS.find((m) => m.id === seriesId) || MARKETS[0];
  }, [seriesId, custom]);
  const vals = useMemo(() => series.pts.map((p) => p[1]), [series]);
  const labels = useMemo(() => series.pts.map((p) => p[0]), [series]);
  const n = vals.length;

  const randomK = () => {
    const lo = Math.min(n - 2, Math.max(W, Math.min(V, n - 2)));
    return lo + Math.floor(Math.random() * (n - 1 - lo));
  };

  // nouvelle série → nouvelle partie à une date au hasard
  useEffect(() => {
    setK(randomK());
    setRounds([]);
    setGuess(null);
    setRevealed(false);
    setBacktest(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ seriesId, W, H, V, log, active, custom }));
    } catch (e) { /* ignore */ }
  }, [seriesId, W, H, V, log, active, custom]);

  useEffect(() => { setBacktest(null); }, [W, H, log]);

  const kk = k == null ? Math.max(1, n - 2) : Math.min(k, n - 2);
  const preds = useMemo(() => predictAll(vals, kk, W, H, log), [vals, kk, W, H, log]);
  const userGuess = guess == null ? vals[kk] : guess;
  const atEnd = kk >= n - 2;

  const validate = () => {
    const prev = vals[kk];
    const actual = vals[kk + 1];
    const row = { user: roundScore(userGuess, prev, actual) };
    BM.forEach((m) => { row[m.id] = roundScore(preds[m.id], prev, actual); });
    setRounds((r) => [...r, row]);
    setRevealed(true);
  };

  const next = () => {
    setK(kk + 1);
    setGuess(null);
    setRevealed(false);
  };

  const otherDate = () => {
    setK(randomK());
    setGuess(null);
    setRevealed(false);
    setRounds([]);
  };

  const runBacktest = () => {
    const lists = {};
    BM.forEach((m) => { lists[m.id] = []; });
    const start = Math.max(1, W - 1);
    for (let i = start; i <= n - 2; i++) {
      const p = predictAll(vals, i, W, H, log);
      BM.forEach((m) => lists[m.id].push(roundScore(p[m.id], vals[i], vals[i + 1])));
    }
    const out = {};
    BM.forEach((m) => { out[m.id] = summarize(lists[m.id]); });
    setBacktest({ n: n - 1 - start, rows: out });
  };

  const usePasted = () => {
    const pts = parsePasted(pasteText);
    if (pts.length < 20) { setPasteErr(true); return; }
    setCustom(pts);
    setSeriesId("custom");
    setPasting(false);
    setPasteErr(false);
  };

  const stats = useMemo(() => {
    const out = { user: summarize(rounds.map((r) => r.user)) };
    BM.forEach((m) => { out[m.id] = summarize(rounds.map((r) => r[m.id])); });
    return out;
  }, [rounds]);

  const shownIds = ["user", ...BM.filter((m) => active[m.id]).map((m) => m.id)];
  const bestErr = rounds.length
    ? shownIds.slice().sort((a, b) => stats[a].err - stats[b].err)[0]
    : null;
  const seriesName = (m) => (lang === "en" && m.nameEn ? m.nameEn : m.name);

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#12161d", color: "#EDEAE3", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* GRAPHIQUE */}
      <div style={{ flex: "0 0 44%", background: "#1c222c", padding: "4px 6px 4px", borderBottom: "1px solid #2a313d", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 8px 4px", fontFamily: "monospace", fontSize: 10, color: "#5c6577" }}>
          <span style={{ color: "#8A93A3" }}>{series.id === "custom" ? t.custom : seriesName(series)}{series.unit ? " · " + (lang === "en" && series.unitEn ? series.unitEn : series.unit) : ""}</span>
          <span>{labels[kk]} → {revealed ? labels[kk + 1] : "?"}</span>
        </div>
        <MarketChart
          vals={vals}
          labels={labels}
          k={kk}
          V={V}
          preds={preds}
          active={active}
          userGuess={userGuess}
          setGuess={setGuess}
          revealed={revealed}
          dragging={dragging}
          setDragging={setDragging}
        />
      </div>

      {/* CONTRÔLES */}
      <div style={{ flex: "1 1 auto", overflowY: "auto", padding: "10px 12px max(24px, env(safe-area-inset-bottom))" }}>
        {info === "intro" && <InfoBox>{t.info.intro}</InfoBox>}

        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <select
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value)}
            aria-label={t.series}
            style={{ ...btnStyle("#EDEAE3", "#1c222c"), flex: 1, appearance: "none", WebkitAppearance: "none" }}
          >
            {MARKETS.map((m) => (
              <option key={m.id} value={m.id}>{seriesName(m)} ({m.pts[0][0].slice(0, 4)}–{m.pts[m.pts.length - 1][0].slice(0, 4)})</option>
            ))}
            {custom && <option value="custom">{t.custom}</option>}
          </select>
          <button onClick={() => { setPasting(!pasting); setPasteErr(false); }} style={{ ...btnStyle("#EDEAE3", "#1c222c"), flex: "0 0 auto" }}>
            {t.paste}
          </button>
          <button onClick={() => setInfo(info === "intro" ? null : "intro")} style={iconBtn} aria-label="ⓘ">ⓘ</button>
        </div>

        {pasting && (
          <div style={{ marginBottom: 10 }}>
            <InfoBox>{t.info.paste}</InfoBox>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={5}
              maxLength={200000}
              style={{ width: "100%", background: "#0f131a", color: "#EDEAE3", border: "1px solid #3a4250", borderRadius: 6, fontFamily: "monospace", fontSize: 12, padding: 8, userSelect: "text", WebkitUserSelect: "text" }}
              placeholder={"2024-01, 101.2\n2024-02, 103.5\n…"}
            />
            {pasteErr && <div style={{ color: USER_COLOR, fontSize: 11, fontFamily: "monospace", margin: "4px 0" }}>{t.pasteErr}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={usePasted} style={btnStyle("#12161d", "#EDEAE3")}>{t.pasteOk}</button>
              <button onClick={() => setPasting(false)} style={btnStyle("#EDEAE3", "#1c222c")}>{t.pasteCancel}</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {!revealed ? (
            <button onClick={validate} style={btnStyle("#12161d", USER_COLOR)}>
              {t.validate}
            </button>
          ) : atEnd ? (
            <button disabled style={{ ...btnStyle("#8A93A3", "#1c222c"), cursor: "default" }}>{t.end}</button>
          ) : (
            <button onClick={next} style={btnStyle("#12161d", "#EDEAE3")}>{t.next}</button>
          )}
          <button onClick={otherDate} style={btnStyle("#EDEAE3", "#1c222c")}>{t.otherDate}</button>
        </div>

        {revealed && rounds.length > 0 && (
          <div style={{ fontFamily: "monospace", fontSize: 11.5, marginBottom: 12, color: "#C9C5BC" }}>
            {t.guess} {fmtPrice(userGuess)} · {t.actual} {fmtPrice(vals[kk + 1])} · {t.err} {rounds[rounds.length - 1].user.err.toFixed(1)} %
            {rounds[rounds.length - 1].user.dir === true ? " · ✓" : rounds[rounds.length - 1].user.dir === false ? " · ✗" : ""}
          </div>
        )}

        {/* SCORE */}
        {rounds.length > 0 && (
          <>
            <SectionTitle>{t.score} · {t.round(rounds.length)}</SectionTitle>
            <ScoreTable ids={shownIds} rows={stats} t={t} best={bestErr} />
          </>
        )}

        {/* MÉTHODES */}
        <SectionTitle>{t.methods}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          {BM.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", background: "#1c222c", borderRadius: 8, border: active[m.id] ? "1px solid " + m.color : "1px solid transparent" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 0 8px 9px", cursor: "pointer", flex: 1 }}>
                <input
                  type="checkbox"
                  checked={active[m.id]}
                  onChange={() => setActive((a) => ({ ...a, [m.id]: !a[m.id] }))}
                  style={{ accentColor: m.color, width: 15, height: 15, flexShrink: 0 }}
                />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontFamily: "monospace", lineHeight: 1.2 }}>{t.m[m.id]}</span>
              </label>
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
          <SliderRow label={t.window(W)} min={2} max={60} value={W} onChange={setW} />
          <SliderRow label={t.halfLife(H)} min={1} max={60} value={H} onChange={setH} disabled={!active.weighted} />
          <SliderRow label={t.visible(V)} min={12} max={240} value={V} onChange={setV} />
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
            <ScoreTable
              ids={BM.map((m) => m.id)}
              rows={backtest.rows}
              t={t}
              best={BM.map((m) => m.id).sort((a, b) => backtest.rows[a].err - backtest.rows[b].err)[0]}
            />
          </>
        )}

        <div style={{ fontFamily: "monospace", fontSize: 10.5, color: "#5c6577", lineHeight: 1.5, marginTop: 8 }}>
          {t.source}{series.source}. {t.disclaimer}
        </div>
      </div>
    </div>
  );
}

function fmtPrice(v) {
  if (v == null) return "—";
  return v >= 100 ? v.toFixed(0) : v.toFixed(2);
}

function ScoreTable({ ids, rows, t, best }) {
  const color = (id) => (id === "user" ? USER_COLOR : BM.find((m) => m.id === id).color);
  return (
    <div style={{ fontFamily: "monospace", fontSize: 11.5, marginBottom: 14 }}>
      <div style={{ display: "flex", color: "#5c6577", padding: "0 0 4px" }}>
        <span style={{ flex: 1 }} />
        <span style={{ width: 70, textAlign: "right" }}>{t.err}</span>
        <span style={{ width: 76, textAlign: "right" }}>{t.dir}</span>
      </div>
      {ids.map((id) => (
        <div key={id} style={{ display: "flex", alignItems: "center", padding: "3px 0" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: color(id), marginRight: 7 }} />
          <span style={{ flex: 1 }}>{t.m[id]}</span>
          <span style={{ width: 70, textAlign: "right" }}>
            {rows[id].err == null ? "—" : rows[id].err.toFixed(2) + " %"}{ids.length > 1 && best === id ? " ★" : ""}
          </span>
          <span style={{ width: 76, textAlign: "right" }}>{rows[id].dir == null ? "—" : rows[id].dir.toFixed(0) + " %"}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- graphique ----------

function MarketChart({ vals, labels, k, V, preds, active, userGuess, setGuess, revealed, dragging, setDragging }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [size, setSize] = useState({ w: 300, h: 200 });
  const drag = useRef(false);
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
  const xMin = i0;
  // zone de prédiction : ~20 % de la largeur à droite du dernier point
  const xMax = k + 1 + Math.max(0.6, (k - i0 + 1) * 0.2);

  // échelle : points visibles + prédictions ; figée pendant un glissé
  const live = useMemo(() => {
    const vs = vals.slice(i0, k + 1);
    BM.forEach((m) => { if (active[m.id]) vs.push(preds[m.id]); });
    if (revealed) vs.push(vals[k + 1]);
    let lo = Math.min(...vs);
    let hi = Math.max(...vs);
    const r = hi - lo || hi * 0.1 || 1;
    return [lo - 0.25 * r, hi + 0.25 * r];
  }, [vals, i0, k, preds, active, revealed]);
  if (!dragging || !frozen.current) frozen.current = live;
  const [yLo, yHi] = frozen.current;

  const pw = Math.max(10, size.w - M.left - M.right);
  const ph = Math.max(10, size.h - M.top - M.bottom);
  const sx = (i) => M.left + ((i - xMin) / (xMax - xMin)) * pw;
  const sy = (v) => M.top + ((yHi - v) / (yHi - yLo)) * ph;
  const iy = (py) => yHi - ((py - M.top) / ph) * (yHi - yLo);

  const setFromEvent = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const v = iy(e.clientY - r.top);
    setGuess(Math.max(yLo, Math.min(yHi, v)));
  };
  const onDown = (e) => {
    if (revealed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = true;
    setDragging(true);
    setFromEvent(e);
  };
  const onMove = (e) => { if (drag.current) setFromEvent(e); };
  const onUp = () => { drag.current = false; setDragging(false); };

  // abscisse d'affichage du mois prédit : au milieu de la zone de droite
  const xp = sx(k + (xMax - k) * 0.55);

  let d = "";
  for (let i = i0; i <= k; i++) d += (d ? "L" : "M") + sx(i).toFixed(1) + "," + sy(vals[i]).toFixed(1);

  const yTicks = niceTicks(yLo, yHi, 4);
  const step = Math.max(1, Math.ceil((k - i0 + 1) / 4));
  const xTicks = [];
  for (let i = k; i >= i0; i -= step) xTicks.push(i);
  const fmtTick = (v) => (Math.abs(v) >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + "k" : +v.toPrecision(3));

  return (
    <div ref={wrapRef} style={{ flex: 1, minHeight: 0 }}>
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        style={{ display: "block", touchAction: "none", userSelect: "none" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
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
        {xTicks.map((i) => (
          <text key={"x" + i} x={sx(i)} y={M.top + ph + 12} textAnchor="middle" fill="#8A93A3" fontSize="9" fontFamily="monospace">{labels[i]}</text>
        ))}
        <rect x={M.left} y={M.top} width={pw} height={ph} fill="transparent" stroke="#3a4250" />

        <g clipPath="url(#mplot)" style={{ pointerEvents: "none" }}>
          <rect x={sx(k + 0.3)} y={M.top} width={sx(xMax) - sx(k + 0.5)} height={ph} fill="#ffffff" opacity="0.03" />
          <path d={d} fill="none" stroke="#EDEAE3" strokeWidth="1.5" />

          {BM.filter((m) => active[m.id]).map((m) => (
            <g key={m.id}>
              <line x1={sx(k)} y1={sy(vals[k])} x2={xp} y2={sy(preds[m.id])} stroke={m.color} strokeWidth="1.4" strokeDasharray="4 3" />
              <circle cx={xp} cy={sy(preds[m.id])} r="3.5" fill={m.color} />
            </g>
          ))}

          <line x1={sx(k)} y1={sy(vals[k])} x2={xp} y2={sy(userGuess)} stroke={USER_COLOR} strokeWidth="1.8" />

          {revealed && (
            <>
              <line x1={sx(k)} y1={sy(vals[k])} x2={xp} y2={sy(vals[k + 1])} stroke="#EDEAE3" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx={xp} cy={sy(vals[k + 1])} r="5" fill="#EDEAE3" />
            </>
          )}
          <circle cx={xp} cy={sy(userGuess)} r={revealed ? 5.5 : 7} fill={revealed ? "none" : "#12161d"} stroke={USER_COLOR} strokeWidth="2.2" />
        </g>
      </svg>
    </div>
  );
}
