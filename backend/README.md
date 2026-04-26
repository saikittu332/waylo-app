# Waylo Backend

FastAPI + PostgreSQL foundation for Waylo.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `DATABASE_URL` in `.env`, then run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

API docs are available at:

```text
http://127.0.0.1:8000/docs
```

## Current Scope

- User model
- Vehicle model
- Trip model
- SavedPlan model
- Subscription model
- Basic CRUD-style endpoints
- Alembic migration support
- Environment-based config

Stripe, Mapbox, and AI planning are intentionally not integrated yet.
