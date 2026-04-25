import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import InsightCard from "../components/InsightCard";
import PrimaryButton from "../components/PrimaryButton";
import StopCard from "../components/StopCard";
import { colors, radii, shadows, spacing, typography } from "../constants/theme";
import { defaultVehicle } from "../data/mockVehicleSpecs";
import { planTrip } from "../services/api";
import { getSubscriptionState } from "../services/subscriptionService";
import { formatCurrency, formatHours } from "../utils/tripCalculator";

export default function TripResultsScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const vehicle = route.params?.vehicle || defaultVehicle;
  const tripRequest = route.params?.tripRequest;
  const [tripPlan, setTripPlan] = useState(null);
  const subscription = getSubscriptionState();

  useEffect(() => {
    planTrip({ ...tripRequest, vehicle }).then(setTripPlan);
  }, [tripRequest, vehicle]);

  if (!tripPlan) {
    return <Text style={styles.loading}>Planning with {assistantName}...</Text>;
  }

  const { route: plannedRoute, stops, ruleBasedPlan, insights } = tripPlan;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mapCard}>
          <Text style={styles.mapProvider}>{plannedRoute.map.polylineLabel}</Text>
          <View style={styles.routeLine} />
          <Text style={styles.mapBounds}>{plannedRoute.map.boundsLabel}</Text>
        </View>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{plannedRoute.mode} route</Text>
          <Text style={styles.summaryText}>{plannedRoute.distanceMiles} mi | {formatHours(plannedRoute.durationHours)} | {formatCurrency(insights.estimatedFuelCost)}</Text>
        </View>
        <InsightCard title="Fuel plan" value={`${ruleBasedPlan.fuelStops.length || 1} smart stop`} detail="Fuel stops are suggested near 80% of vehicle range." accent="orange" />
        <InsightCard title="Rest stops" value={`${ruleBasedPlan.restStops.length} reminders`} detail="Comfort reminders appear every 2.5 to 3 hours." />
        <InsightCard title="Food stops" value="1 curated stop" detail="Mock stop near the best midpoint window." />
        <InsightCard title="Scenic stops" value={subscription.isPremium ? "Included" : "Premium locked"} detail="Premium unlocks scenic recommendations and richer route comfort." />
        <InsightCard title="Estimated savings" value={formatCurrency(insights.estimatedSavings)} detail="Compared with unoptimized fuel choices on this route." accent="green" />
        {!subscription.isPremium && (
          <PrimaryButton title="Unlock Full Plan" variant="secondary" onPress={() => navigation.navigate("Paywall")} />
        )}
        <Text style={styles.sectionTitle}>{subscription.planName} stop preview</Text>
        {stops.map((stop) => (
          <StopCard key={stop.id} stop={stop} onPress={() => navigation.navigate("StopDetails", { stop })} />
        ))}
        <PrimaryButton title="Start Navigation" onPress={() => navigation.navigate("Navigation", { tripPlan })} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  container: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl
  },
  loading: {
    ...typography.body,
    margin: spacing.lg
  },
  mapCard: {
    backgroundColor: colors.paleBlue,
    borderRadius: radii.lg,
    height: 250,
    justifyContent: "space-between",
    overflow: "hidden",
    padding: spacing.md
  },
  mapProvider: {
    color: colors.navy,
    fontWeight: "900"
  },
  routeLine: {
    alignSelf: "center",
    borderColor: colors.orange,
    borderRadius: 100,
    borderWidth: 5,
    height: 150,
    transform: [{ rotate: "28deg" }],
    width: 96
  },
  mapBounds: {
    color: colors.muted,
    fontWeight: "700"
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.card
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  summaryText: {
    color: colors.muted,
    marginTop: 6
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 20
  }
});
