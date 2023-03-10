import { HttpException } from "@/exceptions/HttpException";
import Resource from "@/models/resource.model";
import { recallFileUrl, verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    linkToFile?: string;
    message?: string;
};

type QueryPayload = {
    resourceId: string;
};

export const downloadFileController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    try {
        if (req.headers.authorization === undefined)
            throw new HttpException(405, "No authorization header found");

        // Verify token
        const token = req.headers.authorization.split(" ")[1];
        const authUser = await verifyIdTokenValid(token);

        // User has been verified
        if (isValidBody<QueryPayload>(req.query, ["resourceId"])) {
            // Body has been verified
            const queryBody = req.query;
            const { resourceId } = queryBody;

            console.log(resourceId); // TODO: remove

            // Update in database
            const storedName = await Resource.findById(resourceId)
                .then((res) => {
                    if (res === null) throw new Error("Cannot find resource");
                    return res.stored_name;
                })
                .catch((err) => {
                    throw new Error("Failed to retrieve file");
                });

            const fileUrl = await recallFileUrl(storedName);

            return res.status(200).json({ linkToFile: fileUrl });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, ["resourceId"])}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res.status(error.getStatusCode()).json({ message: error.getMessage() });
        } else {
            logger.error(error);
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};
