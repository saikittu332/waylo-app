import { Platform } from "react-native";
import { mockRoute, mockStops, mockTripRequest } from "../data/mockTrip";
import { CURRENT_LOCATION_PLACE, geocodeAddress, getRoutePreview, searchNearbyPlaces } from "./mapService";
import {
  calculateRange,
  calculateSafeRange,
  estimateFuelCost,
  estimateFuelUsed,
  estimateSavings,
  generateFuelStops,
  generateRestStops
} from "../utils/tripCalculator";
import { rankStops } from "../utils/stopIntelligence";
import { routeTitle } from "../utils/placeLabels";

const DEFAULT_API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
export const API_BASE_URL = process.env.EXPO_PUBLIC_WAYLO_API_URL || DEFAULT_API_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail || `Waylo API request failed: ${response.status}`);
  }

  return data;
}

export function isPersisted(record) {
  return Boolean(record?.id);
}

export function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return phone.trim();
}

export function apiVehicleToApp(vehicle) {
  return {
    id: vehicle.id,
    userId: vehicle.user_id,
    vehicleName: vehicle.vehicle_name,
    fuelType: vehicle.fuel_type,
    cityMpg: vehicle.city_mpg ?? 0,
    highwayMpg: vehicle.highway_mpg ?? 0,
    tankCapacity: vehicle.tank_capacity_gallons ?? 0
  };
}

export function apiUserToApp(user) {
  return {
    ...user,
    activeVehicleId: user.active_vehicle_id,
    fuelSavingsAlerts: user.fuel_savings_alerts ?? true,
    restRemindersEnabled: user.rest_reminders_enabled ?? true,
    restReminderHours: user.rest_reminder_hours ?? 2.5
  };
}

export function appVehicleToApi(vehicle, userId) {
  return {
    user_id: userId,
    vehicle_name: vehicle.vehicleName,
    fuel_type: vehicle.fuelType,
    city_mpg: Number(vehicle.cityMpg) || null,
    highway_mpg: Number(vehicle.highwayMpg) || null,
    tank_capacity_gallons: Number(vehicle.tankCapacity) || null
  };
}

export function apiSavedPlanToApp(plan) {
  const payload = plan.plan_payload || {};
  return {
    id: plan.id,
    tripId: plan.trip_id,
    title: payload.title || routeTitle(plan.origin, plan.destination),
    from: plan.origin,
    to: plan.destination,
    mode: plan.trip_mode,
    vehicleName: payload.vehicleName || "Saved vehicle",
    distanceMiles: payload.distanceMiles,
    durationHours: payload.durationHours,
    estimatedFuelCost: payload.estimatedFuelCost,
    estimatedSavings: payload.estimatedSavings,
    finalStops: payload.finalStops || [],
    stopDecisions: payload.stopDecisions || {},
    routePayload: payload.route || null,
    savedAt: "Saved in Waylo"
  };
}

export function apiTripToCompletedTrip(trip, vehicleName = "Saved vehicle") {
  return {
    id: trip.id,
    tripId: trip.id,
    title: routeTitle(trip.origin, trip.destination),
    from: trip.origin,
    to: trip.destination,
    mode: trip.trip_mode,
    vehicleName,
    distanceMiles: trip.distance_miles,
    durationHours: trip.duration_hours,
    estimatedFuelCost: trip.estimated_fuel_cost,
    estimatedSavings: trip.estimated_savings,
    tripPlan: {
      persistedTrip: trip,
      route: {
        from: trip.origin,
        to: trip.destination,
        mode: trip.trip_mode,
        distanceMiles: trip.distance_miles,
        durationHours: trip.duration_hours
      },
      insights: {
        estimatedFuelCost: trip.estimated_fuel_cost,
        estimatedSavings: trip.estimated_savings
      }
    }
  };
}

export async function loginWithPhone(phone) {
  return request("/auth/login", {
    body: JSON.stringify({ phone: normalizePhone(phone) }),
    method: "POST"
  });
}

export async function loginWithFirebaseToken(idToken) {
  return request("/auth/firebase-login", {
    body: JSON.stringify({ id_token: idToken }),
    method: "POST"
  });
}

export async function updateUser(userId, payload) {
  return request(`/users/${userId}`, {
    body: JSON.stringify(payload),
    method: "PATCH"
  });
}

export async function createVehicle(vehicle, userId) {
  const saved = await request("/vehicles", {
    body: JSON.stringify(appVehicleToApi(vehicle, userId)),
    method: "POST"
  });
  return apiVehicleToApp(saved);
}

