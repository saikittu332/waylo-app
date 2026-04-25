import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, shadows, spacing } from "../constants/theme";

export default function NavigationScreen({ navigation, route }) {
  const tripPlan = route.params?.tripPlan;
  const firstFuelStop = tripPlan?.fullStops?.find((stop) => stop.type === "fuel");

  return (
    <View style={styles.screen}>
      <View style={styles.map}>
        <Text style={styles.mapText}>Full-screen Mapbox navigation placeholder</Text>
        <View style={styles.routeLine} />
      </View>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.voiceButton}>
          <Text style={styles.voiceText}>Voice</Text>
        </View>
        <View style={styles.bottomCard}>
          <Text style={styles.cardTitle}>Smart drive card</Text>
          <Text style={styles.item}>Next fuel stop: {firstFuelStop?.name || "Prairie Star Fuel"}</Text>
          <Text style={styles.item}>Rest reminder: in 42 minutes</Text>
          <Text style={styles.alert}>Cheaper fuel alert: save $0.23/gal ahead</Text>
          <PrimaryButton title="End Trip" onPress={() => navigation.navigate("TripSummary", { tripPlan })} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  map: {
    backgroundColor: colors.paleBlue,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  mapText: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900",
    position: "absolute",
    top: 72,
    left: spacing.lg
  },
  routeLine: {
    alignSelf: "center",
    borderColor: colors.navy,
    borderRadius: 140,
    borderWidth: 8,
    height: 360,
    transform: [{ rotate: "-12deg" }],
    width: 180
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0
  },
  voiceButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: colors.orange,
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    marginRight: spacing.lg,
    width: 64,
    ...shadows.card
  },
  voiceText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900"
  },
  bottomCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.lg
  },
  cardTitle: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: "900"
  },
  item: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  alert: {
    color: colors.green,
    fontSize: 15,
    fontWeight: "900"
  }
});
