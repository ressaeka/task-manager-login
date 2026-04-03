import { serverErrorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, _next) => {
  console.error("ERROR:", err);

  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  return serverErrorResponse(res);
};
