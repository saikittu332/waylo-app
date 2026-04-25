import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../constants/theme";

export default function StatItem({ label, value, compact = false }) {
  return (
    <View style={[styles.item, compact && styles.compact]}>
      <Text style={[styles.value, compact && styles.compactValue]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    flex: 1,
    gap: 4,
    paddingHorizontal: spacing.sm
  },
  compact: {
    alignItems: "flex-start"
  },
  value: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900"
  },
  compactValue: {
    fontSize: 16
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  }
});
