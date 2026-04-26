import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, screen, spacing, typography } from "../constants/theme";
import { formatCurrency, formatHours } from "../utils/tripCalculator";
import { routeTitle } from "../utils/placeLabels";

export default function TripSummaryScreen({ navigation, route }) {
  const tripPlan = route.params?.tripPlan;
  const routeSummary = tripPlan?.route;
  const fuelCost = tripPlan?.insights?.estimatedFuelCost || 52.36;
  const savings = tripPlan?.insights?.estimatedSavings || 14.28;
  const fuelUsed = tripPlan?.insights?.fuelUsed || 11.2;
  const completedTrip = route.params?.completedTrip || {
    id: `completed-${tripPlan?.savedPlanId || routeSummary?.from || "route"}-${Date.now()}`,
    savedPlanId: tripPlan?.savedPlanId,
    title: routeTitle(routeSummary?.from || "San Francisco", routeSummary?.to || "Los Angeles"),
    from: routeSummary?.from || "San Francisco",
    to: routeSummary?.to || "Los Angeles",
    mode: routeSummary?.mode || "Cheapest",
    vehicleName: tripPlan?.vehicleName || "Toyota Camry 2021",
    distanceMiles: routeSummary?.distanceMiles || 383,
    durationHours: routeSummary?.durationHours || 6.75,
    estimatedFuelCost: fuelCost,
    estimatedSavings: savings,
    tripPlan
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.completeIcon}>
            <Ionicons color={colors.surface} name="checkmark" size={24} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.completed}>Trip Completed</Text>
            <Text style={styles.message}>Great job. You've reached your destination.</Text>
          </View>
        </View>
        <PremiumCard style={styles.summaryCard}>
          <Text style={styles.routeTitle}>{completedTrip.title}</Text>
          <Text style={styles.date}>May 24, 2024</Text>
          <SummaryRow label="Distance" value={`${routeSummary?.distanceMiles || 383} mi`} />
          <SummaryRow label="Total Time" value={formatHours(routeSummary?.durationHours || 6.75)} />
          <SummaryRow label="Fuel Used" value={`${fuelUsed.toFixed(1)} gal`} />
          <SummaryRow label="Total Fuel Cost" value={formatCurrency(fuelCost)} />

          <View style={styles.savingsCard}>
            <View>
              <Text style={styles.savingsLabel}>You Saved</Text>
              <Text style={styles.savingsSub}>vs standard route</Text>
            </View>
            <Text style={styles.savingsValue}>{formatCurrency(savings)}</Text>
          </View>

          <View style={styles.stopsMade}>
            <Text style={styles.stopsTitle}>Stops Made</Text>
            <Text style={styles.stopsText}>2 Fuel stops | 2 Breaks</Text>
          </View>
        </PremiumCard>

        <PrimaryButton title="Save Trip" onPress={() => navigation.navigate("Home", { completedTrip })} />
        <PrimaryButton title="Share Summary" variant="secondary" onPress={() => navigation.navigate("Home")} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.appBackground,
    flex: 1
  },
  header: {
    alignItems: "center",
    backgroundColor: colors.navy,
    borderRadius: radii.xl,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 104,
    padding: spacing.md
  },
  completeIcon: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: radii.pill,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  headerCopy: {
    flex: 1
  },
  completed: {
    color: colors.surface,
    fontSize: 21,
    fontWeight: "800"
  },
  message: {
    color: "#DDE7F5",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: spacing.xs,
    maxWidth: 260
  },
  container: {
    alignSelf: "center",
    gap: spacing.md,
    maxWidth: screen.maxWidth,
    padding: screen.padding,
    paddingBottom: spacing.xl * 2,
    width: "100%"
  },
  summaryCard: {
    gap: spacing.md
  },
  routeTitle: {
    ...typography.body,
    fontWeight: "800"
  },
  date: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: -8
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800"
  },
  summaryValue: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "800"
  },
  savingsCard: {
    alignItems: "center",
    backgroundColor: colors.paleGreen,
    borderColor: "rgba(24,184,117,0.16)",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md
  },
  savingsLabel: {
    color: "#087A3A",
    fontSize: 16,
    fontWeight: "800"
  },
  savingsSub: {
    color: "#087A3A",
    fontSize: 12,
    marginTop: 3
  },
  savingsValue: {
    color: "#087A3A",
    fontSize: 24,
    fontWeight: "800"
  },
  stopsMade: {
    gap: 3
  },
  stopsTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  stopsText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  }
});
