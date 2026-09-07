# CoopServe API

All endpoints are prefixed with `/api/v1`.

## Endpoints

- `GET /health` returns the service status.
- `GET /initiatives?category=Environment` lists initiatives.
- `POST /initiatives` creates an initiative.
- `GET /initiatives/stats/summary` returns dashboard aggregates.
- `POST /initiatives/{initiative_id}/join` registers a volunteer.

Initiatives and volunteer signups are stored in PostgreSQL. Run `alembic upgrade head` from `backend/` when running the API outside Docker.
# API Conventions

- JSON responses use `snake_case` keys.
- Resource routes are grouped under `/api/v1`.
- Health checks are available at `GET /api/v1/health`.
- New business logic should be implemented in a service before adding complexity to a route handler.
