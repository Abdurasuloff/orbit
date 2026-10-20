import { useState, useEffect, useCallback, useRef } from "react";

/* ---------- styles ---------- */
const css = `
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css");
:root{
  --bg:#08090c;--surface:rgba(255,255,255,.045);--surface-2:rgba(255,255,255,.08);
  --line:rgba(255,255,255,.08);--text:#f2f3f7;--dim:#8b90a0;--danger:#ff7a85;
  --blue:#7c9cff;--mint:#4fe0b5;--amber:#ffb85c;--rose:#ff7ab6;
  --r:22px;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body,#root{min-height:100%;margin:0;background:var(--bg);color:var(--text);
  font-family:"Pretendard Variable",Pretendard,-apple-system,"Apple SD Gothic Neo",system-ui,sans-serif;
  -webkit-font-smoothing:antialiased}
.glow{position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(420px 320px at 85% -5%,rgba(124,156,255,.22),transparent 70%),
             radial-gradient(360px 300px at -10% 25%,rgba(79,224,181,.10),transparent 70%)}
.app{position:relative;z-index:1;max-width:480px;margin:0 auto;min-height:100vh;
  padding:max(18px,env(safe-area-inset-top)) 18px max(28px,env(safe-area-inset-bottom))}
.top{display:flex;align-items:center;justify-content:space-between;margin:6px 2px 22px}
.brand{font-size:26px;font-weight:700;letter-spacing:-.03em}
.date{color:var(--dim);font-size:14px}
h2{font-size:24px;font-weight:700;letter-spacing:-.02em;margin:0}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:20px;
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.dim{color:var(--dim);font-size:13px}
.stack{display:flex;flex-direction:column;gap:14px}
.row{display:flex;gap:10px;align-items:center}
.between{justify-content:space-between}

/* rate card */
.rate{background:linear-gradient(160deg,rgba(124,156,255,.16),rgba(124,156,255,.03) 60%),var(--surface)}
.live{display:inline-flex;align-items:center;gap:7px;font-size:13px;color:var(--dim)}
.live i{width:7px;height:7px;border-radius:50%;background:var(--mint);box-shadow:0 0 0 0 rgba(79,224,181,.6);animation:pulse 2s infinite}
@keyframes pulse{70%{box-shadow:0 0 0 7px rgba(79,224,181,0)}100%{box-shadow:0 0 0 0 rgba(79,224,181,0)}}
.amount{display:flex;align-items:baseline;gap:6px;margin:18px 0 4px}
.amount span{font-size:30px;font-weight:600;color:var(--dim)}
.amount input{background:none;border:0;padding:0;font-size:44px;font-weight:700;letter-spacing:-.03em;width:100%;color:var(--text)}
.amount input:focus{border:0}
.result{font-size:40px;font-weight:700;letter-spacing:-.03em;margin:2px 0 14px}
.result small{font-size:24px;color:var(--blue);margin-left:4px;font-weight:600}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{padding:8px 14px;border-radius:999px;font-size:14px;font-weight:600;background:var(--surface-2);color:var(--text);border:1px solid transparent}
.chip.on{background:var(--text);color:#0b0c10}

/* controls */
input,textarea{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:14px;color:var(--text);
  font:inherit;font-size:16px;padding:14px 16px;outline:none;transition:border-color .15s,background .15s}
input:focus,textarea:focus{border-color:rgba(124,156,255,.7);background:rgba(124,156,255,.06)}
::placeholder{color:#5d6272}
textarea{resize:none;min-height:150px;line-height:1.5}
button{font:inherit;cursor:pointer;border:0;border-radius:14px;padding:14px 18px;font-weight:600;
  background:var(--blue);color:#0a0d18;transition:transform .12s,opacity .12s}
button:active{transform:scale(.97)}
button:disabled{opacity:.4}
button.ghost{background:var(--surface-2);color:var(--text);padding:10px 14px;font-size:14px}
.icon-btn{width:38px;height:38px;padding:0;display:grid;place-items:center;border-radius:12px}
.back{background:none;color:var(--dim);padding:6px 0;font-weight:500;align-self:flex-start}
.seg{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:rgba(255,255,255,.05);padding:4px;border-radius:14px}
.seg button{background:none;color:var(--dim);padding:10px;font-size:14px}
.seg button.on{background:var(--surface-2);color:var(--text)}

/* home grid */
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:12px}
.tile{display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:26px;text-align:left;
  min-height:128px;padding:18px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);color:var(--text)}
.tile:active{background:var(--surface-2)}
.tile .ic{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 18%,transparent)}
.tile svg{width:22px;height:22px;stroke:var(--c);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.tile b{font-size:16px;font-weight:600;display:block}
.tile span{font-size:13px;color:var(--dim);font-weight:400}

/* lists */
.item{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid var(--line)}
.item:last-child{border-bottom:0;padding-bottom:0}
.item:first-child{padding-top:0}
.item b{display:block;font-weight:500;margin-top:5px;word-break:break-word;line-height:1.4}
.badge{font-size:12px;font-weight:600;padding:3px 9px;border-radius:999px;color:var(--c);background:color-mix(in srgb,var(--c) 16%,transparent)}
.out{white-space:pre-wrap;font-size:20px;line-height:1.55;font-weight:500}
.err{color:var(--danger);font-size:14px}
.empty{text-align:center;color:var(--dim);font-size:14px;padding:12px 0;line-height:1.5}
.page{animation:in .22s ease-out}
@keyframes in{from{opacity:0;transform:translateY(8px)}}

/* compact rate card + rate page */
.mini{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;color:var(--text);
  padding:14px 16px;border-radius:var(--r);border:1px solid var(--line);
  background:linear-gradient(160deg,rgba(124,156,255,.14),rgba(124,156,255,.02) 65%),var(--surface)}
.mini:active{background:var(--surface-2)}
.mini .rt{font-size:26px;font-weight:700;letter-spacing:-.03em;margin-top:2px}
.mini .rt small{font-size:15px;color:var(--dim);font-weight:500;margin-left:3px}
.mini .side{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
.delta{font-size:13px;font-weight:600}
.up{color:var(--mint)}.down{color:var(--rose)}
.spark{display:block}
.chart{width:100%;height:120px;display:block}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
.stats div{background:rgba(255,255,255,.04);border-radius:14px;padding:10px 12px}
.stats b{display:block;font-size:15px;margin-top:3px;font-weight:600}
.swap{width:40px;height:40px;padding:0;border-radius:50%;display:grid;place-items:center;background:var(--surface-2);color:var(--text);font-size:18px}

/* multi-currency page */
.cur{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-radius:18px;
  background:rgba(255,255,255,.04);border:1px solid var(--line);transition:border-color .15s,background .15s}
.cur.on{border-color:rgba(124,156,255,.7);background:rgba(124,156,255,.09)}
.cc{display:flex;gap:12px;align-items:center;flex-shrink:0}
.flag{font-size:28px;line-height:1}
.cc b{display:block;font-weight:600}
.cur input{background:none;border:0;padding:0;text-align:right;font-size:24px;font-weight:700;letter-spacing:-.02em;min-width:0;border-radius:0}
.cur input:focus{border:0;background:none}
.prow{display:flex;justify-content:space-between;gap:12px;padding:13px 0;border-bottom:1px solid var(--line);font-size:15px}
.prow:last-child{border-bottom:0;padding-bottom:0}.prow:first-child{padding-top:0}
.prow span:first-child{color:var(--dim)}.prow b{font-weight:600}

/* AI teacher */
.tpage{display:flex;flex-direction:column;gap:14px;min-height:calc(100vh - 50px);min-height:calc(100dvh - 50px)}
.chat{flex:1;display:flex;flex-direction:column;gap:12px}
.me{align-self:flex-end;max-width:85%;background:rgba(124,156,255,.18);border:1px solid rgba(124,156,255,.3);padding:10px 14px;
  border-radius:18px 18px 6px 18px;line-height:1.45;white-space:pre-wrap;word-break:break-word}
.ai{align-self:flex-start;max-width:96%;background:var(--surface);border:1px solid var(--line);padding:14px 16px;
  border-radius:18px 18px 18px 6px;line-height:1.65;white-space:pre-wrap;word-break:break-word}
.think{align-self:flex-start;color:var(--dim);font-size:14px;animation:blink 1.2s infinite}
@keyframes blink{50%{opacity:.4}}
.dock{position:sticky;bottom:0;display:flex;gap:10px;align-items:flex-end;padding:12px 0 max(2px,env(safe-area-inset-bottom));
  background:linear-gradient(to top,var(--bg) 70%,transparent)}
.dock textarea{min-height:48px;max-height:140px;padding:13px 16px;border-radius:24px}
.send{width:48px;height:48px;padding:0;border-radius:50%;flex-shrink:0;font-size:20px;display:grid;place-items:center}
.hello{margin:auto 0;text-align:center}
.hello .dim{margin:8px 0 18px;font-size:15px}
.hello .chips{justify-content:center}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

/* ---------- icons ---------- */
const I = {
  translate: <svg viewBox="0 0 24 24"><path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 5.5 5.5 7M11 5c-.5 3-3 6-7 8M13 20l4-9 4 9M14.5 17h5"/></svg>,
  teach: <svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>,
  clip: <svg viewBox="0 0 24 24"><rect x="6" y="4" width="12" height="17" rx="2.5"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/></svg>,
};

/* ---------- currency (keyless public APIs) ---------- */
const day = (d) => d.toISOString().slice(0, 10);
const CURRENCIES = [
  { code: "USD", flag: "🇺🇸", name: "US dollar", dp: 2, quick: ["10", "50", "100", "500", "1000"] },
  { code: "UZS", flag: "🇺🇿", name: "Uzbek som", dp: 0, quick: ["100000", "500000", "1000000", "5000000"] },
  { code: "KRW", flag: "🇰🇷", name: "Korean won", dp: 0, quick: ["10000", "50000", "100000", "500000", "1000000"] },
];
const cinfo = (c) => CURRENCIES.find((x) => x.code === c);
const fmt = (v, dp = 0) => (v == null || !isFinite(v) ? "—" : v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp }));
const plain = (v, dp) => String(+v.toFixed(dp));

const get = async (url) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
};
const need = (rates) => { if (!rates?.KRW || !rates?.UZS) throw new Error("missing KRW/UZS"); return rates; };

// All-currency sources (ECB/Frankfurter has no UZS, so it is only used for the USD→KRW history).
const RATE_SOURCES = [
  ["open.er-api", async () => {
    const d = await get("https://open.er-api.com/v6/latest/USD");
    return { rates: need(d.rates), date: day(new Date(d.time_last_update_unix * 1000)), source: "open.er-api.com" };
  }],
  ["currency-api", async () => {
    const d = await get("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json");
    const rates = Object.fromEntries(Object.entries(d.usd).map(([k, v]) => [k.toUpperCase(), v]));
    return { rates: need(rates), date: d.date, source: "currency-api" };
  }],
];
async function loadSeries() {
  const start = day(new Date(Date.now() - 30 * 864e5));
  const d = await get(`https://api.frankfurter.dev/v1/${start}..?base=USD&symbols=KRW`);
  return Object.entries(d.rates).map(([date, v]) => ({ date, rate: v.KRW })).sort((a, b) => a.date.localeCompare(b.date));
}