export async function updateVehicle(vehicle) {
  const saved = await request(`/vehicles/${vehicle.id}`, {
    body: JSON.stringify({
      vehicle_name: vehicle.vehicleName,
      fuel_type: vehicle.fuelType,
      city_mpg: Number(vehicle.cityMpg) || null,
      highway_mpg: Number(vehicle.highwayMpg) || null,
      tank_capacity_gallons: Number(vehicle.tankCapacity) || null
    }),
    method: "PATCH"
  });
  return apiVehicleToApp(saved);
}

export async function deleteVehicle(vehicleId) {
  await request(`/vehicles/${vehicleId}`, {
    method: "DELETE"
  });
}

export async function getVehicles(userId) {
  const vehicles = await request(`/vehicles?user_id=${encodeURIComponent(userId)}`);
  return vehicles.map(apiVehicleToApp);
}

export async function createTripRecord({ userId, vehicle, route, insights }) {
  if (!userId) return null;
  return request("/trips", {
    body: JSON.stringify({
      user_id: userId,
      vehicle_id: vehicle?.id || null,
      origin: route.from,
      destination: route.to,
      trip_mode: route.mode,
      status: "planned",
      distance_miles: route.distanceMiles,
      duration_hours: route.durationHours,
      estimated_fuel_cost: insights.estimatedFuelCost,
      estimated_savings: insights.estimatedSavings
    }),
    method: "POST"
  });
}

export async function updateTrip(tripId, payload) {
  return request(`/trips/${tripId}`, {
    body: JSON.stringify(payload),
    method: "PATCH"
  });
}

export function appStopToApi(stop, tripId, decision = "recommended") {
  return {
    trip_id: tripId,
    stop_type: stop.type,
    name: stop.name,
    address: stop.address || null,
    distance_from_start_miles: Number(stop.distanceFromStart) || null,
    distance_from_current_miles: Number(stop.distanceFromCurrent) || null,
    rating: Number(stop.rating) || null,
    fuel_price: Number(stop.fuelPrice) || null,
    decision,
    recommendation: stop.recommendation || null,
    stop_payload: stop
  };
}

export function apiTripStopToApp(stop) {
  return {
    ...(stop.stop_payload || {}),
    id: stop.stop_payload?.id || stop.id,
    persistedStopId: stop.id,
    type: stop.stop_type,
    name: stop.name,
    address: stop.address,
    distanceFromStart: stop.distance_from_start_miles,
    distanceFromCurrent: stop.distance_from_current_miles,
    rating: stop.rating ? String(stop.rating) : stop.stop_payload?.rating,
    fuelPrice: stop.fuel_price ? String(stop.fuel_price) : stop.stop_payload?.fuelPrice,
    recommendation: stop.recommendation,
    decision: stop.decision
  };
}

export async function createTripStop(tripId, stop, decision = "recommended") {
  const saved = await request("/trip-stops", {
    body: JSON.stringify(appStopToApi(stop, tripId, decision)),
    method: "POST"
  });
  return apiTripStopToApp(saved);
}

export async function getTripStops(tripId) {
  const stops = await request(`/trip-stops?trip_id=${encodeURIComponent(tripId)}`);
  return stops.map(apiTripStopToApp);
}

export async function updateTripStop(stopId, payload) {
  const saved = await request(`/trip-stops/${stopId}`, {
    body: JSON.stringify(payload),
    method: "PATCH"
  });
  return apiTripStopToApp(saved);
}

export async function completeTrip(tripId) {
  return updateTrip(tripId, { status: "completed" });
}

export async function getTrips(userId) {
  return request(`/trips?user_id=${encodeURIComponent(userId)}`);
}

export async function savePlan({ userId, tripId, route, vehicle, insights, finalStops = [], stopDecisions = {} }) {
  return request("/saved-plans", {
    body: JSON.stringify({
      user_id: userId,
      trip_id: tripId || null,
      title: routeTitle(route.from, route.to),
      origin: route.from,
      destination: route.to,
      trip_mode: route.mode,
      notes: "Saved from the Waylo mobile app",
      plan_payload: {
        title: routeTitle(route.from, route.to),
        vehicleName: vehicle.vehicleName,
        distanceMiles: route.distanceMiles,
        durationHours: route.durationHours,
        estimatedFuelCost: insights.estimatedFuelCost,
        estimatedSavings: insights.estimatedSavings,
        finalStops,
        stopDecisions,
        route: {
          from: route.from,
          to: route.to,
          mode: route.mode,
          distanceMiles: route.distanceMiles,
          durationHours: route.durationHours,
          map: route.map || null
        },
        mapProvider: route.map?.provider,
        routeSummary: route.map?.summary,
        routeGeometry: route.map?.geometry || null
      }
    }),
    method: "POST"
  });
}

