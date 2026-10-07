# AegisSight web dashboard

React + Vite operator UI for the Spring Boot API in `../core-backend`.

## Run locally

1. Start PostgreSQL and the backend using the instructions in `../core-backend/README.md`.
2. Create `frontend/.env.local` with the API base URL if it is not `http://localhost:8080`:

   ```dotenv
   VITE_API_URL=http://localhost:8080
   ```

3. Install dependencies and start Vite:

   ```sh
   npm install
   npm run dev
   ```

Open the URL printed by Vite. Log in with an account provisioned by the backend. The login field accepts the backend `username` (the seeded local operator is documented in the backend README).

## Current API-backed features

- JWT login and sign out.
- Dashboard summary from `GET /api/incidents`, `GET /api/alerts`, `GET /api/cameras`, and `GET /api/health`.
- Incident detail and allowed lifecycle updates through `GET /api/incidents/{id}` and `PUT /api/incidents/{id}/status`.
- Refresh and clear API error feedback.

The camera endpoint supplies metadata only. This UI does not yet show camera video streams, UAV telemetry, zone analytics, or map coordinates on a geospatial map. Alert creation and user administration are also not exposed as dashboard actions.

Older Figma-oriented components and their mock data files remain in `src/Components/` for reference, but the current `Dashboard` does not mount them. Do not treat those mock values as live system data.
