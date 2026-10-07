# AegisEye architecture and implementation status

## Runtime flow

```text
Drone/CCTV image source
        ↓
Python vision pipeline (detect/track/analytics)
        ↓
integration/ai_adapter (source ID + contract mapping + JWT + HTTP)
        ↓  POST /api/detections
Spring Boot backend → PostgreSQL
        ↓
React dashboard ← GET incidents / alerts / cameras
```

The backend owns camera metadata and incident lifecycle. A source must be registered before detection ingestion. The API accepts structured JSON only; it does not process video. The API contract in `docs/api-contract/backend-api-contract.md` is the shared integration source of truth.

## Components

- `frontend/`: login, dashboard, incident actions and source/alert views.
- `core-backend/`: modular Spring Boot API (`auth`, `camera`, `detection`, `incident`, `alert`, `health`) with Flyway migrations.
- `ai/`: configurable YOLO vehicle detection/tracking and DINOv2/FAISS cross-view utilities. The `AegisSightEngine` currently detects and crops vehicles; the full cross-view/navigation pipeline is not orchestrated end to end.
- `src/`: earlier single-file YOLO demos and simple analytics. Treat these as demos until a drone-specific model, input, and validation set are identified.
- `integration/ai_adapter/`: translates a configured detection event to the backend request and submits it.

## What is implemented vs. what still needs real-world input

- Backend V1 routes and persistence are implemented. Verify locally with the backend API test guide before integration.
- Frontend login and dashboard read/write flows call the backend. Zone boundaries, video streams, and UAV telemetry are not available in the V1 API, so the UI should not present fabricated values for them.
- The adapter runs the available vehicle detector and can post contract-shaped events. Its risk score/event-type policy is configurable and must be calibrated with the team; it is not a trained anomaly classifier.
- Model code can load an Ultralytics checkpoint by name/path. No custom aerial/CCTV weights are included in this repository. Ultralytics may download a generic checkpoint on first run if network access is available. Do not describe that as domain-trained performance.
- Cross-view ReID, route planning, aerial-specific detection, and CCTV-specific validation remain research/validation work unless their weights and datasets are supplied.

## Repository/data policy

Keep frontend, backend, AI, and integration code in this monorepo while they share one API contract. Keep large datasets and model checkpoints out of normal Git commits. The current `datasets/` files are already tracked; `.gitignore` will not remove them from history. Any untracking or history rewrite needs a team decision and a separate migration plan.

## Local secrets

Set backend and adapter variables in the shell or IDE run configuration. Never commit `.env` files, JWT signing keys, credentials, or model weights. Rotate the backend JWT key that was previously committed.
