import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing, typography } from "../constants/theme";

export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View>
          <Text style={styles.logo}>Waylo</Text>
          <Text style={styles.tagline}>Drive smart. Spend less.</Text>
        </View>
        <View style={styles.hero}>
          <View style={styles.routeLine} />
          <View style={[styles.pin, styles.startPin]} />
          <View style={[styles.pin, styles.endPin]} />
          <Text style={styles.heroText}>AI road trip planning for fuel, stops, cost, and comfort.</Text>
        </View>
        <PrimaryButton title="Get Started" onPress={() => navigation.navigate("Login")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.lg
  },
  logo: {
    ...typography.title,
    fontSize: 48,
    marginTop: spacing.xl
  },
  tagline: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    height: 330,
    justifyContent: "center",
    overflow: "hidden",
    padding: spacing.lg
  },
  routeLine: {
    alignSelf: "center",
    backgroundColor: colors.paleBlue,
    borderColor: colors.navy,
    borderRadius: 120,
    borderWidth: 2,
    height: 220,
    position: "absolute",
    transform: [{ rotate: "-18deg" }],
    width: 140
  },
  pin: {
    borderRadius: 18,
    height: 36,
    position: "absolute",
    width: 36
  },
  startPin: {
    backgroundColor: colors.green,
    left: 84,
    top: 76
  },
  endPin: {
    backgroundColor: colors.orange,
    bottom: 72,
    right: 88
  },
  heroText: {
    color: colors.navy,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 34,
    maxWidth: 260
  }
});
