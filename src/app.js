import express from "express";
import authRoutes from "./routes/authRoutes.js";
import tasksRoutes from "./routes/tasksRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js"; 
import "./config/db.js";

const app = express();

app.use(express.json());

//global rate limiter
app.use(apiLimiter)

app.use("/auth", authRoutes);
app.use("/tasks", tasksRoutes);
app.use("/admin", adminRoutes);

app.use(errorHandler);

export default app;
