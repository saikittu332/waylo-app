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
