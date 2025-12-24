# Firebase Functions (Nuevo)

This folder contains a Cloud Function that keeps unread counters in sync when a new message is created.

Setup & deploy

1. From the project root install dependencies for functions:

```bash
cd functions
npm install
```

2. Build and deploy (you must have the Firebase CLI installed and be logged in):

```bash
# optional: install firebase-tools globally
npm install -g firebase-tools
firebase login
# from functions/
npm run deploy
```

What the function does

- Trigger: `onCreate` for docs in `mensajes/{mensajeId}`
- Actions:
  - updates `conversaciones/{conversacionId}`: increments `noLeidos_{dest}` and updates `ultimoMensaje` + `fechaUltimoMensaje`
  - updates `counters/{dest}.totalNoLeidos` by +1

Notes

- Ensure your Firebase project is selected in `firebase` CLI (e.g. `firebase use`)
- The project expects Node 18 runtime

If you want, I can run these steps locally (install & deploy) or provide the exact commands to run on your machine. If you prefer CI deploy, I can generate a deploy script for GitHub Actions.
