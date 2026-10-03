// Run locally with the real server functions (your Groq key stays on your PC, not in the browser):
//   1) copy .env.example to .env and paste your keys   2) node dev-server.js   3) open http://localhost:3000
const http = require("http"), fs = require("fs"), path = require("path");
try {
  for (const l of fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch (e) { console.log("No .env file found: copy .env.example to .env and add your keys."); }
const H = { chat: require("./api/chat.js"), stt: require("./api/stt.js"), tts: require("./api/tts.js") };
http.createServer((req, res) => {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); };
  res.send = (b) => res.end(b);
  const url = req.url.split("?")[0];
  const m = url.match(/^\/api\/(chat|stt|tts)$/);
  if (m) {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", async () => {
      try { req.body = JSON.parse(Buffer.concat(chunks).toString() || "{}"); } catch (e) { req.body = {}; }
      try { await H[m[1]](req, res); } catch (e) { console.error(e); res.statusCode = 500; res.end(); }
    });
    return;
  }
  if (url === "/" || url === "/index.html") { res.setHeader("Content-Type", "text/html; charset=utf-8"); return res.end(fs.readFileSync(path.join(__dirname, "index.html"))); }
  res.statusCode = 404; res.end();
}).listen(3000, () => console.log("FluentFlow running: http://localhost:3000  (Groq: " + (process.env.GROQ_API_KEY ? "ON" : "OFF") + ")"));