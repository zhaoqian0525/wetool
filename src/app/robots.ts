import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/create", "/auth", "/admin", "/api"],
    },
    sitemap: "https://we-woo.net/sitemap.xml",
    host: "https://we-woo.net",
  };
}
