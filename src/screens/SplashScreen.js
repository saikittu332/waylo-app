import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../components/Logo";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, screen, spacing } from "../constants/theme";

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <View style={styles.sky} />
      <View style={styles.mountains} />
      <View style={styles.road}>
        <View style={styles.line} />
      </View>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.logoBlock}>
            <Logo size="lg" light />
            <Text style={styles.tagline}>Drive smart. Spend less.</Text>
          </View>

          <View style={styles.glassCard}>
            <Feature title="Smart fuel stops" detail="Find the best fuel prices" />
            <Feature title="Lower trip cost" detail="Save more on every mile" />
            <Feature title="Better road trips" detail="Comfort, safety and fun" />
          </View>

          <View style={styles.actions}>
            <PrimaryButton title="Get Started" onPress={() => navigation.navigate("Login")} />
            <Pressable onPress={() => navigation.navigate("Login")} style={styles.loginLink}>
              <Text style={styles.loginText}>Login / Sign up</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Feature({ title, detail }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{title.slice(0, 1)}</Text>
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
    backgroundColor: colors.navy,
    flex: 1,
    overflow: "hidden"
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.navy
  },
  mountains: {
    backgroundColor: "rgba(24, 184, 117, 0.28)",
    borderTopLeftRadius: 260,
    height: 260,
    left: -80,
    position: "absolute",
    right: -70,
    top: 330,
    transform: [{ rotate: "-8deg" }]
  },
  road: {
    backgroundColor: "#2F3338",
    bottom: -70,
    height: 250,
    left: 42,
    position: "absolute",
    right: 42,
    transform: [{ perspective: 500 }, { rotateX: "56deg" }]
  },
  line: {
    alignSelf: "center",
    backgroundColor: colors.orange,
    height: "100%",
    width: 5
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
    marginTop: 52
  },
  tagline: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800",
    marginTop: spacing.xs
  },
  glassCard: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
    width: "78%"
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
  featureIconText: {
    color: colors.surface,
    fontWeight: "900"
  },
  featureTitle: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "900"
  },
  featureDetail: {
    color: "#DDE7F5",
    fontSize: 12,
    marginTop: 2
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  loginText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center"
  },
  loginLink: {
    alignItems: "center",
    minHeight: 36,
    justifyContent: "center"
  }
});
