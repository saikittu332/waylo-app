import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../components/Logo";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, screen, spacing, typography } from "../constants/theme";
import { normalizePhone } from "../services/api";
import { completePhoneLogin, getAuthErrorMessage, logAuthDiagnostic, sendPhoneOtp, verifyOtp } from "../services/authService";

function getUsPhoneDigits(value) {
  const digits = value.replace(/\D/g, "");

  if (digits.length > 10 && digits.startsWith("1")) {
    return digits.slice(1, 11);
  }

  return digits.slice(0, 10);
}

function formatUsPhone(value) {
  const digits = getUsPhoneDigits(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");

  async function handleContinue() {
    const digits = getUsPhoneDigits(phone);
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit US phone number.");
      return;
    }
    if (otpSent && code.join("").length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setError("");
    setLoading(true);
    const normalizedPhone = normalizePhone(digits);

    try {
      if (!otpSent) {
        const nextConfirmation = await sendPhoneOtp(normalizedPhone);
        setPhone(formatUsPhone(normalizedPhone));
        setConfirmation(nextConfirmation);
        setOtpSent(true);
        return;
      }

      const firebaseUser = await verifyOtp(confirmation, code.join(""));
      const session = await completePhoneLogin(normalizedPhone, firebaseUser);
      navigation.navigate("AssistantName", { user: session.user, accessToken: session.access_token });
    } catch (authError) {
      console.warn("Waylo phone auth failed:", authError);
      logAuthDiagnostic(authError);
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoading(false);
    }
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
            <View style={styles.countryCode}>
              <Text style={styles.countryLabel}>US</Text>
              <Text style={styles.countryDial}>+1</Text>
            </View>
            <TextInput
              placeholder="(555) 123-4567"
              placeholderTextColor={colors.mutedLight}
              value={phone}
              onChangeText={(value) => setPhone(formatUsPhone(value))}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              style={styles.phoneInput}
            />
          </View>
          <Text style={styles.phoneHint}>Waylo currently supports US phone numbers for SMS verification.</Text>
          <PrimaryButton title={otpSent ? "Verify OTP" : "Send OTP"} loading={loading} onPress={handleContinue} />
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {otpSent ? (
            <>
              <View style={styles.sentBanner}>
                <Ionicons color={colors.green} name="shield-checkmark-outline" size={18} />
                <Text style={styles.sentBannerText}>Code sent. Enter any 6 digits in Expo Go, or the real SMS code in the development build.</Text>
              </View>
              <Text style={styles.label}>Enter OTP</Text>
              <View style={styles.otpRow}>
                {code.map((digit, index) => (
                  <TextInput
                    key={String(index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    onChangeText={(value) => {
                      const next = [...code];
                      next[index] = value.replace(/\D/g, "");
                      setCode(next);
                    }}
                    style={styles.otpBox}
                    value={digit}
                  />
                ))}
              </View>
              <Text style={styles.resend}>Resend OTP in 00:30</Text>
            </>
          ) : (
            <View style={styles.otpPreview}>
              <Text style={styles.otpPreviewTitle}>Secure phone verification</Text>
              <Text style={styles.otpPreviewText}>Code entry appears after you send a verification code.</Text>
            </View>
          )}
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
  countryCode: {
    alignItems: "center",
    borderColor: colors.border,
    borderRightWidth: 1,
    gap: 1,
    justifyContent: "center",
    marginRight: spacing.md,
    minHeight: 34,
    paddingRight: spacing.md
  },
  countryLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "600"
  },
  countryDial: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: "600"
  },
  phoneInput: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "500"
  },
  phoneHint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
    marginTop: -spacing.xs
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
  sentBanner: {
    alignItems: "flex-start",
    backgroundColor: colors.paleGreen,
    borderColor: "rgba(18,184,134,0.16)",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  sentBannerText: {
    color: colors.navy,
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17
  },
  otpPreview: {
    backgroundColor: colors.paleBlue,
    borderColor: "rgba(47,128,237,0.14)",
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 3,
    padding: spacing.md
  },
  otpPreviewTitle: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: "600"
  },
  otpPreviewText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17
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
