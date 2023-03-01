import { getAuth } from "firebase-admin/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyIdToken } from "next-firebase-auth";
import initAuth from "util/firebase";

// the module you created above

initAuth();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // console.log(req.headers.authorization);
  if (req.headers.authorization !== undefined) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      console.log(token);
      await verifyIdToken(token);
    } catch (e) {
      return res.status(401).json({ error: `Not authorized. ${e}` });
    }
  }
  return res.status(200).json({ success: true });
};

export default handler;
