import { Prisma } from "../generated/prisma/client";
import { AppError } from "./appError";

/**
 * Extracts field names from Prisma error messages like:
 * "Unique constraint failed on the fields: (`username`)"
 */
const extractFieldName = (message: string): string => {
  const match = message.match(/\(`(.*?)`\)/);
  if (match && match[1]) {
    // Replace underscores with spaces for a cleaner look (e.g., "phone_number" -> "phone number")
    return match[1].replace(/_/g, " ");
  }
  return "field";
};

export const handlePrismaError = (error: unknown): AppError => {
  // 1. Known Request Errors (Database Constraints)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        // Fallback to extraction if meta.target is undefined
        const field = error.meta?.target
          ? (error.meta.target as string[]).join(", ").replace(/_/g, " ")
          : extractFieldName(error.message);

        return new AppError(`${field} already exists.`, 400);
      }

      case "P2003": {
        return new AppError(
          "This operation cannot be completed because a related record is required or still exists.",
          400,
        );
      }

      case "P2025": {
        const cause =
          (error.meta?.cause as string) ||
          "The requested record was not found.";
        return new AppError(cause, 404);
      }

      default:
        console.log(error.code);
        return new AppError(`System Error, try again next time`, 400);
    }
  }

  // 2. Validation Errors (Input/Schema mismatches)
  if (error instanceof Prisma.PrismaClientValidationError) {
    const messageLines = error.message.split("\n");
    const cleanMessage =
      messageLines[messageLines.length - 1] || "Invalid data provided.";

    return new AppError(`Validation Error: ${cleanMessage.trim()}`, 400);
  }

  // 3. Initialization/Connection Errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError(
      "Unable to connect to the database. Please try again later.",
      500,
    );
  }

  // 4. Fallback for unknown errors
  return new AppError("An unexpected error occurred.", 500);
};
