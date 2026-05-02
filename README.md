# Waylo

Waylo is an MVP React Native Expo app for an AI road trip planning assistant.

Tagline: Drive smart. Spend less.

## What is included

- Onboarding, phone OTP development fallback, assistant naming, vehicle setup, trip input, smart trip results, stop details, drive preview, and trip summary screens.
- Mock Firebase phone auth service.
- Real Mapbox Geocoding and Directions API route preview through a map service abstraction that can later support Google Maps.
- Rule-based trip intelligence for fuel range, safe range, rest stops, fuel cost, and estimated savings.
- Native Mapbox map rendering when running a custom development build, with a styled fallback map card for Expo Go and web.
- Mock AI stop recommendations until fuel, places, and AI planning services are integrated.
- Real FastAPI persistence for users, vehicles, trips, and saved plans when the backend is running.

## Run locally

```bash
npm install
npx expo start
```

Then open the Expo app on a simulator, emulator, physical device, or web target.

## Mapbox route previews

Waylo uses Mapbox for real address suggestions and route preview distance/duration. Add your public Mapbox token before starting Expo:

```text
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_public_token_here
```

Recommended local setup:

1. Create a `.env` file in the repo root.
2. Add your public token:

```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_public_token_here
EXPO_PUBLIC_WAYLO_API_URL=http://127.0.0.1:8000
```

3. Restart Expo with a clean cache:

```powershell
npx expo start --web --localhost --port 8083 --clear
```

Never commit `.env`. It is already ignored by git.

Windows PowerShell example:

```powershell
$env:EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN="pk.your_public_token_here"
npx expo start --clear
```

If you are also testing against the local backend from a physical phone, set both environment variables:

```powershell
$env:EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN="pk.your_public_token_here"
$env:EXPO_PUBLIC_WAYLO_API_URL="http://YOUR_COMPUTER_IP:8000"
npx expo start
```

What works in Expo Go:

- Mapbox Geocoding API location suggestions.
- Mapbox Directions API route distance and duration.
- Waylo fuel range, safe range, fuel cost, rest stop, and savings calculations using real route distance.
- Styled fallback route preview card.

What requires a custom development build:

- Native `@rnmapbox/maps` map rendering and route polyline drawing.

`@rnmapbox/maps` is configured as an Expo config plugin in `app.json`. Because it contains native code, stock Expo Go cannot render the native Mapbox map. Use an EAS development build when Apple Developer access is available:

```powershell
npx eas build --profile development --platform ios
npm run start:dev-client
```

## Firebase Phone Auth

Real Firebase SMS OTP on a physical iPhone requires a custom Expo development build. The stock Expo Go app can still open the UI, but native Firebase Phone Auth is only available in the Waylo dev build.

Firebase iOS setup currently expects:

```text
Bundle ID: com.saikittu332.waylo
Config file: ./GoogleService-Info.plist
```

Backend Firebase Admin verification expects a local service account JSON at:

```text
backend/firebase-service-account.json
```

Do not commit that JSON file. It is ignored by git.

Create an iOS development build:

```powershell
npx eas login
npx eas build:configure
npx eas build --profile development --platform ios --clear-cache
```

The iOS build uses `expo-build-properties` plus `plugins/with-ios-modular-headers.js` to make Firebase Swift pods install cleanly in EAS. The plugin adds `use_modular_headers!` during native prebuild, which fixes the FirebaseAuth/GoogleUtilities CocoaPods module-map error.

Firebase Android setup expects:

```text
Android package: com.saikittu332.waylo
Config file: ./google-services.json
```

The generated `android/` and `ios/` folders are intentionally git-ignored while Waylo stays in Expo managed/EAS prebuild mode. Keep Firebase config in `app.json` and the root Google config files instead of editing native files directly.

If your Apple Developer Program membership is active, EAS should show your Apple team during the iOS build. If it still says no team is associated, sign in at `https://developer.apple.com/account`, accept any pending agreements, and wait for Apple membership activation to finish before retrying.

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

The backend currently includes User, Vehicle, Trip, and SavedPlan models plus API endpoints used by the MVP app. Trip planning now persists Mapbox-backed route distance and duration when the frontend has a valid Mapbox token. Full Firebase phone auth in Expo Go, turn-by-turn navigation, fuel price APIs, and AI planning are intentionally not integrated yet.

## Future integration points

- `src/services/authService.js`: replace the Expo Go phone-login fallback with Firebase Phone Auth when an EAS development build is available.
- `src/services/mapService.js`: Mapbox Geocoding/Directions live here; add Google Maps behind the same service contract later.
- `src/services/api.js`: keep expanding FastAPI integration beyond persistence into real planning once AI and map services exist.
