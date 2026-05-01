import { Platform } from "react-native";
import { mockRoute, mockStops, mockTripRequest } from "../data/mockTrip";
import { CURRENT_LOCATION_PLACE, geocodeAddress, getRoutePreview } from "./mapService";
import {
  calculateRange,
  calculateSafeRange,
  estimateFuelCost,
  estimateFuelUsed,
  estimateSavings,
  generateFuelStops,
  generateRestStops
} from "../utils/tripCalculator";
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

  let persistedTrip = null;
  try {
    persistedTrip = await createTripRecord({ userId: user?.id, vehicle, route, insights });
  } catch (error) {
    console.warn("Waylo API trip persistence unavailable:", error.message);
  }

  const generatedStops = buildRouteStops({
    fuelStops,
    restStops,
    routeDistance,
    mode: mode || mockTripRequest.mode
  });

  return {
    persistedTrip,
    route,
    stops: generatedStops,
    fullStops: generatedStops,
    ruleBasedPlan: {
      fuelStops,
      restStops
    },
    insights
  };
}

function buildRouteStops({ fuelStops, restStops, routeDistance, mode }) {
  const fuelStopCards = fuelStops.map((stop) => {
    const template = mockStops.find((item) => item.type === "fuel") || {};
    return {
      ...template,
      id: stop.id,
      name: stop.name,
      type: "fuel",
      distanceFromStart: stop.mile,
      distanceFromCurrent: Math.max(stop.mile - 78, 12),
      fuelPrice: String(stop.price),
      recommendation: `Planned near mile ${stop.mile}, before your safe range limit.`
    };
  });

  const lastRestStop = restStops[restStops.length - 1];
  const restStopCards = restStops.map((stop, index) => ({
    id: stop.id,
    name: stop.name,
    type: "rest",
    distanceFromStart: Math.min(Math.round((stop.hour / Math.max(lastRestStop?.hour || stop.hour, 1)) * routeDistance), Math.round(routeDistance - 20)),
    distanceFromCurrent: Math.max(Math.round(stop.hour * 62), 18),
    rating: index === 0 ? "4.2" : "4.0",
    recommendation: `Timed around ${stop.hour} hours to keep the drive comfortable.`
  }));

  const foodStop = {
    ...mockStops.find((item) => item.type === "food"),
    recommendation: "Useful meal stop near the middle of the route."
  };
  const scenicStop = {
    ...mockStops.find((item) => item.type === "scenic"),
    recommendation: mode === "Scenic" ? "Added because Scenic mode values a better route experience." : "Optional quick view stop with a low detour."
  };

  return [...fuelStopCards, ...restStopCards, foodStop, scenicStop]
    .filter(Boolean)
    .sort((a, b) => Number(a.distanceFromStart || 0) - Number(b.distanceFromStart || 0));
}
