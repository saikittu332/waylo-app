import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import StatItem from "../components/StatItem";
import { colors, radii, screen, shadows, spacing } from "../constants/theme";
import { deleteSavedPlan } from "../services/api";
import { formatCurrency, formatHours } from "../utils/tripCalculator";
import { routeMetaLabel } from "../utils/placeLabels";

export default function TripDetailScreen({ navigation, route }) {
  const plan = route.params?.plan || route.params?.completedTrip;
  const isCompleted = route.params?.type === "completed";
  const [deleting, setDeleting] = React.useState(false);
  const stops = plan?.finalStops || [];

  async function removeSavedPlan() {
    if (!plan?.id) return;
    setDeleting(true);
    try {
      await deleteSavedPlan(plan.id);
    } catch (error) {
      console.warn("Waylo API saved plan delete unavailable:", error.message);
    }
    setDeleting(false);
    navigation.navigate("Home", { deletedPlanId: plan.id });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <PremiumCard style={styles.card}>
          <Text style={styles.eyebrow}>{isCompleted ? "Completed trip" : "Ready route"}</Text>
          <Text style={styles.title}>{plan?.title || "Saved route"}</Text>
          <Text style={styles.meta}>{routeMetaLabel(plan)}</Text>
        </PremiumCard>

        <View style={styles.mapPreview}>
          <View style={styles.mapBlob} />
          <View style={styles.routeLine} />
          <View style={styles.mapPinStart} />
          <View style={styles.mapPinEnd} />
          <View style={styles.mapSheet}>
            <Text style={styles.sectionTitle}>{isCompleted ? "Trip recap" : "Drive preview"}</Text>
            <Text style={styles.body}>{plan?.from || "Origin"} to {plan?.to || "Destination"}</Text>
          </View>
        </View>

        <PremiumCard style={styles.statsCard}>
          <StatItem label="Distance" value={`${Math.round(Number(plan?.distanceMiles || 0)) || "--"} mi`} />
          <View style={styles.divider} />
          <StatItem label="Est. Time" value={plan?.durationHours ? formatHours(plan.durationHours) : "--"} />
          <View style={styles.divider} />
          <StatItem label="Fuel Cost" value={plan?.estimatedFuelCost ? formatCurrency(plan.estimatedFuelCost) : "--"} />
        </PremiumCard>

        <PremiumCard style={styles.card}>
          <Text style={styles.sectionTitle}>{isCompleted ? "What happened" : "Selected stops"}</Text>
          <Text style={styles.body}>
            {isCompleted
              ? "This trip is saved in your completed history."
              : stops.length
                ? `${stops.length} stops are saved with this route. You can preview the drive or revise the plan from Home.`
                : "No stops were selected yet. Preview the route and choose the stops you want to keep."}
          </Text>
          {stops.slice(0, 3).map((stop) => (
            <View key={stop.id || stop.name} style={styles.stopMiniRow}>
              <Ionicons color={colors.blue} name={stop.type === "fuel" ? "pricetag-outline" : "location-outline"} size={16} />
              <Text style={styles.stopMiniText}>{stop.name}</Text>
            </View>
          ))}
        </PremiumCard>

        {!isCompleted && (
          <>
            <PrimaryButton
              title="Start Drive Preview"
              onPress={() => navigation.navigate("Navigation", {
                tripPlan: {
                  savedPlanId: plan?.id,
                  persistedTrip: plan?.tripId ? { id: plan.tripId } : null,
                  vehicleName: plan?.vehicleName,
                  route: plan?.routePayload || {
                    from: plan?.from,
                    to: plan?.to,
                    mode: plan?.mode,
                    distanceMiles: plan?.distanceMiles,
                    durationHours: plan?.durationHours
                  },
                  insights: {
                    estimatedFuelCost: plan?.estimatedFuelCost,
                    estimatedSavings: plan?.estimatedSavings
                  },
                  fullStops: plan?.finalStops?.length ? plan.finalStops : [{ id: "quick-fuel", type: "fuel", name: "Best Fuel Stop" }]
                }
              })}
            />
            <PrimaryButton title={deleting ? "Removing..." : "Remove Saved Plan"} variant="secondary" onPress={removeSavedPlan} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.appBackground,
    flex: 1
  },
  container: {
    alignSelf: "center",
    gap: spacing.md,
    maxWidth: screen.maxWidth,
    padding: screen.padding,
    paddingBottom: spacing.xl * 2,
    width: "100%"
  },
  card: {
    gap: spacing.xs
  },
  eyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700"
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  mapPreview: {
    backgroundColor: colors.mapBlue,
    borderRadius: radii.xl,
    height: 230,
    overflow: "hidden",
    position: "relative",
    ...shadows.soft
  },
  mapBlob: {
    backgroundColor: colors.mapGreen,
    borderRadius: 180,
    height: 260,
    left: -70,
    position: "absolute",
    top: 26,
    transform: [{ rotate: "-18deg" }],
    width: 280
  },
  routeLine: {
    borderColor: colors.blue,
    borderRadius: 120,
    borderWidth: 8,
    height: 260,
    left: 190,
    position: "absolute",
    top: -30,
    transform: [{ rotate: "24deg" }],
    width: 90
  },
  mapPinStart: {
    backgroundColor: colors.green,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 4,
    height: 24,
    left: 80,
    position: "absolute",
    top: 78,
    width: 24
  },
  mapPinEnd: {
    backgroundColor: colors.red,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 4,
    bottom: 54,
    height: 24,
    position: "absolute",
    right: 82,
    width: 24
  },
  mapSheet: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radii.lg,
    bottom: spacing.md,
    left: spacing.md,
    padding: spacing.md,
    position: "absolute",
    right: spacing.md
  },
  statsCard: {
    alignItems: "center",
    flexDirection: "row"
  },
  divider: {
    backgroundColor: colors.border,
    height: 42,
    width: 1
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21
  }
  ,
  stopMiniRow: {
    alignItems: "center",
    backgroundColor: colors.appBackground,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  stopMiniText: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "700"
  }
});
