import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import StatItem from "../components/StatItem";
import { colors, radii, screen, spacing, typography } from "../constants/theme";
import { defaultVehicle, vehicleSuggestions } from "../data/mockVehicleSpecs";
import { createVehicle, updateVehicle } from "../services/api";

const fuelTypes = ["gas", "diesel", "hybrid", "EV"];

export default function VehicleSetupScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const user = route.params?.user;
  const isNewVehicle = route.params?.mode === "new";
  const isEditingExisting = Boolean(route.params?.vehicle) && !isNewVehicle;
  const emptyVehicle = { vehicleName: "", fuelType: "gas", cityMpg: "", highwayMpg: "", tankCapacity: "" };
  const initialVehicle = isNewVehicle ? emptyVehicle : route.params?.vehicle || defaultVehicle;
  const existingVehicles = route.params?.vehicles || [route.params?.vehicle || defaultVehicle];
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [search, setSearch] = useState(initialVehicle.vehicleName || "");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const matchingVehicles = vehicleSuggestions
    .filter((item) => item.vehicleName.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, 4);

  function updateField(key, value) {
    setVehicle((current) => ({ ...current, [key]: value }));
  }

  function updateNumericField(key, value) {
    updateField(key, value.replace(/[^\d.]/g, ""));
  }

  function validateVehicle() {
    const nextErrors = {};
    if (vehicle.vehicleName.trim().length < 2) nextErrors.vehicleName = "Enter a vehicle name.";
    if (!Number(vehicle.cityMpg) && vehicle.fuelType !== "EV") nextErrors.cityMpg = "Enter a city MPG number.";
    if (!Number(vehicle.highwayMpg) && vehicle.fuelType !== "EV") nextErrors.highwayMpg = "Enter a highway MPG number.";
    if (!Number(vehicle.tankCapacity) && vehicle.fuelType !== "EV") nextErrors.tankCapacity = "Enter tank capacity.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveVehicle() {
    if (!validateVehicle()) return;
    setSaving(true);
    let savedVehicle = vehicle;
    if (user?.id) {
      try {
        savedVehicle = vehicle.id ? await updateVehicle(vehicle) : await createVehicle(vehicle, user.id);
      } catch (error) {
        console.warn("Waylo API vehicle persistence unavailable:", error.message);
      }
    }
    setSaving(false);
    const nextVehicles = existingVehicles.some((item) => item.id ? item.id === savedVehicle.id : item.vehicleName === savedVehicle.vehicleName)
      ? existingVehicles.map((item) => ((item.id && item.id === savedVehicle.id) || item.vehicleName === savedVehicle.vehicleName ? savedVehicle : item))
      : [...existingVehicles, savedVehicle];
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home", params: { assistantName, user, vehicle: savedVehicle, vehicles: nextVehicles } }]
      })
    );
  }

  function cancelEdit() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home", params: { assistantName, user, vehicle: initialVehicle.vehicleName ? initialVehicle : existingVehicles[0], vehicles: existingVehicles } }]
      })
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.heading}>{isEditingExisting ? "Edit vehicle" : "Add your vehicle"}</Text>
            <Text style={styles.subheading}>Waylo uses these specs to estimate range and cost.</Text>
          </View>
          <Pressable onPress={cancelEdit} hitSlop={8} style={styles.closeButton}>
            <Ionicons color={colors.navy} name="close" size={24} />
          </Pressable>
        </View>

        <View>
          <Text style={styles.label}>Search your vehicle</Text>
          <View style={styles.searchBox}>
            <Ionicons color={colors.muted} name="search" size={17} style={styles.searchIcon} />
            <TextInput value={search} onChangeText={setSearch} style={styles.searchInput} />
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons color={colors.mutedLight} name="close-circle-outline" size={18} />
            </Pressable>
          </View>
        </View>

        <PremiumCard style={styles.vehicleCard}>
          <View style={styles.carImage}>
            <View style={styles.carRoad} />
            <View style={styles.carGlow} />
            <Ionicons color={colors.blue} name="car-sport" size={76} />
          </View>
          <Text style={styles.vehicleName}>{vehicle.vehicleName || "Choose or add your vehicle"}</Text>
          <Text style={styles.verified}>Editable fuel economy specs</Text>
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
        <EditableField label="Vehicle Name" value={vehicle.vehicleName} error={errors.vehicleName} onChangeText={(v) => updateField("vehicleName", v)} />
        <EditableField label="City MPG" keyboardType="numeric" value={String(vehicle.cityMpg)} error={errors.cityMpg} onChangeText={(v) => updateNumericField("cityMpg", v)} />
        <EditableField label="Highway MPG" keyboardType="numeric" value={String(vehicle.highwayMpg)} error={errors.highwayMpg} onChangeText={(v) => updateNumericField("highwayMpg", v)} />
        <EditableField label="Tank Capacity (gal)" keyboardType="numeric" value={String(vehicle.tankCapacity)} error={errors.tankCapacity} onChangeText={(v) => updateNumericField("tankCapacity", v)} />

        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>{search.trim() ? "Matching vehicles" : "Popular vehicles"}</Text>
          {matchingVehicles.length > 0 ? (
            matchingVehicles.map((item) => (
              <Pressable key={item.vehicleName} onPress={() => { setVehicle(item); setSearch(item.vehicleName); setErrors({}); }} style={styles.suggestion}>
                <View style={styles.suggestionIcon}>
                  <Ionicons color={colors.blue} name={item.fuelType === "EV" ? "flash-outline" : "car-sport-outline"} size={18} />
                </View>
                <View style={styles.suggestionCopy}>
                  <Text style={styles.suggestionName}>{item.vehicleName}</Text>
                  <Text style={styles.suggestionMeta}>{item.fuelType.toUpperCase()} | {item.highwayMpg || "EV"} highway MPG | {item.tankCapacity || "N/A"} gal</Text>
                </View>
                <Ionicons color={colors.mutedLight} name="chevron-forward" size={17} />
              </Pressable>
            ))
          ) : (
            <View style={styles.emptySuggestion}>
              <Ionicons color={colors.muted} name="create-outline" size={18} />
              <Text style={styles.suggestionMeta}>No exact match yet. Continue with manual specs and save your custom vehicle.</Text>
            </View>
          )}
        </View>

        <PrimaryButton title="Save Vehicle" loading={saving} onPress={saveVehicle} />
        <PrimaryButton title="Cancel" variant="secondary" onPress={cancelEdit} />
      </ScrollView>
    </SafeAreaView>
  );
}

