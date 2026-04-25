import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import TripSummaryCard from "../components/TripSummaryCard";
import { colors, spacing } from "../constants/theme";
import { formatCurrency } from "../utils/tripCalculator";

export default function TripSummaryScreen({ navigation, route }) {
  const tripPlan = route.params?.tripPlan;
  const routeSummary = tripPlan?.route;
  const fuelCost = tripPlan?.insights?.estimatedFuelCost || 0;
  const savings = tripPlan?.insights?.estimatedSavings || 0;
  const fuelUsed = fuelCost / (routeSummary?.mockFuelPrice || 3.42);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.row}>
          <TripSummaryCard label="Distance" value={`${routeSummary?.distanceMiles || 642} mi`} />
          <TripSummaryCard label="Fuel used" value={`${fuelUsed.toFixed(1)} gal`} />
        </View>
        <View style={styles.row}>
          <TripSummaryCard label="Total cost" value={formatCurrency(fuelCost)} />
          <TripSummaryCard label="Savings" value={formatCurrency(savings)} sublabel="Estimated" />
        </View>
        <TripSummaryCard label="Stops made" value={`${tripPlan?.fullStops?.length || 5}`} sublabel="Fuel, food, rest, and scenic" />
        <PrimaryButton title="Save Trip" onPress={() => navigation.navigate("Home")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1
  },
  container: {
    gap: spacing.md,
    padding: spacing.lg
  },
  row: {
    flexDirection: "row",
    gap: spacing.md
  }
});
