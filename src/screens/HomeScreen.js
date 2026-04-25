import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import TripModeChip from "../components/TripModeChip";
import { colors, radii, screen, spacing } from "../constants/theme";
import { mockTripRequest } from "../data/mockTrip";
import { defaultVehicle } from "../data/mockVehicleSpecs";

const modes = ["Fastest", "Cheapest", "Scenic", "Comfort"];

export default function HomeScreen({ navigation, route }) {
  const assistantName = route.params?.assistantName || "Waylo";
  const vehicle = route.params?.vehicle || defaultVehicle;
  const [from, setFrom] = useState("Current Location");
  const [to, setTo] = useState(mockTripRequest.to);
  const [mode, setMode] = useState(mockTripRequest.mode);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navyHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Good Morning, Sai</Text>
          <Text style={styles.assistant}>{assistantName} is ready to save your next mile.</Text>
          <Text style={styles.bell}>o</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <Text style={styles.viewAll}>View all</Text>
        </View>
        <PremiumCard style={styles.recentCard}>
          <RecentTrip title="San Francisco -> Yosemite" date="May 20, 2024" />
          <View style={styles.listDivider} />
          <RecentTrip title="Las Vegas -> Grand Canyon" date="May 18, 2024" />
        </PremiumCard>
      </ScrollView>

      <View style={styles.tabBar}>
        {["Home", "Trips", "Vehicle", "Profile"].map((item) => (
          <Pressable key={item} style={styles.tabItem}>
            <Text style={[styles.tabIcon, item === "Home" && styles.activeTab]}>*</Text>
            <Text style={[styles.tabLabel, item === "Home" && styles.activeTab]}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
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

function RecentTrip({ title, date }) {
  return (
    <View style={styles.recentTrip}>
      <View>
        <Text style={styles.recentTitle}>{title}</Text>
        <Text style={styles.recentDate}>{date}</Text>
      </View>
      <Text style={styles.chevron}>{">"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.appBackground,
    flex: 1
  },
  navyHeader: {
    backgroundColor: colors.navy,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    minHeight: 230,
    paddingHorizontal: screen.padding,
    paddingTop: spacing.lg
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
    marginTop: spacing.lg
  },
  assistant: {
    color: "#B9C7D9",
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  bell: {
    color: colors.surface,
    fontSize: 20,
    position: "absolute",
    right: 4,
    top: spacing.lg
  },
  container: {
    alignSelf: "center",
    gap: spacing.md,
    marginTop: -108,
    maxWidth: screen.maxWidth,
    padding: screen.padding,
    paddingBottom: 110,
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
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    maxWidth: screen.maxWidth,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    position: "absolute",
    width: "100%"
  },
  tabItem: {
    alignItems: "center",
    gap: 3
  },
  tabIcon: {
    color: colors.mutedLight,
    fontSize: 12
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  activeTab: {
    color: colors.navy
  }
});
