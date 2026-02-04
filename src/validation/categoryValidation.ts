import z from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters long")
    .max(50, "Category name must be at most 50 characters long"),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters long")
    .optional(),
  colorLight: z.string(),
  colorDark: z.string(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
