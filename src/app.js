import express from "express";
import authRoutes from "./routes/authRoutes.js";
import tasksRoutes from "./routes/tasksRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import "./config/db.js";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", tasksRoutes);
app.use("/admin", adminRoutes);

app.use(errorHandler);

export default app;
