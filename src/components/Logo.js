import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

const brandLogo = require("../../assets/waylo-brand-logo.png");

export default function Logo({ size = "md", light = false, showText = true, image = false }) {
  if (image) {
    const imageSize = size === "lg" ? 210 : size === "sm" ? 82 : 132;
    return (
      <Image
        accessibilityLabel="Waylo logo"
        resizeMode="contain"
        source={brandLogo}
        style={{ height: imageSize, width: imageSize }}
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
  text: {
    fontWeight: "700",
    letterSpacing: 0,
    marginTop: -2
  },
  tealText: {
    color: colors.green
  }
});
