import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing } from "../constants/theme";

export default function TripModeChip({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 78,
    outlineStyle: "none",
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  selected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy
  },
  text: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800"
  },
  selectedText: {
    color: colors.surface
  }
});
