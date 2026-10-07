# AI-to-backend adapter

This adapter runs the available vehicle detector on a webcam/video source, maps detections to the backend V1 JSON shape, logs in for a JWT, and posts to `/api/detections`. The backend creates one incident per accepted request, so the adapter applies a cooldown.

## Setup

1. Start PostgreSQL and the Spring backend. Set `JWT_SECRET` and DB environment variables as described in `core-backend/README.md`.
2. Register the source once through `POST /api/cameras`. `SOURCE_ID` below must exactly match that registered ID.
3. Install Python dependencies from the repository root:

   ```bash
   python -m pip install -r ai/requirements.txt -r integration/ai_adapter/requirements.txt
   ```

4. Copy `.env.example` values into your shell/IDE environment. Do not commit credentials. The seeded local operator is documented in `core-backend/README.md`.
5. Start the adapter from the repository root:

   ```bash
   python -m integration.ai_adapter.run_video
   ```

`VIDEO_SOURCE` accepts a webcam index such as `0`, a video-file path, or an RTSP URL. Set `SHOW_PREVIEW=false` for headless operation. `AEGIS_YOLO_MODEL` may be a checkpoint name Ultralytics can download or a local checkpoint path.

## Contract mapping and limitations

- `sourceId`: required `SOURCE_ID` configuration.
- `eventType`: configured `AI_EVENT_TYPE`.
- `confidence`: highest vehicle confidence in the frame.
- `severity`: derived from configured risk score (`<40 LOW`, `40–79 MEDIUM`, `80–89 HIGH`, `90+ CRITICAL`).
- `vehicleCount`: number of vehicle detections in the frame.
- `riskScore`: configured `AI_RISK_SCORE`.
- `timestamp`: current UTC time; `summary`: detected vehicle classes/count.

The detector currently provides vehicles, not proof of an anomaly. The configured risk is a prototype policy value, not model output. Tune the threshold/cooldown and replace this mapping with validated AI analytics before presenting it as operational risk scoring. The backend accepts `INTRUSION`, `CROWD_ANOMALY`, fire, person-collapse, and weapon events, but this vehicle-only pipeline does not detect those classes.
