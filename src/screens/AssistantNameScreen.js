import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, spacing, typography } from "../constants/theme";
import { updateUser } from "../services/api";

const suggestions = ["Waylo", "Scout", "Milewise", "Atlas"];

export default function AssistantNameScreen({ navigation, route }) {
  const user = route.params?.user;
  const [assistantName, setAssistantName] = useState("Waylo");

  async function saveName() {
    const nextName = assistantName.trim() || "Waylo";
    let nextUser = user ? { ...user, assistant_name: nextName } : user;
    if (user?.id) {
      try {
        nextUser = await updateUser(user.id, { assistant_name: nextName });
      } catch (error) {
        console.warn("Waylo API assistant update unavailable:", error.message);
      }
    }
    navigation.navigate("VehicleSetup", {
      assistantName: nextName,
      user: nextUser
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
        <PrimaryButton title="Skip for Now" variant="secondary" onPress={() => navigation.navigate("VehicleSetup", { assistantName: "Waylo", user })} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.appBackground,
    flex: 1
  },
  container: {
    alignSelf: "center",
    gap: spacing.md,
    maxWidth: 430,
    minHeight: "100%",
    padding: spacing.lg,
    width: "100%"
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
    fontWeight: "700"
  },
  activeChipText: {
    color: colors.surface
  }
});
