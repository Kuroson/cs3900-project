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
    res.json({ message: "Hello World" });
};
