import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://we-woo.net";

  // Static pages
  const staticPages = [
    "",
    "/create",
    "/auth",
    "/terms",
    "/privacy",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : 0.7,
  }));

  // Tool pages (using known tool IDs from mock data)
  const toolIds = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "11", "12", "13", "14", "16",
  ];

  const toolEntries: MetadataRoute.Sitemap = toolIds.map((id) => ({
    url: `${baseUrl}/tool/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...toolEntries];
}
