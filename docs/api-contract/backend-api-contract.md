# AegisSight Backend API Contract V1

Purpose: defined the final backend API contract for AegisSight AI hackathon prototype. This contract keeps only the APIs needed for the working flow:

```text
Camera/UAV Source
        |
        ↓
AI Vision Pipeline
(real-time image/video analysis, detection, tracking, risk assessment)
        |
        ↓
AI Inference Result JSON
        |
        ↓
Spring Boot Backend
        |
        ↓
Detection → Incident → Alert
        |
        ↓
Frontend Dashboard
```

The AI system does not generate images. AI processes real-time image/video streams and sends structured inference results only. The backend does not process, store, stream, or generate images/videos. It only receives structured AI inference results, validates them, stores detections, creates incidents, generates alerts, and exposes stable dashboard APIs.

## Contract Basics

- Base URL: `http://localhost:8080`
- API prefix: `/api`
- Content type: `application/json`
- Auth: `Authorization: Bearer <accessToken>` for all APIs except `POST /api/auth/login` and `GET /api/health`
- Date/time format: ISO-8601 UTC, for example `2026-07-23T10:15:30Z`

## API Summary Table

| Module | Endpoint | Method | Purpose |
|---|---|---:|---|
| Authentication | `/api/auth/login` | POST | Login and receive JWT token |
| AI Inference / Detection | `/api/detections` | POST | Receive AI inference result and create incident/alert |
| Incidents | `/api/incidents` | GET | List incidents for dashboard and filters |
| Incidents | `/api/incidents/{id}` | GET | Get incident details |
| Incidents | `/api/incidents/{id}/status` | PUT | Update incident lifecycle status |
| Incidents | `/api/incidents/critical` | GET | List active critical incidents |
| Alerts | `/api/alerts` | GET | List alerts generated from incidents |
| Camera Metadata | `/api/cameras` | GET | List registered camera/source metadata |
| Camera Metadata | `/api/cameras` | POST | Register camera/source metadata |
| Health | `/api/health` | GET | Check backend availability |

## Common Enums

### Severity

```text
LOW
MEDIUM
HIGH
CRITICAL
```

### Incident Status

```text
NEW
VERIFIED
RESPONDING
RESOLVED
FALSE_ALERT
```

### Event Type

Prototype-supported values:

```text
INTRUSION
PHYSICAL_DISTURBANCE
CROWD_ANOMALY
FIRE_SMOKE
PERSON_COLLAPSE
WEAPON_DETECTED
VEHICLE_ANOMALY
UNKNOWN
```

### Alert Status

```text
OPEN
RESOLVED
FALSE_ALERT
```

### Camera Platform

```text
FIXED_CAMERA
UAV_CAMERA
```

`UAV_CAMERA` is metadata only. The backend must not expose UAV fleet control, UAV telemetry, or UAV management APIs.

## Standard Error Response

All APIs should use this error shape where possible.

```json
{
  "timestamp": "2026-07-23T10:15:30Z",
  "status": 422,
  "error": "Validation Failed",
  "message": "Request body has invalid fields",
  "path": "/api/detections",
  "requestId": "req_01J4A1B2C3",
  "fieldErrors": [
    {
      "field": "riskScore",
      "message": "must be between 0 and 100",
      "rejectedValue": 120
    }
  ]
}
```

Common status codes:

- `200 OK`: read/update successful
- `201 Created`: resource created
- `400 Bad Request`: malformed JSON or invalid request syntax
- `401 Unauthorized`: missing or invalid JWT
- `404 Not Found`: requested resource does not exist
- `409 Conflict`: duplicate resource or invalid incident status transition
- `422 Unprocessable Entity`: validation failed
- `500 Internal Server Error`: unexpected backend failure
- `503 Service Unavailable`: the health endpoint reports that the database is unavailable

## 1. Authentication

### POST `/api/auth/login`

Purpose: authenticate an operator and return a JWT token for frontend API calls.

Request JSON:

```json
{
  "username": "operator@aegissight.local",
  "password": "password123"
}
```

