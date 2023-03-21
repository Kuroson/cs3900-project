import { HttpException } from "@/exceptions/HttpException";
import Resource from "@/models/course/page/resource.model";
import { recallFileUrl } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    success: boolean;
    file_type: string;
    download_link: string; // i.e., download link
};

type QueryPayload = {
    resourceId: string;
};

/**
 * POST /file/upload
 * Requested link for new file upload and add to entry to database
 * @param req
 * @param res
 * @returns
 */
export const uploadFileController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["resourceId"];
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const { resourceId } = req.body;

            // Update in database
            const resource = await Resource.findById(resourceId).catch(() => null);
            if (resource === null)
                throw new HttpException(400, `Cannot find resource of ${resourceId}`);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resource.stored_name = (req.file as any).fileRef.name;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resource.file_type = (req.file as any).mimetype;

            await resource.save().catch((err) => {
                throw new HttpException(500, "Failed to save updated resource", err);
            });

            // Get download link and type
            const fileLink = await recallFileUrl(resource.stored_name ?? "");

            return res.status(200).json({
                success: true,
                download_link: fileLink,
                file_type: resource.file_type ?? "",
            });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, KEYS_TO_CHECK)}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res
                .status(error.getStatusCode())
                .json({ message: error.getMessage(), success: false });
        } else {
            logger.error(error);
            return res
                .status(500)
                .json({ message: "Internal server error. Error was not caught", success: false });
        }
    }
};
