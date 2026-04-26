# Waylo

Waylo is an MVP React Native Expo app for an AI road trip planning assistant.

Tagline: Drive smart. Spend less.

## What is included

- Onboarding, phone OTP placeholder, assistant naming, vehicle setup, trip input, AI trip results, stop details, navigation mode, trip summary, and paywall screens.
- Mock Firebase phone auth service.
- Mock Mapbox route preview through a map service abstraction that can later support Google Maps.
- Mock subscription logic isolated for future Stripe integration.
- Rule-based trip intelligence for fuel range, safe range, rest stops, fuel cost, and estimated savings.
- Mock trip and vehicle data.

## Run locally

```bash
npm install
npx expo start
```

Then open the Expo app on a simulator, emulator, physical device, or web target.

## Backend foundation

The FastAPI + PostgreSQL foundation lives in `backend/`.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

The backend currently includes User, Vehicle, Trip, SavedPlan, and Subscription models plus basic API endpoints. Stripe, Mapbox, and AI planning are intentionally not integrated yet.

## Future integration points

- `src/services/authService.js`: replace the mock phone OTP flow with Firebase Phone Auth.
- `src/services/mapService.js`: connect Mapbox Directions and rendering, or add Google Maps behind the same service contract.
- `src/services/api.js`: replace local mock trip planning with FastAPI calls.
- `src/services/subscriptionService.js`: replace mock premium state with Stripe-backed entitlements.
