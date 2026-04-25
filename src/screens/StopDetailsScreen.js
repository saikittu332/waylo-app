import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, shadows, spacing, typography } from "../constants/theme";

export default function StopDetailsScreen({ navigation, route }) {
  const stop = route.params?.stop;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.type}>{stop?.type || "fuel"}</Text>
          <Text style={styles.heading}>{stop?.name || "Smart Stop"}</Text>
          <Text style={styles.meta}>{stop?.distanceFromCurrent || 0} miles from current location</Text>
          <Text style={styles.row}>Rating: {stop?.rating || "4.3"}</Text>
          <Text style={styles.row}>Fuel price: {stop?.fuelPrice ? `$${stop.fuelPrice}/gal` : "Placeholder"}</Text>
        </View>
        <PrimaryButton title="Add to Route" onPress={() => navigation.goBack()} />
        <PrimaryButton title="Skip" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  container: {
    gap: spacing.md,
    padding: spacing.lg
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.card
  },
  type: {
    alignSelf: "flex-start",
    backgroundColor: colors.paleOrange,
    borderRadius: radii.pill,
    color: colors.orange,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textTransform: "capitalize"
  },
  heading: typography.heading,
  meta: {
    color: colors.muted,
    fontSize: 16
  },
  row: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  }
});
