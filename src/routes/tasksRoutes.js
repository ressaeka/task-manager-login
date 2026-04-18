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
router.get("/:id", authMiddleware, getTaskById);  
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

// SOFT DELETE & RESTORE TASK (UNTUK USER)
router.delete("/:id/soft", authMiddleware, softDeleteTask);
router.post("/:id/restore", authMiddleware, restoreTask);
router.get("/deleted", authMiddleware, getDeletedTask);

export default router;