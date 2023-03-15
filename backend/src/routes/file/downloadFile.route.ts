import { HttpException } from "@/exceptions/HttpException";
import Resource from "@/models/resource.model";
import { recallFileUrl, verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    linkToFile?: string;
    fileType?: string;
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
        const resourceId = req.params.resourceId;

        // Fetch from database
        const myFile = await Resource.findById(resourceId).catch((err) => {
            throw new HttpException(500, "Failed to retrieve file");
        });
        if (myFile === null) throw new HttpException(500, "Cannot find resource");

        if (myFile.stored_name === undefined || myFile.stored_name === "") {
            return res.status(200).json({ linkToFile: "", fileType: "" });
        }

        const fileUrl = await recallFileUrl(myFile.stored_name);

        return res.status(200).json({ linkToFile: fileUrl, fileType: myFile.file_type });
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
