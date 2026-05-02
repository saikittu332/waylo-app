import { mockRoute } from "../data/mockTrip";
import { estimateFuelCost } from "./tripCalculator";

const typeWeights = {
  fuel: 34,
  rest: 26,
  food: 18,
  scenic: 16
};

export function scoreStop(stop, context = {}) {
  const routeDistance = Number(context.routeDistance || 1);
  const safeRange = Number(context.safeRange || 0);
  const highwayMpg = Number(context.highwayMpg || 30);
  const mile = Number(stop.distanceFromStart || 0);
  const detourMinutes = estimateDetourMinutes(stop, context.mode);
  const savesAmount = estimateStopSavings(stop, highwayMpg);
  const lowFuelRisk = stop.type === "fuel" && safeRange > 0
    ? Math.max(0, Math.round(((mile % safeRange) / safeRange) * 100))
    : 0;

  const routeFit = Math.max(0, 28 - detourMinutes * 1.7);
  const timingFit = timingScore(stop, context);
  const sourceFit = stop.placeSource ? 8 : 3;
  const savingsFit = Math.min(18, savesAmount * 2.2);
  const typeFit = typeWeights[stop.type] || 12;
  const scenicBoost = context.mode === "Scenic" && stop.type === "scenic" ? 15 : 0;
  const comfortBoost = context.mode === "Comfort" && stop.type === "rest" ? 10 : 0;
  const cheapestBoost = context.mode === "Cheapest" && stop.type === "fuel" ? 10 : 0;

  const score = Math.max(
    1,
    Math.min(99, Math.round(typeFit + routeFit + timingFit + sourceFit + savingsFit + scenicBoost + comfortBoost + cheapestBoost))
  );

  return {
    ...stop,
    intelligenceScore: score,
    detourMinutes,
    savingsImpact: savesAmount,
    lowFuelRisk,
    routeFitLabel: detourMinutes <= 4 ? "On-route" : detourMinutes <= 9 ? "Small detour" : "Optional detour",
    impactSummary: buildImpactSummary(stop, score, detourMinutes, savesAmount, lowFuelRisk, context),
    recommendation: buildRecommendation(stop, detourMinutes, savesAmount, lowFuelRisk, context)
  };
}

export function rankStops(stops, context = {}) {
  return stops
    .map((stop) => scoreStop(stop, context))
    .sort((a, b) => {
      const mileDiff = Number(a.distanceFromStart || 0) - Number(b.distanceFromStart || 0);
      if (Math.abs(mileDiff) < 20) return Number(b.intelligenceScore || 0) - Number(a.intelligenceScore || 0);
      return mileDiff;
    });
}

function estimateDetourMinutes(stop, mode) {
  if (stop.detourMinutes) return Number(stop.detourMinutes);
  if (stop.placeSource) return stop.type === "scenic" ? 9 : 4;
  if (stop.type === "fuel") return 4;
  if (stop.type === "rest") return mode === "Comfort" ? 3 : 6;
  if (stop.type === "food") return 8;
  if (stop.type === "scenic") return mode === "Scenic" ? 7 : 12;
  return 6;
}

function estimateStopSavings(stop, highwayMpg) {
  if (stop.type !== "fuel") return 0;
  const stopPrice = Number(stop.fuelPrice || mockRoute.mockFuelPrice);
  const comparison = Number(mockRoute.comparisonFuelPrice);
  return Math.max(0, estimateFuelCost(42, highwayMpg, comparison) - estimateFuelCost(42, highwayMpg, stopPrice));
}

function timingScore(stop, context) {
  if (stop.type === "fuel" && context.safeRange) {
    const safeRange = Number(context.safeRange);
    const mile = Number(stop.distanceFromStart || 0);
    const rangeProgress = (mile % safeRange) / safeRange;
    return rangeProgress > 0.55 && rangeProgress < 0.9 ? 14 : 6;
  }
  if (stop.type === "rest") return 12;
  if (stop.type === "food") return 8;
  if (stop.type === "scenic") return context.mode === "Scenic" ? 12 : 4;
  return 5;
}

function buildImpactSummary(stop, score, detourMinutes, savesAmount, lowFuelRisk, context) {
  if (stop.type === "fuel") {
    return `Score ${score}: saves about $${savesAmount.toFixed(2)}, adds ${detourMinutes} min, keeps reserve above ${Math.max(20, 100 - lowFuelRisk)}%.`;
  }
  if (stop.type === "rest") {
    return `Score ${score}: adds ${detourMinutes} min and keeps breaks near your ${context.restInterval || 2.5}h rhythm.`;
  }
  if (stop.type === "food") {
    return `Score ${score}: meal stop near the route midpoint with about ${detourMinutes} min added.`;
  }
  return `Score ${score}: ${context.mode === "Scenic" ? "fits Scenic mode" : "optional view stop"} with about ${detourMinutes} min added.`;
}

function buildRecommendation(stop, detourMinutes, savesAmount, lowFuelRisk, context) {
  if (stop.type === "fuel") {
    return savesAmount > 0
      ? `Best fuel value near mile ${Math.round(stop.distanceFromStart || 0)}. Adds ${detourMinutes} min and can save about $${savesAmount.toFixed(2)}.`
      : `Fuel timing protects your safe range near mile ${Math.round(stop.distanceFromStart || 0)}.`;
  }
  if (stop.type === "rest") {
    return `Break timing fits the drive rhythm and adds about ${detourMinutes} min.`;
  }
  if (stop.type === "food") {
    return `Food stop placed near the route midpoint, adding about ${detourMinutes} min.`;
  }
  return context.mode === "Scenic"
    ? `Scenic mode boost: worthwhile view stop with about ${detourMinutes} min added.`
    : `Optional scenic stop. Skip it if you want a tighter drive.`;
}
