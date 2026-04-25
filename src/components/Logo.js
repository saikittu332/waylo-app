import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export default function Logo({ size = "md", light = false, showText = true }) {
  const markSize = size === "lg" ? 126 : size === "sm" ? 38 : 54;
  const textSize = size === "lg" ? 42 : size === "sm" ? 22 : 30;

  return (
    <View style={styles.wrap}>
      <View style={[styles.mark, { width: markSize, height: markSize * 0.88 }]}>
        <View style={[styles.pin, { width: markSize * 0.32, height: markSize * 0.32, borderRadius: markSize * 0.16 }]} />
        <Text style={[styles.w, { fontSize: markSize * 0.62, lineHeight: markSize * 0.68, color: light ? colors.surface : colors.navy }]}>W</Text>
        <View style={[styles.road, { height: markSize * 0.42, borderLeftWidth: markSize * 0.08 }]} />
      </View>
      {showText && <Text style={[styles.text, { fontSize: textSize, color: light ? colors.surface : colors.navy }]}>Waylo</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center"
  },
  mark: {
    alignItems: "center",
    justifyContent: "flex-end"
  },
  pin: {
    backgroundColor: colors.orange,
    position: "absolute",
    top: 0
  },
  w: {
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 56
  },
  road: {
    borderColor: colors.surface,
    borderRadius: 999,
    position: "absolute",
    transform: [{ rotate: "18deg" }],
    bottom: 9
  },
  text: {
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: -4
  }
});
