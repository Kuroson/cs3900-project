// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
import sgMail from "@sendgrid/mail";
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

export const sendEmail = () => {
    const recipients = [
        {
            email: "cs3900githappens23t1@gmail.com",
            name: "Git Happens",
        },
        // Add more recipients as needed
    ];

    const msg = {
        to: recipients,
        from: "cs3900githappens23t1@gmail.com", // Verified sender on sendgrid
        subject: "Sending with SendGrid is Fun",
        text: "and easy to do anywhere, even with Node.js",
        html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    sgMail
        .send(msg)
        .then(() => {
            console.log("Email sent");
        })
        .catch((error) => {
            console.error(error);
        });
};
