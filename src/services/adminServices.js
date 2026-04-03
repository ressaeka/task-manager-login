import { 
  findAllTasksPaginated,
  findAllUsersPaginated, 
  countTotalUsers, 
  countTotalTasks,
  deleteUserById 
} from "../models/adminModel.js";
import { 
  findUserById as findUserByIdModel, 
  findUserByUsername as findUserByUsernameModel,  
  createUser 
} from "../models/usersModel.js";
import bcrypt from "bcrypt";
import { customAlphabet } from "nanoid";

// CREATE ADMIN 
export const createAdminService = async (userData) => {
  const existingAdmin = await findUserByUsernameModel(userData.username);
  
  if (existingAdmin) {
    throw new Error("Admin sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10);

  const newAdmin = await createUser({
    publicId: nanoid(),
    username: userData.username,
    password: hashedPassword,
    role: "admin",
  });
  
  return newAdmin;
};

// GET ALL USERS WITH PAGINATION
export const getAllUsersService = async (page = 1, limit = 10, role = null) => {
  const offset = (page - 1) * limit;

  const users = await findAllUsersPaginated(limit, offset, role);
  const total = await countTotalUsers();

  return {
    users, 
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      ...(role && {filter: {role}})
    }
  };
};

// FIND USER BY USERNAME
export const findUserByUsername = async (username) => {
  const user = await findUserByUsernameModel(username);

  if (!user) {
    throw new Error("User tidak ditemukan");  
  }

  return user;
};

//FIND USER BY ID 
export const findUserById = async (userId) => {
  const user = await findUserByIdModel(userId);

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  return user;
};

// GET ALL TASKS WITH PAGINATION
export const getAllTasksService = async (page = 1, limit = 10, status = null) => {
  const offset = (page - 1 ) * limit;

  const tasks = await findAllTasksPaginated(limit, offset, status)
  const total = await countTotalTasks()
 

  return {
    tasks,
    pagination : {
      page,
      limit,
      totalPages : Math.ceil(total / limit),
      ...(status &&{ filter: { status } })
    }
  }

}

// DELETE USER
export const deleteUserService = async (userId) => {
  const user = await findUserByIdModel(userId);

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  return await deleteUserById(userId);
};