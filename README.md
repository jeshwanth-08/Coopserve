# CoopServe

Smart India Hackathon project for coordinating community needs, volunteers, and local initiatives.

## Stack

- React, TypeScript, Vite, and TailwindCSS
- FastAPI, Pydantic, SQLAlchemy, and Alembic
- PostgreSQL 16
- Docker Compose for local infrastructure

## Repository Layout

```text
frontend/                 React application
backend/app/api/          Versioned HTTP routes
backend/app/core/         Settings and cross-cutting concerns
backend/app/db/           Database engine and sessions
backend/app/models/       SQLAlchemy models
backend/app/schemas/      API request/response schemas
backend/app/repositories/ Persistence access
backend/app/services/     Business use cases
backend/alembic/          PostgreSQL migrations
backend/tests/            Backend tests
infra/                    Deployment and reverse-proxy configuration
docs/                     Architecture and API notes
```

## Local Development

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Start PostgreSQL:

	```bash
	docker compose up -d db
	```

3. Start the API:

	```bash
	cd backend
	python -m venv .venv
	source .venv/bin/activate
	pip install -r requirements.txt
	uvicorn app.main:app --reload --port 8000
	```

4. Start the frontend in a second terminal:

	```bash
	cd frontend
	npm install
	npm run dev
	```

The web app runs at `http://localhost:5173`, API documentation at `http://localhost:8000/docs`, and the health check at `http://localhost:8000/api/v1/health`.

The first version includes a community board with category filters, dashboard metrics, initiative creation, and volunteer signup. When the API is unavailable, the frontend displays sample initiatives so the interface can still be explored; publishing and signup require the backend to be running.

## Useful Commands

```bash
docker compose up --build       # Run database and API containers
cd backend && pytest            # Run backend tests
cd frontend && npm run build    # Type-check and build the web app
```

The API container runs `alembic upgrade head` automatically before Uvicorn, so a fresh PostgreSQL volume is migrated on startup.

See [docs/architecture.md](docs/architecture.md) for the ownership boundaries used when adding features.