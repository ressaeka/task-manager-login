import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,      
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// TASKS
router.post("/tasks", authMiddleware, createTask);
router.get("/tasks", authMiddleware, getTasks);
router.get("/tasks/:id", authMiddleware, getTaskById);  
router.put("/tasks/:id", authMiddleware, updateTask);
router.delete("/asks/:id", authMiddleware, deleteTask);

export default router;