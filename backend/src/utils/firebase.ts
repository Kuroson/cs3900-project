import { cert, initializeApp } from "firebase-admin/app";
import validateEnv from "./validateEnv";

// const firebaseConfig = {
//     apiKey: "AIzaSyA8ZhV0JWeXho7yZ_y9D201BNsTB_VP-0g",
//     authDomain: "capstone390023t1-githappens.firebaseapp.com",
//     projectId: "capstone390023t1-githappens",
//     storageBucket: "capstone390023t1-githappens.appspot.com",
//     messagingSenderId: "913063051631",
//     appId: "1:913063051631:web:5330462318bbbd2108689a",
//     measurementId: "G-PCLLHRRG4Q",
// };

export const app = initializeApp({
    credential: cert({
        projectId: validateEnv.FIREBASE_PROJECT_ID,
        privateKey: JSON.parse(validateEnv.FIREBASE_PRIVATE_KEY),
        clientEmail: validateEnv.FIREBASE_CLIENT_EMAIL,
    }),
});
