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
router.post("/createTasks", authMiddleware, createTask);
router.get("/getTasks", authMiddleware, getTasks);
router.get("/getTasks/:id", authMiddleware, getTaskById);  
router.put("/updateTasks/:id", authMiddleware, updateTask);
router.delete("/deleteTasks/:id", authMiddleware, deleteTask);

export default router;