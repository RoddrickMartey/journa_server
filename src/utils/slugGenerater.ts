class SlugGenerator {
  generateSlugForTitle(title: string): string {
    const slugTitle = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const randomSuffix = Math.random().toString(36).slice(2, 10);

    return `${slugTitle}-${randomSuffix}`;
  }

  generateSlugForCategory(name: string): string {
    const slugName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return slugName;
  }
}

export const slugGenerator = new SlugGenerator();
