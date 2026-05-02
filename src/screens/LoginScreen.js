import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../components/Logo";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, screen, spacing, typography } from "../constants/theme";
import { completePhoneLogin, sendPhoneOtp, verifyOtp } from "../services/authService";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");

  async function handleContinue() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid US phone number.");
      return;
    }
    if (otpSent && code.join("").length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setError("");
    setLoading(true);
    if (!otpSent) {
      const nextConfirmation = await sendPhoneOtp(phone);
      setConfirmation(nextConfirmation);
      setOtpSent(true);
      setLoading(false);
      return;
    }
    const firebaseUser = await verifyOtp(confirmation, code.join(""));
    const session = await completePhoneLogin(phone, firebaseUser);
    setLoading(false);
    navigation.navigate("AssistantName", { user: session.user, accessToken: session.access_token });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo size="md" />
          <Text style={styles.heading}>Welcome back!</Text>
          <Text style={styles.copy}>Login to continue your journey</Text>
        </View>

        <PremiumCard style={styles.formCard}>
          <Text style={styles.label}>Phone number</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.flag}>US</Text>
            <TextInput placeholder="+1 (555) 123-4567" placeholderTextColor={colors.mutedLight} value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.phoneInput} />
          </View>
          <PrimaryButton title={otpSent ? "Verify OTP" : "Send OTP"} loading={loading} onPress={handleContinue} />
          {!!error && <Text style={styles.errorText}>{error}</Text>}

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
    maxWidth: screen.maxWidth,
    minHeight: "100%",
    padding: screen.padding,
    width: "100%"
  },
  header: {
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.lg
  },
  heading: typography.heading,
  copy: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "500"
  },
  formCard: {
    gap: spacing.md
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500"
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
    fontWeight: "500",
    marginRight: spacing.md
  },
  phoneInput: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "500"
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
    fontWeight: "500",
    height: 46,
    textAlign: "center",
    width: 46
  },
  resend: {
    color: colors.mutedLight,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center"
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: "500"
  },
  terms: {
    color: colors.mutedLight,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xl,
    textAlign: "center"
  }
});
