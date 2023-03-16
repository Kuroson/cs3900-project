/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable max-len */
import validateEnv from "@utils/validateEnv";
import { connect, set } from "mongoose";

const initialiseMongoose = async () => {
    const MONGO_DB_NAME = "jestTesting";
    const mongoDBURI = `mongodb+srv://${validateEnv.MONGODB_USERNAME}:${validateEnv.MONGODB_PASSWORD}@githappenscluster.zpjbjkc.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`;
    set("strictQuery", true); // Suppress Mongoose deprecation warning for v7
    await connect(mongoDBURI);
};

/**
 * Attempts to stringify and parse `a` into a string
 * @param a
 */
export const stringifyOutput = (a: any) => {
    return JSON.parse(JSON.stringify(a));
};

export default initialiseMongoose;
