# Frontend integration status

This repository contains only the React/Vite frontend. It has no backend source, API client, authentication provider, role claims, or AI/device service configuration. The login form therefore does not authenticate; demo mode is the only way into dashboard routes and is stored in `sessionStorage`. Demo resource edits are isolated to the browser's `localStorage`.

## Connected services

- OpenStreetMap standard tile service for the map background (attribution is shown on-map).
- Bundled Karnataka ADM1 geometry from geoBoundaries / DataMeet Maps (`src/assets/karnataka-boundary.json`). Boundary attribution: geoBoundaries / DataMeet Maps; source metadata identifies CC BY 2.5 IN.

## Backend work required

| Capability | Suggested integration boundary |
| --- | --- |
| Authentication and sessions | `POST /api/auth/login`, `POST /api/auth/logout`, session refresh endpoint, and a server-provided role claim |
| Device inventory and configuration | `GET/POST /api/devices`, `GET/PATCH/DELETE /api/devices/{id}`; validate identifiers and authorize every mutation server-side |
| Monitoring blocks | `GET/POST /api/blocks`, `GET/PATCH/DELETE /api/blocks/{id}` with validated GeoJSON geometries and device assignments |
| CCTV stream metadata | `GET /api/cameras/{id}/stream` returning an authorized short-lived stream URL or server-side playback session; keep credentials off the client |
| AI detections and alerts | `GET /api/detections` and/or an authenticated event stream with timestamps and supported object classes |
| Drone telemetry and commands | `GET /api/drones/{id}/telemetry` and explicit command endpoints only for implemented device actions |
| Administration | Admin-protected user/device/block listing, role mutation, and audit-history endpoints |

The frontend must not treat demo data as operational state. Demo mode has no device command controls, cannot call production APIs, and cannot grant an administrator role. The administration page remains an explicit unavailable state until authentication and backend role enforcement exist.
