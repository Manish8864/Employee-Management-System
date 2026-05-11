# Deploy on Render (Frontend + Backend)

This project contains:
- **Backend API**: `ems-server/` (Express + Mongoose)
- **Frontend**: `ems-client/` (Vite + React)

---

## 1) Backend service (API)

### Build / Start
Render typically runs `npm install` then starts your app.
- **Build command**: `npm install`
- **Start command**: `node server.js`

(Already matches `ems-server/package.json`.)

### Environment variables
Set these in Render:
- `MONGO_URI` = your MongoDB connection string (Atlas recommended)
- `JWT_SECRET` = a strong random string
- `PORT` = optional (defaults to `5000`)

### CORS note
`ems-server/server.js` uses `app.use(cors())`.
If you want to restrict origins later, set up CORS with an allowlist.

---

## 2) Frontend service (Vite)

### API base URL (required in production)
The frontend uses:
- `import.meta.env.VITE_API_BASE_URL || '/api'`

So for production you should set:
- `VITE_API_BASE_URL=https://YOUR_BACKEND.onrender.com/api`

This avoids relying on `/api` rewrites/proxying.

### Build / Start
- **Build command**: `npm install && npm run build`
- **Start/Serve** (depends on Render plan):
  - Static Web Service: serve `ems-client/dist`
  - Web Service: `npx serve dist -l 3000`

---

## 3) What was fixed for deployment readiness
- Frontend API client is production-safe via `VITE_API_BASE_URL`.
- Backend routes are mounted under `/api/*`.
- Added `ems-client/.env.example`.

---

## 4) Quick local production sanity checks

Backend:
- `cd ems-server && npm install && npm start`

Frontend:
- `cd ems-client && npm install && npm run build`
- `npm run preview`