function useRates() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false); // false, or a list of "source: reason"
  const load = useCallback(async () => {
    const errors = [];
    let base = null, series = [];
    for (const [name, fn] of RATE_SOURCES) {
      try { base = await fn(); break; } catch (e) { errors.push(`${name}: ${e.message || e.name}`); console.warn("Rate source failed:", name, e); }
    }
    try { series = await loadSeries(); } catch (e) { errors.push(`Frankfurter: ${e.message || e.name}`); console.warn(e); }
    if (!base && series.length) {
      const last = series[series.length - 1];
      base = { rates: { USD: 1, KRW: last.rate }, date: last.date, source: "ECB via Frankfurter (no UZS)" };
    }
    if (base) { setData({ ...base, series }); setErr(false); } else setErr(errors);
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 30 * 60 * 1000); return () => clearInterval(t); }, [load]);
  return { data, err, reload: load };
}

function Spark({ values, w = 84, h = 34, className = "spark", id = "s" }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - min) / span) * (h - 6)]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const c = values[values.length - 1] >= values[0] ? "#4fe0b5" : "#ff7ab6";
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width={className === "spark" ? w : undefined}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".28" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={c} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const pct = (series) => (!series || series.length < 2 ? null : ((series[series.length - 1].rate - series[0].rate) / series[0].rate) * 100);