export async function getSavedPlans(userId) {
  const plans = await request(`/saved-plans?user_id=${encodeURIComponent(userId)}`);
  return plans.map(apiSavedPlanToApp);
}

export async function updateSavedPlan(planId, payload) {
  const plan = await request(`/saved-plans/${planId}`, {
    body: JSON.stringify(payload),
    method: "PATCH"
  });
  return apiSavedPlanToApp(plan);
}

export async function deleteSavedPlan(planId) {
  await request(`/saved-plans/${planId}`, {
    method: "DELETE"
  });
}

async function resolvePlace(label, selectedPlace) {
  if (selectedPlace?.coordinates) return selectedPlace;
  const text = label || "Current Location";
  if (text.toLowerCase() === "current location") return CURRENT_LOCATION_PLACE;
  const matches = await geocodeAddress(text);
  if (!matches.length) {
    throw new Error(`Waylo could not find "${text}". Try a city, address, or landmark.`);
  }
  return matches[0];
}

export async function planTrip({ from, to, mode, vehicle, user, originPlace, destinationPlace }) {
  const origin = await resolvePlace(from || mockTripRequest.from, originPlace);
  const destination = await resolvePlace(to || mockTripRequest.to, destinationPlace);
  const routePreview = await getRoutePreview(origin.coordinates, destination.coordinates, mode || "driving");
  const routeDistance = routePreview.distanceMiles;
  const routeDuration = routePreview.durationHours;
  const range = calculateRange(vehicle.highwayMpg, vehicle.tankCapacity);
  const safeRange = calculateSafeRange(range);
  const fuelStops = generateFuelStops(routeDistance, safeRange);
  const restStops = generateRestStops(routeDuration, user?.restReminderHours || user?.rest_reminder_hours || 2.5);
  const estimatedFuelCost = estimateFuelCost(routeDistance, vehicle.highwayMpg, mockRoute.mockFuelPrice);
  const estimatedSavings = estimateSavings(
    routeDistance,
    vehicle.highwayMpg,
    mockRoute.mockFuelPrice,
    mockRoute.comparisonFuelPrice
  );

  const route = {
    ...mockRoute,
    distanceMiles: routeDistance,
    durationHours: routeDuration,
    from: origin.label,
    to: destination.label,
    mode: mode || mockTripRequest.mode,
    origin,
    destination,
    map: routePreview
  };

  const insights = {
    range,
    safeRange,
    fuelUsed: estimateFuelUsed(routeDistance, vehicle.highwayMpg),
    estimatedFuelCost,
    estimatedSavings
  };

  const generatedStops = await buildRouteStops({
    fuelStops,
    restStops,
    routeDistance,
    mode: mode || mockTripRequest.mode,
    routePreview,
    origin,
    destination,
    safeRange,
    highwayMpg: vehicle.highwayMpg,
    restInterval: user?.restReminderHours || user?.rest_reminder_hours || 2.5
  });

  let persistedTrip = null;
  let persistedStops = [];
  try {
    persistedTrip = await createTripRecord({ userId: user?.id, vehicle, route, insights });
    if (persistedTrip?.id) {
      persistedStops = await Promise.all(generatedStops.map((stop) => createTripStop(persistedTrip.id, stop)));
    }
  } catch (error) {
    console.warn("Waylo API trip persistence unavailable:", error.message);
  }

  return {
    persistedTrip,
    route,
    stops: persistedStops.length ? persistedStops : generatedStops,
    fullStops: persistedStops.length ? persistedStops : generatedStops,
    ruleBasedPlan: {
      fuelStops,
      restStops
    },
    insights
  };
}

