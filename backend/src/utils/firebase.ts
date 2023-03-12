import { HttpException } from "@/exceptions/HttpException";
import validateEnv from "@utils/validateEnv";
import { Request } from "express";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import multer from "multer";
import FirebaseStorage from "multer-firebase-storage";

const credentials = {
    projectId: validateEnv.FIREBASE_PROJECT_ID,
    privateKey: JSON.parse(validateEnv.FIREBASE_PRIVATE_KEY),
    clientEmail: validateEnv.FIREBASE_CLIENT_EMAIL,
};

export const app = initializeApp({
    credential: cert(credentials),
    storageBucket: "gs://capstone390023t1-githappens.appspot.com",
});

export const firebaseUpload = multer({
    storage: FirebaseStorage({
        bucketName: "gs://capstone390023t1-githappens.appspot.com",
        credentials,
        unique: true,
        hooks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            beforeUpload: async (req: Request, file: any) => {
                // Verify token
                if (req.headers.authorization === undefined)
                    throw new HttpException(405, "No authorization header found");

                const token = req.headers.authorization.split(" ")[1];
                await verifyIdTokenValid(token);
            },
        },
    }),
});

const auth = getAuth(app);
const bucket = getStorage(app).bucket();

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

/**
 * Fetches a download URL of the specified file
 *
 * @param fileName The name of the file (as stored in firebase storage)
 */
export const recallFileUrl = async (fileName: string) => {
    const file = bucket.file(fileName);

    const expiry_date = new Date();
    expiry_date.setDate(expiry_date.getDate() + 3);
    const expiry = `${
        expiry_date.getMonth() + 1
    }-${expiry_date.getDate()}-${expiry_date.getFullYear()}`;

    return await file
        .getSignedUrl({
            action: "read",
            expires: expiry,
        })
        .then((signedUrls) => {
            return signedUrls[0];
        })
        .catch((err) => {
            throw new HttpException(500, "Failed to retrieve file");
        });
};
