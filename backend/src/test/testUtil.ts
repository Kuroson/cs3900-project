/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable max-len */
import { HttpException } from "@/exceptions/HttpException";
import User, { INSTRUCTOR_ROLE, STUDENT_ROLE } from "@/models/user.model";
import { logger } from "@/utils/logger";
import validateEnv from "@utils/validateEnv";
import { connect, set } from "mongoose";

const initialiseMongoose = async () => {
    const MONGO_DB_NAME = "jestTesting";
    const externalMongoDBURI = `mongodb+srv://${validateEnv.MONGODB_USERNAME}:${validateEnv.MONGODB_PASSWORD}@githappenscluster.zpjbjkc.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`;
    const internalMongoDBURI = `mongodb://root:password@${
        validateEnv.USE_DOCKER_INTERNAL_MONGO ? "mongodb" : "localhost"
    }:27017/?directConnection=true`;
    set("strictQuery", true); // Suppress Mongoose deprecation warning for v7
    await connect(validateEnv.USE_LOCAL_MONGO ? internalMongoDBURI : externalMongoDBURI);
};

/**
 * Attempts to stringify and parse `a` into a string
 * @param a
 */
export const stringifyOutput = (a: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(JSON.stringify(a));
};

export default initialiseMongoose;

type RegisterMultipleUsersPayload = {
    firstName: string;
    lastName: string;
    email: string;
    firebaseUID: string;
};

/**
 * Handy function to generate element for registerMultipleUsersTestingOnly
 * @param firstName
 * @param lastName
 * @param email
 * @param firebaseUID
 * @returns
 */
export const genUserTestOnly = (
    firstName: string,
    lastName: string,
    email: string,
    firebaseUID: string,
): RegisterMultipleUsersPayload => {
    return {
        firstName: firstName,
        lastName: lastName,
        email: email,
        firebaseUID: firebaseUID,
    };
};

/**
 * Testing function to register multiple users
 * @param userData user data as an array
 */
export const registerMultipleUsersTestingOnly = async (
    userData: RegisterMultipleUsersPayload[],
): Promise<void> => {
    const parsedUserData = userData.map((x) => {
        const role = x.email.toLowerCase().includes("admin") ? INSTRUCTOR_ROLE : STUDENT_ROLE;
        const userData = {
            firebase_uid: x.firebaseUID,
            first_name: x.firstName,
            last_name: x.lastName,
            email: x.email,
            enrolments: [],
            role: role,
            avatar: "", // TODO
        };
        return userData;
    });

    await User.insertMany(parsedUserData)
        .then((res) => {
            return res;
        })
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Could not create new user", err);
        });
};
