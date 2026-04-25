import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";

export default function TripSummaryCard({ label, value, sublabel }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {!!sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flex: 1,
    minHeight: 112,
    padding: spacing.md,
    ...shadows.card
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  value: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: "800",
    marginTop: spacing.sm
  },
  sublabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4
  }
});