Response JSON `200 OK`:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresInSeconds": 86400,
  "user": {
    "id": "7f8a4d8d-4c99-47a1-b0d8-9fd37d8c6f21",
    "username": "operator@aegissight.local",
    "displayName": "Control Room Operator"
  }
}
```

Possible error responses:

- `400 Bad Request`: request body is missing or malformed
- `401 Unauthorized`: username/password is incorrect
- `422 Unprocessable Entity`: username or password is blank
- `500 Internal Server Error`: token generation failed unexpectedly

## 2. AI Inference / Detection API

### POST `/api/detections`

Purpose: This endpoint receives AI inference results generated after real-time image/video analysis. The backend validates the payload, stores the detection, creates an incident, and creates an alert when severity/risk requires it.

The AI system sends detection information only. It does not send complete camera metadata. AI does not generate images, and the backend does not process images/videos.

Request JSON:

```json
{
  "sourceId": "CAM-102",
  "eventType": "PHYSICAL_DISTURBANCE",
  "confidence": 0.94,
  "severity": "HIGH",
  "peopleCount": 28,
  "vehicleCount": 2,
  "riskScore": 87,
  "timestamp": "2026-07-23T10:15:30Z",
  "summary": "Possible physical disturbance detected near the main gate."
}
```

Validation rules:

- `sourceId` is required and must match a registered camera/source metadata record. `sourceId` represents the registered camera/UAV identifier. The backend uses this identifier to associate detections with stored camera metadata.
- `eventType` is required and must be one of the supported event types.
- `confidence` is required and must be between `0.0` and `1.0`.
- `severity` is required and must be one of `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
- `peopleCount` is optional; when present, it must be `0` or greater.
- `vehicleCount` is optional; when present, it must be `0` or greater.
- `riskScore` is required and must be between `0` and `100`.
- `timestamp` is required and must be ISO-8601 UTC.
- `summary` is optional but recommended for dashboard display.

Backend action:

1. Validate the AI inference result JSON.
2. Store a `Detection` record.
3. Create an `Incident` with status `NEW`.
4. Create an `Alert` if `severity` is `HIGH` or `CRITICAL`, or if `riskScore >= 80`.
5. Return the created incident reference to the AI/integration caller.

Response JSON `201 Created`:

```json
{
  "detectionId": "f7df0489-28a3-4fd2-a42a-f87f7124c731",
  "incidentId": "1197689b-09be-40e4-9b3f-31b983820ab5",
  "incidentCode": "INC-20260723-0001",
  "incidentStatus": "NEW",
  "alertCreated": true,
  "alertId": "e89f16ad-b581-4306-86d1-22a6ec5f88dc"
}
```

Possible error responses:

- `400 Bad Request`: malformed JSON
- `401 Unauthorized`: missing or invalid JWT
- `404 Not Found`: `sourceId` is required to exist and no matching camera/source was found. `sourceId` represents the registered camera/UAV identifier. Backend uses this identifier to associate detections with stored camera metadata.
- `422 Unprocessable Entity`: invalid confidence, severity, risk score, event type, or timestamp
- `500 Internal Server Error`: detection could not be stored

## 3. Incident APIs

Incident is the central backend entity. Incidents are created from detections and consumed by the frontend dashboard.

Allowed lifecycle:

```text
NEW -> VERIFIED -> RESPONDING -> RESOLVED
NEW -> FALSE_ALERT
VERIFIED -> FALSE_ALERT
RESPONDING -> RESOLVED
```

`RESOLVED` and `FALSE_ALERT` are terminal states.

### GET `/api/incidents`

Purpose: list incidents for the dashboard, incident table, and frontend filters.

Request JSON: none.

Query parameters:

- `status`: optional `Incident Status`
- `severity`: optional `Severity`
- `eventType`: optional `Event Type`
- `sourceId`: optional camera/source id. `sourceId` represents the registered camera/UAV identifier. Backend uses this identifier to associate detections with stored camera metadata.
- `page`: optional zero-based page number, default `0`
- `size`: optional page size, default `20`, max `100`

Response JSON `200 OK`:

