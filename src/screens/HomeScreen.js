import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, shadows, spacing, typography } from "../constants/theme";
import { mockTripRequest } from "../data/mockTrip";

const modes = ["Fastest", "Cheapest", "Scenic", "Comfort"];

export default function HomeScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const vehicle = route.params?.vehicle;
  const [from, setFrom] = useState(mockTripRequest.from);
  const [to, setTo] = useState(mockTripRequest.to);
  const [mode, setMode] = useState(mockTripRequest.mode);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.heading}>Where should {assistantName} plan next?</Text>
        <View style={styles.card}>
          <Text style={styles.label}>From</Text>
          <TextInput value={from} onChangeText={setFrom} style={styles.input} />
          <Text style={styles.label}>To</Text>
          <TextInput value={to} onChangeText={setTo} style={styles.input} />
          <Text style={styles.label}>Trip mode</Text>
          <View style={styles.chips}>
            {modes.map((item) => (
              <Pressable key={item} onPress={() => setMode(item)} style={[styles.chip, mode === item && styles.activeChip]}>
                <Text style={[styles.chipText, mode === item && styles.activeChipText]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <PrimaryButton
          title="Plan Trip"
          onPress={() => navigation.navigate("TripResults", { assistantName, vehicle, tripRequest: { from, to, mode } })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  container: {
    gap: spacing.lg,
    padding: spacing.lg
  },
  heading: typography.heading,
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.card
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    marginTop: spacing.sm
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.md
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    backgroundColor: colors.paleBlue,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  activeChip: {
    backgroundColor: colors.navy
  },
  chipText: {
    color: colors.navy,
    fontWeight: "800"
  },
  activeChipText: {
    color: colors.surface
  }
});
