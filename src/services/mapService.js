export const mapProviders = {
  MAPBOX: "mapbox",
  GOOGLE: "google"
};

const activeProvider = mapProviders.MAPBOX;

export function getActiveMapProvider() {
  return activeProvider;
}

export function getRoutePreview() {
  // Future Mapbox integration: call Mapbox Directions API with a real access token here.
  return {
    provider: activeProvider,
    polylineLabel: "Mapbox route placeholder",
    boundsLabel: "Current location to Denver, CO"
  };
}

// Future Google Maps support can implement this same service contract.
