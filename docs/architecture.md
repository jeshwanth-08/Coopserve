# CoopServe Architecture

CoopServe is organized as a small monorepo so the hackathon team can work independently across the product surface.

- `frontend/`: React and TypeScript user experience. Feature-specific UI belongs under `src/features`; shared primitives live under `src/components`.
- `backend/`: FastAPI application. Routes translate HTTP requests, services hold use cases, repositories isolate persistence, and models represent database tables.
- `backend/alembic/`: PostgreSQL schema migrations.
- `infra/`: Reverse proxy and deployment infrastructure.

The API is versioned under `/api/v1`. PostgreSQL is the system of record; local development is provided by Docker Compose.
