import express from "express";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js"; 
import "./config/db.js";

const app = express();

app.use(express.json());

//global rate limiter
app.use(apiLimiter)

app.use("/auth", authRoutes);
app.use("/task", taskRoutes);
app.use("/admin", adminRoutes);

app.use(errorHandler);

export default app;
