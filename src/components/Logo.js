import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export default function Logo({ size = "md", light = false, showText = true, image = false }) {
  if (image) {
    const markSize = size === "lg" ? 132 : size === "sm" ? 64 : 94;
    return (
      <View accessibilityLabel="Waylo logo" style={styles.brandLockup}>
        <View style={[styles.logoMark, { height: markSize, width: markSize }]}>
          <Text style={[styles.markW, { fontSize: markSize * 0.76 }]}>W</Text>
          <View style={styles.roadSweep} />
          <View style={styles.roadStripe} />
          <View style={styles.pin}>
            <View style={styles.pinHole} />
          </View>
        </View>
        <Text style={[styles.wordmark, { fontSize: size === "lg" ? 38 : 28 }]}>
          Wayl<Text style={styles.tealText}>o</Text>
        </Text>
        <Text style={styles.tagline}>Drive smart. Spend less.</Text>
      </View>
    );
  }

  const textSize = size === "lg" ? 42 : size === "sm" ? 24 : 32;
  const textColor = light ? colors.surface : colors.navy;

  return (
    <View style={styles.wrap}>
      {showText && (
        <Text style={[styles.text, { fontSize: textSize, color: textColor }]}>
          Wayl<Text style={styles.tealText}>o</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center"
  },
  brandLockup: {
    alignItems: "center",
    justifyContent: "center"
  },
  logoMark: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  markW: {
    color: colors.blueDeep,
    fontWeight: "800",
    letterSpacing: -5,
    lineHeight: 100
  },
  roadSweep: {
    backgroundColor: colors.navyDeep,
    borderRadius: 999,
    bottom: 8,
    height: "58%",
    position: "absolute",
    right: 10,
    transform: [{ rotate: "27deg" }],
    width: 26
  },
  roadStripe: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    bottom: 26,
    height: "28%",
    position: "absolute",
    right: 24,
    transform: [{ rotate: "27deg" }],
    width: 7
  },
  pin: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 0,
    width: 42
  },
  pinHole: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 17,
    width: 17
  },
  wordmark: {
    color: colors.navy,
    fontWeight: "600",
    letterSpacing: 0,
    marginTop: -8
  },
  tagline: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2
  },
  text: {
    fontWeight: "600",
    letterSpacing: 0,
    marginTop: -2
  },
  tealText: {
    color: colors.green
  }
});
