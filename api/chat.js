// Chat/LLM. Keeps GROQ_API_KEY secret. Falls through to the next model on 404/429/5xx.
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ text: "" });
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ text: "", error: "Missing GROQ_API_KEY" });
  try {
    const prompt = String((req.body && req.body.prompt) || "").slice(0, 8000);
    if (!prompt) return res.status(400).json({ text: "" });
    let r;
    for (const model of ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile"]) {
      const body = {
        model, temperature: 0.7, max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: "Reply with valid JSON only." }, { role: "user", content: prompt }],
      };
      if (model.startsWith("openai/")) body.reasoning_effort = "low";
      r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (r.ok || (r.status !== 404 && r.status !== 429 && r.status < 500)) break;
    }
    if (!r.ok) return res.status(r.status).json({ text: "" });
    const d = await r.json();
    return res.status(200).json({ text: (d.choices && d.choices[0] && d.choices[0].message.content) || "" });
  } catch (e) {
    return res.status(500).json({ text: "" });
  }
};