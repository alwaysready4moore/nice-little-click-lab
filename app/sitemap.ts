import type { MetadataRoute } from "next";
import { clicks } from "@/data/clicks";
import { guidePath, guides, guidesUpdatedAt } from "@/data/guides";
import { siteConfig } from "@/lib/site";

type SitemapPage = {
  path: string;
  lastModified: string;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: SitemapPage[] = [
    { path: "", lastModified: siteConfig.lastUpdated },
    { path: "/clicks", lastModified: siteConfig.lastUpdated },
    { path: "/guides", lastModified: guidesUpdatedAt },
    { path: "/about", lastModified: "2026-08-17" },
    { path: "/contact", lastModified: "2026-08-17" },
    { path: "/privacy", lastModified: "2026-11-08" },
    { path: "/terms", lastModified: "2026-08-01" },
  ];

  const guidePages: SitemapPage[] = guides.map((guide) => ({
    path: guidePath(guide.slug),
    lastModified: guide.updatedAt,
  }));

  const clickPages: SitemapPage[] = clicks
    .filter((click) => click.status === "live")
    .map((click) => ({
      path: `/clicks/${click.slug}`,
      lastModified: click.updatedAt,
    }));

  return [...staticPages, ...guidePages, ...clickPages].map(({ path, lastModified }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(`${lastModified}T00:00:00Z`),
  }));
}
