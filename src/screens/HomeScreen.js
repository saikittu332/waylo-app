import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import TripModeChip from "../components/TripModeChip";
import { colors, radii, screen, spacing } from "../constants/theme";
import { mockTripRequest } from "../data/mockTrip";
import { defaultVehicle } from "../data/mockVehicleSpecs";
import { getSubscriptionState } from "../services/subscriptionService";

const modes = ["Fastest", "Cheapest", "Scenic", "Comfort"];
const tabs = [
  { label: "Home", icon: "home" },
  { label: "Trips", icon: "map" },
  { label: "Vehicle", icon: "car-sport" },
  { label: "Profile", icon: "person" }
];

export default function HomeScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const vehicle = route.params?.vehicle || defaultVehicle;
  const initialVehicles = route.params?.vehicles || [vehicle];
  const [activeTab, setActiveTab] = useState("Home");
  const [from, setFrom] = useState("Current Location");
  const [to, setTo] = useState(mockTripRequest.to);
  const [mode, setMode] = useState(mockTripRequest.mode);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicle);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [subscription, setSubscription] = useState(getSubscriptionState());

  useFocusEffect(
    React.useCallback(() => {
      setSubscription(getSubscriptionState());
      if (route.params?.vehicle) {
        setVehicles((current) => {
          const exists = current.some((item) => item.vehicleName === route.params.vehicle.vehicleName);
          return exists ? current.map((item) => (item.vehicleName === route.params.vehicle.vehicleName ? route.params.vehicle : item)) : [...current, route.params.vehicle];
        });
        setSelectedVehicle(route.params.vehicle);
      }
    }, [route.params?.vehicle])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.greetingCard}>
          <View>
            <Text style={styles.greeting}>Good Morning, Sai</Text>
            <Text style={styles.assistant}>{assistantName} is ready to save your next mile.</Text>
          </View>
          <View style={styles.bellButton}>
            <Ionicons color={colors.navy} name="notifications-outline" size={20} />
          </View>
        </View>

        {activeTab === "Home" && (
          <PlanTripContent
            assistantName={assistantName}
            vehicle={selectedVehicle}
            vehicles={vehicles}
            navigation={navigation}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            mode={mode}
            setMode={setMode}
            showVehiclePicker={showVehiclePicker}
            setShowVehiclePicker={setShowVehiclePicker}
            setSelectedVehicle={setSelectedVehicle}
          />
        )}
        {activeTab === "Trips" && (
          <TripsContent
            assistantName={assistantName}
            vehicle={selectedVehicle}
            navigation={navigation}
            from={from}
            to={to}
            mode={mode}
          />
        )}
        {activeTab === "Vehicle" && (
          <VehicleContent
            assistantName={assistantName}
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            navigation={navigation}
          />
        )}
        {activeTab === "Profile" && <ProfileContent assistantName={assistantName} navigation={navigation} subscription={subscription} setSubscription={setSubscription} />}
      </ScrollView>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.label}
            onPress={() => setActiveTab(tab.label)}
            style={styles.tabItem}
          >
            <Ionicons
              color={tab.label === activeTab ? colors.navy : colors.mutedLight}
              name={tab.icon}
              size={21}
            />
            <Text style={[styles.tabLabel, tab.label === activeTab && styles.activeTab]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function PlanTripContent({ assistantName, vehicle, vehicles, navigation, from, setFrom, to, setTo, mode, setMode, showVehiclePicker, setShowVehiclePicker, setSelectedVehicle }) {
  function continuePlan() {
    navigation.navigate("TripResults", { assistantName, vehicle, tripRequest: { from, to, mode } });
  }

  return (
    <>
      <PremiumCard style={styles.tripCard}>
        <Text style={styles.cardTitle}>Plan Your Trip</Text>
        <TripField label="From" value={from} onChangeText={setFrom} pinColor="#367CFF" />
        <TripField label="To" value={to} onChangeText={setTo} pinColor={colors.red} />
        <Text style={styles.label}>Trip Mode</Text>
        <View style={styles.modes}>
          {modes.map((item) => (
            <TripModeChip key={item} label={item} selected={mode === item} onPress={() => setMode(item)} />
          ))}
        </View>
        <Pressable onPress={() => setShowVehiclePicker((value) => !value)} style={styles.selectedVehicleCard}>
          <View style={styles.vehicleIconMini}>
            <Ionicons color={colors.blue} name="car-sport-outline" size={20} />
          </View>
          <View style={styles.selectedVehicleText}>
            <Text style={styles.selectedVehicleLabel}>Vehicle</Text>
            <Text style={styles.selectedVehicleName}>{vehicle.vehicleName}</Text>
          </View>
          <Ionicons color={colors.muted} name={showVehiclePicker ? "chevron-up" : "chevron-down"} size={20} />
        </Pressable>
        {showVehiclePicker && (
          <View style={styles.vehiclePicker}>
            <View style={styles.pickerHeader}>
              <Text style={styles.label}>Choose vehicle for this trip</Text>
              <Pressable onPress={() => setShowVehiclePicker(false)} hitSlop={8} style={styles.textAction}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
            {vehicles.map((item) => (
              <Pressable
                key={item.vehicleName}
                onPress={() => {
                  setSelectedVehicle(item);
                  setShowVehiclePicker(false);
                }}
                style={styles.vehicleOption}
              >
                <Ionicons color={colors.blue} name="car-sport-outline" size={19} />
                <View style={styles.selectedVehicleText}>
                  <Text style={styles.vehicleOptionName}>{item.vehicleName}</Text>
                  <Text style={styles.vehicleOptionMeta}>{item.highwayMpg} highway MPG | {item.tankCapacity} gal</Text>
                </View>
              </Pressable>
            ))}
            <Pressable onPress={() => navigation.navigate("VehicleSetup", { assistantName, mode: "new", vehicles })} style={styles.addVehicleInline}>
              <Ionicons color={colors.blue} name="add-circle-outline" size={19} />
              <Text style={styles.addVehicleText}>Add new vehicle</Text>
            </Pressable>
          </View>
        )}
        <PrimaryButton
          title={showVehiclePicker ? "Continue with Vehicle" : "Plan Smart Trip"}
          onPress={showVehiclePicker ? continuePlan : () => setShowVehiclePicker(true)}
        />
      </PremiumCard>
      <TripsContent assistantName={assistantName} vehicle={vehicle} navigation={navigation} from={from} to={to} mode={mode} compact />
    </>
  );
}

function TripsContent({ assistantName, vehicle, navigation, from, to, mode, compact }) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{compact ? "Recent Trips" : "Trips"}</Text>
        <Pressable onPress={() => navigation.navigate("TripResults", { assistantName, vehicle, tripRequest: { from, to, mode } })} hitSlop={8}>
          <Text style={styles.viewAll}>View current plan</Text>
        </Pressable>
      </View>
      <PremiumCard style={styles.recentCard}>
        <RecentTrip title="San Francisco -> Yosemite" date="May 20, 2024" onPress={() => navigation.navigate("TripResults", { assistantName, vehicle, tripRequest: { from: "San Francisco", to: "Yosemite, CA", mode: "Scenic" } })} />
        <View style={styles.listDivider} />
        <RecentTrip title="Las Vegas -> Grand Canyon" date="May 18, 2024" onPress={() => navigation.navigate("TripResults", { assistantName, vehicle, tripRequest: { from: "Las Vegas", to: "Grand Canyon, AZ", mode: "Comfort" } })} />
      </PremiumCard>
    </>
  );
}

