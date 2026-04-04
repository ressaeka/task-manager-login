import express from "express";
import {
  getAllUsers,
  getAllTasks,
  deleteUser,
  createAdmin,
  getUserById,
  getUserByUsername
} from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// apply ke semua route
router.use(authMiddleware);
router.use(adminMiddleware);

// ROUTES 

// 1. CREATE ADMIN
router.post("/create/admins", createAdmin); 

// 2. USER ROUTES 
router.get("/users/username/:username", getUserByUsername);  // by username
router.get("/users/:id", getUserById);                       // by id
router.get("/users", getAllUsers);                           // all users

// 3. TASK ROUTES
router.get("/tasks", getAllTasks);

// 4. DELETE USER
router.delete("/users/:id", deleteUser);

export default router;