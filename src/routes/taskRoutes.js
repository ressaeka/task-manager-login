import express from "express";
import {
  createTask,
  getTask,
  getTaskById,      
  updateTask,
  softDeleteTask,
  restoreTask,
  deleteTask,
  getDeletedTask,
  setDeadlineTask,
  getTaskByDeadline,
  getTaskDeadlineToday

} from "../controllers/taskController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// TASKS
router.post("/task", authMiddleware, createTask);
router.get("/task", authMiddleware, getTask);
router.get("/:id", authMiddleware, getTaskById);  
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

// SOFT DELETE & RESTORE TASK (UNTUK USER)
router.delete("/:id/soft", authMiddleware, softDeleteTask);
router.post("/:id/restore", authMiddleware, restoreTask);
router.get("/deleted", authMiddleware, getDeletedTask);

// Deadline
router.put("/task/:id/deadline", authMiddleware, setDeadlineTask);
router.get("/task/deadline/upcoming", authMiddleware, getTaskByDeadline);
router.get("/task/deadline/today", authMiddleware, getTaskDeadlineToday);

export default router;