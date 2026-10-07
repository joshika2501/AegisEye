# AegisSight

AegisSight is a surveillance prototype with a React operator dashboard, a Spring Boot API, and Python computer-vision code. The backend receives structured inference results; it does not receive or store video.

## Repository map

| Path | Role | Run/setup guide |
|---|---|---|
| `frontend/` | React + Vite operator interface | `frontend/README.md` |
| `core-backend/` | Spring Boot REST API, PostgreSQL persistence, JWT | `core-backend/README.md` |
| `ai/` | Vehicle detection, tracking, embeddings, cross-view utilities | `ai/README.md` |
| `src/` | Earlier standalone YOLO demos and rule-based analytics | `docs/architecture/ai-pipelines.md` |
| `integration/ai_adapter/` | Python adapter from AI detections to backend contract | `integration/ai_adapter/README.md` |
| `docs/api-contract/` | Canonical backend request/response contract | `docs/api-contract/backend-api-contract.md` |
| `datasets/` | Local/sample data; large datasets should be obtained separately | `datasets/README.md` |

The architecture and current implementation status are described in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Local startup outline

1. Start PostgreSQL and configure `core-backend` using its `.env.example` as a reference. The app reads environment variables; it does not load a plain `.env` file automatically.
2. Start the backend with `core-backend/mvnw` (Git Bash) or `core-backend/mvnw.cmd` (PowerShell).
3. In another terminal, set `VITE_API_URL=http://localhost:8080` for the frontend and run `npm install` then `npm run dev` in `frontend/`.
4. Register a camera/source using the API before the AI adapter sends detections. `sourceId` must match the registered camera ID.
5. Configure the adapter using `integration/ai_adapter/.env.example`, install its requirements, and run the video/webcam adapter as described in its README.

The seeded demo operator is documented in the backend README. Change its credentials and use a private `JWT_SECRET` outside local development.

## Scope boundaries

The V1 backend contract covers login, camera metadata, detection ingestion, incidents, alerts, and health. It intentionally excludes video streaming/storage, UAV control/telemetry, manual alert creation, and user administration. The AI adapter maps vision output into the contract; it does not make the detector itself a validated anomaly model.
