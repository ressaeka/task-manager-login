import express from "express";
import { login, register, logout, getProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// AUTH PUBLIC
router.post("/register", register);
router.post("/login", login);

//AUTH PROTECTED
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getProfile); 

export default router;
