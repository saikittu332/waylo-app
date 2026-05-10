import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";

export default function PremiumCard({ children, style, flat = false }) {
  return <View style={[styles.card, flat && styles.flat, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 18,
    ...shadows.card
  },
  flat: {
    shadowOpacity: 0,
    elevation: 0
  }
});
