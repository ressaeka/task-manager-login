import { customAlphabet } from "nanoid";
import {
  createTask,
  getTaskByUserIdPaginated,
  countTaskByUserId,        
  findTaskById,
  updateTaskById,
  restoreTaskById,
  getDeleteTaskByUserId,
  softDeleteTaskById,
  deleteTaskById,
  setDeadlineTask,
  getTaskByDeadline,
  getTaskDeadlineToday,
  countTaskWithDeadline,
} from "../models/taskModel.js";

// CREATE TASK
export const createTaskService = async ({ title, description,deadline_at, userId }) => {
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10);
  
  return await createTask({
    publicId: nanoid(),
    title,
    description,
    deadline_at,
    userId,
  });
};

// GET TASK WITH PAGINATION + FILTER
export const getTaskService = async (userId, page = 1, limit = 10, status=null, search=null) => {
  const offset = (page - 1) * limit;  
  
  // filter kalo ada status, panggil filter
  const task = await getTaskByUserIdPaginated(userId, limit, offset, status, search);
  const total = await countTaskByUserId(userId);
  
  return {
    task,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      ...(status && { filter: { status } } ),
      ...(search && { filter: { search } } )
    }
  };
};

// GET TASK BY ID (DETAIL)
export const getTaskByIdService = async (taskId, userId) => {
  const task = await findTaskById(taskId, userId);
  
  if (!task) {
    throw new Error("Task tidak ditemukan");
  }
  
  return task;
};

// UPDATE TASK
export const updateTaskService = async ({ taskId, userId, data }) => {
  const existingTask = await findTaskById(taskId, userId);

  if (!existingTask) {
    throw new Error("Task tidak ditemukan");
  }

  return await updateTaskById(taskId, userId, data);
};

// DELETE TASK
export const deleteTaskService = async ({ taskId, userId }) => {
  const existingTask = await findTaskById(taskId, userId);

  if (!existingTask) {
    throw new Error("Task tidak ditemukan");
  }

  await deleteTaskById(taskId, userId);
};

// soft delete
export const softDeleteTaskService = async (taskId, userId) => {
  const task = await findTaskById(taskId, userId);
  
  if (!task) {
    throw new Error("Task tidak ditemukan");
  }
  
  if (task.deleted_at) {
    throw new Error("Task sudah dihapus");
  }
  
  return await softDeleteTaskById(taskId, userId);
};

// Restore soft delete
export const restoreTaskService = async (taskId, userId) => {
  const task = await findTaskById(taskId, userId);
  
  if (!task) {
    throw new Error("Task tidak ditemukan");
  }
  
  if (!task.deleted_at) {
    throw new Error("Task masih aktif, tidak perlu direstore");
  }
  
  return await restoreTaskById(taskId, userId);
};

// get soft delete 
export const getDeleteTaskService = async (userId) => {
  return await getDeleteTaskByUserId(userId);
};


// SET DEADLINE TASK SERVICE
export const setDeadlineTaskService = async (taskId, userId, deadline_at) => {
  // Validasi task ada
  const task = await findTaskById(taskId, userId);
  
  if (!task) {
    throw new Error("Task tidak ditemukan");
  }
  
  if (task.deleted_at) {
    throw new Error("Task sudah dihapus");
  }
  
  // Validasi deadline tidak boleh kurang dari hari ini
  if (deadline_at && new Date(deadline_at) < new Date()) {
    throw new Error("Deadline tidak boleh kurang dari hari ini");
  }
  
  return await setDeadlineTask(taskId, userId, deadline_at);
};

// GET TASK BY DEADLINE SERVICE (URUT TERDEKAT)
export const getTaskByDeadlineService = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  const task = await getTaskByDeadline(userId, limit, offset);
  const total = await countTaskWithDeadline(userId);
  
  return {
    task,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// GET TASK DEADLINE TODAY SERVICE
export const getTaskDeadlineTodayService = async (userId) => {
  return await getTaskDeadlineToday(userId);
};