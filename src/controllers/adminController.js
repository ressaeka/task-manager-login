import {
  createAdminService,
  getAllUsersService,
  getAllTasksService,
  getDashboardStatsService,
  deleteUserService,
  softDeleteUserService,
  restoreUserService
} from "../services/adminServices.js";

import { findUserById, findUserByUsername } from "../models/usersModel.js"; 

import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "../utils/response.js";

import { validateAdmin } from "../validators/index.js";

// CREATE ADMIN
export const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    validateAdmin(req.body); 
    await createAdminService({ username, password }); 
    return successResponse(res, "Admin berhasil dibuat", 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

// GET USER BY USERNAME
export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    if(!username || username.trim() === "" ){
      return errorResponse(res, "Username tidak boleh kosong", 400)
    }

    const user = await findUserByUsername(username)

    return successResponse(res, { user }, "Berhasil mengambil user", 200)
  } catch(err){
    if(err.message === "User tidak ditemukan"){
        return errorResponse(res, err.message, 404);
    }
    return serverErrorResponse(res, err.message, 500)
  }
}

// GET USER BY ID
export const getUserById = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId) || userId <= 0) {
      return errorResponse(res, "ID user tidak valid", 400);
    }

    const user = await findUserById(userId); 

    if (!user) {
      return errorResponse(res, "User tidak ditemukan", 404);
    }

    return successResponse(res, { user }, "Berhasil mengambil user", 200);
  } catch(err) {
    return serverErrorResponse(res, err.message, 500);
  }
};

// GET ALL USERS 
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const public_id = req.query.public_id;
    
    if (page < 1) {
      return errorResponse(res, "Page minimal 1", 400);
    }
    if (limit < 1 || limit > 100) {
      return errorResponse(res, "Limit minimal 1 dan maksimal 100", 400);
    }
    if (role && !['user', 'admin'].includes(role)) {
      return errorResponse(res, "Role harus 'user' atau 'admin'", 400);
    }
    
    let message = "Berhasil mengambil semua user";
    
    if(public_id){
      message = `Berhasil mengambil user dengan public_id : ${public_id}`
    }
    else if(role){
      message = `Berhasil mengambil user dengan role: ${role}`
    }
    
    const result = await getAllUsersService(page, limit, role,public_id);
    
    if (public_id && result.users.length === 0) {
      return errorResponse(res, `User dengan public_id : ${public_id} tidak ditemukan`, 404);
    }
    return successResponse(res, result, message, 200);
  } catch (err) {
    return serverErrorResponse(res, err.message, 500);
  }
};

// GET TASKS 
export const getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    if(page < 1) {
      return errorResponse(res, "Page minimal 1", 400);
    }

    if(limit < 1 || limit > 100){
      return errorResponse(res, "Limit minimal 1 dan maksimal 100", 400);
    }
    if(status && !['pending', 'in-progress', 'done'].includes(status)){
      return errorResponse(res, "Status harus pending, in-progress, atau done", 400);
    }

    const result = await getAllTasksService(page, limit, status, search);

    return successResponse(res, result, "Berhasil mengambil semua tasks", 200);
  } catch (err) {
    return serverErrorResponse(res, err.message, 500);
  }
};

// GET DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStatsService();
    
    return successResponse(res, { stats }, "Berhasil mengambil dashboard stats", 200);
  } catch (err) {
    return serverErrorResponse(res, err.message, 500);
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId) || userId <= 0) {
      return errorResponse(res, "ID user tidak valid", 400);
    }

    await deleteUserService(userId);
    return successResponse(res, null, "User berhasil dihapus", 200);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

// SOFT DELETE USER
export const softDeleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id)

    if(isNaN(userId) || userId <= 0) {
      return errorResponse(res, "ID user tidak valid", 400);
    }
    
    await softDeleteUserService(userId)  
    return successResponse(res, null, "User berhasil dihapus (soft delete)", 200)
    
  } catch (err) {
    return errorResponse(res, err.message, 400)
  }
};

// RESTORE USER
export const restoreUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    console.log(req.params.id)

    if(isNaN(userId) || userId <= 0){
      return errorResponse(res, "ID user tidak valid", 400);
    }

    await restoreUserService(userId);  
    return successResponse(res, null, "User berhasil di restore", 200)
    
  } catch (err){
    return errorResponse(res, err.message, 400)
  }
};