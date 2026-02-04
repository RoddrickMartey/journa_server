import z from "zod";

type ParagraphBlock = {
  type: "paragraph";
  text: string;
};

type QuoteBlock = {
  type: "quote";
  text: string;
  author?: string;
};

type CodeBlock = {
  type: "code";
  language: string;
  code: string;
};

type ImageBlock = {
  type: "image";
  url: string; // Cloudinary URL
  caption?: string;
};

type PostContentBlock = ParagraphBlock | QuoteBlock | CodeBlock | ImageBlock;

export type PostContent = PostContentBlock[];

export const createPost = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(50, "Title must be at most 50 characters"),

  summary: z
    .string()
    .min(5, "Summary must be at least 5 characters")
    .max(250, "Summary must be at most 250 characters"),

  categoryId: z.uuid("Invalid category ID"),

  tags: z.array(z.string().min(1)).min(1, "At least one tag is required"),

  coverImageUrl: z.string().url().optional().nullable(),
});

export type CreatePost = z.infer<typeof createPost>;
