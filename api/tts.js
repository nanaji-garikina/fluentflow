// Text-to-speech: Groq Orpheus (English only). Other languages return 501 so the app uses the device voice.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const text = String((req.body && req.body.text) || "").slice(0, 400);
  const l = String((req.body && req.body.lang) || "en").slice(0, 2).toLowerCase();
  const gk = process.env.GROQ_API_KEY;
  if (!text) return res.status(400).end();
  if (!gk || l !== "en") return res.status(501).end();
  try {
    const voice = String((req.body && req.body.voice) || "autumn");
    const r = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: "Bearer " + gk, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "canopylabs/orpheus-v1-english", voice, input: text, response_format: "wav" }),
    });
    if (!r.ok) return res.status(r.status).end();
    res.setHeader("Content-Type", "audio/wav"); res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(await r.arrayBuffer()));
  } catch (e) { return res.status(500).end(); }
};