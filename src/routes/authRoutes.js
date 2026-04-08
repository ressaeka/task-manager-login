import express from "express";
import { login, register, logout, getProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter.js";


const router = express.Router();

//PUBLIC ROUTES (Limiter Khusus)
router.post("/register", registerLimiter, register);  
router.post("/login", loginLimiter, login);           


// AUTH PUBLIC
router.post("/register", register);
router.post("/login", login);

//AUTH PROTECTED
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getProfile); 

export default router;
