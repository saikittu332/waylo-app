import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
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
          <Text style={styles.rating}>{stop.rating || "4.3"} rating (266 reviews)</Text>

          <View style={styles.features}>
            <Feature label="Fuel Price" value={`$${stop.fuelPrice || "3.49"}/gal`} />
            <Feature label="Restrooms" value="Clean" />
            <Feature label="Food" value="Yes" />
            <Feature label="Store" value="Yes" />
          </View>

          <Text style={styles.sectionTitle}>Why we recommend this stop?</Text>
          <Checklist text="Good fuel price" />
          <Checklist text="Clean restrooms" />
          <Checklist text="Highly rated by travelers" />
          <Checklist text="Convenient detour (2 min)" />
        </PremiumCard>

        <PrimaryButton title="Add to Route" onPress={() => navigation.goBack()} />
        <PrimaryButton title="Skip Stop" variant="secondary" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ label, value }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon} />
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureValue}>{value}</Text>
    </View>
  );
}

function Checklist({ text }) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkDot}>
        <Text style={styles.checkText}>v</Text>
      </View>
      <Text style={styles.checkLabel}>{text}</Text>
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
    paddingBottom: spacing.xl,
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
    fontWeight: "900"
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
    backgroundColor: colors.paleBlue,
    borderRadius: radii.pill,
    height: 24,
    width: 24
  },
  featureLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center"
  },
  featureValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: spacing.md
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
  checkText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "900"
  },
  checkLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  }
});
