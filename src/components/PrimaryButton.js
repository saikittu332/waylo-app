import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing } from "../constants/theme";

export default function PrimaryButton({ title, onPress, variant = "primary", disabled, loading, icon, accessibilityLabel }) {
  const isSecondary = variant === "secondary";
  const isDanger = variant === "danger";
  const iconColor = isSecondary ? colors.navy : colors.surface;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel || title}
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
        <View style={styles.content}>
          {!!icon && <Ionicons color={iconColor} name={icon} size={18} />}
          <Text style={[styles.text, isSecondary && styles.secondaryText]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.blueDeep,
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.blue,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
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
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center"
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
