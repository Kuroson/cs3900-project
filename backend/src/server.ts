import { logger } from "@utils/logger";
import { app } from "./app";

const port = process.env.PORT ?? 8080;

app.listen(port, () => {
    logger.info("=================================");
    logger.info(`======= ENV: ${process.env.NODE_ENV} =======`);
    logger.info(`🚀 App listening on the port ${port}`);
    logger.info("=================================");
}).on("error", (err) => {
    logger.error(err.message);
    console.error(err);
});
