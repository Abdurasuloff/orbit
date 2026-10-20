// Tiny backend for translation only. Keeps your OpenAI key off the phone.
// Run: node --env-file=.env server.js   (Node 20.6+, npm i express)
import express from "express";
const app = express();
app.use(express.json());

const MODEL = process.env.OPENAI_MODEL || "gpt-4o"; // change in .env if you prefer another model

const SYSTEM = `You are a translator for a person living in Korea. Detect the input language.
- English or Uzbek input: translate into natural, native-sounding Korean, the way a Korean would actually say it in that situation. Use polite 해요체 by default unless the text is clearly casual or formal.
- Korean input: translate into natural English.
Return only the translation, no notes or explanations.`;

app.post("/api/translate", async (req, res) => {
  const text = String(req.body?.text || "").slice(0, 3000);
  if (!text.trim()) return res.status(400).json({ error: "Empty text" });
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: text }],
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || "OpenAI error");
    res.json({ translation: d.choices[0].message.content.trim() });
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: "Translation failed. Check the server log." });
  }
});

const TEACHER = `You are a patient, friendly teacher. Explain things in simple language, as if to a curious 12-year-old.
- Start with the answer in one or two plain sentences, then explain, with one everyday example or analogy.
- Avoid jargon. If you must use a technical word, explain it right away.
- Keep it short (under about 150 words) unless the person asks for more detail.
- Reply in the same language the person wrote in (English, Uzbek, Korean, etc.).
- Plain text only: no markdown, no asterisks, no headings. Short paragraphs or simple numbered lines are fine.
- For follow-up questions, build on the earlier conversation.`;

app.post("/api/teach", async (req, res) => {
  const messages = (Array.isArray(req.body?.messages) ? req.body.messages : [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return res.status(400).json({ error: "No question" });
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, temperature: 0.5, messages: [{ role: "system", content: TEACHER }, ...messages] }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || "OpenAI error");
    res.json({ answer: d.choices[0].message.content.trim() });
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: "The teacher couldn't answer. Check the server log." });
  }
});

app.listen(3001, () => console.log("Orbit API on :3001"));
