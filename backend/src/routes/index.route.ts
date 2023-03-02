import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/users.model";
import { app } from "@/utils/firebase";
import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

/**`
 * GET /
 * Home page.
 */
export const indexController = async (req: Request, res: Response): Promise<void> => {
    const user = new User({
        name: "Bill123" + Math.random() * 100,
        email: "bill@initech.com",
        avatar: "https://i.imgur.com/dM7Thhn.png",
    });

    await user
        .save()
        .then((res) => {
            console.log(res);
            return res;
        })
        .catch((err) => {
            console.error(err);
        });
    getAuth(app)
        .verifyIdToken(
            "eyJhbGciOiJSUzI1NiIsImtpZCI6ImY4NzZiNzIxNDAwYmZhZmEyOWQ0MTFmZTYwODE2YmRhZWMyM2IzODIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2Fwc3RvbmUzOTAwMjN0MS1naXRoYXBwZW5zIiwiYXVkIjoiY2Fwc3RvbmUzOTAwMjN0MS1naXRoYXBwZW5zIiwiYXV0aF90aW1lIjoxNjc3NzIyMDM5LCJ1c2VyX2lkIjoiZFVxSURoTlI3MldJVXFsQ1FxbDYxUHJMN3h3MiIsInN1YiI6ImRVcUlEaE5SNzJXSVVxbENRcWw2MVByTDd4dzIiLCJpYXQiOjE2Nzc3MjIwMzksImV4cCI6MTY3NzcyNTYzOSwiZW1haWwiOiJjeXByZXNzQHRlc3QuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImN5cHJlc3NAdGVzdC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.t7BQQIkBadUkUmZLYyC9iM_5f52DkEL4wlCQLR7vYkgmpJIcdMMl2NGhoWzGfLKE-mhyfhl1sgBfmARAFkxOLKkSjAd_sHgGg5bY9_XvVBWTS0TJX1YiwTplN9y5GKaqrvOHTiHeHqUcpj7HhAdeCmN9pWRdQ8NNqQlWngFAaVsCPrTyIWegJzj5FhIbxSfwFg7LDcKN15OhsxMCWmoslVKPQQnxMVpy1TfWIggDqQlYoTCb40_S99nV4WHn18WfCNpkc1R2es-tLNjvmwy_sVb6KWgrY3HN6IKmeQA8-nvFJ5pJozLBU7E6N1K1dy3F3uuGpzNHLnrcvfrvoD9qnQ",
        )
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.error(err);
        });
    res.json({ message: "Hello World" });
};
