/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable max-len */
import validateEnv from "@utils/validateEnv";
import { connect } from "mongoose";

const initialiseMongoose = async () => {
    const mongoDBURI = `mongodb+srv://${validateEnv.MONGODB_USERNAME}:${validateEnv.MONGODB_PASSWORD}@githappenscluster.zpjbjkc.mongodb.net/?retryWrites=true&w=majority`;
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
