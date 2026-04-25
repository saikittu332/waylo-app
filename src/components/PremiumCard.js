import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";

export default function PremiumCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: "rgba(7, 30, 61, 0.06)",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.card
  }
});
