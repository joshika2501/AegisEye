# AegisSight Core Backend

AegisSight Core Backend is a Spring Boot modular monolith for the AegisSight prototype. It receives structured AI inference results, validates and stores detections, creates incidents, generates alerts, and exposes dashboard APIs for frontend integration.

## Architecture

The codebase is organized by backend module:

- `auth`: operator login and JWT authentication
- `camera`: backend-managed camera/source metadata
- `detection`: AI inference ingestion
- `incident`: incident listing, detail, critical incidents, and lifecycle updates
- `alert`: alert listing generated from incidents
- `common`: shared enums, response DTOs, validation helpers, and exception handling

Each module follows the existing flow:

```text
Controller -> Service / UseCase -> Repository -> Database
```

## Prerequisites

- Java 21
- Maven Wrapper included in this repository
- PostgreSQL 14+

## Configuration

Set the variables shown in `.env.example` in your shell or IDE run configuration. Spring Boot does not load a plain `.env` file automatically.

Required variables:

- `DB_URL`: PostgreSQL JDBC URL
- `DB_USERNAME`: database username
- `DB_PASSWORD`: database password
- `JWT_SECRET`: JWT signing secret, at least 32 random bytes

Optional variables:

- `SERVER_PORT`: defaults to `8080`
- `JWT_EXPIRATION_SECONDS`: defaults to `86400`
- `CORS_ALLOWED_ORIGINS`: comma-separated frontend origins
- `JPA_SHOW_SQL`: defaults to `false`

The JWT secret is required; the application will not start without it. Do not commit a real secret. The previous signing key was present in a committed configuration file, so use a newly generated secret and invalidate tokens signed with the old key.

For Git Bash, set the variables for the current terminal before starting the backend:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/aegissight
export DB_USERNAME=aegissight
export DB_PASSWORD=your-local-database-password
export JWT_SECRET='replace-with-a-private-random-secret-at-least-32-bytes-long'
./mvnw spring-boot:run
```

## Database Setup

Create the PostgreSQL database and user, then start the application. Flyway applies migrations from `src/main/resources/db/migration`.

```powershell
.\mvnw.cmd spring-boot:run
```

Default seeded operator:

- Username: `operator@aegissight.local`
- Password: `password123`

## Running Tests

Tests use an in-memory H2 database with the `test` profile.

```powershell
.\mvnw.cmd clean test
```

## API Overview

All API routes are under `/api`.

Public routes:

- `POST /api/auth/login`
- `GET /api/health`

Authenticated routes:

- `POST /api/detections`
- `GET /api/incidents`
- `GET /api/incidents/{id}`
- `PUT /api/incidents/{id}/status`
- `GET /api/incidents/critical`
- `GET /api/alerts`
- `GET /api/cameras`
- `POST /api/cameras`

## Authentication

Login request:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "operator@aegissight.local",
  "password": "password123"
}
```

Use the returned token on protected calls:

```http
Authorization: Bearer <accessToken>
```

## API Contract

The backend API contract lives at:

```text
../docs/api-contract/backend-api-contract.md
```
