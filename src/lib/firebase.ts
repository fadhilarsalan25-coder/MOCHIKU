import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { UserAccount, FlavorId } from "../types";

// User-provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCvw8HLQF8iGXN2xcli7PCisFxHm1d4DkE",
  authDomain: "mochiku-6b3c5.firebaseapp.com",
  projectId: "mochiku-6b3c5",
  storageBucket: "mochiku-6b3c5.firebasestorage.app",
  messagingSenderId: "902753085097",
  appId: "1:902753085097:web:eab8c9f432eaa93e51ebb8",
  measurementId: "G-925SDPSKL1",
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics conditionally
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // analytics unsupported or blocked
    });
}

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Helper to convert a Firebase User object into Mochiku's UserAccount structure
 */
export function formatFirebaseUser(
  fbUser: FirebaseUser,
  customData?: Partial<UserAccount>
): UserAccount {
  const flavor: FlavorId = (customData?.favoriteFlavor as FlavorId) || "strawberry";
  const defaultEmoji =
    flavor === "matcha"
      ? "🍵"
      : flavor === "mango"
      ? "🥭"
      : flavor === "oreo"
      ? "🍪"
      : flavor === "chocolate"
      ? "🍫"
      : "🍓";

  const isGoogle = fbUser.providerData.some(
    (p) => p.providerId === GoogleAuthProvider.PROVIDER_ID
  );

  return {
    id: fbUser.uid,
    name: fbUser.displayName || customData?.name || fbUser.email?.split("@")[0] || "Mochi Lover",
    email: fbUser.email || "member@mochiku.id",
    phone: customData?.phone || fbUser.phoneNumber || "0812-8999-7777",
    defaultAddress: customData?.defaultAddress || "DKI Jakarta, Indonesia",
    favoriteFlavor: flavor,
    points: customData?.points !== undefined ? customData.points : 50, // 50 Welcome bonus
    memberTier: customData?.memberTier || "Silver (Mochi Lover)",
    avatarEmoji: customData?.avatarEmoji || defaultEmoji,
    pictureUrl: fbUser.photoURL || undefined,
    authProvider: isGoogle ? "google" : "email",
    joinedDate: customData?.joinedDate || new Date().toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
  };
}

/**
 * Sign Up with Email and Password using Firebase Auth
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  extraData?: {
    name?: string;
    phone?: string;
    favoriteFlavor?: FlavorId;
    defaultAddress?: string;
  }
): Promise<UserAccount> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (extraData?.name && credential.user) {
    try {
      await updateProfile(credential.user, { displayName: extraData.name });
    } catch {
      // ignore
    }
  }

  return formatFirebaseUser(credential.user, {
    name: extraData?.name,
    phone: extraData?.phone,
    favoriteFlavor: extraData?.favoriteFlavor,
    defaultAddress: extraData?.defaultAddress,
    points: 50,
  });
}

/**
 * Sign In with Email and Password using Firebase Auth
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<UserAccount> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return formatFirebaseUser(credential.user);
}

/**
 * Sign In / Sign Up with Google using Firebase Auth popup (with fallback)
 */
export async function signInWithGooglePopup(): Promise<UserAccount> {
  const credential = await signInWithPopup(auth, googleProvider);
  return formatFirebaseUser(credential.user, {
    points: 50,
  });
}

/**
 * Sign Out from Firebase Auth
 */
export async function logoutFirebaseAuth(): Promise<void> {
  await signOut(auth);
}
