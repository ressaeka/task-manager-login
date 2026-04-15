import { customAlphabet } from "nanoid";
import {
  createTask,
  getTasksByUserIdPaginated,
  countTasksByUserId,        
  findTaskById,
  updateTaskById,
  restoreTaskById,
  getDeletedTasksByUserId,
  deleteTaskById,

} from "../models/tasksModel.js";

// CREATE TASK
export const createTaskService = async ({ title, description, userId }) => {
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10);
  
  return await createTask({
    publicId: nanoid(),
    title,
    description,
    userId,
  });
};

// GET TASKS WITH PAGINATION + FILTER
export const getTasksService = async (userId, page = 1, limit = 10, status=null) => {
  const offset = (page - 1) * limit;  
  
  // filter kalo ada status, panggil filter
  const tasks = await getTasksByUserIdPaginated(userId, limit, offset, status);
  const total = await countTasksByUserId(userId);
  
  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      ...(status && { filter: { status } })
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

export const softDeleteTaskService = async (taskId, userId) => {
  const task = await findTaskById(taskId, userId);

  if(!task){
    throw new Error("Task tidak ditemukan")
  }
  if(task.deleted_at){
    throw new Error("Task sudah di hapus")
  }
}

export const restoreTaskService = async (taskId, userId) => {
  const task = await findTaskById(taskId, userId)

  if(!task){
    throw new Error("Task tidak ditemukan")
  }

  if(!task.deleted_at){
    throw new Error("Task masih aktiv, tidak perlu di restore")
  }

  return restoreTaskById(userId, taskId)
}

export const getDeletedTasksService = async (userId) => {
  return await getDeletedTasksByUserId(userId);
};