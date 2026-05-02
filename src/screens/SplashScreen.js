import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../components/Logo";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, screen, spacing } from "../constants/theme";

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <View style={styles.blueHalo} />
      <View style={styles.tealHalo} />
      <View style={styles.routeRoad}>
        <View style={styles.roadStripeOne} />
        <View style={styles.roadStripeTwo} />
      </View>
      <View style={styles.destinationPin}>
        <View style={styles.destinationPinHole} />
      </View>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.logoBlock}>
            <Logo size="lg" image />
          </View>

          <View style={styles.glassCard}>
            <Feature icon="pricetag-outline" title="Smart fuel stops" detail="Find the best fuel prices" />
            <Feature icon="trending-down-outline" title="Lower trip cost" detail="Save more on every mile" />
            <Feature icon="navigate-outline" title="Better road trips" detail="Comfort, safety and fun" />
          </View>

          <View style={styles.actions}>
            <PrimaryButton title="Get Started" onPress={() => navigation.navigate("Login")} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Feature({ icon, title, detail }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Ionicons color={colors.surface} name={icon} size={16} />
      </View>
      <View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    flex: 1,
    overflow: "hidden"
  },
  blueHalo: {
    backgroundColor: "rgba(8,103,242,0.08)",
    borderRadius: 260,
    height: 420,
    left: -190,
    position: "absolute",
    top: 180,
    width: 420
  },
  tealHalo: {
    backgroundColor: "rgba(20,199,154,0.12)",
    borderRadius: 260,
    height: 360,
    position: "absolute",
    right: -170,
    top: 70,
    width: 360
  },
  routeRoad: {
    backgroundColor: colors.navySoft,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    bottom: -36,
    height: 390,
    overflow: "hidden",
    position: "absolute",
    right: -8,
    transform: [{ rotate: "26deg" }],
    width: 160
  },
  roadStripeOne: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 54,
    left: 70,
    position: "absolute",
    top: 110,
    width: 12
  },
  roadStripeTwo: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 54,
    left: 70,
    position: "absolute",
    top: 210,
    width: 12
  },
  destinationPin: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: 42,
    height: 84,
    justifyContent: "center",
    position: "absolute",
    right: 76,
    top: 106,
    width: 84
  },
  destinationPinHole: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    height: 36,
    width: 36
  },
  safe: {
    flex: 1
  },
  container: {
    alignSelf: "center",
    flex: 1,
    justifyContent: "space-between",
    maxWidth: screen.maxWidth,
    padding: screen.padding,
    width: "100%"
  },
  logoBlock: {
    alignItems: "center",
    marginTop: 44
  },
  tagline: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "500",
    marginTop: spacing.sm
  },
  glassCard: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderColor: "rgba(8,103,242,0.12)",
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
    shadowColor: colors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    width: "82%"
  },
  feature: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  featureIcon: {
    alignItems: "center",
    backgroundColor: colors.orange,
    borderRadius: radii.pill,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  featureTitle: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: "500"
  },
  featureDetail: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  actions: {
    marginBottom: spacing.xl
  }
});
