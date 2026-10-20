import { useState, useEffect, useRef } from 'react';
import { KeyCard } from '../components/KeyCard.jsx';
import { askAI, getKey, TEACHER_SYSTEM } from '../services/openai.js';

/* ---------- AI teacher ---------- */
const ASK = ["Why is the sky blue?", "What is inflation?", "How do Korean particles work?"];
export default function Teacher({ back }) {
  const [msgs, setMsgs] = useState(() => { try { return JSON.parse(localStorage.getItem("orbit:teach")) || []; } catch { return []; } });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const end = useRef(null);
  const [keyOk, setKeyOk] = useState(!!getKey());
  const [note, setNote] = useState("");
  const keyProblem = (e) => {
    if (e.message !== "BAD_KEY" && e.message !== "NO_KEY") return false;
    setNote(e.message === "BAD_KEY" ? "That key was rejected. Paste a new one." : ""); setKeyOk(false); return true;
  };

  useEffect(() => {
    try { localStorage.setItem("orbit:teach", JSON.stringify(msgs.slice(-40))); } catch {}
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  const send = async (q = text) => {
    q = q.trim();
    if (!q || busy) return;
    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next); setText(""); setBusy(true); setErr("");
    try {
      const answer = await askAI(TEACHER_SYSTEM, next.slice(-12), 0.5);
      setMsgs([...next, { role: "assistant", content: answer }]);
    } catch (e) { if (!keyProblem(e)) setErr(e.message || "Something went wrong. Try again."); }
    setBusy(false);
  };
  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer:fine)").matches) { e.preventDefault(); send(); }
  };

  if (!keyOk) return <KeyCard back={back} note={note} done={() => setKeyOk(true)} />;
  return (
    <div className="tpage page">
      <div className="row between">
        <button className="back" onClick={back}>‹ Orbit</button>
        {msgs.length > 0 && <button className="back" onClick={() => { setMsgs([]); setErr(""); }}>Clear</button>}
      </div>
      <h2>AI Teacher</h2>
      <div className="chat">
        {msgs.length === 0 && (
          <div className="hello">
            <div style={{ fontSize: 40 }}>💡</div>
            <div className="dim">Ask me anything. I’ll explain it in simple words.</div>
            <div className="chips">{ASK.map((q) => <button key={q} className="chip" onClick={() => send(q)}>{q}</button>)}</div>
          </div>
        )}
        {msgs.map((m, i) => <div key={i} className={m.role === "user" ? "me" : "ai"}>{m.content}</div>)}
        {busy && <div className="think">Thinking…</div>}
        {err && <div className="err">{err}</div>}
        <div ref={end} />
      </div>
      <div className="dock">
        <textarea rows={1} value={text} placeholder="Ask a question…" onKeyDown={onKey}
          onChange={(e) => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} />
        <button className="send" onClick={() => send()} disabled={busy || !text.trim()} aria-label="Send">↑</button>
      </div>
    </div>
  );
}
