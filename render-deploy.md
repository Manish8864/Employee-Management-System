# Deploy on Render (two services: Frontend + Backend)

This project contains:
- **Backend API**: `ems-server/` (Express + Mongoose)
- **Frontend**: `ems-client/` (Vite + React)

## 1) Backend service (API)

### Build command
Render usually runs `npm install` + `npm run start`.
- **Build command**: `npm install`
- **Start command**: `node server.js`

In `ems-server/package.json` the `start` script is already `node server.js`.

### Environment variables
Create environment variables in Render:
- `MONGO_URI` = your MongoDB connection string
- `JWT_SECRET` = any strong secret string
- `PORT` = (optional) `5000`

You can copy the template from `ems-server/.env.example`.

### MongoDB
Connect using Atlas or another hosted Mongo.

## 2) Frontend service (Vite)

### Important (so API calls work)
Your frontend currently calls:
- `baseURL: '/api'` (relative to the frontend host)

That means the frontend must either:
- be deployed with **Render/rewrites** so `/api/*` proxies to the backend domain, OR
- use a different baseURL that points to your backend URL.

The easiest production approach is to update the frontend API baseURL to use an env var like:
- `VITE_API_BASE_URL`

### Recommended changes for production
The frontend calls `VITE_API_BASE_URL`.

Set this in Render (frontend service) to something like:
- `https://YOUR_BACKEND.onrender.com/api`

## 3) Code changes implemented
- Updated `ems-client/src/api/axios.js` to use `import.meta.env.VITE_API_BASE_URL || '/api'`.
- Added `ems-client/.env.example`.

## 4) Build command
- **Build command** (frontend): `npm install && npm run build`
- **Start command**: Render can serve the built static site. Depending on Render plan/type, typical is:
  - if using a Static Web Service: serve `ems-client/dist`
  - if using a Web Service: run `npx serve dist -l 3000`


