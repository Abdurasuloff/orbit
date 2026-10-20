import { useState } from 'react';

export function KeyCard({ back, note, done }) {
  const [v, setV] = useState("");
  const save = () => { if (!v.trim()) return; try { localStorage.setItem("orbit:key", v.trim()); } catch {} done(); };
  return (
    <div className="stack page">
      <button className="back" onClick={back}>‹ Orbit</button>
      <h2>OpenAI key</h2>
      <p className="dim" style={{ margin: 0 }}>Paste your OpenAI API key once. It’s saved only on this device and sent only to OpenAI.</p>
      {note && <div className="err">{note}</div>}
      <input type="password" value={v} onChange={(e) => setV(e.target.value)} placeholder="sk-…" autoCapitalize="none" autoCorrect="off" />
      <button onClick={save} disabled={!v.trim()}>Save</button>
    </div>
  );
}
