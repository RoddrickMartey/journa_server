import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RateLimitRequestHandler } from "express-rate-limit";
import { AppError } from "../errors/appError.js"; // Adjust path as needed
import { NextFunction, Request, Response } from "express";

const userOrIpKeyGenerator = (req: any) => {
  if (req.auth?.id) {
    return `user-${req.auth.id}`;
  }
  return `ip-${ipKeyGenerator(req)}`;
};

interface RateLimitHandlerOptions {
  message?: string;
  statusCode?: number;
}

export const limitReachedHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
  options: RateLimitHandlerOptions,
) => {
  const message =
    options?.message ?? "Too many requests. Please try again later.";

  const statusCode = options?.statusCode ?? 429;

  next(new AppError(message, statusCode));
};

/**
 * Rate Limiter Configuration
 */

// ============================================
// AUTHENTICATION LIMITERS
// ============================================

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login/signup attempts, please try again later.",
  statusCode: 429,
  skip: (req) => req.path === "/health",
  handler: limitReachedHandler,
});

// ============================================
// WRITE OPERATIONS LIMITERS
// ============================================

export const createUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many write operations, please try again later.",
  statusCode: 429,
  keyGenerator: userOrIpKeyGenerator,
  skip: (req) => req.path === "/health",
  handler: limitReachedHandler,
});

export const postCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "You've reached the post creation limit. Try again later.",
  statusCode: 429,
  keyGenerator: userOrIpKeyGenerator,
  handler: limitReachedHandler,
});

export const commentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many comments. Please slow down.",
  statusCode: 429,
  keyGenerator: userOrIpKeyGenerator,
  handler: limitReachedHandler,
});

export const likeSubscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many like/subscription operations. Please try again later.",
  statusCode: 429,
  keyGenerator: userOrIpKeyGenerator,
  handler: limitReachedHandler,
});

// ============================================
// READ OPERATIONS LIMITERS
// ============================================

export const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many read requests. Please try again later.",
  statusCode: 429,
  skip: (req) => req.path === "/health",
  handler: limitReachedHandler,
});

export const feedLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many feed requests. Please try again later.",
  statusCode: 429,
  handler: limitReachedHandler,
});

// ============================================
// ADMIN OPERATIONS LIMITERS
// ============================================

export const adminAuthLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many admin login attempts. Your account may be locked.",
  statusCode: 429,
  handler: limitReachedHandler,
});

export const adminWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many admin operations. Please try again later.",
  statusCode: 429,
  keyGenerator: userOrIpKeyGenerator,
  handler: limitReachedHandler,
});

export const reportLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "You've reached your daily report limit.",
  statusCode: 429,
  keyGenerator: userOrIpKeyGenerator,
  handler: limitReachedHandler,
});

// ============================================
// SPECIAL PURPOSE LIMITERS
// ============================================

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many uploads. Please try again later.",
  statusCode: 429,
  keyGenerator: userOrIpKeyGenerator,
  handler: limitReachedHandler,
});

export const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
  statusCode: 429,
  skip: (req) => req.path === "/health",
  handler: limitReachedHandler,
});

export const blockLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many block operations. Please try again later.",
  statusCode: 429,
  keyGenerator: userOrIpKeyGenerator,
  handler: limitReachedHandler,
});

export const categoryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many category operations. Please try again later.",
  statusCode: 429,
  keyGenerator: userOrIpKeyGenerator,
  handler: limitReachedHandler,
});

export const suspensionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Suspension limit reached. Please try again later.",
  statusCode: 429,
  keyGenerator: userOrIpKeyGenerator,
  handler: limitReachedHandler,
});
