import { errorResponse } from "../utils/response.js";
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(res, "Token wajib ada", 401);
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return errorResponse(res, "Format token salah", 401);
    }

    const token = parts[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, "Token sudah expired", 401);
    }

    return errorResponse(res, "Token tidak valid", 401);
  }
};
