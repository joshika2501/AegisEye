package com.aegissight.incident.api.dto;

import com.aegissight.common.domain.model.IncidentStatus;
import java.time.Instant;
import java.util.UUID;

public record UpdateIncidentStatusResponse(
    UUID id,
    String incidentCode,
    IncidentStatus status,
    Instant updatedAt,
    String note
) {}
