import { loginWithFirebaseToken, loginWithPhone } from "./api";

const OTP_REQUEST_TIMEOUT_MS = 45000;

function getErrorText(error) {
  return [
    error?.code,
    error?.nativeErrorCode,
    error?.nativeErrorMessage,
    error?.message,
    error?.userInfo ? JSON.stringify(error.userInfo) : ""
  ]
    .filter(Boolean)
    .join(" ");
}

export function logAuthDiagnostic(error) {
  const diagnostic = {
    code: error?.code,
    message: error?.message,
    nativeErrorCode: error?.nativeErrorCode,
    nativeErrorMessage: error?.nativeErrorMessage,
    userInfo: error?.userInfo,
    name: error?.name
  };

  console.warn("Waylo Firebase auth diagnostic:", diagnostic);
}

function getNativeFirebaseAuthModule() {
  try {
    return require("@react-native-firebase/auth");
  } catch (error) {
    console.warn("Native Firebase Auth is unavailable in this runtime:", error.message);
    return null;
  }
}

function withTimeout(promise, timeoutMessage) {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), OTP_REQUEST_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export function getAuthErrorMessage(error) {
  const message = getErrorText(error);

  if (message.includes("timed out")) {
    return "SMS verification is taking too long. Check that Phone Authentication is enabled in Firebase, your iPhone has network access, and this dev build was made after adding Firebase.";
  }

  if (message.includes("auth/invalid-phone-number")) {
    return "Enter the phone number in a valid US format.";
  }

  if (message.includes("auth/too-many-requests")) {
    return "Firebase temporarily blocked requests from this device. Wait a bit, then try again.";
  }

  if (message.includes("auth/quota-exceeded")) {
    return "Firebase SMS quota was exceeded for this project.";
  }

  if (message.includes("auth/app-not-authorized")) {
    return "This app build is not authorized for Firebase. Check the iOS bundle ID and GoogleService-Info.plist.";
  }

  if (message.includes("auth/operation-not-allowed")) {
    return "Phone sign-in is not enabled for this Firebase project. In Firebase Console, enable Authentication > Sign-in method > Phone.";
  }

  if (message.includes("auth/internal-error")) {
    return "Firebase could not complete iOS phone verification. Confirm the APNs auth key is uploaded to the Waylo iOS app in Firebase, Push Notifications are enabled for bundle ID com.saikittu332.waylo, then rebuild the development app.";
  }

  if (message.includes("auth/invalid-verification-code")) {
    return "That verification code is not valid. Try the latest SMS code.";
  }

  return message || "Phone verification failed. Please try again.";
}

export async function sendPhoneOtp(phoneNumber) {
  const authModule = getNativeFirebaseAuthModule();

  if (authModule?.getAuth && authModule?.signInWithPhoneNumber) {
    return withTimeout(
      authModule.signInWithPhoneNumber(authModule.getAuth(), phoneNumber),
      "Firebase phone verification timed out."
    );
  }

  if (authModule?.default) {
    return withTimeout(
      authModule.default().signInWithPhoneNumber(phoneNumber),
      "Firebase phone verification timed out."
    );
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
    const idToken = await credential.user.getIdToken();
    return {
      idToken,
      uid: credential.user.uid,
      phoneNumber: credential.user.phoneNumber
    };
  }

  // Expo Go fallback only. Real SMS OTP requires the EAS development build.
  return {
    uid: "mock-user-id",
    verificationId: confirmation?.verificationId || "mock-verification-id",
    code,
    phoneNumber: confirmation?.phoneNumber
  };
}

export async function completePhoneLogin(phoneNumber, firebaseUser) {
  try {
    if (firebaseUser?.idToken) {
      return await loginWithFirebaseToken(firebaseUser.idToken);
    }
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
