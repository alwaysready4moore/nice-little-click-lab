import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/clicks", changeFrequency: "weekly", priority: 0.9 },
    {
      path: "/clicks/meeting-cost-ticker",
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      path: "/clicks/custom-crossword",
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      path: "/clicks/custom-word-search",
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      path: "/clicks/please-advise",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/clicks/should-have-been-an-email",
      changeFrequency: "monthly",
      priority: 0.95,
    },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ];

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(siteConfig.lastUpdated),
    changeFrequency,
    priority,
  }));
}
