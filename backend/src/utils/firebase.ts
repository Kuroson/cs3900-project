import validateEnv from "@utils/validateEnv";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export const app = initializeApp({
    credential: cert({
        projectId: validateEnv.FIREBASE_PROJECT_ID,
        privateKey: JSON.parse(validateEnv.FIREBASE_PRIVATE_KEY),
        clientEmail: validateEnv.FIREBASE_CLIENT_EMAIL,
    }),
});

const auth = getAuth(app);

export const verifyIdToken = (token: string) => {
    return auth.verifyIdToken(token);
};
