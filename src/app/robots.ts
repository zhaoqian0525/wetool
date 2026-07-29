import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/create", "/auth"],
    },
    sitemap: "https://we-woo.net/sitemap.xml",
    host: "https://we-woo.net",
  };
}
