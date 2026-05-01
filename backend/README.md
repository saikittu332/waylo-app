# Waylo Backend

FastAPI + PostgreSQL foundation for Waylo.

## Local PostgreSQL Setup

From the repository root, start the local database:

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:

```text
database: waylo
user: postgres
password: postgres
```

## Backend Setup

In a second terminal:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

`DATABASE_URL` is already set for the Docker database:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/waylo
```

For Firebase token verification, place the Firebase Admin SDK service account JSON at:

```text
backend/firebase-service-account.json
```

That file is intentionally ignored by git. If you keep it somewhere else, update:

```text
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

Run Alembic migrations:

```bash
alembic upgrade head
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Open the API docs:

```text
http://127.0.0.1:8000/docs
```

## Database Smoke Tests

With Docker Postgres running, run:

```bash
cd backend
pytest
```

If you want the test run to fail instead of skip when PostgreSQL is not reachable:

```bash
$env:WAYLO_REQUIRE_DATABASE_TESTS="1"
pytest
```

The smoke test runs Alembic migrations and verifies:

- create user
- create vehicle
- create trip
- get trips by user
- update profile planning preferences

## Alembic Coverage

The initial Alembic migration creates all current persistence tables:

- `users`
- `vehicles`
- `trips`
- `saved_plans`

`users` also stores a nullable `firebase_uid`, active vehicle selection, and planning preferences for fuel alerts and rest reminder timing.

## Current Scope

- User model
- Vehicle model
- Trip model
- SavedPlan model
- User planning preferences
- Basic CRUD-style endpoints
- Alembic migration support
- Environment-based config
- Local Docker PostgreSQL setup
- API persistence smoke tests

Mapbox route preview, Firebase verification scaffolding, and rule-based planning are present. Turn-by-turn navigation, fuel price APIs, and AI planning are intentionally not integrated yet.
