import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InsightCard from "../components/InsightCard";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import StatItem from "../components/StatItem";
import StopCard from "../components/StopCard";
import { colors, radii, screen, shadows, spacing } from "../constants/theme";
import { defaultVehicle } from "../data/mockVehicleSpecs";
import { planTrip } from "../services/api";
import { getSubscriptionState } from "../services/subscriptionService";
import { formatCurrency, formatHours } from "../utils/tripCalculator";

export default function TripResultsScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const vehicle = route.params?.vehicle || defaultVehicle;
  const tripRequest = route.params?.tripRequest;
  const [tripPlan, setTripPlan] = useState(null);
  const [stopDecisions, setStopDecisions] = useState({});
  const subscription = getSubscriptionState();

  useEffect(() => {
    planTrip({ ...tripRequest, vehicle }).then(setTripPlan);
  }, [tripRequest, vehicle]);

  useEffect(() => {
    const decision = route.params?.stopDecision;
    if (decision?.id) {
      setStopDecisions((current) => ({ ...current, [decision.id]: decision.status }));
    }
  }, [route.params?.stopDecision]);

  if (!tripPlan) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Building your smart trip plan...</Text>
      </SafeAreaView>
    );
  }

  const { route: plannedRoute, ruleBasedPlan, insights, stops } = tripPlan;
  const finalStops = stops.filter((stop) => stopDecisions[stop.id] === "added");
  const destination = plannedRoute.to || "Los Angeles, CA";
  const routeLabel = `${plannedRoute.from === "Current Location" ? "San Francisco" : plannedRoute.from} -> ${destination.replace(", CA", "")}`;
  const savedPlan = {
    id: `${plannedRoute.from}-${destination}-${plannedRoute.mode}`.replace(/\s+/g, "-").toLowerCase(),
    title: routeLabel,
    from: plannedRoute.from,
    to: destination,
    mode: plannedRoute.mode,
    vehicleName: vehicle.vehicleName,
    savedAt: "Saved just now"
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <PremiumCard style={styles.headerCard}>
          <Text style={styles.routeTitle}>{routeLabel}</Text>
          <Text style={styles.routeMeta}>Mode: {plannedRoute.mode} | Est. Time: {formatHours(plannedRoute.durationHours)}</Text>
        </PremiumCard>

        <View style={styles.mapCard}>
          <View style={styles.mapLand} />
          <View style={styles.routePath} />
          <MapPin label="San Francisco" style={styles.pinStart} color={colors.green} />
          <MapPin label="Fresno" style={styles.pinMiddle} color={colors.orange} />
          <MapPin label={destination.replace(", CA", "")} style={styles.pinEnd} color={colors.red} />
        </View>

        <PremiumCard style={styles.planCard}>
          <Text style={styles.planTitle}>AI Trip Plan <Text style={styles.premiumText}>({subscription.planName})</Text></Text>
          <Text style={styles.planSubtitle}>Optimized for lowest cost and fewer stops</Text>
          <InsightCard title="Fuel Plan" value={`${Math.max(ruleBasedPlan.fuelStops.length, 1)} stops | Best prices`} accent="green" />
          <InsightCard title="Rest Stops" value={`${Math.max(ruleBasedPlan.restStops.length, 1)} stops | Stay fresh`} />
          <InsightCard title="Food Stops" value="2 stops | Top rated" accent="orange" />
          <InsightCard title="Scenic Stop" value={plannedRoute.mode === "Scenic" ? "2 stops | Great views" : "1 stop | Great view"} />
          <View style={styles.savings}>
            <View>
              <Text style={styles.savingsLabel}>Estimated Savings</Text>
              <Text style={styles.savingsSub}>vs standard route</Text>
            </View>
            <Text style={styles.savingsValue}>{formatCurrency(insights.estimatedSavings)}</Text>
          </View>
        </PremiumCard>

        <PremiumCard style={styles.stopsCard}>
          <View style={styles.stopsHeader}>
            <Text style={styles.stopsTitle}>Recommended Stops</Text>
            <Text style={styles.stopsMeta}>{finalStops.length} final</Text>
          </View>
          {stops.map((stop) => (
            <StopCard
              key={stop.id}
              decision={stopDecisions[stop.id]}
              stop={stop}
              onPress={() => navigation.navigate("StopDetails", { stop, decision: stopDecisions[stop.id] })}
            />
          ))}
        </PremiumCard>

        <PremiumCard style={styles.summaryBar}>
          <StatItem label="Distance" value={`${plannedRoute.distanceMiles} mi`} />
          <View style={styles.divider} />
          <StatItem label="Est. Time" value={formatHours(plannedRoute.durationHours)} />
          <View style={styles.divider} />
          <StatItem label="Est. Fuel Cost" value={formatCurrency(insights.estimatedFuelCost)} />
        </PremiumCard>

        <PrimaryButton title="Start Navigation" onPress={() => navigation.navigate("Navigation", { tripPlan: { ...tripPlan, finalStops } })} />
        <PrimaryButton
          title="Save for Later"
          variant="secondary"
          onPress={() => navigation.navigate("Home", { assistantName, vehicle, savedPlan })}
        />
      </ScrollView>
    </SafeAreaView>
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
  loading: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "800",
    margin: spacing.lg
  },
  headerCard: {
    alignItems: "center",
    paddingVertical: spacing.md
  },
  routeTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  routeMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4
  },
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
  },
  planCard: {
    alignSelf: "flex-end",
    gap: 2,
    width: "100%"
  },
  planTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  premiumText: {
    color: colors.green,
    fontSize: 11
  },
  planSubtitle: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  savings: {
    backgroundColor: colors.paleGreen,
    borderRadius: radii.md,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    padding: spacing.sm
  },
  savingsLabel: {
    color: "#0E7A4A",
    fontSize: 12,
    fontWeight: "800"
  },
  savingsSub: {
    color: "#0E7A4A",
    fontSize: 10,
    marginTop: 2
  },
  savingsValue: {
    color: "#0E7A4A",
    fontSize: 18,
    fontWeight: "800"
  },
  summaryBar: {
    alignItems: "center",
    flexDirection: "row"
  },
  stopsCard: {
    gap: spacing.md
  },
  stopsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  stopsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  stopsMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  divider: {
    backgroundColor: colors.border,
    height: 40,
    width: 1
  }
});
