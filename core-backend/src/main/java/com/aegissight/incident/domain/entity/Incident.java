package com.aegissight.incident.domain.entity;

import com.aegissight.common.domain.model.EventType;
import com.aegissight.common.domain.model.IncidentStatus;
import com.aegissight.common.domain.model.Severity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    private UUID id;

    @Column(name = "incident_code", nullable = false, unique = true)
    private String incidentCode;

    @Column(name = "detection_id", nullable = false, unique = true)
    private UUID detectionId;

    @Column(name = "source_id", nullable = false)
    private String sourceId;

    @Column(nullable = false)
    private String title;

    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "status_note", columnDefinition = "TEXT")
    private String statusNote;

    protected Incident() {
    }

    public Incident(
            UUID id,
            String incidentCode,
            UUID detectionId,
            String sourceId,
            String title,
            String summary,
            EventType eventType,
            Severity severity,
            Integer riskScore,
            IncidentStatus status,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.incidentCode = incidentCode;
        this.detectionId = detectionId;
        this.sourceId = sourceId;
        this.title = title;
        this.summary = summary;
        this.eventType = eventType;
        this.severity = severity;
        this.riskScore = riskScore;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getIncidentCode() {
        return incidentCode;
    }

    public UUID getDetectionId() {
        return detectionId;
    }

    public String getSourceId() {
        return sourceId;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public EventType getEventType() {
        return eventType;
    }

    public Severity getSeverity() {
        return severity;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public String getStatusNote() {
        return statusNote;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setStatusNote(String statusNote) {
        this.statusNote = statusNote;
    }
}