function MiniRate({ rates, open }) {
  const { data, err } = rates;
  const ch = pct(data?.series);
  const krw = data?.rates?.KRW;
  return (
    <button className="mini" onClick={open} aria-label="Open exchange rate">
      <div>
        <span className="live"><i />USD → KRW</span>
        <div className="rt">{krw ? fmt(krw, 2) : err ? "Unavailable" : "…"}<small>₩</small></div>
      </div>
      <div className="side">
        <Spark values={data?.series.map((x) => x.rate)} id="mini" />
        {ch !== null && <span className={"delta " + (ch >= 0 ? "up" : "down")}>{ch >= 0 ? "+" : ""}{ch.toFixed(2)}%</span>}
      </div>
    </button>
  );
}

const PAIRS = [["USD", "KRW", 1], ["USD", "UZS", 1], ["KRW", "UZS", 1000], ["UZS", "KRW", 100000]];

function RatePage({ rates, back }) {
  const { data, err, reload } = rates;
  const [active, setActive] = useState("USD");
  const [raw, setRaw] = useState("100");
  const R = data?.rates || {};
  const n = parseFloat(raw.replace(/,/g, "")) || 0;
  const conv = (x, from, to) => (R[from] && R[to] ? (x / R[from]) * R[to] : null);

  const focus = (c) => {
    if (c === active) return;
    const v = conv(n, active, c);
    setActive(c); setRaw(v == null ? "" : plain(v, cinfo(c).dp));
  };
  const vals = data?.series?.map((x) => x.rate) || [];
  const ch = pct(data?.series);
  const f1 = (v) => v.toLocaleString("en-US", { maximumFractionDigits: 1 });

  return (
    <div className="stack page">
      <button className="back" onClick={back}>‹ Orbit</button>
      <h2>Exchange rate</h2>

      <div className="card rate stack">
        <span className="live"><i />Type in any currency</span>
        {CURRENCIES.map((c) => {
          const on = c.code === active;
          const v = on ? null : conv(n, active, c.code);
          return (
            <label key={c.code} className={"cur" + (on ? " on" : "")}>
              <div className="cc"><span className="flag">{c.flag}</span><div><b>{c.code}</b><span className="dim">{c.name}</span></div></div>
              <input inputMode="decimal" value={on ? raw : fmt(v, c.dp)}
                onFocus={() => focus(c.code)} onChange={(e) => { setActive(c.code); setRaw(e.target.value); }} aria-label={c.code} />
            </label>
          );
        })}
        <div className="chips">
          {cinfo(active).quick.map((q) => (
            <button key={q} className={"chip" + (raw === q ? " on" : "")} onClick={() => setRaw(q)}>{Number(q).toLocaleString()}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <b style={{ fontWeight: 600, display: "block", marginBottom: 14 }}>Rates</b>
        {PAIRS.map(([from, to, amt]) => (
          <div className="prow" key={from + to}>
            <span>{amt.toLocaleString()} {from}</span>
            <b>{fmt(conv(amt, from, to), cinfo(to).dp)} {to}</b>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="row between">
          <b style={{ fontWeight: 600 }}>USD → KRW · 30 days</b>
          {ch !== null && <span className={"delta " + (ch >= 0 ? "up" : "down")}>{ch >= 0 ? "+" : ""}{ch.toFixed(2)}%</span>}
        </div>
        {vals.length > 1 ? (
          <>
            <div style={{ marginTop: 12 }}><Spark values={vals} w={300} h={100} className="chart" id="big" /></div>
            <div className="stats">
              <div><span className="dim">Low</span><b>{f1(Math.min(...vals))}</b></div>
              <div><span className="dim">High</span><b>{f1(Math.max(...vals))}</b></div>
              <div><span className="dim">Now</span><b>{f1(vals[vals.length - 1])}</b></div>
            </div>
          </>
        ) : <div className="empty">History isn’t available right now.</div>}
      </div>

      <div className={err ? "err" : "dim"} style={{ textAlign: "center" }}>
        {err ? "Couldn’t load rates. " + err.join(" · ") + " " : data ? `Daily rates for ${data.date} · ${data.source} · ` : "Loading… "}
        <span onClick={reload} style={{ textDecoration: "underline", cursor: "pointer" }}>Refresh</span>
      </div>
    </div>
  );
}

/* ---------- OpenAI (called directly from the browser) ---------- */
const MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o";
const getKey = () => { try { return localStorage.getItem("orbit:key") || import.meta.env.VITE_OPENAI_API_KEY || ""; } catch { return import.meta.env.VITE_OPENAI_API_KEY || ""; } };

async function askAI(system, messages, temperature = 0.3) {
  const key = getKey();
  if (!key) throw new Error("NO_KEY");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, temperature, messages: [{ role: "system", content: system }, ...messages] }),
  });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { try { localStorage.removeItem("orbit:key"); } catch {} throw new Error("BAD_KEY"); }
  if (!r.ok) throw new Error(d.error?.message || `OpenAI error ${r.status}`);
  return d.choices[0].message.content.trim();
}

const TRANSLATE_SYSTEM = `You are a translator for a person living in Korea. Detect the input language.
- English or Uzbek input: translate into natural, native-sounding Korean, the way a Korean would actually say it in that situation. Use polite 해요체 by default unless the text is clearly casual or formal.
- Korean input: translate into natural English.
Return only the translation, no notes or explanations.`;

const TEACHER_SYSTEM = `You are a patient, friendly teacher. Explain things in simple language, as if to a curious 12-year-old.
- Start with the answer in one or two plain sentences, then explain, with one everyday example or analogy.
- Avoid jargon. If you must use a technical word, explain it right away.
- Keep it short (under about 150 words) unless the person asks for more detail.
- Reply in the same language the person wrote in (English, Uzbek, Korean, etc.).
- Plain text only: no markdown, no asterisks, no headings. Short paragraphs or simple numbered lines are fine.
- For follow-up questions, build on the earlier conversation.`;

function KeyCard({ back, note, done }) {
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

/* ---------- translator ---------- */
function Translator({ back }) {
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
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
          <div className="out">{out}</div>
          <button className="ghost" onClick={copy} style={{ alignSelf: "flex-start" }}>{copied ? "Copied" : "Copy"}</button>
        </div>
      )}
    </div>
  );
}

