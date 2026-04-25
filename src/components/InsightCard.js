import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing } from "../constants/theme";

export default function InsightCard({ title, value, detail, accent = "blue" }) {
  const accentStyle = accent === "green" ? styles.green : accent === "orange" ? styles.orange : styles.blue;
  const iconName = title.includes("Fuel")
    ? "pricetag-outline"
    : title.includes("Rest")
      ? "bed-outline"
      : title.includes("Food")
        ? "restaurant-outline"
        : title.includes("Scenic")
          ? "camera-outline"
          : "sparkles-outline";

  return (
    <View style={styles.card}>
      <View style={[styles.icon, accentStyle]}>
        <Ionicons color={colors.surface} name={iconName} size={16} />
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
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2
  },
  value: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600"
  },
  detail: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6
  }
});
