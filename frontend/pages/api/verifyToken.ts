import { NextApiRequest, NextApiResponse } from "next";
import { verifyIdToken } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import initAuth from "util/firebase";

// the module you created above

initAuth();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.headers.authorization === undefined)
      throw new HttpException(401, "No authorization header found");

    const token = req.headers.authorization.split(" ")[1];
    await verifyIdToken(token)
      .then((res) => {
        if (res.id === null || res.email === null) {
          throw new HttpException(401, "Expired token");
        }
        return res;
      })
      .catch((err) => {
        throw new HttpException(401, "Invalid token", err);
      });
  } catch (err) {
    if (err instanceof HttpException) {
      return res.status(err.status).json({ message: err.message });
    } else {
      console.error(err);
      return res.status(500).json({ message: "Internal server error. Error was not caught" });
    }
  }

  return res.status(200).json({ success: true });
};

export default handler;