function VehicleContent({ assistantName, vehicles, selectedVehicle, navigation }) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Vehicles</Text>
        <Pressable onPress={() => navigation.navigate("VehicleSetup", { assistantName, mode: "new", vehicles })} hitSlop={8} style={styles.textAction}>
          <Text style={styles.viewAll}>Add vehicle</Text>
        </Pressable>
      </View>
      {vehicles.map((item) => (
        <PremiumCard key={item.vehicleName} style={styles.vehicleListCard}>
          <View style={styles.vehiclePhoto}>
            <View style={styles.vehiclePhotoRoad} />
            <Ionicons color={colors.blue} name="car-sport" size={56} />
          </View>
          <Text style={styles.cardTitle}>{item.vehicleName}</Text>
          <Text style={styles.profileMeta}>{item.fuelType.toUpperCase()} | {item.cityMpg} city MPG | {item.highwayMpg} highway MPG</Text>
          <Text style={styles.profileMeta}>Tank capacity: {item.tankCapacity} gal</Text>
          {selectedVehicle.vehicleName === item.vehicleName && <Text style={styles.currentVehicle}>Selected for trips</Text>}
          <PrimaryButton title="Edit Vehicle" onPress={() => navigation.navigate("VehicleSetup", { assistantName, vehicle: item, vehicles })} />
        </PremiumCard>
      ))}
    </>
  );
}