async function buildRouteStops({ fuelStops, restStops, routeDistance, mode, routePreview, origin, destination, safeRange, highwayMpg, restInterval }) {
  const fuelPlanStops = fuelStops.length > 0
    ? fuelStops
    : [{ id: "fuel-price-check", mile: Math.round(routeDistance * 0.58), name: "Best fuel price check", price: mockRoute.mockFuelPrice, optional: true }];
  const fuelStopCards = await Promise.all(fuelPlanStops.map(async (stop) => {
    const template = mockStops.find((item) => item.type === "fuel") || {};
    const coordinates = coordinatesAtMile(routePreview, stop.mile, routeDistance, origin.coordinates, destination.coordinates);
    const place = await findBestRoutePlace("gas station", coordinates);
    return {
      ...template,
      ...placeToStop(place, "fuel"),
      id: stop.id,
      name: place?.name || stop.name,
      type: "fuel",
      coordinates,
      distanceFromStart: stop.mile,
      distanceFromCurrent: Math.max(stop.mile - 78, 12),
      fuelPrice: String(stop.price),
      recommendation: stop.optional
        ? `Optional price check near mile ${stop.mile}. Your vehicle can finish the route, but this helps compare fuel cost.`
        : `Planned near mile ${stop.mile}, before your safe range limit.`,
      source: place ? "Mapbox place search" : "Waylo fallback"
    };
  }));

  const lastRestStop = restStops[restStops.length - 1];
  const restStopCards = await Promise.all(restStops.map(async (stop, index) => {
    const distanceFromStart = Math.min(Math.round((stop.hour / Math.max(lastRestStop?.hour || stop.hour, 1)) * routeDistance), Math.round(routeDistance - 20));
    const coordinates = coordinatesAtMile(routePreview, distanceFromStart, routeDistance, origin.coordinates, destination.coordinates);
    const place = await findBestRoutePlace("rest area", coordinates);
    return {
      ...placeToStop(place, "rest"),
      id: stop.id,
      name: place?.name || stop.name,
      type: "rest",
      coordinates,
      distanceFromStart,
      distanceFromCurrent: Math.max(Math.round(stop.hour * 62), 18),
      rating: place ? null : index === 0 ? "4.2" : "4.0",
      recommendation: `Timed around ${stop.hour} hours to keep the drive comfortable.`,
      source: place ? "Mapbox place search" : "Waylo fallback"
    };
  }));

  const foodTemplate = mockStops.find((item) => item.type === "food");
  const foodCoordinates = coordinatesAtMile(routePreview, Math.round(routeDistance * 0.55), routeDistance, origin.coordinates, destination.coordinates);
  const foodPlace = await findBestRoutePlace("restaurant", foodCoordinates);
  const foodStop = {
    ...foodTemplate,
    ...placeToStop(foodPlace, "food"),
    name: foodPlace?.name || foodTemplate?.name,
    coordinates: foodCoordinates,
    source: foodPlace ? "Mapbox place search" : "Waylo fallback",
    recommendation: "Useful meal stop near the middle of the route."
  };
  const scenicTemplate = mockStops.find((item) => item.type === "scenic");
  const scenicCoordinates = coordinatesAtMile(routePreview, Math.round(routeDistance * 0.8), routeDistance, origin.coordinates, destination.coordinates);
  const scenicPlace = await findBestRoutePlace("scenic viewpoint", scenicCoordinates);
  const scenicStop = {
    ...scenicTemplate,
    ...placeToStop(scenicPlace, "scenic"),
    name: scenicPlace?.name || scenicTemplate?.name,
    coordinates: scenicCoordinates,
    source: scenicPlace ? "Mapbox place search" : "Waylo fallback",
    recommendation: mode === "Scenic" ? "Added because Scenic mode values a better route experience." : "Optional quick view stop with a low detour."
  };

  const stops = [...fuelStopCards, ...restStopCards, foodStop, scenicStop]
    .filter(Boolean)
    .sort((a, b) => Number(a.distanceFromStart || 0) - Number(b.distanceFromStart || 0));

  return rankStops(stops, {
    routeDistance,
    mode,
    safeRange,
    highwayMpg,
    restInterval
  });
}

async function findBestRoutePlace(query, coordinates) {
  try {
    const places = await searchNearbyPlaces(query, coordinates, { limit: 3 });
    return places[0] || null;
  } catch (error) {
    return null;
  }
}

function placeToStop(place, type) {
  if (!place) return {};
  return {
    address: place.address,
    category: place.category,
    mapboxPlaceId: place.id,
    placeProvider: place.provider,
    placeSource: "Mapbox",
    rating: null
  };
}

function coordinatesAtMile(routePreview, mile, routeDistance, originCoordinates, destinationCoordinates) {
  const coordinates = routePreview?.geometry?.coordinates;
  if (Array.isArray(coordinates) && coordinates.length > 0) {
    const ratio = Math.max(0, Math.min(1, Number(mile) / Math.max(Number(routeDistance), 1)));
    const index = Math.min(coordinates.length - 1, Math.max(0, Math.round(ratio * (coordinates.length - 1))));
    return coordinates[index];
  }
  const ratio = Math.max(0, Math.min(1, Number(mile) / Math.max(Number(routeDistance), 1)));
  return [
    originCoordinates[0] + (destinationCoordinates[0] - originCoordinates[0]) * ratio,
    originCoordinates[1] + (destinationCoordinates[1] - originCoordinates[1]) * ratio
  ];
}
