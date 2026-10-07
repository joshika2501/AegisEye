package com.aegissight.health.api.controller;

import com.aegissight.health.api.dto.HealthResponse;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final String serviceName;
    private final String version;
    private final DataSource dataSource;

    public HealthController(
            @Value("${aegissight.app.service-name}") String serviceName,
            @Value("${aegissight.app.version}") String version,
            DataSource dataSource
    ) {
        this.serviceName = serviceName;
        this.version = version;
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<HealthResponse> health() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                return ResponseEntity.ok(response("UP"));
            }
        } catch (SQLException ignored) {
            // Keep database error details out of this public endpoint.
        }

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response("DOWN"));
    }

    private HealthResponse response(String status) {
        return new HealthResponse(status, serviceName, version, Instant.now());
    }
}
