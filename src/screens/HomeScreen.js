import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import TripModeChip from "../components/TripModeChip";
import { colors, radii, screen, spacing } from "../constants/theme";
import { mockTripRequest } from "../data/mockTrip";
import { defaultVehicle } from "../data/mockVehicleSpecs";

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
  const [activeTab, setActiveTab] = useState("Home");
  const [from, setFrom] = useState("Current Location");
  const [to, setTo] = useState(mockTripRequest.to);
  const [mode, setMode] = useState(mockTripRequest.mode);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navyHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Good Morning, Sai</Text>
          <Text style={styles.assistant}>{assistantName} is ready to save your next mile.</Text>
          <Ionicons color={colors.surface} name="notifications-outline" size={22} style={styles.bell} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {activeTab === "Home" && (
          <PlanTripContent
            assistantName={assistantName}
            vehicle={vehicle}
            navigation={navigation}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            mode={mode}
            setMode={setMode}
          />
        )}
        {activeTab === "Trips" && (
          <TripsContent
            assistantName={assistantName}
            vehicle={vehicle}
            navigation={navigation}
            from={from}
            to={to}
            mode={mode}
          />
        )}
        {activeTab === "Vehicle" && (
          <VehicleContent
            assistantName={assistantName}
            vehicle={vehicle}
            navigation={navigation}
          />
        )}
        {activeTab === "Profile" && <ProfileContent assistantName={assistantName} navigation={navigation} />}
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

function PlanTripContent({ assistantName, vehicle, navigation, from, setFrom, to, setTo, mode, setMode }) {
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
        <PrimaryButton
          title="Plan Smart Trip"
          onPress={() => navigation.navigate("TripResults", { assistantName, vehicle, tripRequest: { from, to, mode } })}
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

function VehicleContent({ assistantName, vehicle, navigation }) {
  return (
    <>
      <Text style={styles.sectionTitle}>Your Vehicles</Text>
      <PremiumCard style={styles.profileCard}>
        <Text style={styles.cardTitle}>{vehicle.vehicleName}</Text>
        <Text style={styles.profileMeta}>{vehicle.fuelType.toUpperCase()} | {vehicle.cityMpg} city MPG | {vehicle.highwayMpg} highway MPG</Text>
        <Text style={styles.profileMeta}>Tank capacity: {vehicle.tankCapacity} gal</Text>
        <PrimaryButton title="Edit Vehicle" onPress={() => navigation.navigate("VehicleSetup", { assistantName, vehicle })} />
      </PremiumCard>
    </>
  );
}

function ProfileContent({ assistantName, navigation }) {
  const [profileName, setProfileName] = useState("Sai");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [editing, setEditing] = useState(false);

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Pressable onPress={() => setEditing((value) => !value)} hitSlop={8} style={styles.textAction}>
          <Text style={styles.viewAll}>{editing ? "Done" : "Edit profile"}</Text>
        </Pressable>
      </View>
      <PremiumCard style={styles.profileCard}>
        {editing ? (
          <>
            <ProfileInput label="Name" value={profileName} onChangeText={setProfileName} />
            <ProfileInput label="Phone" value={phone} onChangeText={setPhone} />
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
            <Text style={styles.cardTitle}>Waylo Free</Text>
            <Text style={styles.profileMeta}>Current plan</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>Free</Text>
          </View>
        </View>
        <Text style={styles.profileMeta}>Basic route planning and 1 fuel suggestion per trip.</Text>
        <View style={styles.planRows}>
          <PlanLine label="Basic route" included />
          <PlanLine label="1 fuel suggestion" included />
          <PlanLine label="Full AI fuel optimization" />
          <PlanLine label="Multiple smart stops" />
        </View>
        <PrimaryButton title="View Premium Plan" variant="secondary" onPress={() => navigation.navigate("Paywall")} />
      </PremiumCard>
      <PremiumCard style={styles.profileCard}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <Text style={styles.profileMeta}>Fuel savings alerts enabled</Text>
        <Text style={styles.profileMeta}>Rest reminders every 2.5-3 hours</Text>
      </PremiumCard>
    </>
  );
}

function ProfileInput({ label, value, onChangeText }) {
  return (
    <View style={styles.profileInputWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={styles.profileInput} />
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
  navyHeader: {
    backgroundColor: colors.navy,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    minHeight: 112,
    paddingHorizontal: screen.padding,
    paddingTop: spacing.sm
  },
  headerContent: {
    alignSelf: "center",
    maxWidth: screen.maxWidth,
    width: "100%"
  },
  greeting: {
    color: colors.surface,
    fontSize: 21,
    fontWeight: "900",
    marginTop: spacing.sm
  },
  assistant: {
    color: "#B9C7D9",
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  bell: {
    position: "absolute",
    right: 4,
    top: spacing.sm
  },
  container: {
    alignSelf: "center",
    gap: spacing.md,
    maxWidth: screen.maxWidth,
    paddingHorizontal: screen.padding,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
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
    color: "#367CFF",
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
  profileMeta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  }
});
