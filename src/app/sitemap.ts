import type { MetadataRoute } from "next";
import { site, offers } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${site.domain}`;
  const routes = ["", "/offres", "/comment-ca-marche", "/inscrire-son-centre", "/mentions-legales"];
  const staticPages = routes.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: "weekly" as const,
    priority: r === "" ? 1 : 0.7,
  }));
  const offerPages = offers.map((o) => ({
    url: `${base}/offres/${o.id}`,
    changeFrequency: "hourly" as const,
    priority: 0.5,
  }));
  return [...staticPages, ...offerPages];
}
