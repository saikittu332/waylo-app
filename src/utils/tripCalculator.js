export function calculateRange(highwayMpg, tankCapacity) {
  return Number(highwayMpg) * Number(tankCapacity);
}

export function calculateSafeRange(highwayMpg, tankCapacity) {
  return calculateRange(highwayMpg, tankCapacity) * 0.8;
}

export function estimateFuelUsed(distanceMiles, highwayMpg) {
  if (!highwayMpg) return 0;
  return Number(distanceMiles) / Number(highwayMpg);
}

export function estimateFuelCost(distanceMiles, highwayMpg, fuelPrice) {
  return estimateFuelUsed(distanceMiles, highwayMpg) * Number(fuelPrice);
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
