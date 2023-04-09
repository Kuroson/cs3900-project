import { logger } from "@utils/logger";
import validateEnv from "@utils/validateEnv";
import cron from "cron";
import { app } from "./app";
import { checkWorkloadNotifications } from "./utils/scheduler";

const port = process.env.PORT ?? 8080;

app.listen(port, () => {
    logger.info("=================================");
    logger.info(`======= ENV: ${validateEnv.NODE_ENV} =======`);
    logger.info(`🚀 App listening on the port ${port}`);
    if (validateEnv.NODE_ENV === "development") {
        logger.info(`== Visit http://localhost:${port} ==`);
    }
    logger.info("=================================");
}).on("error", (err) => {
    logger.error(err.message);
    console.error(err);
});

new cron.CronJob("0 * * * *", async () => {
    await checkWorkloadNotifications();
}).start();
