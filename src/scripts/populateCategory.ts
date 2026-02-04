import { prisma } from "../db/client";
import { slugGenerator } from "../utils/slugGenerater";

const categories = [
  {
    name: "Technology",
    description:
      "Stories about gadgets, software, coding, and how technology is shaping the world around us.",
    colorLight: "#01579B", // Deep Navy (light mode text)
    colorDark: "#E1F5FE", // Light Blue (dark mode text)
  },
  {
    name: "Lifestyle",
    description:
      "Thoughts on everyday life, travel experiences, home, relationships, and personal habits.",
    colorLight: "#880E4F", // Rich Magenta
    colorDark: "#FCE4EC", // Soft Pink
  },
  {
    name: "Business",
    description:
      "Ideas and lessons on entrepreneurship, money, work, careers, and building something meaningful.",
    colorLight: "#1B5E20", // Forest Green
    colorDark: "#E8F5E9", // Mint Green
  },
  {
    name: "Science",
    description:
      "Curious explorations of space, nature, biology, physics, and how our universe works.",
    colorLight: "#4A148C", // Deep Purple
    colorDark: "#F3E5F5", // Pale Lavender
  },
  {
    name: "Health",
    description:
      "Writing about mental health, physical fitness, nutrition, and living a healthier life.",
    colorLight: "#E65100", // Burnt Orange
    colorDark: "#FFF3E0", // Peach
  },
  {
    name: "Education",
    description:
      "Learning resources, explanations, tutorials, and insights meant to help people grow.",
    colorLight: "#004D40", // Dark Teal
    colorDark: "#E0F2F1", // Teal Tint
  },
  {
    name: "Entertainment",
    description:
      "Thoughts and reviews on movies, music, games, shows, and popular culture.",
    colorLight: "#F57F17", // Goldenrod
    colorDark: "#FFFDE7", // Cream Yellow
  },
  {
    name: "Creativity",
    description:
      "A home for art, design, writing, photography, and creative inspiration of all kinds.",
    colorLight: "#827717", // Olive Drab
    colorDark: "#F9FBE7", // Lime Tint
  },
  {
    name: "Social",
    description:
      "Perspectives on society, culture, communities, news, and the world we share.",
    colorLight: "#3E2723", // Deep Brown
    colorDark: "#EFEBE9", // Warm Grey
  },
  {
    name: "General",
    description:
      "Posts that don’t fit neatly anywhere else — open, flexible, and free-form.",
    colorLight: "#263238", // Charcoal
    colorDark: "#ECEFF1", // Slate Mist
  },
];

async function populateCategories() {
  for (const category of categories) {
    const slug = slugGenerator.generateSlugForCategory(category.name);
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: category.name,
        slug,
        description: category.description,
        colorLight: category.colorLight,
        colorDark: category.colorDark,
      },
    });
  }
  console.log("Categories populated successfully.");
}
populateCategories().catch((error) => {
  console.error("Error populating categories:", error);
  process.exit(1);
});
export {};
