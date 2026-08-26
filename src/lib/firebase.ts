import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  type Auth,
} from "firebase/auth";
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
} from "@/lib/env";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseWebConfigured() {
  return Boolean(
    FIREBASE_API_KEY &&
      FIREBASE_AUTH_DOMAIN &&
      FIREBASE_PROJECT_ID &&
      FIREBASE_APP_ID,
  );
}

function getFirebaseAuth(): Auth {
  if (!isFirebaseWebConfigured()) {
    throw new Error(
      "Firebase web config missing. Set NEXT_PUBLIC_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, and APP_ID.",
    );
  }
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        apiKey: FIREBASE_API_KEY,
        authDomain: FIREBASE_AUTH_DOMAIN,
        projectId: FIREBASE_PROJECT_ID,
        appId: FIREBASE_APP_ID,
      });
  }
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
}

/**
 * GIS `credential` is a Google OAuth ID token.
 * Nest `POST /auth/google` verifies a Firebase ID token via Admin SDK.
 * Exchange here so web matches Android / the API contract.
 */
export async function firebaseIdTokenFromGoogleCredential(
  googleIdToken: string,
): Promise<string> {
  const credential = GoogleAuthProvider.credential(googleIdToken);
  const result = await signInWithCredential(getFirebaseAuth(), credential);
  return result.user.getIdToken();
}
