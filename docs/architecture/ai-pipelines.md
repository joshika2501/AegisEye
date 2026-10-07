# AI pipeline map

| Code | Observed behavior | Intended role | Current confidence in role |
|---|---|---|---|
| `src/detection/`, `src/tracking/` | YOLO11n examples; some scripts read a local webcam, the image demo reads car/bike images; ByteTrack and DeepSORT demos | Drone/aerial per team description | Not yet established by code or data. Need an aerial input and model/dataset confirmation. |
| `ai/detection/detector.py` | Configured YOLO vehicle detector, filters car/truck/bus/motorcycle/bicycle; supports ByteTrack | CCTV/terrestrial vehicle detector | Plausible, but current generic checkpoint is not evidence of CCTV-specific training. |
| `ai/embedding/`, `ai/crossview/` | DINOv2 features, FAISS similarity lookup, camera graph and association helpers | Match vehicles across drone/CCTV views | Partial utilities; not a validated end-to-end ReID pipeline. |
| `integration/ai_adapter/` | Maps configured output into the Spring API payload | AI/backend boundary | Working prototype adapter; event/risk policy requires team validation. |

## Model configuration

`ai/configs/config.yaml` selects the default YOLO checkpoint. Override it with `AEGIS_YOLO_MODEL` to point to a locally supplied compatible checkpoint. Model files are ignored by Git. The repository contains no domain-trained aerial/CCTV weights, so detector performance for those camera angles must be evaluated separately.

## Contract mapping

The adapter requires `SOURCE_ID`, `AI_EVENT_TYPE`, and `AI_RISK_SCORE` from environment configuration. It derives confidence from the highest-confidence detection and severity from risk thresholds. It sends `vehicleCount` and a UTC timestamp. The adapter throttles repeated events by a configurable interval because each accepted detection creates a new incident.

The current vehicle detector does not identify intrusion, crowd anomalies, weapons, fire, or person collapse. Those event types must not be attributed to this detector unless another validated model/analytics module supplies them.
