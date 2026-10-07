package com.aegissight.incident.application.service;

import com.aegissight.alert.domain.repository.AlertRepository;
import com.aegissight.camera.domain.entity.Camera;
import com.aegissight.camera.domain.repository.CameraRepository;
import com.aegissight.common.application.util.IncidentStatusTransitionValidator;
import com.aegissight.common.domain.model.AlertStatus;
import com.aegissight.common.domain.model.EventType;
import com.aegissight.common.domain.model.IncidentStatus;
import com.aegissight.common.domain.model.Severity;
import com.aegissight.common.infrastructure.dto.PageResponse;
import com.aegissight.detection.domain.entity.Detection;
import com.aegissight.detection.domain.repository.DetectionRepository;
import com.aegissight.incident.api.dto.CriticalIncidentResponse;
import com.aegissight.incident.api.dto.IncidentDetailResponse;
import com.aegissight.incident.api.dto.IncidentResponse;
import com.aegissight.incident.api.dto.UpdateIncidentStatusRequest;
import com.aegissight.incident.api.dto.UpdateIncidentStatusResponse;
import com.aegissight.incident.api.mapper.IncidentMapper;
import com.aegissight.incident.domain.entity.Incident;
import com.aegissight.incident.domain.exception.IncidentNotFoundException;
import com.aegissight.incident.domain.repository.IncidentRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IncidentServiceImpl implements IncidentService {

    private static final int MAX_PAGE_SIZE = 100;

    private final IncidentRepository incidentRepository;
    private final DetectionRepository detectionRepository;
    private final CameraRepository cameraRepository;
    private final AlertRepository alertRepository;
    private final IncidentMapper incidentMapper;

    public IncidentServiceImpl(
            IncidentRepository incidentRepository,
            DetectionRepository detectionRepository,
            CameraRepository cameraRepository,
            AlertRepository alertRepository,
            IncidentMapper incidentMapper
    ) {
        this.incidentRepository = incidentRepository;
        this.detectionRepository = detectionRepository;
        this.cameraRepository = cameraRepository;
        this.alertRepository = alertRepository;
        this.incidentMapper = incidentMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<IncidentResponse> listIncidents(
            IncidentStatus status,
            Severity severity,
            EventType eventType,
            String sourceId,
            int page,
            int size
    ) {
        int pageSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Incident> incidentPage = incidentRepository.findAll(
                status, severity, eventType, sourceId, pageRequest
        );

        List<IncidentResponse> items = incidentPage.getContent().stream()
                .map(incident -> incidentMapper.toResponse(incident, findCamera(incident.getSourceId())))
                .toList();

        return new PageResponse<>(items, toPageDetails(incidentPage));
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentDetailResponse getIncident(UUID id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IncidentNotFoundException("Incident not found: " + id));

        Camera camera = findCamera(incident.getSourceId());
        Detection detection = detectionRepository.findById(incident.getDetectionId()).orElse(null);

        return incidentMapper.toDetailResponse(incident, camera, detection);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CriticalIncidentResponse> listCriticalIncidents() {
        return incidentRepository.findCriticalActive().stream()
                .map(incident -> incidentMapper.toCriticalResponse(incident, findCamera(incident.getSourceId())))
                .toList();
    }

    @Override
    @Transactional
    public UpdateIncidentStatusResponse updateStatus(UUID id, UpdateIncidentStatusRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IncidentNotFoundException("Incident not found: " + id));

        IncidentStatusTransitionValidator.validate(incident.getStatus(), request.status());

        incident.setStatus(request.status());
        incident.setStatusNote(request.note());
        incident.setUpdatedAt(Instant.now());
        Incident saved = incidentRepository.save(incident);

        syncAlertStatus(saved);

        return incidentMapper.toStatusUpdateResponse(saved);
    }

    private void syncAlertStatus(Incident incident) {
        AlertStatus targetStatus = switch (incident.getStatus()) {
            case RESOLVED -> AlertStatus.RESOLVED;
            case FALSE_ALERT -> AlertStatus.FALSE_ALERT;
            default -> null;
        };

        if (targetStatus == null) {
            return;
        }

        alertRepository.findByIncidentId(incident.getId()).forEach(alert -> {
            alert.setStatus(targetStatus);
            alertRepository.save(alert);
        });
    }

    private Camera findCamera(String sourceId) {
        return cameraRepository.findById(sourceId).orElse(null);
    }

    private PageResponse.PageDetails toPageDetails(Page<Incident> page) {
        return new PageResponse.PageDetails(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext()
        );
    }
}
