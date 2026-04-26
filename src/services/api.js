import { Platform } from "react-native";
import { mockRoute, mockStops, mockTripRequest } from "../data/mockTrip";
import { getRoutePreview } from "./mapService";
import { getVisibleStops } from "./subscriptionService";
import {
  calculateRange,
  calculateSafeRange,
  estimateFuelCost,
  estimateFuelUsed,
  estimateSavings,
  generateFuelStops,
  generateRestStops
} from "../utils/tripCalculator";

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
  return {
    id: plan.id,
    tripId: plan.trip_id,
    title: plan.title,
    from: plan.origin,
    to: plan.destination,
    mode: plan.trip_mode,
    vehicleName: plan.plan_payload?.vehicleName || "Saved vehicle",
    savedAt: "Saved in Waylo"
  };
}

export async function loginWithPhone(phone) {
  return request("/auth/login", {
    body: JSON.stringify({ phone: normalizePhone(phone) }),
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

export async function savePlan({ userId, tripId, route, vehicle, insights }) {
  return request("/saved-plans", {
    body: JSON.stringify({
      user_id: userId,
      trip_id: tripId || null,
      title: `${route.from} -> ${route.to}`,
      origin: route.from,
      destination: route.to,
      trip_mode: route.mode,
      notes: "Saved from the Waylo mobile app",
      plan_payload: {
        vehicleName: vehicle.vehicleName,
        distanceMiles: route.distanceMiles,
        durationHours: route.durationHours,
        estimatedFuelCost: insights.estimatedFuelCost,
        estimatedSavings: insights.estimatedSavings
      }
    }),
    method: "POST"
  });
}

export async function getSavedPlans(userId) {
  const plans = await request(`/saved-plans?user_id=${encodeURIComponent(userId)}`);
  return plans.map(apiSavedPlanToApp);
}

export async function createSubscription(userId, premium) {
  return request("/subscriptions", {
    body: JSON.stringify({
      user_id: userId,
      plan_name: premium ? "Premium" : "Free",
      status: "active",
      is_premium: Boolean(premium)
    }),
    method: "POST"
  });
}

export async function getSubscription(userId) {
  const subscriptions = await request(`/subscriptions?user_id=${encodeURIComponent(userId)}`);
  const latest = subscriptions[0];
  if (!latest) return null;
  return {
    isPremium: latest.is_premium,
    planName: latest.plan_name
  };
}

export async function planTrip({ from, to, mode, vehicle, user }) {
  const destination = to || mockTripRequest.to;
  const routeDistance = destination.toLowerCase().includes("angeles") ? 383 : mockRoute.distanceMiles;
  const routeDuration = destination.toLowerCase().includes("angeles") ? 6.75 : mockRoute.durationHours;
  const range = calculateRange(vehicle.highwayMpg, vehicle.tankCapacity);
  const safeRange = calculateSafeRange(range);
  const fuelStops = generateFuelStops(routeDistance, safeRange);
  const restStops = generateRestStops(routeDuration);
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
    from: from || mockTripRequest.from,
    to: destination,
    mode: mode || mockTripRequest.mode,
    map: getRoutePreview()
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

  return {
    persistedTrip,
    route,
    stops: getVisibleStops(mockStops),
    fullStops: mockStops,
    ruleBasedPlan: {
      fuelStops,
      restStops
    },
    insights
  };
}
