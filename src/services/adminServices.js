import { 
  findAllTaskPaginated,
  findAllUsersPaginated, 
  countTotalUsers, 
  countTotalTask,
  deleteUserById,
  countPendingTask,
  countInProgressTask,
  countCompletedTask,
  countNewUsersLast7Days,
  countActiveUsersToday,
  softDeleteUserById,
  restoreUserById
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
export const getAllUsersService = async (page = 1, limit = 10, role = null, public_id=null) => {
  const offset = (page - 1) * limit;

  const users = await findAllUsersPaginated(limit, offset, role, public_id);
  const total = await countTotalUsers(role);  

  return {
    users, 
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      ...(role     &&   { filter    :   {  role      }}),
      ...(public_id &&   { filter   :   {  public_id  }})


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

// FIND USER BY ID 
export const findUserById = async (userId) => {
  const user = await findUserByIdModel(userId);

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  return user;
};

// GET TASKS WITH PAGINATION
export const getAllTaskService = async (page = 1, limit = 10, status = null, search=null) => {
  const offset = (page - 1) * limit;

  const task = await findAllTaskPaginated(limit, offset, status, search);
  const total = await countTotalTask(status);  

  return {
    task,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      ...(status && { filter: { status } }),
      ...(search && { filter: { search } })

    }
  };
};

// DASHBOARD STATS SERVICE 
export const getDashboardStatsService = async () => {
  const [
    totalRegularUsers,  
    totalAdmins,        
    totalTask,
    pendingTask,
    inProgressTask,
    completedTask,
    newUsersLast7Days,
    activeUsersToday
  ] = await Promise.all([
    countTotalUsers('user'),     
    countTotalUsers('admin'),  
    countTotalTask(),
    countPendingTask(),
    countInProgressTask(),
    countCompletedTask(),
    countNewUsersLast7Days(),
    countActiveUsersToday(),
  ]);

  const totalAccounts = totalRegularUsers + totalAdmins;

  const completionRate = totalTask > 0 
    ? Math.round((completedTask / totalTask) * 100) 
    : 0;

  return {
    totalUsers: totalRegularUsers, 
    totalAdmins: totalAdmins,       
    totalAccounts: totalAccounts,   
    totalTask,
    pendingTask,
    inProgressTask,
    completedTask,
    completionRate,
    newUsersLast7Days,
    activeUsersToday
  };
};

// DELETE USER
export const deleteUserService = async (userId) => {
  const user = await findUserByIdModel(userId);

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  return await deleteUserById(userId);
};

// SOFT DELETE USER 
export const softDeleteUserService = async (userId) => {
  const user = await findUserByIdModel(userId);

  if(!user){
    throw new Error("User tidak di temukan")
  }

  if(user.deleted_at){
    throw new Error("User sudah di hapus")
  }

  return await softDeleteUserById(userId)
};

// RESTORE USER 
export const restoreUserService = async (userId) => {
  const user = await findUserByIdModel(userId)

  if(!user){
    throw new Error("User tidak di temukan")
  }

  if(!user.deleted_at){
    throw new Error("User masih aktif, tidak perlu di restore")
  }

  return await restoreUserById(userId)
};

