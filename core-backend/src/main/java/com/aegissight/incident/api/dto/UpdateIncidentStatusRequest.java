package com.aegissight.incident.api.dto;

import com.aegissight.common.domain.model.IncidentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateIncidentStatusRequest(
    @NotNull(message = "status is required")
    IncidentStatus status,

    @Size(max = 2000, message = "note must be 2000 characters or fewer")
    String note
) {}
