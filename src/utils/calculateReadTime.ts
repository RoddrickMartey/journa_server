import { EditorContentType } from "../validation/postValidation.js";

export const calculateReadTime = (content: EditorContentType): number => {
  const WORDS_PER_MINUTE = 225;

  // Extract text from all text-based blocks
  const text = content.blocks.reduce((acc, block) => {
    if (block.type === "paragraph" || block.type === "header") {
      return acc + " " + (block.data.text || "");
    }
    if (block.type === "list") {
      return acc + " " + (block.data.items?.join(" ") || "");
    }
    if (block.type === "quote") {
      return acc + " " + (block.data.text || "");
    }
    return acc;
  }, "");

  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  return minutes > 0 ? minutes : 1; // Minimum 1 minute
};
