# React Team Chat

A real-time team chat app with channels, emoji reactions, user mentions, typing
indicators, and online presence.

## Requirements

- Node.js
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (by default, `http://localhost:3000`).

## Production build

```bash
npm run build
```

Start the production server with `NODE_ENV=production` set in your shell:

```powershell
$env:NODE_ENV = "production"
npm start
```

On macOS or Linux, use `NODE_ENV=production npm start`.

## Deploy to Render

The included `render.yaml` configures a free Render web service. In the Render
Dashboard, create a new Blueprint from this GitHub repository and approve the
service settings. Render will build and deploy the app and redeploy on pushes
to `main`.

If the frontend is hosted separately on Vercel, deploy the Render service
first, then add `VITE_CHAT_SERVER_URL` to the Vercel project's environment
variables. Set it to the Render service origin, for example
`https://react-chat-app.onrender.com` (without a trailing slash), and redeploy
the Vercel project. Vercel's static frontend does not provide the Express API
or persistent Socket.IO server needed to deliver chat messages.

The server stores messages in memory, so messages are cleared when the server
restarts.
