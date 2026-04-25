export const mockTripRequest = {
  from: "Current location",
  to: "Denver, CO",
  mode: "Cheapest"
};

export const mockRoute = {
  distanceMiles: 642,
  durationHours: 9.7,
  mockFuelPrice: 3.42,
  comparisonFuelPrice: 3.76
};

export const mockStops = [
  {
    id: "fuel-1",
    name: "Prairie Star Fuel",
    type: "fuel",
    distanceFromStart: 235,
    distanceFromCurrent: 62,
    rating: "4.4",
    fuelPrice: "3.19"
  },
  {
    id: "rest-1",
    name: "Tallgrass Rest Area",
    type: "rest",
    distanceFromStart: 178,
    distanceFromCurrent: 35,
    rating: "4.2"
  },
  {
    id: "food-1",
    name: "Mesa Kitchen",
    type: "food",
    distanceFromStart: 318,
    distanceFromCurrent: 112,
    rating: "4.6"
  },
  {
    id: "scenic-1",
    name: "Front Range Overlook",
    type: "scenic",
    distanceFromStart: 574,
    distanceFromCurrent: 228,
    rating: "4.8"
  },
  {
    id: "fuel-2",
    name: "Milepost Market Fuel",
    type: "fuel",
    distanceFromStart: 470,
    distanceFromCurrent: 166,
    rating: "4.1",
    fuelPrice: "3.26"
  }
];
