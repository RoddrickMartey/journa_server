import { z } from "zod";

/**
 * User login validation schema
 */
export const userLoginSchema = z.object({
  username: z
    .string({ error: "Username not available" })
    .min(8, "Username must be 8 characters and above"),

  password: z
    .string({ error: "Password not available" })
    .min(8, "Password must be 8 characters and above"),
});

/**
 * User signup validation schema
 */
export const userSignupSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .min(8, "Username must be at least 8 characters long"),

  email: z.email("Invalid email address"),

  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),

  displayName: z
    .string({ error: "Display name is required" })
    .min(2, "Display name must be at least 2 characters long"),
});

export const userUpdateEmailSchema = z.object({
  email: z.email("Invalid email address"),
});

export const userUpdateUsernameSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .min(8, "Username must be at least 8 characters long"),
});

export const userUpdateAvatarSchema = z.object({
  avatar: z.string({ error: "Avatar is required" }),
});
export const userUpdateCoverSchema = z.object({
  cover: z.string({ error: "Avatar is required" }),
});
export const userUpdateBioSchema = z.object({
  bio: z.string().max(160, "Bio must be at most 160 characters").nullable(),
});

export const userUpdateNationalitySchema = z.object({
  nationality: z.string().nullable(),
});

export const userUpdateDisplayNameSchema = z.object({
  displayName: z
    .string({ error: "Display name is required" })
    .min(2, "Display name must be at least 2 characters long"),
});

export const userUpdateSocialsSchema = z.array(
  z.object({
    media: z.string().min(1, "Social media name is required"),

    link: z.string().url("Invalid URL").min(1, "Social link is required"),
  }),
);

export const userChangePasswordSchema = z.object({
  currentPassword: z
    .string({ error: "Current password is required" })
    .min(8, "Current password must be at least 8 characters long"),
  newPassword: z
    .string({ error: "New password is required" })
    .min(8, "New password must be at least 8 characters long"),
});

/* =======================
   Enums
======================= */
export enum ThemePreference {
  LIGHT = "LIGHT",
  DARK = "DARK",
  SYSTEM = "SYSTEM",
}

export enum FontSize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export enum LineHeight {
  NORMAL = "NORMAL",
  WIDE = "WIDE",
}

/* =======================
   Zod Schema
======================= */
export const updateSettingsSchema = z.object({
  theme: z.enum(ThemePreference),
  fontSize: z.enum(FontSize),
  lineHeight: z.enum(LineHeight),
});

export const socialsSchema = z
  .array(
    z.object({
      media: z.string().min(1, "Social media name is required"),
      link: z.url("Invalid URL"),
    }),
  )
  .optional(); // optional for empty updates

export type SocialsType = z.infer<typeof socialsSchema>;
export type UpdateSettingsType = z.infer<typeof updateSettingsSchema>;

export type UserSignupType = z.infer<typeof userSignupSchema>;

export type UserLoginType = z.infer<typeof userLoginSchema>;

export type UserUpdateEmailType = z.infer<typeof userUpdateEmailSchema>;

export type UserUpdateUsernameType = z.infer<typeof userUpdateUsernameSchema>;
