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

export async function planTrip({ from, to, mode, vehicle }) {
  // Future FastAPI integration: POST trip inputs to the backend and return optimized route data.
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

  return {
    route,
    stops: getVisibleStops(mockStops),
    fullStops: mockStops,
    ruleBasedPlan: {
      fuelStops,
      restStops
    },
    insights: {
      range,
      safeRange,
      fuelUsed: estimateFuelUsed(routeDistance, vehicle.highwayMpg),
      estimatedFuelCost,
      estimatedSavings
    }
  };
}
