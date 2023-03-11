import { HttpException } from "@/exceptions/HttpException";
import Resource from "@/models/resource.model";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    message?: string;
};

type QueryPayload = {
    resourceId: string;
};

export const uploadFileController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    try {
        if (isValidBody<QueryPayload>(req.body, ["resourceId"])) {
            // Body has been verified
            const queryBody = req.body;
            const { resourceId } = queryBody;

            // Update in database
            const resource = await Resource.findById(resourceId);
            if (resource === null) throw new Error("Cannot find resource");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resource.stored_name = (req.file as any).fileRef.name;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resource.file_type = (req.file as any).mimetype;

            await resource.save().catch((err) => {
                throw new Error("Failed to save updated resource");
            });

            return res.status(200).json({});
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
