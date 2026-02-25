import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "dotenv/config";

// Import Prisma to keep the DB awake
import { prisma } from "./db/client.js";

import { globalErrorHandler } from "./middlewares/glodalErrorHandler.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import userRouter from "./routes/userRouters.js";
import adminRouter from "./routes/adminRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import logRouter from "./routes/logRoutes.js";
import reportRouter from "./routes/reportRoutes.js";
import adminFetchRouter from "./routes/adminFetchRoutes.js";
import adminSuspensionRouter from "./routes/adminSuspensionRoutes.js";
import postRouter from "./routes/postRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import blockRouter from "./routes/blockRoutes.js";
import postLikeRouter from "./routes/postLikeRoutes.js";
import subscriptionRouter from "./routes/subscriptionRoutes.js";
import feedRouter from "./routes/feedRoutes.js";

const BASEPATH = "/api/v1";
const app = express();

// ============================================
// SECURITY & PROXY CONFIG
// ============================================
// Required for express-rate-limit to see the real IP behind free-tier proxies
app.set("trust proxy", 1);

// ============================================
// CORE MIDDLEWARE
// ============================================
app.use(globalLimiter);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));
app.use(morgan("dev"));

// ============================================
// AUTOMATION: HEALTH & KEEP-ALIVE
// ============================================
app.get("/health", async (req: Request, res: Response) => {
  try {
    // 1. Keep DB awake: Executes a tiny query to prevent pause
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      message: "Journa API is running",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res
      .status(503)
      .json({ status: "error", message: "Database is waking up..." });
  }
});

// ============================================
// ROUTES
// ============================================
app.use(`${BASEPATH}/user`, userRouter);
app.use(`${BASEPATH}/admin`, adminRouter);
app.use(`${BASEPATH}/category`, categoryRouter);
app.use(`${BASEPATH}/logs`, logRouter);
app.use(`${BASEPATH}/reports`, reportRouter);
app.use(`${BASEPATH}/admin-fetch`, adminFetchRouter);
app.use(`${BASEPATH}/admin-suspension`, adminSuspensionRouter);
app.use(`${BASEPATH}/posts`, postRouter);
app.use(`${BASEPATH}/comments`, commentRouter);
app.use(`${BASEPATH}/blocks`, blockRouter);
app.use(`${BASEPATH}/post-likes`, postLikeRouter);
app.use(`${BASEPATH}/subscriptions`, subscriptionRouter);
app.use(`${BASEPATH}/feed`, feedRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // 2. Self-Ping Automation: Pings itself every 26 minutes in production
  if (process.env.NODE_ENV === "production") {
    const SELF_URL = `${process.env.BACKEND_URL}/health`;

    setInterval(
      async () => {
        try {
          const response = await fetch(SELF_URL);
          console.log(
            `[Keep-Alive] Pinged ${SELF_URL}. Status: ${response.status}`,
          );
        } catch (err: any) {
          console.error(`[Keep-Alive] Failed to ping: ${err.message}`);
        }
      },
      26 * 60 * 1000,
    ); // 26 Minutes
  }
});
