import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

const brandLogo = require("../../assets/waylo-brand-logo.png");

export default function Logo({ size = "md", light = false, showText = true, image = false }) {
  if (image) {
    const imageSize = size === "lg" ? 238 : size === "sm" ? 88 : 150;
    return (
      <Image
        accessibilityLabel="Waylo logo"
        resizeMode="contain"
        source={brandLogo}
        style={{ height: imageSize, width: imageSize }}
      />
    );
  }

  const markSize = size === "lg" ? 118 : size === "sm" ? 38 : 54;
  const textSize = size === "lg" ? 40 : size === "sm" ? 22 : 30;
  const textColor = light ? colors.surface : colors.navy;

  return (
    <View style={styles.wrap}>
      <View style={[styles.mark, { width: markSize, height: markSize * 0.76 }]}>
        <Text style={[styles.w, { fontSize: markSize * 0.7, lineHeight: markSize * 0.72 }]}>W</Text>
        <View style={[styles.road, { height: markSize * 0.68, width: markSize * 0.46, right: markSize * 0.02 }]}>
          <View style={styles.roadStripe} />
          <View style={[styles.roadStripe, styles.roadStripeTwo]} />
        </View>
        <View style={[styles.pin, { width: markSize * 0.34, height: markSize * 0.34, borderRadius: markSize * 0.17, right: markSize * 0.01, top: -markSize * 0.08 }]}>
          <View style={[styles.pinHole, { width: markSize * 0.11, height: markSize * 0.11, borderRadius: markSize * 0.055 }]} />
        </View>
      </View>
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
  mark: {
    alignItems: "flex-start",
    justifyContent: "center"
  },
  w: {
    color: colors.blue,
    fontWeight: "900",
    letterSpacing: 0
  },
  road: {
    backgroundColor: colors.navySoft,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 999,
    bottom: 0,
    overflow: "hidden",
    position: "absolute",
    transform: [{ rotate: "28deg" }]
  },
  roadStripe: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    height: 6,
    left: "45%",
    position: "absolute",
    top: "34%",
    transform: [{ rotate: "-16deg" }],
    width: 24
  },
  roadStripeTwo: {
    top: "58%"
  },
  pin: {
    alignItems: "center",
    backgroundColor: colors.green,
    justifyContent: "center",
    position: "absolute"
  },
  pinHole: {
    backgroundColor: colors.surface
  },
  text: {
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: -2
  },
  tealText: {
    color: colors.green
  }
});
