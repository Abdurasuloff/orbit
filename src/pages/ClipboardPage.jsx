import { useState, useEffect } from 'react';

/* ---------- clipboard (saved to localStorage) ---------- */
const loadItems = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("orbit:clips")) || [];
    return saved.map((item) => ({
      id: item.id,
      title: item.title || item.kind || "Saved item",
      value: item.value || "",
    }));
  } catch {
    return [];
  }
};

export default function Clipboard({ back }) {
  const [items, setItems] = useState(loadItems);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { try { localStorage.setItem("orbit:clips", JSON.stringify(items)); } catch {} }, [items]);

  const add = () => {
    if (!title.trim() || !value.trim()) return;
    setItems([{ id: Date.now(), title: title.trim(), value: value.trim() }, ...items]);
    setTitle("");
    setValue("");
  };
  const copy = async (it) => {
    await navigator.clipboard.writeText(it.value);
    setCopiedId(it.id); setTimeout(() => setCopiedId(null), 1200);
  };
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const shown = normalizedQuery
    ? items.filter((item) => `${item.title} ${item.value}`.toLocaleLowerCase().includes(normalizedQuery))
    : items;

  return (
    <div className="stack page">
      <button className="back" onClick={back}>‹ Orbit</button>
      <h2>Clipboard</h2>
      <div className="card stack">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name"
          aria-label="Entry name"
        />
        <textarea
          className="clipboard-value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Detail"
          aria-label="Saved detail"
        />
        <button onClick={add} disabled={!title.trim() || !value.trim()}>Save</button>
        <p className="dim clipboard-privacy">
          Don’t save passwords or card numbers.
        </p>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        aria-label="Search saved details"
      />
      <div className="card">
        {shown.length === 0 && (
          <div className="empty">
            {items.length === 0
              ? "Nothing saved yet."
              : "No matches."}
          </div>
        )}
        {shown.map((it) => (
          <div className="clipboard-item" key={it.id}>
            <div className="clipboard-item-content">
              <b>{it.title}</b>
              <div className="clipboard-detail">{it.value}</div>
            </div>
            <div className="clipboard-actions">
              <button className="ghost" onClick={() => copy(it)}>{copiedId === it.id ? "Copied" : "Copy"}</button>
              <button className="ghost icon-btn" aria-label={`Delete ${it.title}`} onClick={() => setItems(items.filter((x) => x.id !== it.id))}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
