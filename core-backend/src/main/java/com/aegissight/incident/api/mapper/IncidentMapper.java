package com.aegissight.incident.api.mapper;

import com.aegissight.camera.domain.entity.Camera;
import com.aegissight.detection.domain.entity.Detection;
import com.aegissight.incident.api.dto.CriticalIncidentResponse;
import com.aegissight.incident.api.dto.IncidentDetailResponse;
import com.aegissight.incident.api.dto.IncidentResponse;
import com.aegissight.incident.api.dto.UpdateIncidentStatusResponse;
import com.aegissight.incident.domain.entity.Incident;
import org.springframework.stereotype.Component;

@Component
public class IncidentMapper {

    public IncidentResponse toResponse(Incident incident, Camera camera) {
        return new IncidentResponse(
                incident.getId(),
                incident.getIncidentCode(),
                incident.getTitle(),
                incident.getEventType(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getRiskScore(),
                incident.getSourceId(),
                camera != null ? camera.getName() : null,
                camera != null ? camera.getLocationLabel() : null,
                incident.getCreatedAt(),
                incident.getUpdatedAt()
        );
    }

    public IncidentDetailResponse toDetailResponse(Incident incident, Camera camera, Detection detection) {
        IncidentDetailResponse.LatestDetectionDto latestDetection = null;
        if (detection != null) {
            latestDetection = new IncidentDetailResponse.LatestDetectionDto(
                    detection.getId(),
                    detection.getConfidence(),
                    detection.getPeopleCount(),
                    detection.getDetectedAt()
            );
        }

        return new IncidentDetailResponse(
                incident.getId(),
                incident.getIncidentCode(),
                incident.getTitle(),
                incident.getSummary(),
                incident.getEventType(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getRiskScore(),
                incident.getSourceId(),
                camera != null ? camera.getName() : null,
                camera != null ? camera.getLocationLabel() : null,
                camera != null ? camera.getLatitude() : null,
                camera != null ? camera.getLongitude() : null,
                incident.getCreatedAt(),
                incident.getUpdatedAt(),
                incident.getStatusNote(),
                latestDetection
        );
    }

    public CriticalIncidentResponse toCriticalResponse(Incident incident, Camera camera) {
        return new CriticalIncidentResponse(
                incident.getId(),
                incident.getIncidentCode(),
                incident.getTitle(),
                incident.getEventType(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getRiskScore(),
                incident.getSourceId(),
                camera != null ? camera.getLocationLabel() : null,
                incident.getCreatedAt()
        );
    }

    public UpdateIncidentStatusResponse toStatusUpdateResponse(Incident incident) {
        return new UpdateIncidentStatusResponse(
                incident.getId(),
                incident.getIncidentCode(),
                incident.getStatus(),
                incident.getUpdatedAt(),
                incident.getStatusNote()
        );
    }
}
