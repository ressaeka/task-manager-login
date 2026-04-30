/* eslint-disable no-unused-vars */
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "../utils/response.js";
import {
  registerService,
  loginService,
  getUserProfileServices,
} from "../services/authServices.js";
import { validateAuth } from "../validators/index.js";



export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    validateAuth(req.body);

    await registerService({ username, password });

    return successResponse(res, null, "Register berhasil", 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    validateAuth(req.body);

    const user = await loginService({ username, password });

    return successResponse(res, user, "Login berhasil", 200);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const userId = req.user.id;

    const user = await getUserProfileServices(userId)

    const { password, ...safeUser} = user;

    return successResponse(res, safeUser, "Berhasil Mengambil Profile")
  }catch (err) {
    return serverErrorResponse(res, err.message, 500)
  }
}

export const logout = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

    // NOTE: JWT stateless — untuk invalidate token beneran perlu blacklist di Redis/DB
    return successResponse(res, null, "Logout berhasil");
  } catch (err) {
    return serverErrorResponse(res, err.message, 500);
  }
};

