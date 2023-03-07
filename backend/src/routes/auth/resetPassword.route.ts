// NOTE: This is not needed, just leaving this here if we want to send mail manually.

// import { HttpException } from "@/exceptions/HttpException";
// import { logger } from "@/utils/logger";
// import { getMissingBodyIDs, isValidBody } from "@/utils/util";
// import { Request, Response } from "express";
// import { getAuth } from "firebase-admin/auth";

// type ResponsePayload = {
//     message: string;
// };

// type QueryPayload = {
//     email: string;
// };

// const requestPasswordReset = async (email: string): Promise<void> => {
//     // await getAuth()
//     //     .generatePasswordResetLink(email)
//     //     .then((link) => {
//     //         logger.info(`Generated a reset link for ${email}`);
//     //         logger.info(link);
//     //     })
//     //     .catch((err) => {
//     //         logger.error(err);
//     //     });
//     return;
// };

// export const resetPasswordController = async (
//     req: Request<QueryPayload>,
//     res: Response<ResponsePayload>,
// ) => {
//     try {
//         if (req.method !== "POST") throw new HttpException(405, "Method not allowed");

//         if (isValidBody<QueryPayload>(req.body, ["email"])) {
//             const { email } = req.body;
//             await requestPasswordReset(email);
//             return res.status(200).json({ message: "Success" });
//         } else {
//             throw new HttpException(
//                 400,
//                 `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, ["email"])}`,
//             );
//         }
//     } catch (error) {
//         if (error instanceof HttpException) {
//             logger.error(error.getMessage());
//             logger.error(error.originalError);
//             return res.status(error.getStatusCode()).json({ message: error.getMessage() });
//         } else {
//             logger.error(error);
//             return res.status(500).json({ message: "Internal server error. Error was not caught" });
//         }
//     }
// };