```json
{
  "items": [
    {
      "id": "1197689b-09be-40e4-9b3f-31b983820ab5",
      "incidentCode": "INC-20260723-0001",
      "title": "Physical disturbance detected",
      "eventType": "PHYSICAL_DISTURBANCE",
      "severity": "HIGH",
      "status": "NEW",
      "riskScore": 87,
      "sourceId": "CAM-102",
      "cameraName": "Main Gate Camera",
      "locationLabel": "Main Gate",
      "createdAt": "2026-07-23T10:15:31Z",
      "updatedAt": "2026-07-23T10:15:31Z"
    }
  ],
  "page": {
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "hasNext": false
  }
}
```

Possible error responses:

- `401 Unauthorized`: missing or invalid JWT
- `422 Unprocessable Entity`: invalid query parameter value
- `500 Internal Server Error`: incidents could not be loaded

### GET `/api/incidents/{id}`

Purpose: get complete details for one incident.

Request JSON: none.

Path parameters:

- `id`: incident UUID

Response JSON `200 OK`:

```json
{
  "id": "1197689b-09be-40e4-9b3f-31b983820ab5",
  "incidentCode": "INC-20260723-0001",
  "title": "Physical disturbance detected",
  "summary": "Possible physical disturbance detected near the main gate.",
  "eventType": "PHYSICAL_DISTURBANCE",
  "severity": "HIGH",
  "status": "NEW",
  "riskScore": 87,
  "sourceId": "CAM-102",
  "cameraName": "Main Gate Camera",
  "locationLabel": "Main Gate",
  "latitude": 20.2961,
  "longitude": 85.8245,
  "createdAt": "2026-07-23T10:15:31Z",
  "updatedAt": "2026-07-23T10:15:31Z",
  "statusNote": null,
  "latestDetection": {
    "id": "f7df0489-28a3-4fd2-a42a-f87f7124c731",
    "confidence": 0.94,
    "peopleCount": 28,
    "timestamp": "2026-07-23T10:15:30Z"
  }
}
```

Possible error responses:

- `401 Unauthorized`: missing or invalid JWT
- `404 Not Found`: incident does not exist
- `422 Unprocessable Entity`: `id` is not a valid UUID
- `500 Internal Server Error`: incident could not be loaded

### PUT `/api/incidents/{id}/status`

Purpose: let the frontend update the incident lifecycle status after operator review/action.

Path parameters:

- `id`: incident UUID

Request JSON:

```json
{
  "status": "RESPONDING",
  "note": "Security team dispatched to main gate."
}
```

Response JSON `200 OK`:

```json
{
  "id": "1197689b-09be-40e4-9b3f-31b983820ab5",
  "incidentCode": "INC-20260723-0001",
  "status": "RESPONDING",
  "updatedAt": "2026-07-23T10:20:00Z",
  "note": "Security team dispatched to main gate."
}
```

The backend stores the latest optional status-update note and returns it in status-update and incident-detail responses. Notes may contain at most 2,000 characters.

Possible error responses:

- `400 Bad Request`: malformed JSON
- `401 Unauthorized`: missing or invalid JWT
- `404 Not Found`: incident does not exist
- `409 Conflict`: requested status transition is not allowed
- `422 Unprocessable Entity`: status is blank or unsupported
- `422 Unprocessable Entity`: note exceeds 2,000 characters
- `500 Internal Server Error`: status could not be updated

### GET `/api/incidents/critical`

Purpose: provide the frontend a quick list of active critical/high-risk incidents.

Request JSON: none.

Rules:

- Include incidents where `status` is not `RESOLVED` or `FALSE_ALERT`.
- Include incidents where `severity` is `CRITICAL`, or where `riskScore >= 90`.
- Sort newest first for prototype simplicity.

Response JSON `200 OK`:

```json
[
  {
    "id": "80ed1a46-af80-45fe-96d2-c612a3c49e5b",
    "incidentCode": "INC-20260723-0002",
    "title": "Weapon detected",
    "eventType": "WEAPON_DETECTED",
    "severity": "CRITICAL",
    "status": "NEW",
    "riskScore": 96,
    "sourceId": "CAM-201",
    "locationLabel": "North Entrance",
    "createdAt": "2026-07-23T10:18:11Z"
  }
]
```

Possible error responses:

- `401 Unauthorized`: missing or invalid JWT
- `500 Internal Server Error`: critical incidents could not be loaded

## 4. Alert APIs

Alerts are generated from incidents. There is no manual alert creation API in V1.

