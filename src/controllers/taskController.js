import {
  createTaskService,
  getTasksService,
  getTaskByIdService,
  updateTaskService,
  softDeleteTaskService,
  restoreTaskService,
  getDeletedTasksService,
  deleteTaskService,
} from "../services/tasksServices.js";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "../utils/response.js";
import { validateTask, validateUpdateTask } from "../validators/index.js";

// CREATE TASK
export const createTask = async (req, res) => {
    try {
      if (!req.user) {
        return errorResponse(res, "Unauthorized", 401);
      }

      validateTask(req.body);

      const task = await createTaskService({
        title: req.body.title,
        description: req.body.description,
        userId: req.user.id,
      });

      return successResponse(res, { task }, "Task berhasil dibuat", 201);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  };

// GET TASKS
export const getTasks = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const page =  parseInt (req.query.page) || 1;
    const limit = parseInt (req.query.limit) || 10;
    const status = req.query.status;

    if(page < 1){
      return errorResponse(res, "Page minimal 1", 400);
    }

    if(limit < 1 || limit > 100){
      return errorResponse(res, "Limit minimal 1 dan maksimal 100", 400)
    }

    if(status && !['pending', 'in-progress', 'done'].includes(status)){
      return errorResponse(res, "Status harus pending, in-progress, atau done", 400)
    }

    const result = await getTasksService(req.user.id, page, limit, status);

    return successResponse(res, result , "Berhasil mengambil tasks");
  } catch (err) {
    return serverErrorResponse(res, err.message, 500);
  }
};

// GET TASK BY ID (DETAIL) 
export const getTaskById = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const taskId = Number(req.params.id);

    if (isNaN(taskId) || taskId <= 0) {
      return errorResponse(res, "ID task tidak valid", 400);
    }

    const task = await getTaskByIdService(taskId, req.user.id);
    
    if (!task) {
      return errorResponse(res, "Task tidak ditemukan", 404);
    }

    return successResponse(res, { task }, "Berhasil mengambil detail task", 200);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};


// UPDATE TASK
export const updateTask = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const taskId = Number(req.params.id);

    if (isNaN(taskId) || taskId <= 0) {
      return errorResponse(res, "ID task tidak valid", 400);
    }

    validateUpdateTask(req.body);

    const updatedTask = await updateTaskService({
      taskId,
      userId: req.user.id,
      data: req.body,
    });

    return successResponse(
      res,
      { task: updatedTask },
      "Task berhasil diupdate",
    );
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

// DELETE TASK
export const deleteTask = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const taskId = Number(req.params.id);

    if (isNaN(taskId) || taskId <= 0) {
      return errorResponse(res, "ID task tidak valid", 400);
    }

    await deleteTaskService({
      taskId,
      userId: req.user.id,
    });

    return successResponse(res, null, "Task berhasil dihapus", 200);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

export const softDeleteTask = async (req, res) => {
  try {
    if(!req.user){
      return errorResponse(res, "Unauthorized" , 401)
    }

    const taskId = Number(req.params.id)

    if(isNaN(taskId) || taskId <= 0) {
      return errorResponse(res, "ID task tidak valid", 400)
    }

    await softDeleteTaskService(taskId, req.user.id);
    return successResponse(res, null, "Task berhasil di hapus", 200)
  }catch(err){
    return errorResponse(res, err.message, 400)
  }

};

export const restoreTask = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }
    
    const taskId = Number(req.params.id);
    
    if (isNaN(taskId) || taskId <= 0) {
      return errorResponse(res, "ID task tidak valid", 400);
    }
    
    await restoreTaskService(taskId, req.user.id);
    return successResponse(res, null, "Task berhasil direstore", 200);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

export const getDeletedTask = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }
    
    const tasks = await getDeletedTasksService(req.user.id);
    return successResponse(res, { tasks }, "Berhasil mengambil task yang dihapus", 200);
  } catch (err) {
    return serverErrorResponse(res, err.message, 500);
  }
};
