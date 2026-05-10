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

export default function StopCard({ stop, onPress, onAdd, onSkip, decision, timeline = false }) {
  const isAdded = decision === "added";
  const isSkipped = decision === "skipped";
  const hasDecision = isAdded || isSkipped;
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
        {hasDecision ? (
          <View style={[styles.decisionPill, isAdded ? styles.addedPill : styles.skippedPill]}>
            <Ionicons color={isAdded ? colors.green : colors.muted} name={isAdded ? "checkmark-circle" : "remove-circle-outline"} size={14} />
            <Text style={[styles.decisionText, isAdded ? styles.addedText : styles.skippedText]}>{isAdded ? "Added" : "Skipped"}</Text>
          </View>
        ) : (
          <Text style={styles.type}>{typeLabels[stop.type] || stop.type}</Text>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.rating}>
          {stop.recommendation ? `Recommended because ${lowercaseFirst(stop.recommendation)}` : stop.rating ? `Rating ${stop.rating}` : sourceLabel}
        </Text>
        {stop.fuelPrice ? <Text style={styles.price}>${stop.fuelPrice}/gal</Text> : <Text style={styles.price}>Good fit</Text>}
      </View>
      {!!stop.impactSummary && (
        <View style={styles.impactRow}>
          <Ionicons color={colors.green} name="sparkles-outline" size={14} />
          <Text style={styles.impactText}>{stop.impactSummary}</Text>
        </View>
      )}
      {(onAdd || onSkip) && (
        <View style={styles.actionRow}>
          {!!onAdd && (
            <Pressable
              onPress={(event) => {
                event?.stopPropagation?.();
                onAdd();
              }}
              style={[styles.stopAction, isAdded && styles.stopActionSelected]}
            >
              <Ionicons color={isAdded ? colors.surface : colors.green} name={isAdded ? "checkmark-circle" : "add-circle-outline"} size={15} />
              <Text style={[styles.stopActionText, isAdded && styles.stopActionTextSelected]}>{isAdded ? "Added" : "Add"}</Text>
            </Pressable>
          )}
          {!!onSkip && (
            <Pressable
              onPress={(event) => {
                event?.stopPropagation?.();
                onSkip();
              }}
              style={[styles.stopAction, isSkipped && styles.stopActionSkipped]}
            >
              <Ionicons color={isSkipped ? colors.surface : colors.muted} name={isSkipped ? "remove-circle" : "close-circle-outline"} size={15} />
              <Text style={[styles.stopActionText, isSkipped && styles.stopActionTextSelected]}>{isSkipped ? "Skipped" : "Skip"}</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

function lowercaseFirst(text) {
  if (!text) return "";
  return `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 18,
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
    backgroundColor: colors.paleBlue,
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
    fontSize: 16,
    fontWeight: "700"
  },
  type: {
    backgroundColor: colors.paleBlue,
    borderRadius: radii.pill,
    color: colors.blue,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.sm
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md
  },
  rating: {
    color: colors.navy,
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16
  },
  timelineBadge: {
    backgroundColor: colors.paleBlue
  },
  price: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "700"
  },
  impactRow: {
    alignItems: "flex-start",
    backgroundColor: colors.paleGreen,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm
  },
  impactText: {
    color: colors.navy,
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  stopAction: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.md
  },
  stopActionSelected: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },
  stopActionSkipped: {
    backgroundColor: colors.navySoft,
    borderColor: colors.navySoft
  },
  stopActionText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "700"
  },
  stopActionTextSelected: {
    color: colors.surface
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
    fontWeight: "500"
  },
  addedText: {
    color: colors.green
  },
  skippedText: {
    color: colors.muted
  }
});
