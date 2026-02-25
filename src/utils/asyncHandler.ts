import { Request, Response, NextFunction } from "express";
import { handlePrismaError } from "../errors/prismaHandler.js";
import { handleZodError } from "../errors/zodHandler.js";
import { ZodError } from "zod";

/**
 * Wraps an asynchronous Express route handler and ensures that
 * all rejected promises are properly forwarded to `next()`.
 *
 * This eliminates the need for repetitive try/catch blocks in controllers.
 *
 * Additionally:
 * - Automatically detects Prisma-related errors
 * - Converts Prisma errors into `AppError` instances via `handlePrismaError`
 * - Forwards all other errors unchanged
 *
 * @param fn - Asynchronous Express route handler
 * @returns Express-compatible middleware function
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  /**
   * Express middleware wrapper
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err) => {
      // Zod validation errors
      if (err instanceof ZodError) {
        next(handleZodError(err));
        return;
      }

      // Convert Prisma errors into operational AppError instances
      if (err?.name?.startsWith("Prisma")) {
        next(handlePrismaError(err));
        return;
      }

      // Forward non-Prisma errors unchanged
      next(err);
    });
  };
};
