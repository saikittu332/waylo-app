import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, spacing, typography } from "../constants/theme";

const suggestions = ["Waylo", "Scout", "Milewise", "Atlas"];

export default function AssistantNameScreen({ navigation }) {
  const [assistantName, setAssistantName] = useState("Waylo");

  function saveName() {
    navigation.navigate("VehicleSetup", {
      assistantName: assistantName.trim() || "Waylo"
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.heading}>What would you like to call your assistant?</Text>
        <Text style={styles.copy}>You can personalize the assistant, and Waylo stays as the backup name.</Text>
        <TextInput
          onChangeText={setAssistantName}
          placeholder="Waylo"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={assistantName}
        />
        <View style={styles.suggestions}>
          {suggestions.map((name) => (
            <Pressable
              key={name}
              onPress={() => setAssistantName(name)}
              style={[styles.chip, assistantName === name && styles.activeChip]}
            >
              <Text style={[styles.chipText, assistantName === name && styles.activeChipText]}>{name}</Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton title="Save Assistant Name" onPress={saveName} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  container: {
    gap: spacing.md,
    padding: spacing.lg
  },
  heading: {
    ...typography.heading,
    marginTop: spacing.lg
  },
  copy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    minHeight: 56,
    paddingHorizontal: spacing.md
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  activeChip: {
    backgroundColor: colors.navy,
    borderColor: colors.navy
  },
  chipText: {
    color: colors.text,
    fontWeight: "800"
  },
  activeChipText: {
    color: colors.surface
  }
});
