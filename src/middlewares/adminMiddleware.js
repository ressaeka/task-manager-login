import { errorResponse } from "../utils/response.js";

export const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

 
    if (req.user.role !== "admin") {
      return errorResponse(res, "Akses ditolak (bukan admin)", 403);
    }

    return next();
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};