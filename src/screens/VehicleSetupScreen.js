import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import StatItem from "../components/StatItem";
import { colors, radii, screen, spacing, typography } from "../constants/theme";
import { defaultVehicle, vehicleSuggestions } from "../data/mockVehicleSpecs";
import { createVehicle, updateVehicle } from "../services/api";
import { getVehicleMakes, getVehicleModels, getVehicleOptions, getVehicleYears, lookupVehicleSpecs, parseVehicleQuery } from "../services/vehicleLookupService";
import { calculateRange, calculateSafeRange } from "../utils/tripCalculator";

const fuelTypes = ["gas", "diesel", "hybrid", "EV"];

export default function VehicleSetupScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const user = route.params?.user;
  const isNewVehicle = route.params?.mode === "new";
  const isEditingExisting = Boolean(route.params?.vehicle) && !isNewVehicle;
  const emptyVehicle = { vehicleName: "", fuelType: "gas", cityMpg: "", highwayMpg: "", tankCapacity: "" };
  const initialVehicle = isNewVehicle ? emptyVehicle : route.params?.vehicle || defaultVehicle;
  const existingVehicles = route.params?.vehicles || (route.params?.vehicle ? [route.params.vehicle] : []);
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [search, setSearch] = useState(initialVehicle.vehicleName || "");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [remoteVehicles, setRemoteVehicles] = useState([]);
  const [years, setYears] = useState(["2024", "2023", "2022", "2021", "2020", "2019"]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [guidedOptions, setGuidedOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [guidedLoading, setGuidedLoading] = useState(false);
  const [guidedError, setGuidedError] = useState("");
  const localMatches = vehicleSuggestions
    .filter((item) => item.vehicleName.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, 4);
  const matchingVehicles = remoteVehicles.length > 0 ? remoteVehicles : localMatches;
  const fullRange = calculateRange(vehicle.highwayMpg, vehicle.tankCapacity);
  const safeRange = calculateSafeRange(fullRange);

  useEffect(() => {
    const query = search.trim();
    const parsed = parseVehicleQuery(query);
    if (!parsed.year || !parsed.make || parsed.model.length < 2) {
      setRemoteVehicles([]);
      setLookupError("");
      setLookupLoading(false);
      return undefined;
    }

    let active = true;
    setLookupLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await lookupVehicleSpecs(query);
        if (!active) return;
        setRemoteVehicles(results);
        setLookupError(results.length ? "" : "No EPA match found. You can still enter the specs manually.");
      } catch (error) {
        if (!active) return;
        setRemoteVehicles([]);
        setLookupError("Live vehicle lookup is unavailable. Manual entry still works.");
      } finally {
        if (active) setLookupLoading(false);
      }
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    let active = true;
    getVehicleYears()
      .then((items) => {
        if (active && items.length) setYears(items);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedYear) return undefined;
    let active = true;
    setGuidedLoading(true);
    setSelectedMake("");
    setSelectedModel("");
    setModels([]);
    setGuidedOptions([]);
    getVehicleMakes(selectedYear)
      .then((items) => {
        if (active) setMakes(items);
      })
      .catch(() => {
        if (active) setGuidedError("Could not load makes. Search still works.");
      })
      .finally(() => {
        if (active) setGuidedLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedYear || !selectedMake) return undefined;
    let active = true;
    setGuidedLoading(true);
    setSelectedModel("");
    setGuidedOptions([]);
    getVehicleModels(selectedYear, selectedMake)
      .then((items) => {
        if (active) setModels(items);
      })
      .catch(() => {
        if (active) setGuidedError("Could not load models. Search still works.");
      })
      .finally(() => {
        if (active) setGuidedLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedYear, selectedMake]);

  useEffect(() => {
    if (!selectedYear || !selectedMake || !selectedModel) return undefined;
    let active = true;
    setGuidedLoading(true);
    setGuidedError("");
    getVehicleOptions(selectedYear, selectedMake, selectedModel)
      .then((items) => {
        if (!active) return;
        setGuidedOptions(items);
        if (items[0]) {
          setVehicle(items[0]);
          setSearch(items[0].vehicleName);
          setErrors({});
        }
        if (!items.length) setGuidedError("No EPA spec match found. You can still enter values manually.");
      })
      .catch(() => {
        if (active) setGuidedError("Could not auto-fill specs. Manual entry still works.");
      })
      .finally(() => {
        if (active) setGuidedLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedYear, selectedMake, selectedModel]);

  function updateField(key, value) {
    setVehicle((current) => ({ ...current, [key]: value }));
  }

  function updateNumericField(key, value) {
    updateField(key, value.replace(/[^\d.]/g, ""));
  }

  function validateVehicle() {
    const nextErrors = {};
    const name = vehicle.vehicleName.trim();
    const duplicate = existingVehicles.some((item) => {
      const sameRecord = vehicle.id && item.id === vehicle.id;
      return !sameRecord && item.vehicleName?.trim().toLowerCase() === name.toLowerCase();
    });
    const cityMpg = Number(vehicle.cityMpg);
    const highwayMpg = Number(vehicle.highwayMpg);
    const tankCapacity = Number(vehicle.tankCapacity);

    if (name.length < 2) nextErrors.vehicleName = "Enter a vehicle name.";
    if (duplicate) nextErrors.vehicleName = "This vehicle already exists.";
    if (vehicle.fuelType !== "EV") {
      if (!cityMpg || cityMpg < 5 || cityMpg > 120) nextErrors.cityMpg = "Enter city MPG between 5 and 120.";
      if (!highwayMpg || highwayMpg < 5 || highwayMpg > 140) nextErrors.highwayMpg = "Enter highway MPG between 5 and 140.";
      if (!tankCapacity || tankCapacity < 1 || tankCapacity > 60) nextErrors.tankCapacity = "Enter tank capacity between 1 and 60 gallons.";
      if (cityMpg && highwayMpg && highwayMpg < cityMpg * 0.7) nextErrors.highwayMpg = "Highway MPG looks too low for this vehicle.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveVehicle() {
    if (!validateVehicle()) return;
    setSaving(true);
    let savedVehicle = vehicle;
    if (user?.id) {
      try {
        const isLookupSuggestion = String(vehicle.id || "").startsWith("fueleconomy-");
        savedVehicle = vehicle.id && !isLookupSuggestion ? await updateVehicle(vehicle) : await createVehicle(vehicle, user.id);
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
        routes: [{ name: "Home", params: { assistantName, user, vehicle: initialVehicle.vehicleName ? initialVehicle : existingVehicles[0] || defaultVehicle, vehicles: existingVehicles.length ? existingVehicles : [defaultVehicle] } }]
      })
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.heading}>{isEditingExisting ? "Edit vehicle" : "Add your vehicle"}</Text>
            <Text style={styles.subheading}>Pick from EPA data. Waylo fills MPG and fuel type, then you can adjust anything.</Text>
          </View>
          <Pressable onPress={cancelEdit} hitSlop={8} style={styles.closeButton}>
            <Ionicons color={colors.navy} name="close" size={24} />
          </Pressable>
        </View>

        <PremiumCard style={styles.guidedCard}>
          <View style={styles.guidedHeader}>
            <View style={styles.guidedIcon}>
              <Ionicons color={colors.blue} name="sparkles-outline" size={18} />
            </View>
            <View style={styles.guidedCopy}>
              <Text style={styles.guidedTitle}>Find specs automatically</Text>
              <Text style={styles.guidedSubtitle}>EPA fuel economy fills MPG and fuel type. Tank size stays editable.</Text>
            </View>
          </View>
          <StepSelector label="Year" value={selectedYear || "Select"} items={years} onSelect={setSelectedYear} />
          <StepSelector label="Make" value={selectedMake || (selectedYear ? "Select" : "Choose year first")} items={makes} disabled={!selectedYear} onSelect={setSelectedMake} />
          <StepSelector label="Model" value={selectedModel || (selectedMake ? "Select" : "Choose make first")} items={models} disabled={!selectedMake} onSelect={setSelectedModel} />
          {guidedLoading && (
            <View style={styles.guidedStatus}>
              <ActivityIndicator color={colors.blue} />
              <Text style={styles.suggestionMeta}>Loading vehicle data...</Text>
            </View>
          )}
          {!!guidedError && <Text style={styles.guidedError}>{guidedError}</Text>}
          {guidedOptions.length > 1 && (
            <View style={styles.trimList}>
              <Text style={styles.suggestionsTitle}>Choose trim</Text>
              {guidedOptions.map((item) => (
                <Pressable key={item.id} onPress={() => { setVehicle(item); setSearch(item.vehicleName); setErrors({}); }} style={[styles.trimOption, vehicle.id === item.id && styles.trimOptionActive]}>
                  <View style={styles.suggestionCopy}>
                    <Text style={styles.suggestionName}>{item.trim || item.vehicleName}</Text>
                    <Text style={styles.suggestionMeta}>{item.cityMpg} city | {item.highwayMpg} highway MPG</Text>
                  </View>
                  {vehicle.id === item.id && <Ionicons color={colors.green} name="checkmark-circle" size={18} />}
                </Pressable>
              ))}
            </View>
          )}
        </PremiumCard>

        <View>
          <Text style={styles.label}>Or search by name</Text>
          <View style={styles.searchBox}>
            <Ionicons color={colors.muted} name="search" size={17} style={styles.searchIcon} />
            <TextInput
              placeholder="2021 Toyota Camry"
              placeholderTextColor={colors.mutedLight}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons color={colors.mutedLight} name="close-circle-outline" size={18} />
            </Pressable>
          </View>
          <Text style={styles.lookupHint}>Example: 2021 Toyota Camry. This is here as a faster fallback.</Text>
        </View>

        <PremiumCard style={styles.vehicleCard}>
          <View style={styles.carImage}>
            <View style={styles.carRoad} />
            <View style={styles.carGlow} />
            {vehicle.photoUrl ? (
              <Image resizeMode="contain" source={{ uri: vehicle.photoUrl }} style={styles.vehiclePhotoImage} />
            ) : (
              <VehiclePreview />
            )}
          </View>
          <Text style={styles.vehicleName}>{vehicle.vehicleName || "Choose or add your vehicle"}</Text>
          <Text style={styles.verified}>{vehicle.source ? `${vehicle.source} specs` : "Editable fuel economy specs"}</Text>
          <View style={styles.detailPills}>
            {!!vehicle.trim && <Text style={styles.detailPill} numberOfLines={1}>{vehicle.trim}</Text>}
            {!!vehicle.engine && <Text style={styles.detailPill}>{vehicle.engine}</Text>}
            {!!vehicle.drive && <Text style={styles.detailPill}>{vehicle.drive}</Text>}
          </View>
          <View style={styles.statsRow}>
            <StatItem label="City MPG" value={String(vehicle.cityMpg)} />
            <View style={styles.divider} />
            <StatItem label="Highway MPG" value={String(vehicle.highwayMpg)} />
            <View style={styles.divider} />
            <StatItem label="Tank (gal)" value={String(vehicle.tankCapacity)} />
          </View>
          <View style={styles.rangePanel}>
            <View style={styles.rangeHeader}>
              <Text style={styles.rangeLabel}>Estimated safe range</Text>
              <Text style={styles.rangeValue}>{safeRange ? `${Math.round(safeRange)} mi` : "--"}</Text>
            </View>
            <View style={styles.rangeTrack}>
              <View style={[styles.rangeFill, { width: `${fullRange ? 80 : 8}%` }]} />
            </View>
            <Text style={styles.rangeMeta}>{fullRange ? `Waylo uses 80% of your ${Math.round(fullRange)} mi estimated range so you are not forced to refuel at the last minute.` : "Enter highway MPG and tank size to calculate range."}</Text>
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

        <Text style={styles.helper}>Edit manually if your vehicle specs look different.</Text>
        <EditableField label="Vehicle Name" value={vehicle.vehicleName} error={errors.vehicleName} onChangeText={(v) => updateField("vehicleName", v)} />
        <EditableField label="City MPG" keyboardType="numeric" value={String(vehicle.cityMpg)} error={errors.cityMpg} onChangeText={(v) => updateNumericField("cityMpg", v)} />
        <EditableField label="Highway MPG" keyboardType="numeric" value={String(vehicle.highwayMpg)} error={errors.highwayMpg} onChangeText={(v) => updateNumericField("highwayMpg", v)} />
        <EditableField label="Tank Capacity (gal)" keyboardType="numeric" value={String(vehicle.tankCapacity)} error={errors.tankCapacity} onChangeText={(v) => updateNumericField("tankCapacity", v)} />

        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>{search.trim() ? "Matching vehicles" : "Popular vehicles"}</Text>
          {lookupLoading ? (
            <View style={styles.emptySuggestion}>
              <ActivityIndicator color={colors.blue} />
              <Text style={styles.suggestionMeta}>Checking EPA vehicle data...</Text>
            </View>
          ) : matchingVehicles.length > 0 ? (
            matchingVehicles.map((item) => (
              <Pressable key={item.id || item.vehicleName} onPress={() => { setVehicle(item); setSearch(item.vehicleName); setErrors({}); }} style={styles.suggestion}>
                <View style={styles.suggestionIcon}>
                  <Ionicons color={colors.blue} name={item.fuelType === "EV" ? "flash-outline" : "car-sport-outline"} size={18} />
                </View>
                <View style={styles.suggestionCopy}>
                  <Text style={styles.suggestionName}>{item.vehicleName}</Text>
                  <Text style={styles.suggestionMeta}>{item.fuelType.toUpperCase()} | {item.highwayMpg || "EV"} highway MPG | {item.tankCapacity || "N/A"} gal</Text>
                  {!!item.source && <Text style={styles.sourceMeta}>{item.source} - tank estimate editable</Text>}
                </View>
                <Ionicons color={colors.mutedLight} name="chevron-forward" size={17} />
              </Pressable>
            ))
          ) : (
            <View style={styles.emptySuggestion}>
              <Ionicons color={colors.muted} name="create-outline" size={18} />
              <Text style={styles.suggestionMeta}>{lookupError || "No exact match yet. Continue with manual specs and save your custom vehicle."}</Text>
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

function StepSelector({ label, value, items, onSelect, disabled }) {
  const visibleItems = items.slice(0, 18);
  return (
    <View style={[styles.stepSelector, disabled && styles.stepSelectorDisabled]}>
      <View style={styles.stepTopRow}>
        <Text style={styles.stepLabel}>{label}</Text>
        <Text style={styles.stepValue}>{value}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepChips}>
        {visibleItems.map((item) => {
          const isActive = value === item;
          return (
            <Pressable
              disabled={disabled}
              key={`${label}-${item}`}
              onPress={() => onSelect(item)}
              style={[styles.stepChip, isActive && styles.stepChipActive]}
            >
              <Text style={[styles.stepChipText, isActive && styles.stepChipTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
        {!visibleItems.length && (
          <View style={styles.stepChip}>
            <Text style={styles.stepChipText}>{disabled ? "Waiting" : "No results"}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function VehiclePreview() {
  return (
    <View style={styles.vehiclePreview}>
      <View style={styles.previewCabin} />
      <View style={styles.previewBody} />
      <View style={[styles.previewWheel, styles.previewWheelLeft]} />
      <View style={[styles.previewWheel, styles.previewWheelRight]} />
      <View style={styles.previewHighlight} />
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
    fontWeight: "500",
    lineHeight: 18,
    marginTop: spacing.xs,
    maxWidth: 340
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
    fontWeight: "500",
    marginBottom: spacing.xs
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: spacing.md
  },
  searchIcon: {
    marginRight: spacing.sm
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    outlineStyle: "none"
  },
  lookupHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs
  },
  guidedCard: {
    gap: spacing.md,
    padding: 18
  },
  guidedHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  guidedIcon: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderRadius: radii.pill,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  guidedCopy: {
    flex: 1
  },
  guidedTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  guidedSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2
  },
  guidedStatus: {
    alignItems: "center",
    backgroundColor: colors.appBackground,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  guidedError: {
    color: colors.red,
    fontSize: 12,
    lineHeight: 17
  },
  stepSelector: {
    backgroundColor: "#FBFDFF",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm
  },
  stepSelectorDisabled: {
    opacity: 0.7
  },
  stepTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  stepLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600"
  },
  stepValue: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: "700"
  },
  stepChips: {
    gap: spacing.sm,
    paddingRight: spacing.sm
  },
  stepChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  stepChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy
  },
  stepChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600"
  },
  stepChipTextActive: {
    color: colors.surface
  },
  trimList: {
    gap: spacing.sm
  },
  trimOption: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    padding: spacing.sm
  },
  trimOptionActive: {
    backgroundColor: colors.paleGreen,
    borderColor: "rgba(24,184,117,0.24)"
  },
  vehicleCard: {
    gap: spacing.md,
    padding: 18
  },
  carImage: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderRadius: radii.md,
    height: 150,
    justifyContent: "center",
    overflow: "hidden"
  },
  vehiclePhotoImage: {
    height: 132,
    width: "88%",
    zIndex: 2
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
    fontWeight: "600"
  },
  detailPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  detailPill: {
    backgroundColor: colors.appBackground,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    maxWidth: "100%",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  statsRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: spacing.sm
  },
  rangePanel: {
    backgroundColor: colors.appBackground,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: 18
  },
  rangeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rangeLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "400"
  },
  rangeValue: {
    color: colors.green,
    fontSize: 22,
    fontWeight: "700"
  },
  rangeTrack: {
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    height: 9,
    overflow: "hidden"
  },
  rangeFill: {
    backgroundColor: colors.green,
    borderRadius: radii.pill,
    height: "100%"
  },
  rangeMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 17
  },
  vehiclePreview: {
    height: 88,
    position: "relative",
    width: 190
  },
  previewCabin: {
    backgroundColor: colors.skyBlue,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 36,
    height: 42,
    left: 58,
    position: "absolute",
    top: 10,
    width: 78
  },
  previewBody: {
    backgroundColor: colors.blue,
    borderRadius: 34,
    height: 42,
    left: 22,
    position: "absolute",
    top: 38,
    width: 150
  },
  previewWheel: {
    backgroundColor: colors.navyDeep,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 5,
    height: 34,
    position: "absolute",
    top: 60,
    width: 34
  },
  previewWheelLeft: {
    left: 44
  },
  previewWheelRight: {
    right: 42
  },
  previewHighlight: {
    backgroundColor: "rgba(255,255,255,0.46)",
    borderRadius: radii.pill,
    height: 6,
    left: 44,
    position: "absolute",
    top: 50,
    width: 86
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
    fontSize: 14,
    fontWeight: "500"
  },
  activeFuelText: {
    color: colors.surface
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "400"
  },
  fieldRow: {
    gap: spacing.sm
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500"
  },
  fieldInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    minHeight: 56,
    outlineStyle: "none",
    paddingHorizontal: spacing.md
  },
  invalidInput: {
    borderColor: colors.red
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: "500"
  },
  suggestions: {
    gap: spacing.sm
  },
  suggestionsTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
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
    fontWeight: "500"
  },
  suggestionMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  sourceMeta: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "600",
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
