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
import postRouter from "./routes/postRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import blockRouter from "./routes/blockRoutes.js";
import postLikeRouter from "./routes/postLikeRoutes.js";
import subscriptionRouter from "./routes/subscriptionRoutes.js";
import feedRouter from "./routes/feedRoutes.js";

const BASEPATH = "/api/v1";

const app = express();

// Core middleware

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));

app.use(morgan("dev"));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "Journa API is running" });
});

// Routes
app.use(`${BASEPATH}/user`, userRouter);
app.use(`${BASEPATH}/admin`, adminRouter);
app.use(`${BASEPATH}/category`, categoryRouter);
app.use(`${BASEPATH}/logs`, logRouter);
app.use(`${BASEPATH}/posts`, postRouter);
app.use(`${BASEPATH}/comments`, commentRouter);
app.use(`${BASEPATH}/blocks`, blockRouter);
app.use(`${BASEPATH}/post-likes`, postLikeRouter);
app.use(`${BASEPATH}/subscriptions`, subscriptionRouter);
app.use(`${BASEPATH}/feed`, feedRouter);

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
