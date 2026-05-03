import * as Location from "expo-location";
import { reverseGeocode } from "./mapService";

export async function getCurrentLocationPlace() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    throw new Error("Turn on location permission to use your current position.");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  const { latitude, longitude } = position.coords;
  let resolvedPlace = null;
  try {
    resolvedPlace = await reverseGeocode(latitude, longitude);
  } catch (error) {
    resolvedPlace = null;
  }

  return {
    id: "device-current-location",
    label: resolvedPlace?.label || "Current Location",
    name: resolvedPlace?.name || "Current Location",
    address: resolvedPlace?.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    coordinates: [longitude, latitude],
    provider: resolvedPlace?.provider || "device-location",
    isCurrentLocation: true
  };
}
