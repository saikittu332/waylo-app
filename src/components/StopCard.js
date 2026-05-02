import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, spacing } from "../constants/theme";

const typeLabels = {
  fuel: "Fuel",
  food: "Food",
  rest: "Rest",
  scenic: "Scenic"
};

const typeIcons = {
  fuel: "pricetag-outline",
  food: "restaurant-outline",
  rest: "bed-outline",
  scenic: "camera-outline"
};

export default function StopCard({ stop, onPress, decision, timeline = false }) {
  const isAdded = decision === "added";
  const isSkipped = decision === "skipped";
  const sourceLabel = stop.placeSource ? "Real place" : "Route logic";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, timeline && styles.timelineCard, isAdded && styles.addedCard, isSkipped && styles.skippedCard, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={[styles.badge, timeline && styles.timelineBadge]}>
          <Ionicons color={colors.blue} name={typeIcons[stop.type] || "location-outline"} size={19} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{stop.name}</Text>
          <Text style={styles.meta}>{stop.distanceFromStart} mi into route | {stop.recommendation || `${stop.distanceFromCurrent} mi away`}</Text>
        </View>
        {decision ? (
          <View style={[styles.decisionPill, isAdded ? styles.addedPill : styles.skippedPill]}>
            <Ionicons color={isAdded ? colors.green : colors.muted} name={isAdded ? "checkmark-circle" : "remove-circle-outline"} size={14} />
            <Text style={[styles.decisionText, isAdded ? styles.addedText : styles.skippedText]}>{isAdded ? "Added" : "Skipped"}</Text>
          </View>
        ) : (
          <Text style={styles.type}>{typeLabels[stop.type] || stop.type}</Text>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.rating}>{stop.rating ? `Rating ${stop.rating}` : sourceLabel}</Text>
        {stop.fuelPrice ? <Text style={styles.price}>${stop.fuelPrice}/gal</Text> : <Text style={styles.price}>Good fit</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.soft
  },
  timelineCard: {
    borderColor: colors.border,
    shadowOpacity: 0.02
  },
  addedCard: {
    borderColor: "rgba(18,184,134,0.28)",
    backgroundColor: "#FBFFFD"
  },
  skippedCard: {
    opacity: 0.74
  },
  pressed: {
    opacity: 0.8
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.paleOrange,
    borderRadius: radii.pill,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  titleBlock: {
    flex: 1
  },
  name: {
    color: colors.text,
    flex: 1,
    fontSize: 17,
    fontWeight: "700"
  },
  type: {
    backgroundColor: colors.paleOrange,
    borderRadius: radii.pill,
    color: colors.orange,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.sm
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md
  },
  rating: {
    color: colors.navy,
    fontWeight: "600"
  },
  timelineBadge: {
    backgroundColor: colors.paleBlue
  },
  price: {
    color: colors.green,
    fontWeight: "700"
  },
  decisionPill: {
    alignItems: "center",
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  addedPill: {
    backgroundColor: colors.paleGreen
  },
  skippedPill: {
    backgroundColor: colors.appBackground
  },
  decisionText: {
    fontSize: 12,
    fontWeight: "700"
  },
  addedText: {
    color: colors.green
  },
  skippedText: {
    color: colors.muted
  }
});
