import { loginWithPhone } from "./api";

export async function sendPhoneOtp(phoneNumber) {
  // Future Firebase integration: call Firebase Phone Auth here.
  return {
    verificationId: "mock-verification-id",
    phoneNumber
  };
}

export async function verifyOtp(verificationId, code) {
  // Future Firebase integration: verify the OTP credential here.
  return {
    uid: "mock-user-id",
    verificationId,
    code,
    phoneNumber: "+15551234567"
  };
}

export async function completePhoneLogin(phoneNumber) {
  try {
    return await loginWithPhone(phoneNumber);
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
