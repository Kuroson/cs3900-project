import { config } from "dotenv";
import { bool, cleanEnv, port, str } from "envalid";

config({ path: ".env" });

const validateEnv = cleanEnv(process.env, {
    NODE_ENV: str({ default: "development" }),
    PORT: port({ default: 8080 }),
    FIREBASE_PRIVATE_KEY: str(),
    FIREBASE_PROJECT_ID: str(),
    FIREBASE_CLIENT_EMAIL: str(),
    MONGODB_USERNAME: str(),
    MONGODB_PASSWORD: str(),
    USE_LOCAL_MONGO: bool({ default: false }),
    USE_DOCKER_INTERNAL_MONGO: bool({ default: false }),
    SENDGRID_API_KEY: str(),
});

export default validateEnv;
