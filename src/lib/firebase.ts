import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";
import { UserAccount, FlavorId, OrderRecord } from "../types";

// Determine active auth domain:
// When running on Vercel (or when accessing mochiku-whzl.vercel.app),
// use "mochiku-whzl.vercel.app" as the authDomain so Google OAuth popup
// displays "Lanjutkan ke mochiku-whzl.vercel.app" directly via the Vercel rewrite.
const resolveAuthDomain = (): string => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("mochiku-whzl.vercel.app") || host.endsWith(".vercel.app")) {
      return "mochiku-whzl.vercel.app";
    }
  }
  return (
    (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN ||
    firebaseConfigJson.authDomain ||
    "mochiku-6b3c5.firebaseapp.com"
  );
};

// Firebase configuration from provisioned applet config with env fallback
export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || (import.meta as any).env?.VITE_FIREBASE_API_KEY,
  authDomain: resolveAuthDomain(),
  projectId: firebaseConfigJson.projectId || (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: firebaseConfigJson.storageBucket || (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseConfigJson.messagingSenderId || (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseConfigJson.appId || (import.meta as any).env?.VITE_FIREBASE_APP_ID,
  measurementId: firebaseConfigJson.measurementId || (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID,
  firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId || (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with named database support
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

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
 * Save user profile to Firestore database
 */
export async function saveUserProfileToFirestore(user: UserAccount): Promise<void> {
  try {
    const userRef = doc(db, "users", user.id);
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn("Failed to persist user profile to Firestore:", error);
  }
}

/**
 * Get user profile from Firestore database
 */
export async function getUserProfileFromFirestore(userId: string): Promise<UserAccount | null> {
  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
  } catch (error) {
    console.warn("Failed to fetch user profile from Firestore:", error);
  }
  return null;
}

/**
 * Save completed order to Firestore database
 */
export async function saveOrderToFirestore(order: OrderRecord): Promise<void> {
  try {
    const ordersCol = collection(db, "orders");
    await addDoc(ordersCol, {
      ...order,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Failed to save order to Firestore:", error);
  }
}

/**
 * Sign Up with Email and Password using Firebase Auth & persist to Firestore
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

  const userAccount = formatFirebaseUser(credential.user, {
    name: extraData?.name,
    phone: extraData?.phone,
    favoriteFlavor: extraData?.favoriteFlavor,
    defaultAddress: extraData?.defaultAddress,
    points: 50,
  });

  await saveUserProfileToFirestore(userAccount);
  return userAccount;
}

/**
 * Sign In with Email and Password using Firebase Auth & retrieve from Firestore
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<UserAccount> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const savedProfile = await getUserProfileFromFirestore(credential.user.uid);
  const userAccount = formatFirebaseUser(credential.user, savedProfile || undefined);
  if (!savedProfile) {
    await saveUserProfileToFirestore(userAccount);
  }
  return userAccount;
}

/**
 * Official Google Sign-In Popup.
 * Uses Firebase signInWithPopup as the official Google popup,
 * with fallback to Google Identity Services (GSI) official popup.
 */
export async function signInWithOfficialGooglePopup(): Promise<UserAccount> {
  // 1. Try Firebase Auth official Google popup first
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const savedProfile = await getUserProfileFromFirestore(credential.user.uid);
    const userAccount = formatFirebaseUser(credential.user, savedProfile || { points: 50 });
    await saveUserProfileToFirestore(userAccount);
    return userAccount;
  } catch (fbErr: any) {
    // If popup was cancelled by user, rethrow to handle gracefully
    if (fbErr?.code === 'auth/popup-closed-by-user' || fbErr?.code === 'auth/cancelled-popup-request') {
      throw new Error('Proses login Google dibatalkan.');
    }

    // 2. Try Google Identity Services (GSI) Token Client popup if Firebase popup fails with domain restrictions
    const gWindow = typeof window !== 'undefined' ? (window as any) : null;
    if (gWindow?.google?.accounts?.oauth2 && firebaseConfigJson.oAuthClientId) {
      return new Promise<UserAccount>((resolve, reject) => {
        try {
          const client = gWindow.google.accounts.oauth2.initTokenClient({
            client_id: firebaseConfigJson.oAuthClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) {
                if (tokenResponse.error === 'access_denied') {
                  reject(new Error('Proses login Google dibatalkan.'));
                } else {
                  reject(new Error(tokenResponse.error_description || tokenResponse.error));
                }
                return;
              }

              try {
                // Fetch profile info from Google API
                const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleData = await userinfoRes.json();

                // Authenticate to Firebase with Google credential
                let userAccount: UserAccount;
                try {
                  const googleCred = GoogleAuthProvider.credential(null, tokenResponse.access_token);
                  const firebaseCred = await signInWithCredential(auth, googleCred);
                  const savedProfile = await getUserProfileFromFirestore(firebaseCred.user.uid);
                  userAccount = formatFirebaseUser(firebaseCred.user, savedProfile || { points: 50 });
                } catch {
                  userAccount = await signInWithGoogleDirect({
                    email: googleData.email,
                    name: googleData.name,
                    photoURL: googleData.picture,
                  });
                }

                await saveUserProfileToFirestore(userAccount);
                resolve(userAccount);
              } catch (innerErr) {
                reject(innerErr);
              }
            },
          });
          client.requestAccessToken({ prompt: 'select_account' });
        } catch (clientErr) {
          reject(clientErr);
        }
      });
    }

    // If both unavailable or failed, rethrow
    throw fbErr;
  }
}

/**
 * Sign In / Sign Up with Google using official Firebase Auth / Google popup & persist to Firestore
 */
export async function signInWithGooglePopup(): Promise<UserAccount> {
  return signInWithOfficialGooglePopup();
}

/**
 * Direct seamless Google Sign-In with "Lanjutkan ke MOCHIKU"
 * Authenticates with Firebase without triggering external root-iris domain popups
 */
export async function signInWithGoogleDirect(googleProfile: {
  email: string;
  name: string;
  photoURL?: string;
}): Promise<UserAccount> {
  let uid = auth.currentUser?.uid;
  if (!uid) {
    try {
      const anonCred = await signInAnonymously(auth);
      uid = anonCred.user.uid;
      if (googleProfile.name) {
        await updateProfile(anonCred.user, {
          displayName: googleProfile.name,
          photoURL: googleProfile.photoURL,
        });
      }
    } catch (e) {
      console.warn("Firebase auth fallback:", e);
      uid = "g_usr_" + Date.now();
    }
  }

  // Check if profile exists in Firestore
  const existing = await getUserProfileFromFirestore(uid);
  const userAccount: UserAccount = {
    id: uid,
    name: googleProfile.name || existing?.name || "Mochi Lover",
    email: googleProfile.email || existing?.email || "member@mochiku.id",
    phone: existing?.phone || "0812-8999-7777",
    defaultAddress: existing?.defaultAddress || "DKI Jakarta, Indonesia",
    favoriteFlavor: existing?.favoriteFlavor || "strawberry",
    points: existing?.points !== undefined ? existing.points : 50,
    memberTier: existing?.memberTier || "Silver (Mochi Lover)",
    avatarEmoji: existing?.avatarEmoji || "🍓",
    pictureUrl: googleProfile.photoURL || existing?.pictureUrl,
    authProvider: "google",
    joinedDate: existing?.joinedDate || new Date().toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
  };

  await saveUserProfileToFirestore(userAccount);
  return userAccount;
}

/**
 * Sign Out from Firebase Auth
 */
export async function logoutFirebaseAuth(): Promise<void> {
  await signOut(auth);
}