### GET `/api/alerts`

Purpose: list alerts for the frontend alert panel.

Request JSON: none.

Query parameters:

- `status`: optional `OPEN`, `RESOLVED`, or `FALSE_ALERT`
- `severity`: optional `Severity`
- `page`: optional zero-based page number, default `0`
- `size`: optional page size, default `20`, max `100`

Response JSON `200 OK`:

```json
{
  "items": [
    {
      "id": "e89f16ad-b581-4306-86d1-22a6ec5f88dc",
      "incidentId": "1197689b-09be-40e4-9b3f-31b983820ab5",
      "incidentCode": "INC-20260723-0001",
      "title": "High severity incident detected",
      "message": "Physical disturbance detected near Main Gate.",
      "severity": "HIGH",
      "status": "OPEN",
      "sourceId": "CAM-102",
      "locationLabel": "Main Gate",
      "createdAt": "2026-07-23T10:15:31Z"
    }
  ],
  "page": {
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "hasNext": false
  }
}
```

Possible error responses:

- `401 Unauthorized`: missing or invalid JWT
- `422 Unprocessable Entity`: invalid query parameter value
- `500 Internal Server Error`: alerts could not be loaded

## 5. Camera Metadata APIs

Camera metadata APIs are backend-managed records used for dashboard labels and AI `sourceId` validation. AI does not register or manage cameras; it only sends inference results containing `sourceId`. They do not expose streaming, health monitoring, video storage, UAV control, or maintenance workflows.

### GET `/api/cameras`

Purpose: list backend-managed camera/source metadata.

Request JSON: none.

Query parameters:

- `platform`: optional `FIXED_CAMERA` or `UAV_CAMERA`

Response JSON `200 OK`:

```json
[
  {
    "id": "CAM-102",
    "name": "Main Gate Camera",
    "platform": "FIXED_CAMERA",
    "locationLabel": "Main Gate",
    "active": true,
    "latitude": 20.2961,
    "longitude": 85.8245
  }
]
```

Possible error responses:

- `401 Unauthorized`: missing or invalid JWT
- `422 Unprocessable Entity`: invalid query parameter value
- `500 Internal Server Error`: cameras could not be loaded

### POST `/api/cameras`

Purpose: register backend-managed metadata for a camera or UAV-mounted visual source.

Request JSON:

```json
{
  "id": "CAM-102",
  "name": "Main Gate Camera",
  "platform": "FIXED_CAMERA",
  "locationLabel": "Main Gate",
  "active": true,
  "latitude": 20.2961,
  "longitude": 85.8245
}
```

Response JSON `201 Created`:

```json
{
  "id": "CAM-102",
  "name": "Main Gate Camera",
  "platform": "FIXED_CAMERA",
  "locationLabel": "Main Gate",
  "active": true,
  "latitude": 20.2961,
  "longitude": 85.8245
}
```

Possible error responses:

- `400 Bad Request`: malformed JSON
- `401 Unauthorized`: missing or invalid JWT
- `409 Conflict`: camera/source `id` already exists
- `422 Unprocessable Entity`: required fields are blank or latitude/longitude is invalid
- `500 Internal Server Error`: camera metadata could not be saved

## 6. Health API

### GET `/api/health`

Purpose: allow frontend, AI team, and deployment scripts to verify the backend is running.

Request JSON: none.

Response JSON `200 OK`:

```json
{
  "status": "UP",
  "service": "aegissight-backend",
  "version": "1.0.0-prototype",
  "timestamp": "2026-07-23T10:15:30Z"
}
```

The endpoint checks database connectivity. It returns `200 OK` with `status: UP` when the database is reachable and `503 Service Unavailable` with `status: DOWN` otherwise. Database error details are not exposed.

Possible error responses:

- `503 Service Unavailable`: database connectivity check failed; response body reports `status: DOWN`
- `500 Internal Server Error`: unexpected health-check failure

## Backend Database Entities

### User

Stores login identity for JWT authentication.

Fields:

- `id`: UUID primary key
- `username`: unique login name/email
- `passwordHash`: hashed password
- `displayName`: frontend display name
- `createdAt`: creation timestamp

### Camera

Stores backend-owned metadata for camera/UAV visual sources.

