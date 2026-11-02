import { MiniRate } from './ExchangeRatePage.jsx';

const I = {
  translate: <svg viewBox="0 0 24 24"><path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 5.5 5.5 7M11 5c-.5 3-3 6-7 8M13 20l4-9 4 9M14.5 17h5"/></svg>,
  teach: <svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>,
  clip: <svg viewBox="0 0 24 24"><rect x="6" y="4" width="12" height="17" rx="2.5"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/></svg>,
  bigText: <svg viewBox="0 0 24 24"><path d="M4 7V4h16v3M12 4v16M8 20h8"/></svg>,
  korean: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2z"/><text x="12" y="15.5" textAnchor="middle">가</text></svg>,
  koreanReading: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2z"/><text x="12" y="15.5" textAnchor="middle">나</text></svg>,
};

const TOOLS = [
  { id: "translate", label: "Translate", icon: I.translate, color: "var(--blue)" },
  { id: "teach", label: "AI Teacher", icon: I.teach, color: "var(--amber)" },
  { id: "clip", label: "Clipboard", icon: I.clip, color: "var(--mint)" },
  { id: "big-text", label: "Big Text", icon: I.bigText, color: "var(--rose)" },
  { id: "korean", label: "K-words", icon: I.korean, color: "var(--mint)" },
  { id: "korean-reading", label: "Read Hangul", icon: I.koreanReading, color: "var(--blue)" },
];

export default function HomePage({ rates, openRate, openTool }) {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
  return (
    <div className="page">
      <div className="top"><span className="brand">Orbit</span><span className="date">{today}</span></div>
      <MiniRate rates={rates} open={openRate} />
      <div className="grid">
        {TOOLS.map((t) => (
          <button key={t.id} className="tile" style={{ "--c": t.color }} onClick={() => openTool(t.id)} aria-label={t.label} title={t.label}>
            <div className="ic">{t.icon}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
