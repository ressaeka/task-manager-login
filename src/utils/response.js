export const successResponse = (res, data, message = "success", code = 200) => {
  return res.status(code).json({
    status: "success",
    message,
    data,
  });
};

export const errorResponse = (res, message = "failed", code = 400) => {
  return res.status(code).json({
    status: "failed",
    message,
  });
};

export const serverErrorResponse = ( res, message = "Terjadi kesalahan server", code = 500) => {
  return res.status(code).json({
    status: "error",
    message,
  });
};
