import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InsightCard from "../components/InsightCard";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import RoutePreviewMap from "../components/RoutePreviewMap";
import StatItem from "../components/StatItem";
import StopCard from "../components/StopCard";
import { colors, radii, screen, spacing } from "../constants/theme";
import { defaultVehicle } from "../data/mockVehicleSpecs";
import { apiSavedPlanToApp, savePlan, planTrip } from "../services/api";
import { formatCurrency, formatHours } from "../utils/tripCalculator";
import { routeTitle, shortPlaceLabel } from "../utils/placeLabels";

export default function TripResultsScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const user = route.params?.user;
  const vehicle = route.params?.vehicle || defaultVehicle;
  const tripRequest = route.params?.tripRequest;
  const [tripPlan, setTripPlan] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [stopDecisions, setStopDecisions] = useState({});

  useEffect(() => {
    loadTripPlan();
  }, [tripRequest, user, vehicle]);

  function loadTripPlan() {
    setLoadingRoute(true);
    setRouteError("");
    planTrip({ ...tripRequest, vehicle, user })
      .then(setTripPlan)
      .catch((error) => {
        setTripPlan(null);
        setRouteError(error.message || "Waylo could not build this route preview.");
      })
      .finally(() => setLoadingRoute(false));
  }

  useEffect(() => {
    const decision = route.params?.stopDecision;
    if (decision?.id) {
      setStopDecisions((current) => ({ ...current, [decision.id]: decision.status }));
    }
  }, [route.params?.stopDecision]);

  if (loadingRoute) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Building your smart trip plan...</Text>
      </SafeAreaView>
    );
  }

  if (routeError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorWrap}>
          <PremiumCard style={styles.errorCard}>
            <Text style={styles.errorTitle}>Route preview unavailable</Text>
            <Text style={styles.errorCopy}>{routeError}</Text>
            <PrimaryButton title="Retry Route" onPress={loadTripPlan} />
            <PrimaryButton title="Back to Trip Input" variant="secondary" onPress={() => navigation.goBack()} />
          </PremiumCard>
        </View>
      </SafeAreaView>
    );
  }

  const { route: plannedRoute, ruleBasedPlan, insights, stops } = tripPlan;
  const finalStops = stops.filter((stop) => stopDecisions[stop.id] === "added");
  const destination = plannedRoute.to || "Los Angeles, CA";
  const routeLabel = routeTitle(plannedRoute.from, destination);
  const savedPlan = {
    id: `${plannedRoute.from}-${destination}-${plannedRoute.mode}`.replace(/\s+/g, "-").toLowerCase(),
    title: routeLabel,
    from: plannedRoute.from,
    to: destination,
    mode: plannedRoute.mode,
    vehicleName: vehicle.vehicleName,
    distanceMiles: plannedRoute.distanceMiles,
    durationHours: plannedRoute.durationHours,
    estimatedFuelCost: insights.estimatedFuelCost,
    estimatedSavings: insights.estimatedSavings,
    routePayload: plannedRoute,
    savedAt: "Saved just now"
  };

  async function handleSaveForLater() {
    let nextSavedPlan = savedPlan;
    if (user?.id) {
      try {
        const persisted = await savePlan({
          userId: user.id,
          tripId: tripPlan.persistedTrip?.id,
          route: plannedRoute,
          vehicle,
          insights
        });
        nextSavedPlan = apiSavedPlanToApp(persisted);
      } catch (error) {
        console.warn("Waylo API saved plan persistence unavailable:", error.message);
      }
    }
    navigation.navigate("Home", { assistantName, user, vehicle, savedPlan: nextSavedPlan });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <PremiumCard style={styles.headerCard}>
          <Text style={styles.routeTitle}>{routeLabel}</Text>
          <Text style={styles.routeMeta}>Mode: {plannedRoute.mode} | Est. Time: {formatHours(plannedRoute.durationHours)}</Text>
        </PremiumCard>

        <RoutePreviewMap
          destinationLabel={shortPlaceLabel(destination)}
          originLabel={shortPlaceLabel(plannedRoute.from)}
          route={plannedRoute}
        />

        <PremiumCard style={styles.planCard}>
          <Text style={styles.planTitle}>Smart Trip Plan</Text>
          <Text style={styles.planSubtitle}>Rule-based preview using real route distance</Text>
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

        <PrimaryButton
          title="Start Navigation"
          onPress={() => navigation.navigate("Navigation", {
            tripPlan: {
              ...tripPlan,
              savedPlanId: savedPlan.id,
              vehicleName: vehicle.vehicleName,
              finalStops,
              user
            }
          })}
        />
        <PrimaryButton
          title="Save for Later"
          variant="secondary"
          onPress={handleSaveForLater}
        />
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
  loading: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "800",
    margin: spacing.lg
  },
  errorWrap: {
    alignSelf: "center",
    maxWidth: screen.maxWidth,
    padding: screen.padding,
    width: "100%"
  },
  errorCard: {
    gap: spacing.md
  },
  errorTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  errorCopy: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
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
