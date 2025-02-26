import ADMIN from "../models/admin.model.js";
import jwt from "jsonwebtoken";

export const VERIFY_ADMIN = async (req, res, next) => {
  const { userToken } = req.cookies;

  

  try {
    // FETCHING TOKEN FROM FRONTEND
    if (!userToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized access => Middlware" });
    }

    // VERIFYING TOKEN
    const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);

    if (decodedToken.role !== "Administrator") {
      return res
        .status(401)
        .json({ message: "Unauthorized access => Middlware" });
    }

    // FINDING ADMIN BASED ON TOKEN
    const admin = await ADMIN.findById(decodedToken.id);

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Unauthorized access => Middlware" });
    }

    // PASSING ADMIN TO NEXT MIDDLEWARE
    req.admin = admin;
    next();
  } catch (error) {
    console.log("Error while verifying admin: ", error.message);
    res.status(500).json({ message: "Unauthorized access => Middlware" });
  }
};
