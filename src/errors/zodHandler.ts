import { ZodError } from "zod";
import { AppError } from "./appError";

/**
 * Converts Zod validation errors into a standardized AppError
 *
 * - Uses the first validation issue
 * - Returns a clean, user-facing message
 * - Responds with HTTP 400
 */
export const handleZodError = (error: ZodError): AppError => {
  const firstIssue = error.issues[0];

  const message =
    firstIssue?.message || `${firstIssue?.path.join(".")} is invalid`;

  return new AppError(message, 400);
};
