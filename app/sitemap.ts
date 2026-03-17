import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://sunshinesmoothiesvallejo.com/",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://sunshinesmoothiesvallejo.com/menu",
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: "https://sunshinesmoothiesvallejo.com/location",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://sunshinesmoothiesvallejo.com/community",
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: "https://sunshinesmoothiesvallejo.com/events",
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: "https://sunshinesmoothiesvallejo.com/about",
      lastModified: new Date(),
      priority: 0.7,
    },
  ];
}