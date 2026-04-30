export function shortPlaceLabel(label, fallback = "Selected place") {
  if (!label) return fallback;
  const clean = String(label).replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  if (clean.toLowerCase() === "current location") return "San Francisco";

  const parts = clean.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return clean;
  return parts[0];
}

export function routeTitle(from, to) {
  return `${shortPlaceLabel(from, "Origin")} -> ${shortPlaceLabel(to, "Destination")}`;
}

export function routeMetaLabel(plan) {
  const details = [];
  if (plan?.mode) details.push(`${plan.mode} route`);
  if (plan?.vehicleName) details.push(plan.vehicleName);
  if (plan?.distanceMiles) details.push(`${Math.round(Number(plan.distanceMiles))} mi`);
  return details.join(" | ");
}
