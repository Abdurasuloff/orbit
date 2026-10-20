/* ---------- OpenAI (called directly from the browser) ---------- */
const MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o";
export const getKey = () => { try { return localStorage.getItem("orbit:key") || import.meta.env.VITE_OPENAI_API_KEY || ""; } catch { return import.meta.env.VITE_OPENAI_API_KEY || ""; } };

export async function askAI(system, messages, temperature = 0.3) {
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

export const TRANSLATE_SYSTEM = `You are a translator for a person living in Korea. Detect the input language.
- English or Uzbek input: translate into natural, native-sounding Korean, the way a Korean would actually say it in that situation. Use polite 해요체 by default unless the text is clearly casual or formal.
- Korean input: translate into natural English.
Return only the translation, no notes or explanations.`;

export const TEACHER_SYSTEM = `You are a patient, friendly teacher. Explain things in simple language, as if to a curious 12-year-old.
- Start with the answer in one or two plain sentences, then explain, with one everyday example or analogy.
- Avoid jargon. If you must use a technical word, explain it right away.
- Keep it short (under about 150 words) unless the person asks for more detail.
- Reply in the same language the person wrote in (English, Uzbek, Korean, etc.).
- Plain text only: no markdown, no asterisks, no headings. Short paragraphs or simple numbered lines are fine.
- For follow-up questions, build on the earlier conversation.`;
