import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing } from "../constants/theme";

export default function PrimaryButton({ title, onPress, variant = "primary", disabled, loading }) {
  const isSecondary = variant === "secondary";
  const isDanger = variant === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondary,
        isDanger && styles.danger,
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
    backgroundColor: colors.blue,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.blue,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    outlineStyle: "none"
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0
  },
  danger: {
    backgroundColor: colors.red,
    shadowColor: colors.red
  },
  dimmed: {
    opacity: 0.72
  },
  text: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "600"
  },
  secondaryText: {
    color: colors.navy
  }
});
