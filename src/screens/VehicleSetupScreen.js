import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, spacing, typography } from "../constants/theme";
import { defaultVehicle, vehicleSuggestions } from "../data/mockVehicleSpecs";

const fuelTypes = ["gas", "diesel", "hybrid", "EV"];

export default function VehicleSetupScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const [vehicle, setVehicle] = useState(defaultVehicle);
  const [search, setSearch] = useState("");

  function updateField(key, value) {
    setVehicle((current) => ({ ...current, [key]: value }));
  }

  function selectSuggestion(suggestion) {
    setVehicle(suggestion);
    setSearch(suggestion.vehicleName);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Tell {assistantName} what you drive</Text>
        <Text style={styles.copy}>Search is mocked now. Every spec can be overridden manually.</Text>
        <TextInput
          onChangeText={setSearch}
          placeholder="Search vehicle"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={search}
        />
        <View style={styles.suggestionList}>
          {vehicleSuggestions.map((item) => (
            <Pressable key={item.vehicleName} onPress={() => selectSuggestion(item)} style={styles.suggestion}>
              <Text style={styles.suggestionTitle}>{item.vehicleName}</Text>
              <Text style={styles.suggestionMeta}>{item.fuelType} | {item.highwayMpg || "EV"} highway MPG</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.manualCard}>
          <Text style={styles.sectionTitle}>Manual entry</Text>
          <EditableField label="Vehicle name" value={vehicle.vehicleName} onChangeText={(v) => updateField("vehicleName", v)} />
          <Text style={styles.label}>Fuel type</Text>
          <View style={styles.chips}>
            {fuelTypes.map((type) => (
              <Pressable key={type} onPress={() => updateField("fuelType", type)} style={[styles.chip, vehicle.fuelType === type && styles.activeChip]}>
                <Text style={[styles.chipText, vehicle.fuelType === type && styles.activeChipText]}>{type}</Text>
              </Pressable>
            ))}
          </View>
          <EditableField label="City MPG" keyboardType="numeric" value={String(vehicle.cityMpg)} onChangeText={(v) => updateField("cityMpg", v)} />
          <EditableField label="Highway MPG" keyboardType="numeric" value={String(vehicle.highwayMpg)} onChangeText={(v) => updateField("highwayMpg", v)} />
          <EditableField label="Tank capacity in gallons" keyboardType="numeric" value={String(vehicle.tankCapacity)} onChangeText={(v) => updateField("tankCapacity", v)} />
        </View>
        <PrimaryButton
          title="Save Vehicle"
          onPress={() => navigation.navigate("Home", { assistantName, vehicle })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function EditableField({ label, value, onChangeText, keyboardType = "default" }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  container: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl
  },
  heading: typography.heading,
  copy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.md
  },
  suggestionList: {
    gap: spacing.sm
  },
  suggestion: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md
  },
  suggestionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  suggestionMeta: {
    color: colors.muted,
    marginTop: 4
  },
  manualCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.sm,
    padding: spacing.md
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900"
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: spacing.sm
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
