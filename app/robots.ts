import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep authenticated app, public client tokens, and signing links out of search.
      disallow: ["/dashboard", "/project", "/onboarding", "/client", "/sign", "/api", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
