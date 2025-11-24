# Mock API Frontend (React + Vite)

Static SPA for managing mock APIs against the backend at `https://tuanla.cloud`. No server-side rendering is used; everything runs in the browser.

## Setup
1. `cd frontend-react`
2. `cp .env.example .env` (or `.env.local`) and set `VITE_BACKEND_URL` if you need a different backend origin.
3. `npm install`

## Commands
- `npm run dev` — start local dev server.
- `npm run build` — build static assets to `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run lint` — run ESLint.

## Cloudflare Pages Deployment
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_BACKEND_URL=https://tuanla.cloud` (or your custom domain).
- SPA routing: handled via `public/_redirects` (`/* /index.html 200`).
- Cookies: the backend uses a `user_id` cookie to keep your mock list. Keep frontend and backend on the same apex domain if possible and allow credentials/CORS for the backend origin.

## Notes
- The UI expects the backend to expose `/api/mocks` endpoints and respond with JSON.
- Requests are made with credentials to preserve the backend session cookie; if you point to a different origin, ensure it allows CORS with credentials.
