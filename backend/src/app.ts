/* eslint-disable max-len */
import errorMiddleware from "@middlewares/error.middleware";
import { indexRouter } from "@routes/index";
import { logger, stream } from "@utils/logger";
import validateEnv from "@utils/validateEnv";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import { connect, set } from "mongoose";
import morgan from "morgan";
import { exit } from "process";

export const app = express();

app.use("/public", express.static("public")); // https://github.com/expressjs/cors/issues/104
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(morgan("dev", { stream }));
app.use(cors({ origin: "*", credentials: true }));
app.use(hpp());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorMiddleware);

const MONGO_DB_NAME = "SPRINT3";

const externalMongoDBURI = `mongodb+srv://${validateEnv.MONGODB_USERNAME}:${validateEnv.MONGODB_PASSWORD}@githappenscluster.zpjbjkc.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`;
const internalMongoDBURI = `mongodb://root:password@${
    validateEnv.USE_DOCKER_INTERNAL_MONGO ? "mongodb" : "localhost"
}:27017/?directConnection=true`;

export const startupTime = new Date();
set("strictQuery", true); // Suppress Mongoose deprecation warning for v7

connect(validateEnv.USE_LOCAL_MONGO ? internalMongoDBURI : externalMongoDBURI)
    .then(() => {
        logger.info(
            `Connected to ${validateEnv.USE_LOCAL_MONGO ? "internal" : "external"} MongoDB`,
        );
        if (validateEnv.USE_LOCAL_MONGO) {
            logger.info("MongoDB URI: " + internalMongoDBURI);
        }
    })
    .catch((err) => {
        logger.error("Failed to connected to MongoDB");
        logger.error(err);
        exit(1);
    });

// Add routes
app.use("/", indexRouter);

// Ensure this is last
app.get("*", (req, res) => {
    return res.status(404).json({ message: "Route does not exist" });
});