function ProfileContent({ assistantName, navigation, subscription, setSubscription }) {
  const [profileName, setProfileName] = useState("Sai");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [editing, setEditing] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [fuelAlerts, setFuelAlerts] = useState(true);
  const [restReminders, setRestReminders] = useState(true);
  const [restInterval, setRestInterval] = useState("2.5 hours");

  function toggleEditing() {
    if (!editing) {
      setEditing(true);
      return;
    }
    const validName = profileName.trim().length >= 2;
    const validPhone = /^\+1 \(\d{3}\) \d{3}-\d{4}$/.test(phone.trim());
    setNameError(validName ? "" : "Enter at least 2 characters.");
    setPhoneError(validPhone ? "" : "Use format +1 (555) 123-4567.");
    if (validName && validPhone) setEditing(false);
  }

  function formatPhoneInput(value) {
    const digits = value.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
    const area = digits.slice(0, 3);
    const prefix = digits.slice(3, 6);
    const line = digits.slice(6, 10);
    if (digits.length <= 3) return `+1 (${area}`;
    if (digits.length <= 6) return `+1 (${area}) ${prefix}`;
    return `+1 (${area}) ${prefix}-${line}`;
  }

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Pressable onPress={toggleEditing} hitSlop={8} style={styles.textAction}>
          <Text style={styles.viewAll}>{editing ? "Done" : "Edit profile"}</Text>
        </Pressable>
      </View>
      <PremiumCard style={styles.profileCard}>
        {editing ? (
          <>
            <ProfileInput label="Name" value={profileName} onChangeText={setProfileName} error={nameError} />
            <ProfileInput label="Phone" value={phone} onChangeText={(value) => setPhone(formatPhoneInput(value))} error={phoneError} keyboardType="phone-pad" />
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>{profileName}</Text>
            <Text style={styles.profileMeta}>{phone}</Text>
          </>
        )}
        <Text style={styles.profileMeta}>Assistant name: {assistantName}</Text>
        <Text style={styles.profileMeta}>Saved trips: 2</Text>
      </PremiumCard>
      <PremiumCard style={styles.subscriptionCard}>
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.cardTitle}>Waylo {subscription.planName}</Text>
            <Text style={styles.profileMeta}>Current plan</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{subscription.planName}</Text>
          </View>
        </View>
        <Text style={styles.profileMeta}>{subscription.isPremium ? "Full AI optimization, smart stops, and savings insights are enabled." : "Basic route planning and 1 fuel suggestion per trip."}</Text>
        <View style={styles.planRows}>
          <PlanLine label="Basic route" included />
          <PlanLine label="1 fuel suggestion" included />
          <PlanLine label="Full AI fuel optimization" included={subscription.isPremium} />
          <PlanLine label="Multiple smart stops" included={subscription.isPremium} />
        </View>
        <PrimaryButton title={subscription.isPremium ? "Manage Premium" : "View Premium Plan"} variant="secondary" onPress={() => navigation.navigate("Paywall")} />
      </PremiumCard>
      <PremiumCard style={styles.profileCard}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <PreferenceRow label="Fuel savings alerts" value={fuelAlerts} onValueChange={setFuelAlerts} />
        <ReminderPreference
          enabled={restReminders}
          interval={restInterval}
          onIntervalChange={setRestInterval}
          onToggle={setRestReminders}
        />
      </PremiumCard>
    </>
  );
}

