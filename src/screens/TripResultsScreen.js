import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import RoutePreviewMap from "../components/RoutePreviewMap";
import StatItem from "../components/StatItem";
import StopCard from "../components/StopCard";
import { colors, radii, screen, shadows, spacing } from "../constants/theme";
import { defaultVehicle } from "../data/mockVehicleSpecs";
import { apiSavedPlanToApp, savePlan, planTrip, updateSavedPlanRoute, updateTripStop } from "../services/api";
import { formatCurrency, formatHours } from "../utils/tripCalculator";
import { routeTitle, shortPlaceLabel } from "../utils/placeLabels";

export default function TripResultsScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const user = route.params?.user;
  const vehicle = route.params?.vehicle || defaultVehicle;
  const tripRequest = route.params?.tripRequest;
  const existingPlan = route.params?.existingPlan;
  const [tripPlan, setTripPlan] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [stopDecisions, setStopDecisions] = useState(existingPlan?.stopDecisions || {});

  useEffect(() => {
    loadTripPlan();
  }, [tripRequest, user, vehicle]);

  useEffect(() => {
    if (existingPlan?.stopDecisions) {
      setStopDecisions(existingPlan.stopDecisions);
    }
  }, [existingPlan?.id]);

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
        <View style={styles.loadingWrap}>
          <View style={styles.loadingMap}>
            <View style={styles.loadingRouteLine} />
            <View style={styles.loadingPinStart} />
            <View style={styles.loadingPinEnd} />
          </View>
          <PremiumCard style={styles.loadingCard}>
            <Text style={styles.loadingTitle}>Building your smart trip</Text>
            <Text style={styles.loadingCopy}>Checking route distance, safe range, rest timing, and fuel-cost tradeoffs.</Text>
            <View style={styles.loadingSteps}>
              <LoadingStep done text="Route preview" />
              <LoadingStep done text="Vehicle range" />
              <LoadingStep text="Stop ranking" />
            </View>
          </PremiumCard>
        </View>
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
  const recommendedStops = stops.filter((stop) => !stopDecisions[stop.id] || stopDecisions[stop.id] === "recommended");
  const standardFuelCost = insights.estimatedFuelCost + insights.estimatedSavings;
  const destination = plannedRoute.to || "Los Angeles, CA";
  const routeLabel = routeTitle(plannedRoute.from, destination);
  const topStops = [...stops].sort((a, b) => Number(b.intelligenceScore || 0) - Number(a.intelligenceScore || 0)).slice(0, 3);
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
    allStops: stops.map((stop) => ({ ...stop, decision: stopDecisions[stop.id] || stop.decision || "recommended" })),
    finalStops,
    stopDecisions,
    stopCount: finalStops.length,
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
          stopDecisions,
          allStops: stops
        });
        nextSavedPlan = apiSavedPlanToApp(persisted);
      } catch (error) {
        console.warn("Waylo API saved plan persistence unavailable:", error.message);
      }
    }
    navigation.navigate("Home", { assistantName, user, vehicle, savedPlan: nextSavedPlan });
  }

  async function handleUpdatePlan() {
    if (!existingPlan?.id) {
      handleSaveForLater();
      return;
    }
    let nextSavedPlan = savedPlan;
    try {
      nextSavedPlan = await updateSavedPlanRoute(existingPlan.id, {
        route: plannedRoute,
        vehicle,
        insights,
        finalStops,
        stopDecisions,
        allStops: stops
      });
    } catch (error) {
      console.warn("Waylo API saved plan update unavailable:", error.message);
      nextSavedPlan = { ...savedPlan, id: existingPlan.id, tripId: existingPlan.tripId };
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
            {!!existingPlan && <Text style={styles.editingMeta}>Editing saved plan</Text>}
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

        <View style={styles.routeStrip}>
          <RouteStripItem icon="shield-checkmark-outline" label="Reserve" value={`${Math.round(insights.safeRange)} mi`} />
          <RouteStripItem icon="time-outline" label="Drive time" value={formatHours(plannedRoute.durationHours)} />
          <RouteStripItem icon="sparkles-outline" label="Confidence" value={`${Math.max(82, Math.min(96, Math.round(100 - finalStops.length * 2)))}%`} />
        </View>

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

        <PremiumCard style={styles.aiCoachCard}>
          <View style={styles.stopsHeader}>
            <View>
              <Text style={styles.stopsTitle}>Assistant picks</Text>
              <Text style={styles.planSubtitle}>Ranked by cost impact, detour, route fit, and comfort timing.</Text>
            </View>
            <Text style={styles.stopsMeta}>{plannedRoute.mode}</Text>
          </View>
          {topStops.map((stop) => (
            <View key={`rank-${stop.id}`} style={styles.rankRow}>
              <View style={styles.rankScore}>
                <Text style={styles.rankScoreText}>{stop.intelligenceScore || "--"}</Text>
              </View>
              <View style={styles.rankCopy}>
                <Text style={styles.rankTitle}>{stop.name}</Text>
                <Text style={styles.rankMeta}>{stop.routeFitLabel || "Route fit"} | {stop.detourMinutes || 0} min detour | {stop.type}</Text>
              </View>
            </View>
          ))}
        </PremiumCard>

        <PremiumCard style={styles.stopsCard}>
          <View style={styles.stopsHeader}>
            <View>
              <Text style={styles.stopsTitle}>Route Timeline</Text>
              <Text style={styles.planSubtitle}>{finalStops.length} selected | {skippedStops.length} skipped | {recommendedStops.length} undecided</Text>
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

        <PremiumCard style={styles.selectedStopsCard}>
          <View style={styles.stopsHeader}>
            <View>
              <Text style={styles.stopsTitle}>Final stop list</Text>
              <Text style={styles.planSubtitle}>These stops will be saved with your drive.</Text>
            </View>
            <Text style={styles.stopsMeta}>{finalStops.length} selected</Text>
          </View>
          {finalStops.length === 0 ? (
            <Text style={styles.emptyStopsText}>Tap a stop in the timeline, then choose Add to Route to build your final route.</Text>
          ) : (
            finalStops.map((stop) => (
              <View key={`selected-${stop.id}`} style={styles.selectedStopRow}>
                <Ionicons color={colors.green} name={stop.type === "fuel" ? "pricetag-outline" : "checkmark-circle-outline"} size={17} />
                <View style={styles.selectedStopCopy}>
                  <Text style={styles.selectedStopTitle}>{stop.name}</Text>
                  <Text style={styles.selectedStopMeta}>{stop.routeFitLabel || "Route fit"} | {stop.detourMinutes || 0} min detour</Text>
                </View>
              </View>
            ))
          )}
        </PremiumCard>

        <PremiumCard style={styles.summaryBar}>
          <StatItem label="Distance" value={`${plannedRoute.distanceMiles} mi`} />
          <View style={styles.divider} />
          <StatItem label="Est. Time" value={formatHours(plannedRoute.durationHours)} />
          <View style={styles.divider} />
          <StatItem label="Est. Fuel Cost" value={formatCurrency(insights.estimatedFuelCost)} />
        </PremiumCard>

        <PrimaryButton
          icon="navigate-outline"
          title={finalStops.length ? "Start Drive Preview" : "Preview Without Added Stops"}
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
          icon={existingPlan ? "checkmark-circle-outline" : "bookmark-outline"}
          title={existingPlan ? "Update Saved Plan" : "Save for Later"}
          variant="secondary"
          onPress={existingPlan ? handleUpdatePlan : handleSaveForLater}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function LoadingStep({ text, done }) {
  return (
    <View style={styles.loadingStep}>
      <Ionicons color={done ? colors.green : colors.blue} name={done ? "checkmark-circle" : "radio-button-off-outline"} size={17} />
      <Text style={styles.loadingStepText}>{text}</Text>
    </View>
  );
}

function RouteStripItem({ icon, label, value }) {
  return (
    <View style={styles.routeStripItem}>
      <Ionicons color={colors.blue} name={icon} size={17} />
      <Text style={styles.routeStripLabel}>{label}</Text>
      <Text style={styles.routeStripValue}>{value}</Text>
    </View>
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
  loadingWrap: {
    alignSelf: "center",
    flex: 1,
    justifyContent: "center",
    maxWidth: screen.maxWidth,
    padding: screen.padding,
    width: "100%"
  },
  loadingMap: {
    backgroundColor: colors.mapBlue,
    borderRadius: radii.xl,
    height: 260,
    overflow: "hidden"
  },
  loadingRouteLine: {
    backgroundColor: colors.blueDeep,
    borderRadius: radii.pill,
    height: 230,
    left: "52%",
    position: "absolute",
    top: 18,
    transform: [{ rotate: "24deg" }],
    width: 8
  },
  loadingPinStart: {
    backgroundColor: colors.green,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 4,
    height: 28,
    left: 72,
    position: "absolute",
    top: 80,
    width: 28
  },
  loadingPinEnd: {
    backgroundColor: colors.red,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 4,
    bottom: 64,
    height: 28,
    position: "absolute",
    right: 80,
    width: 28
  },
  loadingCard: {
    gap: spacing.md,
    marginTop: -36
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "600"
  },
  loadingCopy: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20
  },
  loadingSteps: {
    gap: spacing.sm
  },
  loadingStep: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  loadingStepText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500"
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
    fontWeight: "500"
  },
  errorCopy: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20
  },
  heroCard: {
    backgroundColor: colors.glass,
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
    fontWeight: "500",
    textTransform: "uppercase"
  },
  routeTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "500"
  },
  routeMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4
  },
  editingMeta: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 5
  },
  savingsBadge: {
    alignItems: "flex-end",
    backgroundColor: colors.paleGreen,
    borderRadius: radii.md,
    justifyContent: "center",
    minWidth: 116,
    padding: spacing.sm
  },
  routeStrip: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: -4
  },
  routeStripItem: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    padding: spacing.sm,
    ...shadows.soft
  },
  routeStripLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "500"
  },
  routeStripValue: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: "600"
  },
  savingsBadgeLabel: {
    color: "#0E7A4A",
    fontSize: 10,
    fontWeight: "500"
  },
  savingsBadgeValue: {
    color: "#0E7A4A",
    fontSize: 22,
    fontWeight: "500",
    marginTop: 2
  },
  proofCard: {
    gap: spacing.md
  },
  planTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500"
  },
  planSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
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
    fontWeight: "500"
  },
  proofValue: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "500",
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
  aiCoachCard: {
    gap: spacing.md
  },
  selectedStopsCard: {
    gap: spacing.md
  },
  selectedStopRow: {
    alignItems: "center",
    backgroundColor: colors.appBackground,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  selectedStopCopy: {
    flex: 1
  },
  selectedStopTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500"
  },
  selectedStopMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2
  },
  emptyStopsText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19
  },
  rankRow: {
    alignItems: "center",
    backgroundColor: colors.appBackground,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  rankScore: {
    alignItems: "center",
    backgroundColor: colors.navy,
    borderRadius: radii.pill,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  rankScoreText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "600"
  },
  rankCopy: {
    flex: 1
  },
  rankTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600"
  },
  rankMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2
  },
  stopsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  stopsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500"
  },
  stopsMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500"
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
    fontWeight: "500"
  },
  timelineMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  }
});
