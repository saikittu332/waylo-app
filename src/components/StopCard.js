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

export default function StopCard({ stop, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons color={colors.blue} name={typeIcons[stop.type] || "location-outline"} size={19} />
        </View>
        <View style={styles.titleBlock}>
        <Text style={styles.name}>{stop.name}</Text>
          <Text style={styles.meta}>{stop.distanceFromStart} mi into route | {stop.distanceFromCurrent} mi away</Text>
        </View>
        <Text style={styles.type}>{typeLabels[stop.type] || stop.type}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.rating}>Rating {stop.rating}</Text>
        {stop.fuelPrice ? <Text style={styles.price}>${stop.fuelPrice}/gal</Text> : <Text style={styles.price}>Good stop</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.soft
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
    fontWeight: "800"
  },
  type: {
    backgroundColor: colors.paleOrange,
    borderRadius: radii.pill,
    color: colors.orange,
    fontSize: 12,
    fontWeight: "800",
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
    fontWeight: "700"
  },
  price: {
    color: colors.green,
    fontWeight: "800"
  }
});
