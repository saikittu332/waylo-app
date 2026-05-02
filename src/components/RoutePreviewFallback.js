import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";
import { hasMapboxToken } from "../services/mapService";

export default function RoutePreviewFallback({ route, originLabel, destinationLabel }) {
  const distance = route?.distanceMiles ? `${Math.round(route.distanceMiles)} mi` : "Route preview";
  const duration = route?.durationHours ? `${Math.floor(route.durationHours)}h ${Math.round((route.durationHours % 1) * 60)}m` : "Preview";
  const badgeText = route?.map?.isDemoRoute
    ? "Demo route preview"
    : hasMapboxToken() ? "Route data from Mapbox" : "Add Mapbox token for live route data";
  return (
    <View style={styles.mapCard}>
      <View style={styles.water} />
      <View style={styles.sand} />
      <View style={styles.mapLand} />
      <View style={styles.highwayShadow} />
      <View style={styles.highway} />
      <View style={styles.routePath} />
      <View style={styles.routePulse} />
      <MapPin label={originLabel || "Origin"} style={styles.pinStart} color={colors.green} />
      <View style={styles.routeBadge}>
        <Text style={styles.routeBadgeLabel}>Route</Text>
        <Text style={styles.routeBadgeText}>{distance}</Text>
        <Text style={styles.routeBadgeSub}>{duration}</Text>
      </View>
      <MapPin label={destinationLabel || "Destination"} style={styles.pinEnd} color={colors.red} />
      <View style={styles.fallbackBadge}>
        <Text style={styles.fallbackBadgeText}>{badgeText}</Text>
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
    backgroundColor: "#DDEFFC",
    borderRadius: radii.xl,
    height: 430,
    overflow: "hidden",
    ...shadows.float
  },
  water: {
    backgroundColor: "#BFE0F4",
    borderRadius: 240,
    height: 340,
    position: "absolute",
    right: -120,
    top: 20,
    width: 260
  },
  sand: {
    backgroundColor: colors.mapSand,
    borderRadius: 180,
    bottom: -92,
    height: 240,
    position: "absolute",
    right: -100,
    transform: [{ rotate: "14deg" }],
    width: 280
  },
  mapLand: {
    backgroundColor: "#DCEED8",
    borderRadius: 220,
    height: 470,
    left: -95,
    position: "absolute",
    top: -25,
    transform: [{ rotate: "-10deg" }],
    width: 355
  },
  highwayShadow: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 999,
    height: 410,
    left: 178,
    position: "absolute",
    top: 15,
    transform: [{ rotate: "27deg" }],
    width: 48
  },
  highway: {
    backgroundColor: "#F9FBFF",
    borderColor: "rgba(11,45,92,0.08)",
    borderRadius: 999,
    borderWidth: 1,
    height: 420,
    left: 190,
    position: "absolute",
    top: 8,
    transform: [{ rotate: "27deg" }],
    width: 24
  },
  routePath: {
    backgroundColor: colors.blueDeep,
    borderRadius: 999,
    height: 315,
    left: 190,
    position: "absolute",
    top: 58,
    transform: [{ rotate: "27deg" }],
    width: 7
  },
  routePulse: {
    backgroundColor: colors.surface,
    borderColor: colors.blueDeep,
    borderRadius: radii.pill,
    borderWidth: 3,
    height: 34,
    left: 178,
    position: "absolute",
    top: 190,
    width: 34,
    ...shadows.soft
  },
  routeBadge: {
    backgroundColor: colors.surface,
    borderColor: "rgba(35,71,101,0.08)",
    borderRadius: radii.md,
    borderWidth: 1,
    left: 132,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: "absolute",
    top: 164,
    ...shadows.soft
  },
  routeBadgeLabel: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  routeBadgeText: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "600"
  },
  routeBadgeSub: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "500"
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
    fontWeight: "600"
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
    fontWeight: "600",
    marginTop: 2
  },
  pinStart: {
    left: 45,
    top: 86
  },
  pinEnd: {
    bottom: 74,
    right: 42
  }
});