/* ---------- AI teacher ---------- */
const ASK = ["Why is the sky blue?", "What is inflation?", "How do Korean particles work?"];
function Teacher({ back }) {
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

/* ---------- clipboard (saved to localStorage) ---------- */
const KINDS = { Name: "var(--blue)", Address: "var(--mint)", Phone: "var(--amber)" };
function Clipboard({ back }) {
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

/* ---------- home ---------- */
const TOOLS = [
  { id: "translate", label: "Translate", sub: "EN · UZ · 한국어", icon: I.translate, color: "var(--blue)" },
  { id: "teach", label: "AI Teacher", sub: "Ask, learn simply", icon: I.teach, color: "var(--amber)" },
  { id: "clip", label: "Clipboard", sub: "Names, addresses, phones", icon: I.clip, color: "var(--mint)" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const rates = useRates();
  const home = () => setPage("home");
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
  return (
    <>
      <style>{css}</style>
      <div className="glow" />
      <div className="app">
        {page === "home" && (
          <div className="page">
            <div className="top"><span className="brand">Orbit</span><span className="date">{today}</span></div>
            <MiniRate rates={rates} open={() => setPage("rate")} />
            <div className="grid">
              {TOOLS.map((t) => (
                <button key={t.id} className="tile" style={{ "--c": t.color }} onClick={() => setPage(t.id)}>
                  <div className="ic">{t.icon}</div>
                  <div><b>{t.label}</b><span>{t.sub}</span></div>
                </button>
              ))}
            </div>
          </div>
        )}
        {page === "rate" && <RatePage rates={rates} back={home} />}
        {page === "translate" && <Translator back={home} />}
        {page === "teach" && <Teacher back={home} />}
        {page === "clip" && <Clipboard back={home} />}
      </div>
    </>
  );
}
