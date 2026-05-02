import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PremiumCard from "../components/PremiumCard";
import StatItem from "../components/StatItem";
import { colors, radii, screen, shadows, spacing } from "../constants/theme";
import { formatHours } from "../utils/tripCalculator";

export default function NavigationScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const tripPlan = route.params?.tripPlan;
  const routeSummary = tripPlan?.route;
  const firstFuelStop = tripPlan?.fullStops?.find((stop) => stop.type === "fuel");
  const selectedStops = tripPlan?.fullStops || [];
  const destinationLabel = routeSummary?.to?.split(",")[0] || "Your destination";

  return (
    <View style={styles.screen}>
      <View style={styles.map}>
        <View style={styles.mapGrid} />
        <View style={styles.routePath} />
        <View style={styles.carMarker}>
          <Text style={styles.carText}>A</Text>
        </View>
      </View>

      <View style={styles.overlay}>
        <View
          style={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing.sm,
              paddingTop: Math.max(insets.top, spacing.sm) + spacing.xs
            }
          ]}
        >
          <View style={styles.turnCard}>
            <Ionicons color={colors.surface} name="navigate" size={30} />
            <View>
              <Text style={styles.turnText}>Drive Preview</Text>
              <Text numberOfLines={1} style={styles.turnDistance}>{destinationLabel}</Text>
            </View>
            <View style={styles.voiceButton}>
              <Ionicons color={colors.surface} name="volume-medium-outline" size={18} />
            </View>
          </View>

          <View style={styles.controls}>
            <FloatingControl label="65" sublabel="speed" />
            <FloatingControl label="58" sublabel="mph" />
          </View>

          <PremiumCard style={styles.bottomCard}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Previewing route</Text>
                <Text style={styles.sheetMeta}>{routeSummary?.from || "Current location"} to {destinationLabel}</Text>
              </View>
              <Text style={styles.stopCountPill}>{selectedStops.length || "Smart"} stops</Text>
            </View>
            <View style={styles.stopRail}>
              {selectedStops.slice(0, 4).map((stop) => (
                <View key={stop.id || stop.name} style={styles.stopChip}>
                  <Ionicons color={colors.blue} name={stop.type === "fuel" ? "pricetag-outline" : stop.type === "food" ? "restaurant-outline" : "bed-outline"} size={14} />
                  <Text numberOfLines={1} style={styles.stopChipText}>{stop.name}</Text>
                </View>
              ))}
            </View>
            <SmartRow color={colors.blue} icon="pricetag-outline" title="Next Fuel Stop" value={firstFuelStop?.name || "Best fuel stop"} meta="Planned from your saved route" />
            <View style={styles.dividerLine} />
            <SmartRow color={colors.skyBlue} icon="bed-outline" title="Take a break" value="Recommended in 1h 45m" meta="" />
            <View style={styles.dividerLine} />
            <SmartRow color={colors.green} icon="trending-down-outline" title="Fuel savings cue" value="Use the recommended stops to keep cost down" meta="" />

            <View style={styles.tripStats}>
              <StatItem compact label="arrival" value="6:45" />
              <StatItem compact label="hrs" value={formatHours(routeSummary?.durationHours || 6.75)} />
              <StatItem compact label="mi" value={`${routeSummary?.distanceMiles || 383}`} />
              <Pressable
                accessibilityLabel="End drive preview"
                accessibilityRole="button"
                onPress={() => navigation.navigate("TripSummary", { tripPlan })}
                style={styles.endButton}
              >
                <Text style={styles.endButtonText}>End</Text>
              </Pressable>
            </View>
          </PremiumCard>
        </View>
      </View>
    </View>
  );
}

function FloatingControl({ label, sublabel }) {
  return (
    <View style={styles.floatControl}>
      <Text style={styles.floatLabel}>{label}</Text>
      <Text style={styles.floatSub}>{sublabel}</Text>
    </View>
  );
}

function SmartRow({ color, icon, title, value, meta }) {
  return (
    <View style={styles.smartRow}>
      <View style={[styles.smartIcon, { backgroundColor: color }]}>
        <Ionicons color={colors.surface} name={icon} size={17} />
      </View>
      <View style={styles.smartBody}>
        <Text style={styles.smartTitle}>{title}</Text>
        <Text style={styles.smartValue}>{value}</Text>
        {!!meta && <Text style={styles.smartMeta}>{meta}</Text>}
      </View>
      <Text style={styles.chevron}>{">"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.appBackground,
    flex: 1
  },
  map: {
    backgroundColor: colors.mapGreen,
    flex: 1,
    overflow: "hidden"
  },
  mapGrid: {
    backgroundColor: "rgba(255,255,255,0.42)",
    borderRadius: 260,
    height: 620,
    left: -80,
    position: "absolute",
    top: 40,
    transform: [{ rotate: "18deg" }],
    width: 520
  },
  routePath: {
    borderColor: "#287BFF",
    borderRadius: 170,
    borderWidth: 10,
    height: 520,
    left: 168,
    position: "absolute",
    top: 80,
    transform: [{ rotate: "12deg" }],
    width: 126
  },
  carMarker: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: "#287BFF",
    borderRadius: radii.pill,
    borderWidth: 3,
    height: 54,
    justifyContent: "center",
    left: "47%",
    position: "absolute",
    top: "42%",
    width: 54,
    ...shadows.card
  },
  carText: {
    color: "#287BFF",
    fontSize: 22,
    fontWeight: "500"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  },
  content: {
    alignSelf: "center",
    flex: 1,
    justifyContent: "space-between",
    maxWidth: screen.maxWidth,
    paddingHorizontal: screen.padding,
    width: "100%"
  },
  turnCard: {
    alignItems: "center",
    backgroundColor: "#087A3A",
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.card
  },
  turnArrow: {
    color: colors.surface,
    fontSize: 42,
    fontWeight: "500"
  },
  turnText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "500"
  },
  turnDistance: {
    color: colors.surface,
    flexShrink: 1,
    fontSize: 21,
    fontWeight: "500",
    maxWidth: 250
  },
  voiceButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radii.pill,
    height: 44,
    justifyContent: "center",
    marginLeft: "auto",
    width: 44
  },
  voiceText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "500"
  },
  controls: {
    gap: spacing.sm,
    marginTop: "auto",
    width: 60
  },
  floatControl: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: spacing.xs,
    ...shadows.soft
  },
  floatLabel: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "500"
  },
  floatSub: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "500",
    textTransform: "uppercase"
  },
  bottomCard: {
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    gap: spacing.sm
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "500"
  },
  sheetMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2
  },
  stopCountPill: {
    backgroundColor: colors.paleBlue,
    borderRadius: radii.pill,
    color: colors.blue,
    fontSize: 12,
    fontWeight: "500",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  stopRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  stopChip: {
    alignItems: "center",
    backgroundColor: colors.appBackground,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    maxWidth: "48%",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  stopChipText: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "500"
  },
  smartRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  smartIcon: {
    alignItems: "center",
    borderRadius: radii.pill,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  smartBody: {
    flex: 1
  },
  smartTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500"
  },
  smartValue: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2
  },
  smartMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },
  chevron: {
    color: colors.muted,
    fontSize: 24
  },
  dividerLine: {
    backgroundColor: colors.border,
    height: 1
  },
  tripStats: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  endButton: {
    alignItems: "center",
    backgroundColor: colors.red,
    borderRadius: radii.md,
    height: 54,
    justifyContent: "center",
    width: 64
  },
  endButtonText: {
    color: colors.surface,
    fontWeight: "500"
  }
});
