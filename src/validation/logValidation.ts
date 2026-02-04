import { z } from "zod";

/**
 * Log creation validation schema
 */
export const logCreateSchema = z.object({
  action: z.enum(
    [
      "UPDATE_PROFILE",
      "SUSPEND_USER",
      "ACTIVATE_USER",
      "RESTORE_USER",
      "DELETE_POST",
      "RESTORE_POST",
      "CREATE_CATEGORY",
      "DELETE_CATEGORY",
      "OTHER",
    ] as const,
    {
      error: "Invalid action type",
    },
  ),

  description: z
    .string({ error: "Description is required" })
    .min(5, "Description must be at least 5 characters long"),

  meta: z.record(z.string(), z.any()).optional(),
});

/**
 * Log update validation schema
 */
export const logUpdateSchema = z.object({
  description: z
    .string({ error: "Description is required" })
    .min(5, "Description must be at least 5 characters long")
    .optional(),

  meta: z.record(z.string(), z.any()).optional(),
});

// Type exports
export type LogCreateType = z.infer<typeof logCreateSchema>;
export type LogUpdateType = z.infer<typeof logUpdateSchema>;
