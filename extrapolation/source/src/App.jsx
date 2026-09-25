import React, { useState, useEffect } from "react";
import PredictionExplorer, { T, HISTORY, iconBtn } from "./PredictionExplorer.jsx";
import Bourse from "./Bourse.jsx";

const APP_KEY = "extrapolation_app";

function loadApp() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(APP_KEY) || "null"); } catch (e) { raw = null; }
  if (!raw || typeof raw !== "object") raw = {};
  let lang = raw.lang === "fr" || raw.lang === "en" ? raw.lang : null;
  if (!lang) {
    // ancienne sauvegarde (v4-v6) : la langue était dans l'état de l'onglet Courbe
    try {
      const old = JSON.parse(localStorage.getItem("extrapolation_state") || "null");
      if (old && (old.lang === "fr" || old.lang === "en")) lang = old.lang;
    } catch (e) { /* ignore */ }
  }
  if (!lang) {
    const nav = (typeof navigator !== "undefined" && navigator.language) || "fr";
    lang = nav.toLowerCase().startsWith("fr") ? "fr" : "en";
  }
  const tab = raw.tab === "bourse" ? "bourse" : "courbe";
  return { lang, tab };
}

const TABS = {
  fr: { courbe: "Courbe", bourse: "Bourse" },
  en: { courbe: "Curve", bourse: "Markets" },
};

export default function App() {
  const [init] = useState(loadApp);
  const [lang, setLang] = useState(init.lang);
  const [tab, setTab] = useState(init.tab);
  const [showHistory, setShowHistory] = useState(false);
  const t = T[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(APP_KEY, JSON.stringify({ lang, tab })); } catch (e) { /* ignore */ }
  }, [lang, tab]);

  const tabBtn = (id) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      style={{
        background: "none",
        border: "none",
        borderBottom: "2px solid " + (tab === id ? "#F2994A" : "transparent"),
        color: tab === id ? "#EDEAE3" : "#8A93A3",
        fontFamily: "'Georgia', serif",
        fontSize: 13,
        fontWeight: 600,
        padding: "4px 2px 3px",
        marginRight: 14,
        cursor: "pointer",
      }}
    >
      {TABS[lang][id]}
    </button>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#12161d", color: "#EDEAE3" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#1c222c",
          padding: "max(6px, env(safe-area-inset-top)) 12px 0",
        }}
      >
        {tabBtn("courbe")}
        {tabBtn("bourse")}
        <span style={{ flex: 1 }} />
        <button onClick={() => setShowHistory(true)} aria-label={t.history} style={iconBtn}>ⓘ</button>
        <button
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          aria-label={lang === "fr" ? "English" : "Français"}
          style={{ ...iconBtn, fontSize: 10, fontFamily: "monospace", border: "1px solid #3a4250", borderRadius: 4, padding: "1px 5px", marginLeft: 6 }}
        >
          {t.otherLang}
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {tab === "courbe" ? <PredictionExplorer lang={lang} /> : <Bourse lang={lang} />}
      </div>

      {showHistory && (
        <div
          onClick={() => setShowHistory(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 10,
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
