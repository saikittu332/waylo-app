import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import StatItem from "../components/StatItem";
import { colors, screen, spacing } from "../constants/theme";
import { deleteSavedPlan } from "../services/api";
import { formatCurrency, formatHours } from "../utils/tripCalculator";
import { routeMetaLabel } from "../utils/placeLabels";

export default function TripDetailScreen({ navigation, route }) {
  const plan = route.params?.plan || route.params?.completedTrip;
  const isCompleted = route.params?.type === "completed";
  const [deleting, setDeleting] = React.useState(false);

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

        <PremiumCard style={styles.statsCard}>
          <StatItem label="Distance" value={`${Math.round(Number(plan?.distanceMiles || 0)) || "--"} mi`} />
          <View style={styles.divider} />
          <StatItem label="Est. Time" value={plan?.durationHours ? formatHours(plan.durationHours) : "--"} />
          <View style={styles.divider} />
          <StatItem label="Fuel Cost" value={plan?.estimatedFuelCost ? formatCurrency(plan.estimatedFuelCost) : "--"} />
        </PremiumCard>

        <PremiumCard style={styles.card}>
          <Text style={styles.sectionTitle}>Trip notes</Text>
          <Text style={styles.body}>
            {isCompleted
              ? "This trip is saved in your completed history."
              : "This route is ready to start from the Navigate tab."}
          </Text>
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
});
