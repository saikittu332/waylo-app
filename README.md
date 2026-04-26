# Waylo

Waylo is an MVP React Native Expo app for an AI road trip planning assistant.

Tagline: Drive smart. Spend less.

## What is included

- Onboarding, phone OTP placeholder, assistant naming, vehicle setup, trip input, AI trip results, stop details, navigation mode, trip summary, and paywall screens.
- Mock Firebase phone auth service.
- Mock Mapbox route preview through a map service abstraction that can later support Google Maps.
- Mock subscription logic isolated for future Stripe integration.
- Rule-based trip intelligence for fuel range, safe range, rest stops, fuel cost, and estimated savings.
- Mock map visuals and AI stop recommendations until Mapbox and AI planning are integrated.
- Real FastAPI persistence for users, vehicles, trips, saved plans, and subscriptions when the backend is running.

## Run locally

```bash
npm install
npx expo start
```

Then open the Expo app on a simulator, emulator, physical device, or web target.

## Firebase Phone Auth

Real Firebase SMS OTP on a physical iPhone requires a custom Expo development build. The stock Expo Go app can still open the UI, but native Firebase Phone Auth is only available in the Waylo dev build.

Firebase iOS setup currently expects:

```text
Bundle ID: com.saikittu332.waylo
Config file: ./GoogleService-Info.plist
```

Create an iOS development build:

```powershell
npx eas login
npx eas build:configure
npx eas build --profile development --platform ios
```

After installing that build on the iPhone, start Metro for the dev client:

```powershell
npm run start:dev-client
```

For backend persistence during mobile testing, point the app at your computer's LAN IP:

```powershell
$env:EXPO_PUBLIC_WAYLO_API_URL="http://YOUR_COMPUTER_IP:8000"
npm run start:dev-client
```

## Backend foundation

The FastAPI + PostgreSQL foundation lives in `backend/`.

Start PostgreSQL from the repo root:

```bash
docker compose up -d
```

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m alembic upgrade head
python -m uvicorn app.main:app --reload
```

API docs are available at `http://127.0.0.1:8000/docs`.

To run Expo against the local API on web or iOS simulator:

```bash
EXPO_PUBLIC_WAYLO_API_URL=http://127.0.0.1:8000 npx expo start
```

On Windows PowerShell:

```powershell
$env:EXPO_PUBLIC_WAYLO_API_URL="http://127.0.0.1:8000"
npx expo start
```

For a physical phone, use your computer's LAN IP instead of `127.0.0.1`, for example:

```powershell
$env:EXPO_PUBLIC_WAYLO_API_URL="http://192.168.1.25:8000"
npx expo start
```

The backend currently includes User, Vehicle, Trip, SavedPlan, and Subscription models plus API endpoints used by the MVP app. Stripe, Mapbox, Firebase, and AI planning are intentionally not integrated yet.

## Future integration points

- `src/services/authService.js`: replace the mock phone OTP flow with Firebase Phone Auth.
- `src/services/mapService.js`: connect Mapbox Directions and rendering, or add Google Maps behind the same service contract.
- `src/services/api.js`: keep expanding FastAPI integration beyond persistence into real planning once AI and map services exist.
- `src/services/subscriptionService.js`: replace mock premium state with Stripe-backed entitlements.
