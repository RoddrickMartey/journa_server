import rateLimit, { Options } from "express-rate-limit";

/**
 * Rate Limiter Configuration
 * Different limits for different types of endpoints
 */

// ============================================
// AUTHENTICATION LIMITERS (Most Strict)
// ============================================

/**
 * Login/Signup rate limiter
 * - 5 attempts per 15 minutes per IP
 * - Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login/signup attempts, please try again later.",
  statusCode: 429,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === "/health";
  },
});

// ============================================
// WRITE OPERATIONS LIMITERS (Strict)
// ============================================

/**
 * Create/Update operations rate limiter
 * - 30 requests per 15 minutes per IP
 * - Prevents spam of posts, comments, etc.
 */
export const createUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many write operations, please try again later.",
  statusCode: 429,
  keyGenerator: (req) => {
    // Use user ID if authenticated, fallback to IP
    return req.auth?.id || req.ip!;
  },
});

/**
 * Post creation specifically
 * - 10 posts per hour per user
 * - Prevents flooding the platform with posts
 */
export const postCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "You've reached the post creation limit. Try again later.",
  statusCode: 429,
  keyGenerator: (req) => req.auth?.id || req.ip!,
});

/**
 * Comment creation limiter
 * - 50 comments per hour per user
 * - Allows normal discussion
 */
export const commentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many comments. Please slow down.",
  statusCode: 429,
  keyGenerator: (req) => req.auth?.id || req.ip!,
});

/**
 * Like/Subscription operations
 * - 100 per 15 minutes per user
 * - Prevents rapid-fire likes/subscribes
 */
export const likeSubscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many like/subscription operations. Please try again later.",
  statusCode: 429,
  keyGenerator: (req) => req.auth?.id || req.ip!,
});

// ============================================
// READ OPERATIONS LIMITERS (Moderate)
// ============================================

/**
 * General read limiter (feeds, lists, etc.)
 * - 200 requests per minute per IP
 * - Allows normal browsing
 */
export const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many read requests. Please try again later.",
  statusCode: 429,
  skip: (req) => {
    // Skip for health checks and public feeds
    return req.path === "/health";
  },
});

/**
 * Feed/Explore limiter
 * - 100 requests per 5 minutes per IP
 * - Prevents scraping
 */
export const feedLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many feed requests. Please try again later.",
  statusCode: 429,
});

// ============================================
// ADMIN OPERATIONS LIMITERS (Strict for data integrity)
// ============================================

/**
 * Admin login limiter
 * - 3 attempts per 30 minutes per IP
 * - Very strict for admin accounts
 */
export const adminAuthLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many admin login attempts. Your account may be locked.",
  statusCode: 429,
});

/**
 * Admin write operations (suspensions, deletions, etc.)
 * - 50 per hour per admin
 * - Moderator actions need rate limiting
 */
export const adminWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many admin operations. Please try again later.",
  statusCode: 429,
  keyGenerator: (req) => req.auth?.id || req.ip!,
});

/**
 * Reports and flags
 * - 20 reports per day per user
 * - Prevents false report spam
 */
export const reportLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "You've reached your daily report limit.",
  statusCode: 429,
  keyGenerator: (req) => req.auth?.id || req.ip!,
});

// ============================================
// SPECIAL PURPOSE LIMITERS
// ============================================

/**
 * Image upload limiter
 * - 50 uploads per hour per user
 * - Prevents bandwidth abuse
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many uploads. Please try again later.",
  statusCode: 429,
  keyGenerator: (req) => req.auth?.id || req.ip!,
});

/**
 * Global API rate limiter (fallback)
 * - 1000 requests per hour per IP
 * - General protection against abuse
 */
export const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
  statusCode: 429,
  skip: (req) => {
    // Skip health checks
    return req.path === "/health";
  },
});

/**
 * Block operations limiter
 * - 100 block operations per hour per user
 */
export const blockLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many block operations. Please try again later.",
  statusCode: 429,
  keyGenerator: (req) => req.auth?.id || req.ip!,
});

/**
 * Category operations limiter (admin specific)
 * - 30 category operations per hour per admin
 */
export const categoryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many category operations. Please try again later.",
  statusCode: 429,
  keyGenerator: (req) => req.auth?.id || req.ip!,
});

/**
 * Suspension operations limiter
 * - 40 suspensions per hour per admin
 */
export const suspensionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Suspension limit reached. Please try again later.",
  statusCode: 429,
  keyGenerator: (req) => req.auth?.id || req.ip!,
});
