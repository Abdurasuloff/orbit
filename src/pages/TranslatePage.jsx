import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { KeyCard } from '../components/KeyCard.jsx';
import { askAI, getKey, TRANSLATE_SYSTEM } from '../services/openai.js';

/* ---------- translator ---------- */
export default function Translator({ back }) {
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [keyOk, setKeyOk] = useState(!!getKey());
  const [note, setNote] = useState("");
  const keyProblem = (e) => {
    if (e.message !== "BAD_KEY" && e.message !== "NO_KEY") return false;
    setNote(e.message === "BAD_KEY" ? "That key was rejected. Paste a new one." : ""); setKeyOk(false); return true;
  };

  const go = async () => {
    if (!text.trim()) return;
    setBusy(true); setErr(""); setOut("");
    try {
      setOut(await askAI(TRANSLATE_SYSTEM, [{ role: "user", content: text }]));
    } catch (e) { if (!keyProblem(e)) setErr(e.message || "Translation failed. Try again."); }
    setBusy(false);
  };
  const copy = async () => { await navigator.clipboard.writeText(out); setCopied(true); setTimeout(() => setCopied(false), 1200); };

  useEffect(() => {
    if (!showFullScreen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowFullScreen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showFullScreen]);

  if (!keyOk) return <KeyCard back={back} note={note} done={() => setKeyOk(true)} />;
  return (
    <div className="stack page">
      <button className="back" onClick={back}>‹ Orbit</button>
      <h2>Translate</h2>
      <p className="dim" style={{ margin: 0 }}>English or Uzbek to natural Korean. Korean to English.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste a message…" />
      <button onClick={go} disabled={busy || !text.trim()}>{busy ? "Translating…" : "Translate"}</button>
      {err && <div className="err">{err}</div>}
      {out && (
        <div className="card stack">
          <button className="translation-preview" onClick={() => setShowFullScreen(true)} aria-label="Show translation full screen">
            <span className="out">{out}</span>
          </button>
          <button className="ghost" onClick={copy} style={{ alignSelf: "flex-start" }}>{copied ? "Copied" : "Copy"}</button>
        </div>
      )}
      {showFullScreen && createPortal(
        <div className="translation-modal" role="dialog" aria-modal="true" aria-label="Full-screen translation">
          <div className={`translation-modal-content${rotated ? ' rotated' : ''}`}>
            <div className="translation-modal-actions">
              <button className="ghost" onClick={() => setRotated((value) => !value)} aria-pressed={rotated}>
                {rotated ? 'Normal view' : 'Rotate'}
              </button>
              <button className="ghost" onClick={() => setShowFullScreen(false)} aria-label="Close full-screen translation">
                Close
              </button>
            </div>
            <div className="translation-modal-text">{out}</div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
