import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import RoutePreviewMap from "../components/RoutePreviewMap";
import StatItem from "../components/StatItem";
import StopCard from "../components/StopCard";
import { colors, radii, screen, spacing } from "../constants/theme";
import { defaultVehicle } from "../data/mockVehicleSpecs";
import { apiSavedPlanToApp, savePlan, planTrip, updateTripStop } from "../services/api";
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
      const stop = tripPlan?.stops?.find((item) => item.id === decision.id);
      if (stop?.persistedStopId) {
        updateTripStop(stop.persistedStopId, { decision: decision.status }).catch((error) => {
          console.warn("Waylo API stop decision update unavailable:", error.message);
        });
      }
    }
  }, [route.params?.stopDecision, tripPlan?.stops]);

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

  const { route: plannedRoute, insights, stops } = tripPlan;
  const finalStops = stops.filter((stop) => stopDecisions[stop.id] === "added");
  const skippedStops = stops.filter((stop) => stopDecisions[stop.id] === "skipped");
  const standardFuelCost = insights.estimatedFuelCost + insights.estimatedSavings;
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
          insights,
          finalStops,
          stopDecisions
        });
        nextSavedPlan = apiSavedPlanToApp(persisted);
      } catch (error) {
        console.warn("Waylo API saved plan persistence unavailable:", error.message);
      }
    }
    navigation.navigate("Home", { assistantName, user, vehicle, savedPlan: nextSavedPlan });
  }

  async function openStopDetails(stop) {
    navigation.navigate("StopDetails", { stop, decision: stopDecisions[stop.id] || stop.decision });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>Waylo route plan</Text>
            <Text style={styles.routeTitle}>{routeLabel}</Text>
            <Text style={styles.routeMeta}>{plannedRoute.mode} mode | {vehicle.vehicleName}</Text>
          </View>
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsBadgeLabel}>Estimated savings</Text>
            <Text style={styles.savingsBadgeValue}>{formatCurrency(insights.estimatedSavings)}</Text>
          </View>
        </View>

        <RoutePreviewMap
          destinationLabel={shortPlaceLabel(destination)}
          originLabel={shortPlaceLabel(plannedRoute.from)}
          route={plannedRoute}
        />

        <PremiumCard style={styles.proofCard}>
          <Text style={styles.planTitle}>Why this plan works</Text>
          <View style={styles.proofGrid}>
            <ProofMetric label="Safe range" value={`${Math.round(insights.safeRange)} mi`} detail={`${Math.round(insights.range)} mi full range`} />
            <ProofMetric label="Waylo fuel" value={formatCurrency(insights.estimatedFuelCost)} detail={`${insights.fuelUsed.toFixed(1)} gal est.`} />
            <ProofMetric label="Standard" value={formatCurrency(standardFuelCost)} detail="same route at higher price" />
          </View>
          <View style={styles.comparisonBar}>
            <View style={[styles.comparisonFill, { width: `${Math.max(20, 100 - (insights.estimatedSavings / Math.max(standardFuelCost, 1)) * 100)}%` }]} />
          </View>
          <Text style={styles.planSubtitle}>Savings are estimated from route distance, your vehicle MPG, and comparison fuel pricing.</Text>
        </PremiumCard>

        <PremiumCard style={styles.stopsCard}>
          <View style={styles.stopsHeader}>
            <View>
              <Text style={styles.stopsTitle}>Route Timeline</Text>
              <Text style={styles.planSubtitle}>{finalStops.length} selected | {skippedStops.length} skipped</Text>
            </View>
            <Text style={styles.stopsMeta}>{stops.length} suggestions</Text>
          </View>
          <View style={styles.timeline}>
            <TimelinePoint title={shortPlaceLabel(plannedRoute.from)} meta="Start" />
            {stops.map((stop) => (
              <StopCard
                key={stop.id}
                decision={stopDecisions[stop.id] || stop.decision}
                stop={stop}
                timeline
                onPress={() => openStopDetails(stop)}
              />
            ))}
            <TimelinePoint title={shortPlaceLabel(destination)} meta="Destination" end />
          </View>
        </PremiumCard>

        <PremiumCard style={styles.summaryBar}>
          <StatItem label="Distance" value={`${plannedRoute.distanceMiles} mi`} />
          <View style={styles.divider} />
          <StatItem label="Est. Time" value={formatHours(plannedRoute.durationHours)} />
          <View style={styles.divider} />
          <StatItem label="Est. Fuel Cost" value={formatCurrency(insights.estimatedFuelCost)} />
        </PremiumCard>

        <PrimaryButton
          title="Start Drive Preview"
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

function ProofMetric({ label, value, detail }) {
  return (
    <View style={styles.proofMetric}>
      <Text style={styles.proofLabel}>{label}</Text>
      <Text style={styles.proofValue}>{value}</Text>
      <Text style={styles.proofDetail}>{detail}</Text>
    </View>
  );
}

function TimelinePoint({ title, meta, end }) {
  return (
    <View style={styles.timelinePoint}>
      <View style={[styles.timelineDot, end && styles.timelineDotEnd]} />
      <View style={styles.timelinePointText}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineMeta}>{meta}</Text>
      </View>
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
    fontWeight: "700",
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
    fontWeight: "700"
  },
  errorCopy: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.md
  },
  heroText: {
    flex: 1
  },
  eyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  routeTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700"
  },
  routeMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4
  },
  savingsBadge: {
    alignItems: "flex-end",
    backgroundColor: colors.paleGreen,
    borderRadius: radii.md,
    justifyContent: "center",
    minWidth: 116,
    padding: spacing.sm
  },
  savingsBadgeLabel: {
    color: "#0E7A4A",
    fontSize: 10,
    fontWeight: "700"
  },
  savingsBadgeValue: {
    color: "#0E7A4A",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 2
  },
  proofCard: {
    gap: spacing.md
  },
  planTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  planSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17
  },
  proofGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  proofMetric: {
    backgroundColor: colors.appBackground,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.sm
  },
  proofLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  proofValue: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 5
  },
  proofDetail: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4
  },
  comparisonBar: {
    backgroundColor: "#E7EEF8",
    borderRadius: radii.pill,
    height: 10,
    overflow: "hidden"
  },
  comparisonFill: {
    backgroundColor: colors.green,
    borderRadius: radii.pill,
    height: "100%"
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
    fontWeight: "700"
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
  },
  timeline: {
    gap: spacing.sm
  },
  timelinePoint: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs
  },
  timelineDot: {
    backgroundColor: colors.green,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 3,
    height: 22,
    width: 22
  },
  timelineDotEnd: {
    backgroundColor: colors.red
  },
  timelinePointText: {
    flex: 1
  },
  timelineTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  timelineMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  }
});
