// server/api/generateTags.ts (Node / Express)

import { Router } from "express";
import OpenAI from "openai";
import "dotenv/config";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  const { title, summary } = req.body;
  if (!title && !summary) return res.status(400).json({ error: "No text" });

  try {
    const prompt = `
Suggest 5 relevant blog tags for the following post. Return only a JSON array of lowercase strings:

Title: "${title}"
Summary: "${summary}"
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = response.choices[0].message?.content || "[]";
    let tags: string[] = [];
    try {
      tags = JSON.parse(text);
    } catch {
      // fallback: split by commas if not JSON
      tags = text.split(",").map((t) => t.trim().toLowerCase());
    }

    res.json(tags.slice(0, 5)); // limit to 5 tags
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate tags" });
  }
});

export default router;
