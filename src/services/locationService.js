import * as Location from "expo-location";

export async function getCurrentLocationPlace() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    throw new Error("Location permission is needed to use your current position.");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  const { latitude, longitude } = position.coords;
  return {
    id: "device-current-location",
    label: "Current Location",
    address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    coordinates: [longitude, latitude],
    isCurrentLocation: true
  };
}
