import express from "express";
import {
  getAllUsers,
  getAllTasks,
  deleteUser,
  createAdmin,
  getUserById,
  getUserByUsername,
  getDashboardStats,
  softDeleteUser,
  restoreUser
} from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { adminLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// apply ke semua route
router.use(adminLimiter);
router.use(authMiddleware);
router.use(adminMiddleware);

// ROUTES 

// CREATE ADMIN
router.post("/create/admins", createAdmin); 

// USER ROUTES 
router.get("/users/username/:username", getUserByUsername);  // by username
router.get("/users/:id", getUserById);                       // by id
router.get("/users", getAllUsers);                           // all users

// TASK ROUTES
router.get("/tasks", getAllTasks);

// ADMIN DASHBOARD STATS
router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardStats);

// DELETE USER
router.delete("/users/:id", deleteUser);

// DELETE USER ( SOFT DELETE )
router.delete("/users/:id/soft", authMiddleware, adminMiddleware, softDeleteUser)
router.post("/users/:id/restore", authMiddleware, adminMiddleware, restoreUser);

export default router;