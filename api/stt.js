// Speech-to-text: Groq Whisper large-v3 (falls back to turbo).
const BAD = /^(thank you\.?|thanks for watching[.!]?|please subscribe\.?|you\.?|bye\.?|\.+)$/i;
const clean = (d) => {
  const s = d.segments;
  if (Array.isArray(s) && s.length)
    return s.filter((x) => !(x.no_speech_prob > 0.6 && x.avg_logprob < -1) && !(x.avg_logprob < -1.6)).map((x) => x.text).join(" ").trim();
  return (d.text || "").trim();
};
async function whisper(buf, mp4, key, prompt, lang) {
  let status = 500;
  for (const model of ["whisper-large-v3", "whisper-large-v3-turbo"]) {
    const fd = new FormData();
    fd.append("file", new Blob([buf], { type: mp4 ? "audio/mp4" : "audio/webm" }), "a." + (mp4 ? "mp4" : "webm"));
    fd.append("model", model);
    fd.append("temperature", "0");
    fd.append("response_format", "verbose_json");
    if (/^[a-z]{2}$/.test(lang || "") && lang !== "en") fd.append("language", lang);
    if (prompt) fd.append("prompt", String(prompt).slice(-220)); // context bias: fewer wrong words
    const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { Authorization: "Bearer " + key }, body: fd });
    if (r.ok) { const d = await r.json(); return { text: clean(d), lang: d.language || "" }; }
    status = r.status;
    if (r.status !== 404 && r.status !== 429 && r.status < 500) break;
  }
  throw Object.assign(new Error("whisper " + status), { status });
}
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const gk = process.env.GROQ_API_KEY;
  if (!gk) return res.status(500).end();
  try {
    const { audio, ext, prompt, lang } = req.body || {};
    if (!audio) return res.status(400).end();
    const buf = Buffer.from(audio, "base64"), mp4 = ext === "mp4";
    let out = null;
    out = await whisper(buf, mp4, gk, prompt, lang);
    const text = out && !BAD.test(out.text) ? out.text : "";
    return res.status(200).json({ text, lang: (out && out.lang) || "" });
  } catch (e) {
    return res.status(e.status || 500).end();
  }
};