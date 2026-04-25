export const mockTripRequest = {
  from: "Current location",
  to: "Los Angeles, CA",
  mode: "Cheapest"
};

export const mockRoute = {
  from: "San Francisco",
  to: "Los Angeles",
  distanceMiles: 383,
  durationHours: 6.75,
  mockFuelPrice: 3.49,
  comparisonFuelPrice: 3.88
};

export const mockStops = [
  {
    id: "fuel-1",
    name: "Shell Gas Station",
    type: "fuel",
    distanceFromStart: 120,
    distanceFromCurrent: 42,
    rating: "4.3",
    fuelPrice: "3.49",
    address: "1200 W Tehachapi Blvd, Tehachapi, CA"
  },
  {
    id: "rest-1",
    name: "Tehachapi Rest Stop",
    type: "rest",
    distanceFromStart: 186,
    distanceFromCurrent: 86,
    rating: "4.2"
  },
  {
    id: "food-1",
    name: "Central Coast Grill",
    type: "food",
    distanceFromStart: 238,
    distanceFromCurrent: 126,
    rating: "4.6"
  },
  {
    id: "scenic-1",
    name: "Pacific View Stop",
    type: "scenic",
    distanceFromStart: 310,
    distanceFromCurrent: 174,
    rating: "4.8"
  },
  {
    id: "fuel-2",
    name: "Chevron Fuel Stop",
    type: "fuel",
    distanceFromStart: 282,
    distanceFromCurrent: 154,
    rating: "4.1",
    fuelPrice: "3.55"
  }
];
