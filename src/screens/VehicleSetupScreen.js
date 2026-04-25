import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import StatItem from "../components/StatItem";
import { colors, radii, screen, shadows, spacing, typography } from "../constants/theme";
import { defaultVehicle, vehicleSuggestions } from "../data/mockVehicleSpecs";

const fuelTypes = ["gas", "diesel", "hybrid", "EV"];

export default function VehicleSetupScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const initialVehicle = route.params?.vehicle || defaultVehicle;
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [search, setSearch] = useState(initialVehicle.vehicleName || "Toyota Camry 2021");

  function updateField(key, value) {
    setVehicle((current) => ({ ...current, [key]: value }));
  }

  function saveVehicle() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home", params: { assistantName, vehicle } }]
      })
    );
  }

  function cancelEdit() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home", params: { assistantName, vehicle: initialVehicle } }]
      })
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Let's add your vehicle</Text>

        <View>
          <Text style={styles.label}>Search your vehicle</Text>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>Q</Text>
            <TextInput value={search} onChangeText={setSearch} style={styles.searchInput} />
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Text style={styles.clear}>x</Text>
            </Pressable>
          </View>
        </View>

        <PremiumCard style={styles.vehicleCard}>
          <View style={styles.carImage}>
            <View style={styles.carRoad} />
            <View style={styles.carShadow} />
            <View style={styles.carBody} />
            <View style={styles.carCabin} />
            <View style={styles.carWindowLeft} />
            <View style={styles.carWindowRight} />
            <View style={styles.headLight} />
            <View style={[styles.wheel, styles.wheelLeft]} />
            <View style={[styles.wheel, styles.wheelRight]} />
          </View>
          <Text style={styles.vehicleName}>{vehicle.vehicleName}</Text>
          <Text style={styles.verified}>Verified mock specs</Text>
          <View style={styles.statsRow}>
            <StatItem label="City MPG" value={String(vehicle.cityMpg)} />
            <View style={styles.divider} />
            <StatItem label="Highway MPG" value={String(vehicle.highwayMpg)} />
            <View style={styles.divider} />
            <StatItem label="Tank (gal)" value={String(vehicle.tankCapacity)} />
          </View>
        </PremiumCard>

        <Text style={styles.label}>Fuel Type</Text>
        <View style={styles.fuelRow}>
          {fuelTypes.map((type) => (
            <Pressable key={type} onPress={() => updateField("fuelType", type)} style={[styles.fuelChip, vehicle.fuelType === type && styles.activeFuel]}>
              <Text style={[styles.fuelText, vehicle.fuelType === type && styles.activeFuelText]}>{type}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.helper}>You can edit values if needed</Text>
        <EditableField label="Vehicle Name" value={vehicle.vehicleName} onChangeText={(v) => updateField("vehicleName", v)} />
        <EditableField label="City MPG" keyboardType="numeric" value={String(vehicle.cityMpg)} onChangeText={(v) => updateField("cityMpg", v)} />
        <EditableField label="Highway MPG" keyboardType="numeric" value={String(vehicle.highwayMpg)} onChangeText={(v) => updateField("highwayMpg", v)} />
        <EditableField label="Tank Capacity (gal)" keyboardType="numeric" value={String(vehicle.tankCapacity)} onChangeText={(v) => updateField("tankCapacity", v)} />

        <View style={styles.suggestions}>
          {vehicleSuggestions.slice(0, 2).map((item) => (
            <Pressable key={item.vehicleName} onPress={() => setVehicle(item)} style={styles.suggestion}>
              <Text style={styles.suggestionName}>{item.vehicleName}</Text>
              <Text style={styles.suggestionMeta}>{item.highwayMpg || "EV"} highway MPG</Text>
            </Pressable>
          ))}
        </View>

        <PrimaryButton title="Save Vehicle" onPress={saveVehicle} />
        <PrimaryButton title="Cancel" variant="secondary" onPress={cancelEdit} />
      </ScrollView>
    </SafeAreaView>
  );
}

function EditableField({ label, value, onChangeText, keyboardType = "default" }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput keyboardType={keyboardType} onChangeText={onChangeText} style={styles.fieldInput} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.appBackground,
    flex: 1
  },
  container: {
    alignSelf: "center",
    gap: spacing.md,
    maxWidth: screen.maxWidth,
    padding: screen.padding,
    paddingBottom: spacing.xl * 2,
    width: "100%"
  },
  heading: typography.heading,
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 50,
    paddingHorizontal: spacing.md
  },
  searchIcon: {
    color: colors.muted,
    fontWeight: "900",
    marginRight: spacing.sm
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontWeight: "800"
  },
  clear: {
    color: colors.mutedLight,
    fontWeight: "900"
  },
  vehicleCard: {
    gap: spacing.sm
  },
  carImage: {
    alignItems: "center",
    backgroundColor: "#DCEEFF",
    borderRadius: radii.md,
    height: 150,
    justifyContent: "center",
    overflow: "hidden"
  },
  carRoad: {
    backgroundColor: "#C6D4E3",
    borderRadius: 120,
    bottom: -60,
    height: 110,
    position: "absolute",
    width: 340
  },
  carShadow: {
    backgroundColor: "rgba(7,30,61,0.18)",
    borderRadius: 999,
    bottom: 38,
    height: 18,
    position: "absolute",
    width: 210
  },
  carBody: {
    backgroundColor: "#EEF3F8",
    borderColor: "#B8C7D7",
    borderRadius: 22,
    borderWidth: 1,
    height: 42,
    width: 226,
    ...shadows.soft
  },
  carCabin: {
    backgroundColor: "#F7FBFF",
    borderColor: "#B8C0CC",
    borderRadius: 18,
    borderWidth: 1,
    height: 48,
    position: "absolute",
    top: 44,
    width: 112
  },
  carWindowLeft: {
    backgroundColor: "#BFDDF7",
    borderRadius: 8,
    height: 22,
    left: "40%",
    position: "absolute",
    top: 57,
    transform: [{ skewX: "-14deg" }],
    width: 38
  },
  carWindowRight: {
    backgroundColor: "#BFDDF7",
    borderRadius: 8,
    height: 22,
    position: "absolute",
    right: "40%",
    top: 57,
    transform: [{ skewX: "14deg" }],
    width: 38
  },
  headLight: {
    backgroundColor: colors.orange,
    borderRadius: 5,
    height: 10,
    position: "absolute",
    right: 93,
    top: 89,
    width: 16
  },
  wheel: {
    backgroundColor: colors.navy,
    borderRadius: 14,
    bottom: 37,
    height: 28,
    position: "absolute",
    width: 28
  },
  wheelLeft: {
    left: 94
  },
  wheelRight: {
    right: 94
  },
  vehicleName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  verified: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "900"
  },
  statsRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: spacing.sm
  },
  divider: {
    backgroundColor: colors.border,
    height: 36,
    width: 1
  },
  fuelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  fuelChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  activeFuel: {
    backgroundColor: colors.navy,
    borderColor: colors.navy
  },
  fuelText: {
    color: colors.text,
    fontWeight: "800"
  },
  activeFuelText: {
    color: colors.surface
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  fieldRow: {
    gap: spacing.xs
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  fieldInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.text,
    minHeight: 42,
    paddingHorizontal: spacing.md
  },
  suggestions: {
    gap: spacing.sm
  },
  suggestion: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md
  },
  suggestionName: {
    color: colors.text,
    fontWeight: "900"
  },
  suggestionMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  }
});
