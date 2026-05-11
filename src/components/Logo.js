import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";
import brandLogo from "../../assets/waylo-brand-logo.png";

export default function Logo({ size = "md", light = false, showText = true, image = false }) {
  if (image) {
    const imageSize = size === "lg" ? 210 : size === "sm" ? 96 : 148;
    return (
      <Image
        accessibilityLabel="Waylo logo"
        resizeMode="contain"
        source={brandLogo}
        style={[styles.brandAsset, { height: imageSize, width: imageSize }]}
      />
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
  brandImageWrap: {
    alignItems: "center",
    aspectRatio: 1,
    justifyContent: "center"
  },
  brandAsset: {
    flexShrink: 0
  },
  logoMark: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  markW: {
    color: colors.blueDeep,
    fontWeight: "800",
    letterSpacing: 0
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
