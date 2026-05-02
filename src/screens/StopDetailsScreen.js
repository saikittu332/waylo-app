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
  const parsedSavingsImpact = Number(stop.savingsImpact);
  const savingsImpact = Number.isFinite(parsedSavingsImpact) ? parsedSavingsImpact : isFuel ? 4 : 0;
  const score = stop.intelligenceScore || 72;
  const riskImpact = isFuel ? `Reserve ${Math.max(20, 100 - Number(stop.lowFuelRisk || 68))}%+` : "Low route friction";
  const hero = getStopHero(stop.type);

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
        <View style={[styles.hero, { backgroundColor: hero.background }]}>
          <View style={styles.heroMapLand} />
          <View style={styles.heroRoad} />
          <View style={[styles.heroStopMarker, { backgroundColor: hero.accent }]}>
            <Ionicons color={colors.surface} name={hero.icon} size={24} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>{hero.kicker}</Text>
            <Text style={styles.heroTitle}>{hero.title}</Text>
          </View>
        </View>

        <PremiumCard style={styles.detailsCard}>
          <Text style={styles.heading}>{stop.name}</Text>
          <Text style={styles.address}>{stop.address || "1200 W Tehachapi Blvd, Tehachapi, CA"}</Text>
          <Text style={styles.rating}>{trustLine}</Text>
          <View style={styles.scoreBand}>
            <Text style={styles.scoreValue}>{score}</Text>
            <View style={styles.scoreCopy}>
              <Text style={styles.scoreLabel}>Waylo recommendation score</Text>
              <Text style={styles.scoreText}>{stop.impactSummary || "Scored by timing, detour, route fit, and trip mode."}</Text>
            </View>
          </View>

          <View style={styles.features}>
            <Feature icon={isFuel ? "pricetag-outline" : "navigate-outline"} label={isFuel ? "Fuel Price" : "Detour"} value={isFuel ? fuelPriceLabel : "Low"} />
            <Feature icon="map-outline" label="Route Mile" value={`${Math.round(stop.distanceFromStart || 0)} mi`} />
            <Feature icon="information-circle-outline" label="Type" value={String(stop.type || "stop")} />
            <Feature icon="business-outline" label="Source" value={stop.placeSource ? "Mapbox" : "Waylo"} />
          </View>

          <Text style={styles.sectionTitle}>Why Waylo recommends this stop</Text>
          <View style={styles.impactGrid}>
            <Impact icon="trending-down-outline" label="Impact" value={isFuel ? `Saves $${savingsImpact.toFixed(2)}` : `Adds ${detourMinutes} min`} />
            <Impact icon="time-outline" label="Detour" value={`${detourMinutes} min`} />
            <Impact icon="shield-checkmark-outline" label="Risk" value={riskImpact} />
          </View>
          <Checklist text={stop.recommendation || "Good fit for this route plan"} />
          <Checklist text={stop.type === "fuel" ? "Fuel timing protects your safe range" : "Low-friction stop near your route"} />
          <Checklist text="Useful amenities for a longer drive" />
          <Checklist text="Can be added or skipped before you save the route" />
        </PremiumCard>

        <PrimaryButton icon={decision === "added" ? "checkmark-circle-outline" : "add-circle-outline"} title={decision === "added" ? "Added to Route" : "Add to Route"} onPress={() => chooseStop("added")} />
        <PrimaryButton icon={decision === "skipped" ? "remove-circle-outline" : "close-circle-outline"} title={decision === "skipped" ? "Skipped" : "Skip Stop"} variant="secondary" onPress={() => chooseStop("skipped")} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getStopHero(type) {
  const options = {
    fuel: { icon: "pricetag-outline", kicker: "Fuel strategy", title: "Lower-cost stop near your route", background: "#D8ECFF", accent: colors.orange },
    food: { icon: "restaurant-outline", kicker: "Meal break", title: "A useful pause near midpoint", background: "#FFF4E8", accent: colors.orange },
    rest: { icon: "bed-outline", kicker: "Comfort timing", title: "Rest break before fatigue builds", background: "#E8F8F1", accent: colors.green },
    scenic: { icon: "camera-outline", kicker: "Scenic option", title: "A better stop without a big detour", background: "#EDF6FF", accent: colors.blue }
  };
  return options[type] || { icon: "location-outline", kicker: "Route stop", title: "Recommended stop for this drive", background: colors.mapBlue, accent: colors.blue };
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
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    height: 230,
    overflow: "hidden",
    position: "relative"
  },
  heroMapLand: {
    backgroundColor: "rgba(255,255,255,0.54)",
    borderRadius: 220,
    height: 260,
    left: -72,
    position: "absolute",
    top: 52,
    transform: [{ rotate: "-18deg" }],
    width: 300
  },
  heroRoad: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: radii.pill,
    height: 270,
    position: "absolute",
    right: 72,
    top: -12,
    transform: [{ rotate: "26deg" }],
    width: 32
  },
  heroStopMarker: {
    alignItems: "center",
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 4,
    height: 58,
    justifyContent: "center",
    position: "absolute",
    right: 82,
    top: 86,
    width: 58,
    ...shadows.card
  },
  heroCopy: {
    backgroundColor: colors.glass,
    borderColor: "rgba(35,71,101,0.08)",
    borderRadius: radii.lg,
    borderWidth: 1,
    bottom: spacing.md,
    left: spacing.md,
    padding: spacing.md,
    position: "absolute",
    right: spacing.md
  },
  heroKicker: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 3
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
    fontWeight: "500"
  },
  rating: {
    color: colors.orange,
    fontSize: 13,
    fontWeight: "500"
  },
  scoreBand: {
    alignItems: "center",
    backgroundColor: colors.paleGreen,
    borderColor: "rgba(18,184,134,0.18)",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md
  },
  scoreValue: {
    color: colors.green,
    fontSize: 28,
    fontWeight: "600"
  },
  scoreCopy: {
    flex: 1
  },
  scoreLabel: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: "600"
  },
  scoreText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
    marginTop: 2
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
    fontWeight: "500",
    textAlign: "center"
  },
  featureValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
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
    fontWeight: "500"
  },
  impactValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "500",
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
    fontWeight: "500"
  }
});
