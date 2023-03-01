import { initializeApp } from "firebase-admin/app";

const firebaseConfig = {
    apiKey: "AIzaSyA8ZhV0JWeXho7yZ_y9D201BNsTB_VP-0g",
    authDomain: "capstone390023t1-githappens.firebaseapp.com",
    projectId: "capstone390023t1-githappens",
    storageBucket: "capstone390023t1-githappens.appspot.com",
    messagingSenderId: "913063051631",
    appId: "1:913063051631:web:5330462318bbbd2108689a",
    measurementId: "G-PCLLHRRG4Q",
};

export const app = initializeApp(firebaseConfig);
