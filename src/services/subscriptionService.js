let mockIsPremium = false;

export function getSubscriptionState() {
  return {
    isPremium: mockIsPremium,
    planName: mockIsPremium ? "Premium" : "Free"
  };
}

export function setMockPremium(value) {
  mockIsPremium = Boolean(value);
}

export function getVisibleStops(stops) {
  if (mockIsPremium) return stops;
  const firstFuelStop = stops.find((stop) => stop.type === "fuel");
  return firstFuelStop ? [firstFuelStop] : stops.slice(0, 1);
}

// Future Stripe integration: replace the mock state above with customer entitlement checks.
