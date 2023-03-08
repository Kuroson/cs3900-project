import { HttpException } from "@/exceptions/HttpException";
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

/**
 * @deprecated Use verifyIdTokenValid instead
 * @param token
 * @returns
 */
export const verifyIdToken = (token: string) => {
    return auth.verifyIdToken(token);
};

/**
 * Verifies the firebase id `token`
 * @throws HttpException if token is invalid or expired
 * @param token token to validate
 * @returns
 */
export const verifyIdTokenValid = async (token: string) => {
    return auth
        .verifyIdToken(token)
        .then((res) => {
            if (res.id === null || res.email === null) {
                throw new HttpException(401, "Expired token");
            }
            return res;
        })
        .catch((err) => {
            throw new HttpException(401, "Invalid token", err);
        });
};
