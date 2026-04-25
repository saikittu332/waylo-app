import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing } from "../constants/theme";

export default function PrimaryButton({ title, onPress, variant = "primary", disabled, loading }) {
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondary,
        (pressed || disabled) && styles.dimmed
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.navy : colors.surface} />
      ) : (
        <Text style={[styles.text, isSecondary && styles.secondaryText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.orange,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: spacing.lg
  },
  secondary: {
    backgroundColor: colors.paleBlue,
    borderColor: colors.border,
    borderWidth: 1
  },
  dimmed: {
    opacity: 0.72
  },
  text: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800"
  },
  secondaryText: {
    color: colors.navy
  }
});
