import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";
import { hasMapboxToken } from "../services/mapService";

export default function RoutePreviewFallback({ route, originLabel, destinationLabel }) {
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
