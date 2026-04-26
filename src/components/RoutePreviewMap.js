import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";
import { getMapboxAccessToken, hasMapboxToken } from "../services/mapService";

let MapboxGL = null;
if (Platform.OS !== "web") {
  try {
    const mapboxModule = require("@rnmapbox/maps");
    MapboxGL = mapboxModule.default || mapboxModule;
    MapboxGL.setAccessToken?.(getMapboxAccessToken());
  } catch (error) {
    MapboxGL = null;
  }
}

export default function RoutePreviewMap({ route, originLabel, destinationLabel }) {
  const geometry = route?.map?.geometry;
  const origin = route?.origin?.coordinates;
  const destination = route?.destination?.coordinates;
  const canRenderNativeMap = Platform.OS !== "web" && MapboxGL && hasMapboxToken() && geometry && origin && destination;

  if (canRenderNativeMap) {
    return (
      <View style={styles.mapCard}>
        <MapboxGL.MapView style={styles.nativeMap} logoEnabled={false} attributionEnabled={false}>
          <MapboxGL.Camera
            bounds={{
              ne: [
                Math.max(origin[0], destination[0]),
                Math.max(origin[1], destination[1])
              ],
              sw: [
                Math.min(origin[0], destination[0]),
                Math.min(origin[1], destination[1])
              ],
              paddingBottom: 54,
              paddingLeft: 54,
              paddingRight: 54,
              paddingTop: 54
            }}
            animationDuration={0}
          />
          <MapboxGL.ShapeSource id="waylo-route" shape={geometry}>
            <MapboxGL.LineLayer
              id="waylo-route-line"
              style={{
                lineColor: colors.blue,
                lineWidth: 5,
                lineCap: "round",
                lineJoin: "round"
              }}
            />
          </MapboxGL.ShapeSource>
          <MapboxGL.PointAnnotation id="origin" coordinate={origin} />
          <MapboxGL.PointAnnotation id="destination" coordinate={destination} />
        </MapboxGL.MapView>
      </View>
    );
  }

  return (
    <View style={styles.mapCard}>
      <View style={styles.mapLand} />
      <View style={styles.routePath} />
      <MapPin label={originLabel || "Origin"} style={styles.pinStart} color={colors.green} />
      <MapPin label={route?.map?.provider === "mapbox" ? "Mapbox route" : "Preview"} style={styles.pinMiddle} color={colors.orange} />
      <MapPin label={destinationLabel || "Destination"} style={styles.pinEnd} color={colors.red} />
      <View style={styles.fallbackBadge}>
        <Text style={styles.fallbackBadgeText}>
          {hasMapboxToken() ? "Route data from Mapbox" : "Add Mapbox token for live route data"}
        </Text>
      </View>
    </View>
  );
}

function MapPin({ label, color, style }) {
  return (
    <View style={[styles.mapPinWrap, style]}>
      <View style={[styles.mapPin, { backgroundColor: color }]} />
      <Text style={styles.mapPinText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    backgroundColor: colors.mapBlue,
    borderRadius: radii.xl,
    height: 420,
    overflow: "hidden",
    ...shadows.card
  },
  nativeMap: {
    flex: 1
  },
  mapLand: {
    backgroundColor: colors.mapGreen,
    borderRadius: 220,
    height: 450,
    left: -70,
    position: "absolute",
    top: -10,
    transform: [{ rotate: "-16deg" }],
    width: 310
  },
  routePath: {
    borderColor: "#2F80ED",
    borderRadius: 120,
    borderWidth: 7,
    height: 285,
    left: 118,
    position: "absolute",
    top: 82,
    transform: [{ rotate: "-24deg" }],
    width: 105
  },
  fallbackBadge: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radii.pill,
    bottom: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    position: "absolute"
  },
  fallbackBadgeText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "700"
  },
  mapPinWrap: {
    position: "absolute"
  },
  mapPin: {
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 3,
    height: 28,
    width: 28
  },
  mapPinText: {
    color: colors.navy,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2
  },
  pinStart: {
    left: 45,
    top: 86
  },
  pinMiddle: {
    left: 130,
    top: 205
  },
  pinEnd: {
    bottom: 62,
    right: 44
  }
});