Fields:

- `id`: string primary key, same value AI sends as `sourceId`
- `name`: display name
- `platform`: `FIXED_CAMERA` or `UAV_CAMERA`
- `locationLabel`: human-readable location
- `active`: boolean metadata flag
- `latitude`: optional decimal latitude
- `longitude`: optional decimal longitude

### Detection

Stores raw structured AI inference results.

Fields:

- `id`: UUID primary key
- `sourceId`: camera/source id. `sourceId` represents the registered camera/UAV identifier. Backend uses this identifier to associate detections with stored camera metadata.
- `eventType`: detected event type
- `confidence`: AI confidence between `0.0` and `1.0`
- `severity`: AI-provided severity
- `peopleCount`: optional count from AI pipeline
- `vehicleCount`: optional count from AI pipeline
- `riskScore`: AI risk score between `0` and `100`
- `detectedAt`: AI event timestamp
- `summary`: AI-provided summary
- `createdAt`: backend ingestion timestamp

### Incident

Central backend entity created from a detection.

Fields:

- `id`: UUID primary key
- `incidentCode`: human-readable unique code, for example `INC-20260723-0001`
- `detectionId`: source detection id
- `sourceId`: camera/source id. `sourceId` represents the registered camera/UAV identifier. Backend uses this identifier to associate detections with stored camera metadata.
- `title`: dashboard title
- `summary`: incident summary
- `eventType`: incident event type
- `severity`: current severity
- `riskScore`: current risk score
- `status`: `NEW`, `VERIFIED`, `RESPONDING`, `RESOLVED`, or `FALSE_ALERT`
- `createdAt`: creation timestamp
- `updatedAt`: last update timestamp
- `statusNote`: latest optional operator note supplied during a status update

### Alert

Generated automatically for high-risk incidents.

Fields:

- `id`: UUID primary key
- `incidentId`: linked incident id
- `title`: alert title
- `message`: alert message for frontend display
- `severity`: alert severity
- `status`: `OPEN`, `RESOLVED`, or `FALSE_ALERT`
- `createdAt`: creation timestamp

## Ownership Boundary Section

### AI Team Owns

- Camera/UAV image and video processing
- Real-time image/video stream analysis
- Object/event detection
- Tracking and temporal analysis
- Risk score generation
- Generation of incident summary and analytics output

The current AI implementation does **not** expose an HTTP API or generate a JSON payload directly.

A lightweight AI Integration Adapter will convert the AI analytics output into the backend ingestion request and send it to:

`POST /api/detections`

without modifying the AI model or inference logic.

The AI module does not:

- Generate images
- Manage camera metadata
- Generate event-level confidence values
- Perform HTTP communication with the backend directly

### Backend Team Owns

- Login and JWT token generation
- Detection ingestion API
- Payload validation
- Detection persistence
- Incident creation and lifecycle management
- Alert generation from incidents
- Camera/source metadata APIs
- Stable REST APIs for frontend integration
- AI does not manage camera metadata. AI only provides inference results containing `sourceId`. Backend maintains camera registration, location information, and incident lifecycle management.

### Frontend Team Owns

- Dashboard UI
- Incident list/detail visualization
- Filters and status controls
- Alert panel display
- Operator interaction flows

### Integration Team Owns

- Connecting AI output to backend ingestion
- Data aggregation outside this V1 backend contract
- Cross-module correlation outside this V1 backend contract
- Advanced analytics and timeline visualization outside this V1 backend contract

## Implementation Notes

- Designed for a Spring Boot modular monolith.
- Suggested backend modules: `auth`, `detection`, `incident`, `alert`, `camera`, and `common`.
- Prototype focuses on the working AI → Backend → Frontend flow.
- Backend should implement DTOs from this contract before controllers/entities to keep frontend and AI integration stable.
- For speed, one valid detection creates one incident in V1.
- Alerts are generated automatically from incidents; no manual alert API is included.
- This contract can later evolve into microservices if the prototype grows, but no microservice communication APIs are included in V1.
- Excluded by design: UAV fleet control, video storage, evidence storage, camera streaming, camera health monitoring, maintenance management, multi-region synchronization, advanced analytics, dashboard aggregation APIs, user administration, and permission management.
