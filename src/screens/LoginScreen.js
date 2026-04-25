import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import Logo from "../components/Logo";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, screen, spacing, typography } from "../constants/theme";
import { sendPhoneOtp, verifyOtp } from "../services/authService";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState(["2", "4", "6", "8", "1", "2"]);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    if (!otpSent) {
      await sendPhoneOtp(phone);
      setOtpSent(true);
      setLoading(false);
      return;
    }
    await verifyOtp("mock-verification-id", code.join(""));
    setLoading(false);
    navigation.navigate("AssistantName");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Logo size="md" />
        <View style={styles.header}>
          <Text style={styles.heading}>Welcome back!</Text>
          <Text style={styles.copy}>Login to continue your journey</Text>
        </View>

        <PremiumCard style={styles.formCard}>
          <Text style={styles.label}>Phone number</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.flag}>US</Text>
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.phoneInput} />
          </View>
          <PrimaryButton title={otpSent ? "Verify OTP" : "Send OTP"} loading={loading} onPress={handleContinue} />

          <Text style={styles.label}>Enter OTP</Text>
          <View style={styles.otpRow}>
            {code.map((digit, index) => (
              <TextInput
                key={String(index)}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(value) => {
                  const next = [...code];
                  next[index] = value;
                  setCode(next);
                }}
                style={styles.otpBox}
                value={digit}
              />
            ))}
          </View>
          <Text style={styles.resend}>Resend OTP in 00:30</Text>
        </PremiumCard>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
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
    flex: 1,
    gap: spacing.lg,
    maxWidth: screen.maxWidth,
    padding: screen.padding,
    width: "100%"
  },
  header: {
    alignItems: "center",
    gap: spacing.xs
  },
  heading: typography.heading,
  copy: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700"
  },
  formCard: {
    gap: spacing.md
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  phoneRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: spacing.md
  },
  flag: {
    color: colors.navy,
    fontWeight: "900",
    marginRight: spacing.md
  },
  phoneInput: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "700"
  },
  otpRow: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  otpBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900",
    height: 46,
    textAlign: "center",
    width: 46
  },
  resend: {
    color: colors.mutedLight,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center"
  },
  terms: {
    color: colors.mutedLight,
    fontSize: 12,
    lineHeight: 18,
    marginTop: "auto",
    textAlign: "center"
  }
});
