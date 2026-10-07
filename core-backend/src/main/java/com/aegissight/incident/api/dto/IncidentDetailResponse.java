package com.aegissight.incident.api.dto;

import com.aegissight.common.domain.model.EventType;
import com.aegissight.common.domain.model.IncidentStatus;
import com.aegissight.common.domain.model.Severity;
import java.time.Instant;
import java.util.UUID;

public record IncidentDetailResponse(
    UUID id,
    String incidentCode,
    String title,
    String summary,
    EventType eventType,
    Severity severity,
    IncidentStatus status,
    Integer riskScore,
    String sourceId,
    String cameraName,
    String locationLabel,
    Double latitude,
    Double longitude,
    Instant createdAt,
    Instant updatedAt,
    String statusNote,
    LatestDetectionDto latestDetection
) {
    public record LatestDetectionDto(
        UUID id,
        Double confidence,
        Integer peopleCount,
        Instant timestamp
    ) {}
}