function EditableField({ label, value, onChangeText, error, keyboardType = "default" }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput keyboardType={keyboardType} onChangeText={onChangeText} style={[styles.fieldInput, !!error && styles.invalidInput]} value={value} />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
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
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  heading: typography.heading,
  subheading: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: spacing.xs
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    outlineStyle: "none",
    width: 42
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
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
    marginRight: spacing.sm
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontWeight: "700"
  },
  vehicleCard: {
    gap: spacing.sm
  },
  carImage: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderRadius: radii.md,
    height: 150,
    justifyContent: "center",
    overflow: "hidden"
  },
  carRoad: {
    backgroundColor: "rgba(23,74,124,0.08)",
    borderRadius: 120,
    bottom: -60,
    height: 110,
    position: "absolute",
    width: 340
  },
  carGlow: {
    backgroundColor: "rgba(35,132,244,0.12)",
    borderRadius: 999,
    height: 118,
    position: "absolute",
    width: 118
  },
  vehicleName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  },
  verified: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "700"
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
    fontWeight: "700"
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
    fontWeight: "700"
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
  invalidInput: {
    borderColor: colors.red
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: "700"
  },
  suggestions: {
    gap: spacing.sm
  },
  suggestionsTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  suggestion: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    outlineStyle: "none",
    padding: spacing.md
  },
  suggestionIcon: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderRadius: radii.pill,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  suggestionCopy: {
    flex: 1
  },
  suggestionName: {
    color: colors.text,
    fontWeight: "700"
  },
  suggestionMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  emptySuggestion: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  }
});
