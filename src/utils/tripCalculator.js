export function calculateRange(highwayMpg, tankCapacity) {
  return Number(highwayMpg) * Number(tankCapacity);
}

export function calculateSafeRange(range) {
  return Number(range) * 0.8;
}

export function estimateFuelUsed(distanceMiles, highwayMpg) {
  if (!highwayMpg) return 0;
  return Number(distanceMiles) / Number(highwayMpg);
}

export function estimateFuelCost(distanceMiles, highwayMpg, fuelPrice) {
  return estimateFuelUsed(distanceMiles, highwayMpg) * Number(fuelPrice);
}

export function generateFuelStops(distanceMiles, safeRange) {
  if (!safeRange || safeRange <= 0) return [];

  const stops = [];
  let mile = Number(safeRange);

  while (mile < Number(distanceMiles)) {
    stops.push({
      id: `fuel-${stops.length + 1}`,
      mile: Math.round(mile),
      name: stops.length === 0 ? "Shell Gas Station" : "Chevron Fuel Stop",
      price: stops.length === 0 ? 3.49 : 3.55
    });
    mile += Number(safeRange);
  }

  return stops;
}

export function generateRestStops(durationHours) {
  const stops = [];
  let hour = 2.75;

  while (hour < Number(durationHours)) {
    stops.push({
      id: `rest-${stops.length + 1}`,
      hour: Number(hour.toFixed(1)),
      name: stops.length === 0 ? "Tehachapi Break Stop" : "Highway Rest Area"
    });
    hour += 2.75;
  }

  return stops;
}

export function estimateSavings(distanceMiles, highwayMpg, optimizedPrice, comparisonPrice) {
  const optimized = estimateFuelCost(distanceMiles, highwayMpg, optimizedPrice);
  const comparison = estimateFuelCost(distanceMiles, highwayMpg, comparisonPrice);
  return Math.max(comparison - optimized, 0);
}

export function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function formatHours(hours) {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
}
