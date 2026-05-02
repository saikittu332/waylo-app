import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, screen, shadows, spacing, typography } from "../constants/theme";

export default function StopDetailsScreen({ navigation, route }) {
  const stop = route.params?.stop || {
    name: "Shell Gas Station",
    address: "1200 W Tehachapi Blvd, Tehachapi, CA",
    rating: "4.3",
    fuelPrice: "3.49"
  };
  const decision = route.params?.decision;
  const isFuel = stop.type === "fuel";
  const sourceLabel = stop.placeSource || stop.source || "Waylo route logic";
  const fuelPriceLabel = stop.fuelPrice ? `$${stop.fuelPrice}/gal` : "TBD";
  const trustLine = stop.rating ? `${stop.rating} rating | ${sourceLabel}` : sourceLabel;
  const detourMinutes = stop.detourMinutes || (isFuel ? 4 : stop.type === "scenic" ? 12 : 7);
  const savingsImpact = stop.savingsImpact || (isFuel ? "$4-8" : "$0");
  const riskImpact = isFuel ? "Keeps reserve above 20%" : "Improves comfort without changing route";

  function chooseStop(status) {
    navigation.navigate({
      name: "TripResults",
      params: { stopDecision: { id: stop.id, status } },
      merge: true
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.canopy} />
          <View style={styles.stationBody} />
          <View style={styles.pump} />
          <View style={styles.pumpTwo} />
        </View>

        <PremiumCard style={styles.detailsCard}>
          <Text style={styles.heading}>{stop.name}</Text>
          <Text style={styles.address}>{stop.address || "1200 W Tehachapi Blvd, Tehachapi, CA"}</Text>
          <Text style={styles.rating}>{trustLine}</Text>

          <View style={styles.features}>
            <Feature icon={isFuel ? "pricetag-outline" : "navigate-outline"} label={isFuel ? "Fuel Price" : "Detour"} value={isFuel ? fuelPriceLabel : "Low"} />
            <Feature icon="map-outline" label="Route Mile" value={`${Math.round(stop.distanceFromStart || 0)} mi`} />
            <Feature icon="information-circle-outline" label="Type" value={String(stop.type || "stop")} />
            <Feature icon="business-outline" label="Source" value={stop.placeSource ? "Mapbox" : "Waylo"} />
          </View>

          <Text style={styles.sectionTitle}>Why we recommend this stop?</Text>
          <View style={styles.impactGrid}>
            <Impact icon="trending-down-outline" label="Impact" value={isFuel ? `Saves ${savingsImpact}` : `Adds ${detourMinutes} min`} />
            <Impact icon="time-outline" label="Detour" value={`${detourMinutes} min`} />
            <Impact icon="shield-checkmark-outline" label="Risk" value={riskImpact} />
          </View>
          <Checklist text={stop.recommendation || "Good fit for this route plan"} />
          <Checklist text={stop.type === "fuel" ? "Fuel timing protects your safe range" : "Low-friction stop near your route"} />
          <Checklist text="Useful amenities for a longer drive" />
          <Checklist text="Can be added or skipped before you save the route" />
        </PremiumCard>

        <PrimaryButton title={decision === "added" ? "Added to Route" : "Add to Route"} onPress={() => chooseStop("added")} />
        <PrimaryButton title={decision === "skipped" ? "Skipped" : "Skip Stop"} variant="secondary" onPress={() => chooseStop("skipped")} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ icon, label, value }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Ionicons color={colors.blue} name={icon} size={16} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureValue}>{value}</Text>
    </View>
  );
}

function Checklist({ text }) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkDot}>
        <Ionicons color={colors.surface} name="checkmark" size={12} />
      </View>
      <Text style={styles.checkLabel}>{text}</Text>
    </View>
  );
}

function Impact({ icon, label, value }) {
  return (
    <View style={styles.impactItem}>
      <Ionicons color={colors.blue} name={icon} size={17} />
      <Text style={styles.impactLabel}>{label}</Text>
      <Text style={styles.impactValue}>{value}</Text>
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
    paddingBottom: spacing.xl * 2,
    width: "100%"
  },
  hero: {
    backgroundColor: "#62A2E8",
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    height: 230,
    overflow: "hidden"
  },
  canopy: {
    backgroundColor: colors.orange,
    borderRadius: 5,
    height: 28,
    left: 70,
    position: "absolute",
    right: 28,
    top: 92
  },
  stationBody: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    bottom: 36,
    height: 88,
    left: 88,
    position: "absolute",
    right: 54,
    ...shadows.soft
  },
  pump: {
    backgroundColor: colors.navy,
    borderRadius: 4,
    bottom: 36,
    height: 60,
    left: 130,
    position: "absolute",
    width: 26
  },
  pumpTwo: {
    backgroundColor: colors.navy,
    borderRadius: 4,
    bottom: 36,
    height: 60,
    position: "absolute",
    right: 110,
    width: 26
  },
  detailsCard: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    gap: spacing.sm,
    marginTop: -28
  },
  heading: typography.heading,
  address: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  rating: {
    color: colors.orange,
    fontSize: 13,
    fontWeight: "700"
  },
  features: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    marginTop: spacing.md,
    paddingTop: spacing.md
  },
  feature: {
    alignItems: "center",
    flex: 1,
    gap: 4
  },
  featureIcon: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderRadius: radii.pill,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  featureLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center"
  },
  featureValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: spacing.md
  },
  impactGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.xs
  },
  impactItem: {
    backgroundColor: colors.appBackground,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: spacing.sm
  },
  impactLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700"
  },
  impactValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15
  },
  checkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  checkDot: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: radii.pill,
    height: 18,
    justifyContent: "center",
    width: 18
  },
  checkLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  }
});
