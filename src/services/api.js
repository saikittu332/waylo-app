import { mockRoute, mockStops, mockTripRequest } from "../data/mockTrip";
import { getRoutePreview } from "./mapService";
import { getVisibleStops } from "./subscriptionService";
import { suggestFuelStops, suggestRestStops } from "../utils/fuelOptimizer";
import { estimateFuelCost, estimateSavings } from "../utils/tripCalculator";

export async function planTrip({ from, to, mode, vehicle }) {
  // Future FastAPI integration: POST trip inputs to the backend and return optimized route data.
  const route = {
    ...mockRoute,
    from: from || mockTripRequest.from,
    to: to || mockTripRequest.to,
    mode: mode || mockTripRequest.mode,
    map: getRoutePreview()
  };

  const fuelStops = suggestFuelStops(route.distanceMiles, vehicle);
  const restStops = suggestRestStops(route.durationHours);
  const estimatedFuelCost = estimateFuelCost(route.distanceMiles, vehicle.highwayMpg, route.mockFuelPrice);
  const estimatedSavings = estimateSavings(
    route.distanceMiles,
    vehicle.highwayMpg,
    route.mockFuelPrice,
    route.comparisonFuelPrice
  );

  return {
    route,
    stops: getVisibleStops(mockStops),
    fullStops: mockStops,
    ruleBasedPlan: {
      fuelStops,
      restStops
    },
    insights: {
      estimatedFuelCost,
      estimatedSavings
    }
  };
}
