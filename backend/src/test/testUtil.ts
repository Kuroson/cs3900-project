/* eslint-disable max-len */
import validateEnv from "@utils/validateEnv";
import { connect } from "mongoose";

const initialiseMongoose = async () => {
    const mongoDBURI = `mongodb+srv://${validateEnv.MONGODB_USERNAME}:${validateEnv.MONGODB_PASSWORD}@githappenscluster.zpjbjkc.mongodb.net/?retryWrites=true&w=majority`;
    await connect(mongoDBURI);
};

export default initialiseMongoose;
