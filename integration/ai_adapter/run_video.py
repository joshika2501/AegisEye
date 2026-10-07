"""Run the available vehicle detector and publish configured events."""

import logging
import os
import time

import cv2

from ai.detection.detector import VehicleDetector
from integration.ai_adapter.backend_client import BackendClient
from integration.ai_adapter.mapper import build_detection_payload


logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("aegiseye.ai_adapter")


def required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Set the {name} environment variable before starting the adapter.")
    return value


def video_source(value: str):
    return int(value) if value.isdecimal() else value


def main() -> None:
    base_url = os.getenv("API_BASE_URL", "http://localhost:8080")
    source_id = required_env("SOURCE_ID")
    event_type = os.getenv("AI_EVENT_TYPE", "VEHICLE_ANOMALY").strip().upper()
    risk_score = int(required_env("AI_RISK_SCORE"))
    min_vehicle_count = max(1, int(os.getenv("AI_MIN_VEHICLES_FOR_EVENT", "1")))
    cooldown_seconds = max(0, int(os.getenv("AI_EVENT_COOLDOWN_SECONDS", "60")))
    preview = os.getenv("SHOW_PREVIEW", "true").lower() in {"1", "true", "yes"}

    client = BackendClient(
        base_url,
        required_env("API_USERNAME"),
        required_env("API_PASSWORD"),
    )
    detector = VehicleDetector()
    capture = cv2.VideoCapture(video_source(os.getenv("VIDEO_SOURCE", "0")))
    if not capture.isOpened():
        raise RuntimeError("Could not open VIDEO_SOURCE.")

    last_sent = 0.0
    frame_id = 0
    logger.info("Adapter started for source %s; event type %s, configured risk %s", source_id, event_type, risk_score)
    logger.warning("Risk score and event type are configured prototype policy, not model-calibrated anomaly output.")

    try:
        while True:
            ok, frame = capture.read()
            if not ok:
                break
            frame_id += 1
            detections = detector.track(frame, frame_id=frame_id, persist=True)

            if len(detections) >= min_vehicle_count and time.monotonic() - last_sent >= cooldown_seconds:
                payload = build_detection_payload(
                    source_id=source_id,
                    event_type=event_type,
                    risk_score=risk_score,
                    detections=detections,
                )
                result = client.post_detection(payload)
                last_sent = time.monotonic()
                logger.info("Backend accepted detection: %s", result)

            if preview:
                cv2.imshow("AegisEye AI Adapter", detector.draw_detections(frame, detections))
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
    finally:
        capture.release()
        if preview:
            cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
