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

The server stores messages in memory, so messages are cleared when the server
restarts.
