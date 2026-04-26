import { loginWithPhone } from "./api";

function getNativeFirebaseAuth() {
  try {
    const authModule = require("@react-native-firebase/auth");
    return authModule.default();
  } catch (error) {
    console.warn("Native Firebase Auth is unavailable in this runtime:", error.message);
    return null;
  }
}

export async function sendPhoneOtp(phoneNumber) {
  const auth = getNativeFirebaseAuth();
  if (auth) {
    return auth.signInWithPhoneNumber(phoneNumber);
  }

  // Expo Go fallback only. Real SMS OTP requires the EAS development build.
  return {
    verificationId: "mock-verification-id",
    phoneNumber
  };
}

export async function verifyOtp(confirmation, code) {
  if (confirmation?.confirm) {
    const credential = await confirmation.confirm(code);
    return {
      uid: credential.user.uid,
      phoneNumber: credential.user.phoneNumber
    };
  }

  // Expo Go fallback only. Real SMS OTP requires the EAS development build.
  return {
    uid: "mock-user-id",
    verificationId: confirmation?.verificationId || "mock-verification-id",
    code,
    phoneNumber: "+15551234567"
  };
}

export async function completePhoneLogin(phoneNumber, firebaseUser) {
  try {
    return await loginWithPhone(firebaseUser?.phoneNumber || phoneNumber);
  } catch (error) {
    console.warn("Waylo API login unavailable:", error.message);
    return {
      access_token: "mock-token-offline",
      token_type: "bearer",
      user: {
        id: null,
        phone: phoneNumber,
        name: "Sai",
        assistant_name: "Waylo"
      }
    };
  }
}
