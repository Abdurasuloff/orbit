import { useState, useEffect } from 'react';

/* ---------- clipboard (saved to localStorage) ---------- */
const KINDS = { Name: "var(--blue)", Address: "var(--mint)", Phone: "var(--amber)" };
export default function Clipboard({ back }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("orbit:clips")) || []; } catch { return []; }
  });
  const [kind, setKind] = useState("Address");
  const [filter, setFilter] = useState("All");
  const [value, setValue] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { try { localStorage.setItem("orbit:clips", JSON.stringify(items)); } catch {} }, [items]);

  const add = () => {
    if (!value.trim()) return;
    setItems([{ id: Date.now(), kind, value: value.trim() }, ...items]);
    setValue("");
  };
  const copy = async (it) => {
    await navigator.clipboard.writeText(it.value);
    setCopiedId(it.id); setTimeout(() => setCopiedId(null), 1200);
  };
  const shown = filter === "All" ? items : items.filter((i) => i.kind === filter);

  return (
    <div className="stack page">
      <button className="back" onClick={back}>‹ Orbit</button>
      <h2>Clipboard</h2>
      <div className="card stack">
        <div className="seg">
          {Object.keys(KINDS).map((k) => (
            <button key={k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{k}</button>
          ))}
        </div>
        <input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
          inputMode={kind === "Phone" ? "tel" : "text"} placeholder={`Add a ${kind.toLowerCase()}`} />
        <button onClick={add}>Save</button>
      </div>
      <div className="chips">
        {["All", ...Object.keys(KINDS)].map((k) => (
          <button key={k} className={"chip" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{k}</button>
        ))}
      </div>
      <div className="card">
        {shown.length === 0 && <div className="empty">Nothing saved here yet.<br />Add a name, address or phone number above.</div>}
        {shown.map((it) => (
          <div className="item" key={it.id}>
            <div style={{ minWidth: 0 }}>
              <span className="badge" style={{ "--c": KINDS[it.kind] }}>{it.kind}</span>
              <b>{it.value}</b>
            </div>
            <div className="row">
              <button className="ghost" onClick={() => copy(it)}>{copiedId === it.id ? "Copied" : "Copy"}</button>
              <button className="ghost icon-btn" aria-label="Delete" onClick={() => setItems(items.filter((x) => x.id !== it.id))}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
