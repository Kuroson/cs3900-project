// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
import sgMail from "@sendgrid/mail";
import { logger } from "./logger";
import validateEnv from "./validateEnv";

const SENDGRID_KEY = (): string => {
    try {
        return validateEnv.SENDGRID_API_KEY !== undefined
            ? JSON.parse(validateEnv.SENDGRID_API_KEY)
            : undefined;
    } catch (err) {
        return validateEnv.SENDGRID_API_KEY ?? "";
    }
};
sgMail.setApiKey(SENDGRID_KEY());

type RecipientType = {
    email: string;
    name: string;
};

export type RecipientsType = Array<RecipientType>;

export const sendEmail = (recipients: RecipientsType, subject: string, text: string) => {
    const msg = {
        to: recipients,
        from: "cs3900githappens23t1@gmail.com", // Verified sender on sendgrid
        subject: subject,
        text: text,
        // html: "<strong></strong>",
    };

    sgMail
        .send(msg)
        .then(() => {
            logger.info("Email sent");
        })
        .catch((error) => {
            logger.error(error);
        });
};
