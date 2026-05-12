import express from "express";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js"; 
import "./config/db.js";

// instance dari Express
const app = express();

// parsing JSON dari request body
app.use(express.json());

//global rate limiter
app.use(apiLimiter)

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/admin", adminRoutes);

// error handling
app.use(errorHandler);

// export app ke server.js
export default app;
