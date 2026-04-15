import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,      
  updateTask,
  softDeleteTask,
  restoreTask,
  deleteTask,
  getDeletedTask
} from "../controllers/taskController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// TASKS
router.post("/tasks", authMiddleware, createTask);
router.get("/tasks", authMiddleware, getTasks);
router.get("/tasks/:id", authMiddleware, getTaskById);  
router.put("/tasks/:id", authMiddleware, updateTask);
router.delete("/tasks/:id", authMiddleware, deleteTask);

// SOFT DELETE & RESTORE TASK (UNTUK USER)
router.delete("/tasks/:id/soft", authMiddleware, softDeleteTask);
router.post("/tasks/:id/restore", authMiddleware, restoreTask);
router.get("/tasks/deleted", authMiddleware, getDeletedTask);

export default router;