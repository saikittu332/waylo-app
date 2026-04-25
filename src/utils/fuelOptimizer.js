import { calculateSafeRange } from "./tripCalculator";

export function suggestFuelStops(distanceMiles, vehicle) {
  const safeRange = calculateSafeRange(vehicle.highwayMpg, vehicle.tankCapacity);

  if (!safeRange) return [];

  const stops = [];
  let nextStop = safeRange;

  while (nextStop < distanceMiles) {
    stops.push({
      id: `auto-fuel-${stops.length + 1}`,
      mile: Math.round(nextStop),
      reason: "Planned near your 80% safe range"
    });
    nextStop += safeRange;
  }

  return stops;
}

export function suggestRestStops(durationHours) {
  const stops = [];
  let nextStopHour = 2.75;

  while (nextStopHour < durationHours) {
    stops.push({
      id: `auto-rest-${stops.length + 1}`,
      hour: Number(nextStopHour.toFixed(1)),
      reason: "Keeps the drive comfortable and alert"
    });
    nextStopHour += 2.75;
  }

  return stops;
}
