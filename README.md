# Nexa Landing Page

This project is a landing page for Nexa.

## Creators

Nexa was created by:

*   **Kaua M.** - Full Stack Developer
*   **Raul B.** - Backend Developer

## Development

Run frontend dev server (Vite):

```bash
npm install
npm run dev
```

Run backend in dev mode (from the `backend` folder):

```bash
cd backend
npm install
npm run dev
```

Notes:
- The backend listens on port `4001` by default. Vite's dev server proxies `/api` to the backend.
- To override the frontend API base, set `VITE_API_URL` in a `.env` file at project root, e.g. `VITE_API_URL="http://localhost:4001"`.
