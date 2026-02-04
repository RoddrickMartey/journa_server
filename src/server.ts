import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { globalErrorHandler } from "./middlewares/gladalErrorHandler.js";
import userRouter from "./routes/userRouters.js";
import adminRouter from "./routes/adminRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import logRouter from "./routes/logRoutes.js";
import { slugGenerator } from "./utils/slugGenerater.js";

const app = express();

// Core middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "3mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "Journa API is running" });
});

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/logs", logRouter);

// 404 Handler: Catches all routes that don't exist
app.use((req: Request, res: Response, next) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
