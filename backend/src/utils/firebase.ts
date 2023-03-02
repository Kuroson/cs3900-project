import validateEnv from "@utils/validateEnv";
import { cert, initializeApp } from "firebase-admin/app";

export const app = initializeApp({
    credential: cert({
        projectId: validateEnv.FIREBASE_PROJECT_ID,
        privateKey: JSON.parse(validateEnv.FIREBASE_PRIVATE_KEY),
        clientEmail: validateEnv.FIREBASE_CLIENT_EMAIL,
    }),
});
