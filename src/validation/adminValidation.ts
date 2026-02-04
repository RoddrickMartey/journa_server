import { z } from "zod";

/**
 * Admin login validation schema
 */
export const adminLoginSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .min(3, "Username must be at least 3 characters long"),

  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
});

/**
 * Admin creation validation schema
 */
export const adminCreateSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .min(3, "Username must be at least 3 characters long"),

  email: z.email("Invalid email address"),

  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),

  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters long"),

  number: z.string({ error: "Phone number is required" }).optional(),

  avatar: z.string({ error: "Avatar is required" }),

  isSuperAdmin: z.boolean().optional().default(false),
});

/**
 * Admin update email validation schema
 */
export const adminUpdateEmailSchema = z.object({
  email: z.email("Invalid email address"),
});

/**
 * Admin update username validation schema
 */
export const adminUpdateUsernameSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .min(3, "Username must be at least 3 characters long"),
});

/**
 * Admin update name validation schema
 */
export const adminUpdateNameSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters long"),
});

/**
 * Admin update phone number validation schema
 */
export const adminUpdateNumberSchema = z.object({
  number: z.string({ error: "Phone number is required" }),
});

/**
 * Admin update avatar validation schema
 */
export const adminUpdateAvatarSchema = z.object({
  avatar: z.string({ error: "Avatar is required" }),
});

/**
 * Admin update profile validation schema
 */
export const adminUpdateProfileSchema = z.object({
  email: z.email("Invalid email address").optional(),
  username: z
    .string({ error: "Username is required" })
    .min(3, "Username must be at least 3 characters long")
    .optional(),
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters long")
    .optional(),
  number: z.string().optional(),
  avatarUrl: z.string().optional(),
  avatarPath: z.string().optional(),
});

/**
 * Admin password change validation schema
 */
export const adminChangePasswordSchema = z.object({
  currentPassword: z
    .string({ error: "Current password is required" })
    .min(8, "Password must be at least 8 characters long"),

  newPassword: z
    .string({ error: "New password is required" })
    .min(8, "Password must be at least 8 characters long"),
});

// Type exports
export type AdminLoginType = z.infer<typeof adminLoginSchema>;
export type AdminCreateType = z.infer<typeof adminCreateSchema>;
export type AdminUpdateEmailType = z.infer<typeof adminUpdateEmailSchema>;
export type AdminUpdateUsernameType = z.infer<typeof adminUpdateUsernameSchema>;
export type AdminUpdateNameType = z.infer<typeof adminUpdateNameSchema>;
export type AdminUpdateNumberType = z.infer<typeof adminUpdateNumberSchema>;
export type AdminUpdateAvatarType = z.infer<typeof adminUpdateAvatarSchema>;
export type AdminUpdateProfileType = z.infer<typeof adminUpdateProfileSchema>;
export type AdminChangePasswordType = z.infer<typeof adminChangePasswordSchema>;
