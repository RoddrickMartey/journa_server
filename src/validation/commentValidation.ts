import z from "zod";

export const commentSchema = z.object({
  content: z
    .string("Comment must be text")
    .max(650, "Comment must be atmost 650 characters"),
});
