import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../constants/theme";

export default function InsightCard({ title, value, detail, accent = "blue" }) {
  const accentStyle = accent === "green" ? styles.green : accent === "orange" ? styles.orange : styles.blue;

  return (
    <View style={styles.card}>
      <View style={[styles.icon, accentStyle]}>
        <Text style={styles.iconText}>{title.slice(0, 1)}</Text>
      </View>
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
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  icon: {
    alignItems: "center",
    borderRadius: radii.sm,
    height: 28,
    justifyContent: "center",
    width: 28
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
  iconText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900"
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2
  },
  value: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  detail: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6
  }
});
