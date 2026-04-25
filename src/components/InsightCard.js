import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";

export default function InsightCard({ title, value, detail, accent = "blue" }) {
  const accentStyle = accent === "green" ? styles.green : accent === "orange" ? styles.orange : styles.blue;

  return (
    <View style={styles.card}>
      <View style={[styles.marker, accentStyle]} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        {!!detail && <Text style={styles.detail}>{detail}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.card
  },
  marker: {
    borderRadius: radii.pill,
    height: 42,
    width: 6
  },
  blue: {
    backgroundColor: colors.navy
  },
  green: {
    backgroundColor: colors.green
  },
  orange: {
    backgroundColor: colors.orange
  },
  content: {
    flex: 1
  },
  title: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  detail: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6
  }
});
