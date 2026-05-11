# TODO: Render build/start commands

- [x] Inspect backend entry (`ems-server/server.js`) and routes mounting under `/api/*`.
- [x] Inspect frontend API client (`ems-client/src/api/axios.js`) to confirm `VITE_API_BASE_URL` usage.
- [x] Provide Render service commands.
  - [x] Backend-only command: `cd ems-server && npm install && node server.js`
  - [x] Frontend-only command (Web Service): `cd ems-client && npm install && npm run build && npx serve dist -l 3000`
- [x] Combined (single Render service) approach can be done by serving `ems-client/dist` from Express.
  - I can implement it by updating `ems-server/server.js` to add: `express.static(...)` + SPA fallback (`app.get('*', ...)`).
  - Build command would build frontend before starting backend.



