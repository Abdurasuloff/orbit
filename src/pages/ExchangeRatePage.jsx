import { useState, useCallback, useEffect } from 'react';

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

export function useRates() {
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

export function MiniRate({ rates, open }) {
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

export function RatePage({ rates, back }) {
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
