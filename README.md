# Employee Management System (EMS)

A full-stack **Employee Management System** with:
- **Backend API**: `ems-server/` (Express + MongoDB via Mongoose)
- **Frontend**: `ems-client/` (React + Vite)

---

## Features
- Employee & manager dashboards
- Attendance, leaves, weekly reports
- Project management and assignments
- Authentication (JWT-based)

---

## Repo Structure
- `ems-server/` — Node/Express backend
- `ems-client/` — React/Vite frontend

---

## Prerequisites
- Node.js (LTS recommended)
- MongoDB (local or hosted like MongoDB Atlas)

---

## Local Development (Recommended)

### 1) Backend (API)
```bash
cd ems-server
npm install
```

Create an environment file (commonly named `.env`) with:
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — strong secret for JWT signing
- `PORT` — optional (default typically `5000`)

Run the server:
```bash
npm start
```
> If you prefer hot reload, use the backend dev script if your `package.json` provides it (commonly `npm run dev`).

---

### 2) Frontend (Web UI)
```bash
cd ems-client
npm install
```

Create an environment file (commonly named `.env`) with:
- `VITE_API_BASE_URL` — base URL for API requests  
  - Example for local backend: `http://localhost:5000/api`
  - If not set, the app falls back to `/api`.

Run the frontend:
```bash
npm run dev
```

---

## Important: API Base URL (VITE_API_BASE_URL)
The frontend API client is configured as:
- `import.meta.env.VITE_API_BASE_URL || '/api'`

So in production you must ensure **`/api` routing works** (via proxy/rewrites) OR set `VITE_API_BASE_URL` to your backend URL.

---

## Deploy on Render (Frontend + Backend)

### Services
Deploy **two services**:
1. **Backend**: `ems-server/`
2. **Frontend**: `ems-client/`

---

### 1) Backend (Render)
**Build command** (Render typically runs install automatically, but keep consistent):
- `npm install`

**Start command**:
- `node server.js`

Environment variables on Render:
- `MONGO_URI` = your MongoDB connection string
- `JWT_SECRET` = any strong secret string
- `PORT` = (optional) `5000`

---

### 2) Frontend (Render)
**Build command**:
- `npm install && npm run build`

**Start command / Serving**
Depending on your Render plan:
- **Static Web Service**: serve `ems-client/dist`
- **Web Service**: run (example):
  - `npx serve dist -l 3000`

Environment variables on Render:
- `VITE_API_BASE_URL` = `https://YOUR_BACKEND.onrender.com/api`

---

## Notes / Troubleshooting
- If API calls fail in production:
  - verify `VITE_API_BASE_URL`
  - verify backend environment variables (`MONGO_URI`, `JWT_SECRET`)
  - verify backend routes are mounted under `/api` (as expected by the frontend)

---

## Contributing
Contributions are welcome. Please open an issue or PR.

---

## License
Add your license here (or include a `LICENSE` file in the repository).
