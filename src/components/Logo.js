import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export default function Logo({ size = "md", light = false, showText = true, image = false }) {
  if (image) {
    const markSize = size === "lg" ? 132 : size === "sm" ? 64 : 94;
    const pinSize = markSize * 0.28;
    return (
      <View accessibilityLabel="Waylo logo" style={styles.brandLockup}>
        <View style={[styles.logoMark, { height: markSize, width: markSize }]}>
          <Text style={[styles.markW, { fontSize: markSize * 0.7, lineHeight: markSize * 0.74 }]}>W</Text>
          <View
            style={[
              styles.roadSweep,
              {
                bottom: markSize * 0.08,
                height: markSize * 0.46,
                right: markSize * 0.18,
                width: markSize * 0.13
              }
            ]}
          />
          <View
            style={[
              styles.roadStripe,
              {
                bottom: markSize * 0.19,
                height: markSize * 0.2,
                right: markSize * 0.245,
                width: Math.max(4, markSize * 0.036)
              }
            ]}
          />
          <View
            style={[
              styles.pin,
              {
                height: pinSize,
                right: markSize * 0.07,
                top: markSize * 0.02,
                width: pinSize
              }
            ]}
          >
            <View style={[styles.pinHole, { height: pinSize * 0.42, width: pinSize * 0.42 }]} />
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
    letterSpacing: -4
  },
  roadSweep: {
    backgroundColor: colors.navyDeep,
    borderRadius: 999,
    position: "absolute",
    transform: [{ rotate: "29deg" }]
  },
  roadStripe: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    position: "absolute",
    transform: [{ rotate: "29deg" }]
  },
  pin: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: 999,
    justifyContent: "center",
    position: "absolute",
    zIndex: 2
  },
  pinHole: {
    backgroundColor: colors.surface,
    borderRadius: 999
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
