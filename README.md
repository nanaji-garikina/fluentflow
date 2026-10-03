# FluentFlow – AI voice assistant & English coach

Folder layout (keep exactly):
```
index.html   dev-server.js   package.json   vercel.json   .env.example   .gitignore
api/chat.js  api/stt.js      api/tts.js
```

## 1) Run in VS Code
1. Install Node 20+. Copy `.env.example` to `.env`, paste your Groq key (GROQ_API_KEY).
2. In the VS Code terminal: `node dev-server.js`  then open http://localhost:3000
   (Do not use Live Server: it has no /api, so the server functions cannot work.)
3. No keys in .env? Tap ⚙️ in the app and paste a free Groq key (console.groq.com). Chat and speech recognition work; voice uses Orpheus (English) or the device.

## 2) Upload to GitHub
`git init && git add . && git commit -m "FluentFlow" ` then create a repo on github.com and push. `.env` is ignored, your keys never go to GitHub.

## 3) Deploy on Vercel
1. vercel.com > Add New > Project > import the repo > Deploy.
2. Settings > Environment Variables: GROQ_API_KEY. Then Redeploy.

## When the shared key hits its limit
The app shows a message and opens ⚙️ Settings. The user pastes their own free Groq key(s); it is saved only in their browser and used automatically (several keys rotate when one is full).

## Telugu / Hindi voice
Groq has no Telugu or Hindi voice, so those use your device's voice. Use Microsoft Edge (free, very natural Telugu and Hindi voices) or Chrome on Android.