function ProfileInput({ label, value, onChangeText, error, keyboardType = "default" }) {
  return (
    <View style={styles.profileInputWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput keyboardType={keyboardType} value={value} onChangeText={onChangeText} style={[styles.profileInput, !!error && styles.invalidInput]} />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function PreferenceRow({ label, value, onValueChange }) {
  return (
    <View style={styles.preferenceRow}>
      <Text style={styles.profileMeta}>{label}</Text>
      <Switch
        onValueChange={onValueChange}
        thumbColor={colors.surface}
        trackColor={{ false: colors.border, true: colors.green }}
        value={value}
      />
    </View>
  );
}

function ReminderPreference({ enabled, interval, onIntervalChange, onToggle }) {
  const options = ["2 hours", "2.5 hours", "3 hours", "4 hours"];

  return (
    <View style={styles.reminderBlock}>
      <View style={styles.preferenceRow}>
        <View style={styles.preferenceText}>
          <Text style={styles.profileMeta}>Rest break timing</Text>
          <Text style={styles.preferenceSub}>{enabled ? `Every ${interval}` : "Paused"}</Text>
        </View>
        <Switch
          onValueChange={onToggle}
          thumbColor={colors.surface}
          trackColor={{ false: colors.border, true: colors.green }}
          value={enabled}
        />
      </View>
      {enabled && (
        <View style={styles.intervalChips}>
          {options.map((option) => {
            const selected = option === interval;
            return (
              <Pressable
                key={option}
                onPress={() => onIntervalChange(option)}
                style={[styles.intervalChip, selected && styles.intervalChipActive]}
              >
                <Text style={[styles.intervalChipText, selected && styles.intervalChipTextActive]}>
                  {option.replace(" hours", "h")}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function PlanLine({ label, included }) {
  return (
    <View style={styles.planLine}>
      <Ionicons
        color={included ? colors.green : colors.mutedLight}
        name={included ? "checkmark-circle" : "lock-closed-outline"}
        size={17}
      />
      <Text style={styles.planLineText}>{label}</Text>
    </View>
  );
}

function TripField({ label, value, onChangeText, pinColor }) {
  return (
    <View style={styles.tripFieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.tripField}>
        <View style={[styles.pin, { backgroundColor: pinColor }]} />
        <TextInput value={value} onChangeText={onChangeText} style={styles.input} />
        <Text style={styles.fieldAction}>+</Text>
      </View>
    </View>
  );
}

function RecentTrip({ title, date, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.recentTrip}>
      <View>
        <Text style={styles.recentTitle}>{title}</Text>
        <Text style={styles.recentDate}>{date}</Text>
      </View>
      <Text style={styles.chevron}>{">"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.appBackground,
    flex: 1,
    paddingBottom: 0
  },
  greetingCard: {
    alignItems: "center",
    backgroundColor: colors.headerBlue,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md
  },
  greeting: {
    color: colors.navy,
    fontSize: 19,
    fontWeight: "900"
  },
  assistant: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  bellButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  container: {
    alignSelf: "center",
    gap: spacing.md,
    maxWidth: screen.maxWidth,
    paddingHorizontal: screen.padding,
    paddingBottom: 112,
    paddingTop: spacing.sm,
    width: "100%"
  },
  tripCard: {
    gap: spacing.md
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  tripFieldWrap: {
    gap: spacing.xs
  },
  tripField: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  pin: {
    borderRadius: radii.pill,
    height: 14,
    marginRight: spacing.sm,
    width: 14
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "800"
  },
  fieldAction: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900"
  },
  modes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  viewAll: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: "800"
  },
  textAction: {
    outlineStyle: "none"
  },
  recentCard: {
    paddingVertical: spacing.sm
  },
  recentTrip: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.sm
  },
  recentTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  recentDate: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  chevron: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: "700"
  },
  listDivider: {
    backgroundColor: colors.border,
    height: 1
  },
  tabBar: {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    maxWidth: screen.maxWidth,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    width: "100%"
  },
  tabItem: {
    alignItems: "center",
    gap: 3,
    outlineStyle: "none"
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  activeTab: {
    color: colors.navy
  },
  profileCard: {
    gap: spacing.md
  },
  selectedVehicleCard: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 58,
    outlineStyle: "none",
    padding: spacing.sm
  },
  vehicleIconMini: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  selectedVehicleText: {
    flex: 1
  },
  selectedVehicleLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  selectedVehicleName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2
  },
  vehiclePicker: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm
  },
  pickerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  doneText: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: "900"
  },
  vehicleOption: {
    alignItems: "center",
    borderRadius: radii.sm,
    flexDirection: "row",
    gap: spacing.sm,
    outlineStyle: "none",
    padding: spacing.sm
  },
  vehicleOptionName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  vehicleOptionMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  addVehicleInline: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    outlineStyle: "none",
    padding: spacing.sm
  },
  addVehicleText: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: "900"
  },
  vehicleListCard: {
    gap: spacing.md
  },
  vehiclePhoto: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderRadius: radii.md,
    height: 128,
    justifyContent: "center",
    overflow: "hidden"
  },
  vehiclePhotoRoad: {
    backgroundColor: "rgba(11,45,92,0.08)",
    borderRadius: 999,
    bottom: -34,
    height: 86,
    position: "absolute",
    width: 320
  },
  currentVehicle: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "900"
  },
  subscriptionCard: {
    gap: spacing.md
  },
  planHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  planBadge: {
    backgroundColor: colors.paleBlue,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  planBadgeText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "900"
  },
  planRows: {
    gap: spacing.sm
  },
  planLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  planLineText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  profileInputWrap: {
    gap: spacing.xs
  },
  profileInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.text,
    minHeight: 44,
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
  preferenceRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  preferenceText: {
    flex: 1,
    paddingRight: spacing.sm
  },
  preferenceSub: {
    color: colors.mutedLight,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  reminderBlock: {
    gap: spacing.sm
  },
  intervalChips: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  intervalChip: {
    alignItems: "center",
    backgroundColor: colors.appBackground,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
    outlineStyle: "none",
    paddingHorizontal: spacing.sm
  },
  intervalChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy
  },
  intervalChipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  intervalChipTextActive: {
    color: colors.surface
  },
  profileMeta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  }
});
