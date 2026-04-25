import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, spacing, typography } from "../constants/theme";
import { sendPhoneOtp, verifyOtp } from "../services/authService";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    if (!otpSent) {
      await sendPhoneOtp(phone);
      setOtpSent(true);
      setLoading(false);
      return;
    }
    await verifyOtp("mock-verification-id", code);
    setLoading(false);
    navigation.navigate("AssistantName");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.heading}>Sign in with your phone</Text>
        <Text style={styles.copy}>Waylo uses phone OTP login. Firebase is mocked for this MVP.</Text>
        <TextInput
          keyboardType="phone-pad"
          onChangeText={setPhone}
          placeholder="+1 555 123 4567"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={phone}
        />
        {otpSent && (
          <TextInput
            keyboardType="number-pad"
            onChangeText={setCode}
            placeholder="Enter OTP"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={code}
          />
        )}
        <PrimaryButton
          title={otpSent ? "Verify and Continue" : "Continue"}
          loading={loading}
          onPress={handleContinue}
        />
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
    fontSize: 17,
    minHeight: 56,
    paddingHorizontal: spacing.md
  }
});
