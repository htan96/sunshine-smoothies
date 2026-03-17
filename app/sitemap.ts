import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${SITE_URL}/menu`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/fuel`,
      lastModified: new Date(),
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/location`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/community`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      priority: 0.7,
    },
  ];
}