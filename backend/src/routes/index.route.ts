import { HttpException } from "@/exceptions/HttpException";
import { app } from "@/utils/firebase";
import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

/**`
 * GET /
 * Home page.
 */
export const indexController = async (req: Request, res: Response): Promise<void> => {
    // const user = new User({
    //     name: "Bill123" + Math.random() * 100,
    //     email: "bill@initech.com",
    //     avatar: "https://i.imgur.com/dM7Thhn.png",
    // });

    // await user
    //     .save()
    //     .then((res) => {
    //         console.log(res);
    //         return res;
    //     })
    //     .catch((err) => {
    //         console.error(err);
    //     });
    getAuth(app)
        .verifyIdToken(
            "eyJhbGciOiJSUzI1NiIsImtpZCI6ImY4NzZiNzIxNDAwYmZhZmEyOWQ0MTFmZTYwODE2YmRhZWMyM2IzODIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2Fwc3RvbmUzOTAwMjN0MS1naXRoYXBwZW5zIiwiYXVkIjoiY2Fwc3RvbmUzOTAwMjN0MS1naXRoYXBwZW5zIiwiYXV0aF90aW1lIjoxNjc3NjcxMzU1LCJ1c2VyX2lkIjoiZFVxSURoTlI3MldJVXFsQ1FxbDYxUHJMN3h3MiIsInN1YiI6ImRVcUlEaE5SNzJXSVVxbENRcWw2MVByTDd4dzIiLCJpYXQiOjE2Nzc2NzUxMTcsImV4cCI6MTY3NzY3ODcxNywiZW1haWwiOiJjeXByZXNzQHRlc3QuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImN5cHJlc3NAdGVzdC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.CNf34zGbpeRBMxlO-oCy6iqe-0LV60NrC9uPoZUIMftYPygdmWrptTC3RjjO-L3BxLEsPVE4OeRRVyGhfPnLfk0r1BB7AsgSQCbewV8bkOxTXex28HJFZgXw2V4KqTaXqrVio94ZCveJHFbT8hxGbNEbMj2OXiYx2LfC94AyKlDJxgntf_tU6pEZfSLfMqPqeFF5kVum9prL3u01iQQqOoQ72vEigXWUZKvT331cUji2Y-F1GkZi8CV9zhfp9-5tgHw3gETJJcdVYjrzjKGOgghsxeKqg4WVmHTbX_ljrvo0Jo4Go9FdznkPcxbEH7UgfDDPnMAg5Y0ioFxV5Yc4vQ",
        )
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.error(res);
        });
    res.json({ message: "Hello World" });
};
