import z from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 50 characters"),

  summary: z
    .string()
    .min(5, "Summary must be at least 5 characters")
    .max(450, "Summary must be at most 250 characters")
    .optional(),

  categoryId: z.uuid("Invalid category ID"),

  tags: z.array(z.string().min(1)).min(1, "At least one tag is required"),

  coverImageBase64: z.string().nullable(),
});

export const postImageUploadSchema = z.object({
  imageBase64: z.string(),
});

/* ===== Common block base ===== */
const baseBlock = z.object({
  id: z.string().optional(),
  type: z.string(),
  data: z.record(z.string(), z.any()),
});

/* ===== Specific block types you use ===== */

const headerBlock = z.object({
  type: z.literal("header"),
  data: z.object({
    text: z.string().min(1),
    level: z.number().min(1).max(6),
  }),
});

const paragraphBlock = z.object({
  type: z.literal("paragraph"),
  data: z.object({
    text: z.string(),
  }),
});

const listBlock = z.object({
  type: z.literal("list"),
  data: z.object({
    style: z.enum(["ordered", "unordered"]),
    items: z.array(z.string()),
  }),
});

const imageBlock = z.object({
  type: z.literal("image"),
  data: z.object({
    file: z.object({
      url: z.string().url(),
    }),
    caption: z.string().optional(),
  }),
});

const quoteBlock = z.object({
  type: z.literal("quote"),
  data: z.object({
    text: z.string(),
    caption: z.string().optional(),
  }),
});

const codeBlock = z.object({
  type: z.literal("code"),
  data: z.object({
    code: z.string(),
  }),
});

/* ===== Union of supported blocks ===== */

const editorBlockSchema = z.union([
  headerBlock,
  paragraphBlock,
  listBlock,
  imageBlock,
  quoteBlock,
  codeBlock,
  baseBlock, // fallback for unknown plugins
]);

/* ===== Full EditorJS Output ===== */

export const editorContentSchema = z.object({
  time: z.number(),
  blocks: z.array(editorBlockSchema),
  version: z.string(),
});

export type EditorContentType = z.infer<typeof editorContentSchema>;

export type CreatePost = z.infer<typeof createPostSchema>;

export const updatePostSchema = createPostSchema.partial();
