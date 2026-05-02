export const mapProviders = {
  MAPBOX: "mapbox",
  GOOGLE: "google"
};

export const CURRENT_LOCATION_PLACE = {
  id: "current-location",
  label: "Current Location",
  name: "Current Location",
  address: "Set manually until live location permission is enabled",
  coordinates: [-122.4194, 37.7749],
  provider: "manual"
};

const activeProvider = mapProviders.MAPBOX;
const MAPBOX_API_BASE = "https://api.mapbox.com";
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export function getActiveMapProvider() {
  return activeProvider;
}

export function getMapboxAccessToken() {
  return MAPBOX_ACCESS_TOKEN;
}

export function hasMapboxToken() {
  return Boolean(MAPBOX_ACCESS_TOKEN);
}

function requireMapboxToken() {
  if (!MAPBOX_ACCESS_TOKEN) {
    const error = new Error("Mapbox token is missing. Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment and restart Expo.");
    error.code = "MAPBOX_TOKEN_MISSING";
    throw error;
  }
}

function normalizeFeature(feature) {
  const label = feature.place_name || feature.text || "Unknown place";
  return {
    id: feature.id,
    label,
    name: feature.text || label,
    address: label,
    coordinates: feature.center,
    category: feature.properties?.category,
    maki: feature.properties?.maki,
    provider: activeProvider
  };
}

async function mapboxRequest(path, params = {}) {
  requireMapboxToken();
  const query = new URLSearchParams({
    access_token: MAPBOX_ACCESS_TOKEN,
    ...params
  });
  const response = await fetch(`${MAPBOX_API_BASE}${path}?${query.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Mapbox request failed with ${response.status}`);
  }
  return data;
}

export async function geocodeAddress(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (trimmed.toLowerCase() === "current location") return [CURRENT_LOCATION_PLACE];

  const data = await mapboxRequest(`/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json`, {
    autocomplete: "true",
    country: "us",
    limit: "5",
    types: "address,place,locality,neighborhood,poi"
  });

  return (data.features || []).map(normalizeFeature);
}

export async function reverseGeocode(latitude, longitude) {
  const data = await mapboxRequest(`/geocoding/v5/mapbox.places/${longitude},${latitude}.json`, {
    limit: "1",
    types: "address,place,locality,neighborhood,poi"
  });
  return data.features?.[0] ? normalizeFeature(data.features[0]) : null;
}

export async function searchNearbyPlaces(query, coordinates, options = {}) {
  const trimmed = query.trim();
  if (!trimmed || !coordinates?.length) return [];

  const data = await mapboxRequest(`/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json`, {
    autocomplete: "false",
    country: "us",
    language: "en",
    limit: String(options.limit || 4),
    proximity: coordinates.join(","),
    types: "poi"
  });

  return (data.features || []).map(normalizeFeature);
}

function normalizeDirectionsProfile(profile) {
  const normalized = String(profile || "driving").toLowerCase();
  if (normalized.includes("walk")) return "walking";
  if (normalized.includes("bike") || normalized.includes("cycling")) return "cycling";
  return "driving";
}

export async function getRoutePreview(originCoordinates, destinationCoordinates, profile = "driving") {
  const origin = originCoordinates.join(",");
  const destination = destinationCoordinates.join(",");
  const directionsProfile = normalizeDirectionsProfile(profile);
  const data = await mapboxRequest(`/directions/v5/mapbox/${directionsProfile}/${origin};${destination}`, {
    alternatives: "false",
    geometries: "geojson",
    overview: "full",
    steps: "true"
  });

  return normalizeRouteResponse(data);
}

export function normalizeRouteResponse(mapboxResponse) {
  const route = mapboxResponse?.routes?.[0];
  if (!route) {
    throw new Error("No route was found for those locations. Try a nearby city, address, or landmark.");
  }

  return {
    provider: activeProvider,
    distanceMiles: Number((route.distance / 1609.344).toFixed(1)),
    durationHours: Number((route.duration / 3600).toFixed(2)),
    durationSeconds: route.duration,
    distanceMeters: route.distance,
    geometry: route.geometry,
    summary: route.legs?.[0]?.summary || "Mapbox route preview",
    legs: route.legs || []
  };
}

// Future Google Maps support can implement this same service contract.
