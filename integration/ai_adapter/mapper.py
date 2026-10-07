"""Translate vehicle detections into the backend V1 request contract."""

from collections import Counter
from datetime import datetime, timezone


def severity_for_risk(risk_score: int) -> str:
    if risk_score >= 90:
        return "CRITICAL"
    if risk_score >= 80:
        return "HIGH"
    if risk_score >= 40:
        return "MEDIUM"
    return "LOW"


def build_detection_payload(
    *,
    source_id: str,
    event_type: str,
    risk_score: int,
    detections: list,
    summary: str | None = None,
) -> dict | None:
    """Create one contract payload; return None when there are no detections."""
    if not detections:
        return None
    if not source_id.strip():
        raise ValueError("source_id must be configured")
    if not 0 <= risk_score <= 100:
        raise ValueError("risk_score must be between 0 and 100")
    if event_type not in {
        "INTRUSION",
        "PHYSICAL_DISTURBANCE",
        "CROWD_ANOMALY",
        "FIRE_SMOKE",
        "PERSON_COLLAPSE",
        "WEAPON_DETECTED",
        "VEHICLE_ANOMALY",
        "UNKNOWN",
    }:
        raise ValueError(f"unsupported event_type: {event_type}")

    confidences = [float(detection.confidence) for detection in detections]
    if any(not 0.0 <= confidence <= 1.0 for confidence in confidences):
        raise ValueError("detection confidence must be between 0.0 and 1.0")

    class_counts = Counter(detection.class_name for detection in detections)
    class_summary = ", ".join(
        f"{count} {name}{'s' if count != 1 else ''}"
        for name, count in sorted(class_counts.items())
    )
    event_summary = summary or f"{class_summary} detected by the vision pipeline."

    return {
        "sourceId": source_id,
        "eventType": event_type,
        "confidence": max(confidences),
        "severity": severity_for_risk(risk_score),
        "vehicleCount": len(detections),
        "riskScore": risk_score,
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "summary": event_summary,
    }
