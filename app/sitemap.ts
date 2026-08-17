import type { MetadataRoute } from "next";
import { clicks } from "@/data/clicks";
import { siteConfig } from "@/lib/site";

type SitemapPage = {
  path: string;
  lastModified: string;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: SitemapPage[] = [
    { path: "", lastModified: siteConfig.lastUpdated },
    { path: "/clicks", lastModified: siteConfig.lastUpdated },
    { path: "/about", lastModified: "2026-08-17" },
    { path: "/contact", lastModified: "2026-08-17" },
    { path: "/privacy", lastModified: "2026-08-01" },
    { path: "/terms", lastModified: "2026-08-01" },
  ];

  const clickPages: SitemapPage[] = clicks
    .filter((click) => click.status === "live")
    .map((click) => ({
      path: `/clicks/${click.slug}`,
      lastModified: click.updatedAt,
    }));

  return [...staticPages, ...clickPages].map(({ path, lastModified }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(`${lastModified}T00:00:00Z`),
  }));
}
