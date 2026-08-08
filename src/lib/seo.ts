import type { Post } from "@/data/content";
import { CATEGORY_LABEL, pathForPost } from "@/data/content";

export const SITE_NAME = "Anime Cartoon";

/** Site origin comes from configuration, never hardcoded business logic. */
export function siteUrl(): string {
  const fromEnv =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SITE_URL"]) ||
    (typeof process !== "undefined" && process.env?.["SITE_URL"]);
  if (fromEnv) return String(fromEnv).replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "https://anime-cartoon.lovable.app";
}

export function absolute(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

type MetaTag = Record<string, string>;

export function buildMeta(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  noindex?: boolean;
}): MetaTag[] {
  const url = absolute(opts.url);
  const image = opts.image ? absolute(opts.image) : "";
  const meta: MetaTag[] = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { name: "robots", content: opts.noindex ? "noindex, nofollow" : "index, follow" },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:url", content: url },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:site_name", content: SITE_NAME },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:url", content: url },
  ];
  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
  }
  return meta;
}

export function canonicalLink(url: string) {
  return [{ rel: "canonical", href: absolute(url) }];
}

export function postDescription(post: Post): string {
  const base = post.description?.trim() || post.content?.trim();
  if (base) return base.replace(/\s+/g, " ").slice(0, 158);
  const bits = [post.quality, post.languages, post.duration].filter(Boolean).join(" • ");
  return `${post.title} — ${CATEGORY_LABEL[post.type]} download${bits ? ` (${bits})` : ""} on ${SITE_NAME}.`;
}

export function postImage(post: Post): string {
  return post.banner?.trim() || post.slider?.image?.trim() || post.poster?.trim() || "";
}

function schemaType(post: Post): string {
  if (post.type === "movie") return "Movie";
  if (post.type === "page") return "WebPage";
  return "TVSeries";
}

/** JSON-LD built only from real database values. */
export function postJsonLd(post: Post, extra?: { season?: string; episode?: string }) {
  const url = absolute(pathForPost(post));
  const image = postImage(post);
  const graph: Record<string, unknown>[] = [
    {
      "@type": schemaType(post),
      name: post.title,
      url,
      ...(image ? { image: absolute(image) } : {}),
      ...(post.description ? { description: post.description } : {}),
      ...(post.genres.length ? { genre: post.genres } : {}),
      ...(post.languages ? { inLanguage: post.languages } : {}),
      ...(post.releaseDate ? { datePublished: post.releaseDate } : {}),
    },
  ];

  if (extra?.season) {
    graph.push({
      "@type": "TVSeason",
      seasonNumber: extra.season,
      url: `${url}/season/${extra.season}`,
      partOfSeries: { "@type": "TVSeries", name: post.title, url },
    });
  }
  if (extra?.season && extra?.episode) {
    graph.push({
      "@type": "TVEpisode",
      episodeNumber: extra.episode,
      url: `${url}/season/${extra.season}/episode/${extra.episode}`,
      partOfSeason: { "@type": "TVSeason", seasonNumber: extra.season },
      partOfSeries: { "@type": "TVSeries", name: post.title, url },
    });
  }

  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: siteUrl() },
      { "@type": "ListItem", position: 2, name: post.title, item: url },
    ],
  });

  return { "@context": "https://schema.org", "@graph": graph };
}

export function jsonLdScript(data: unknown) {
  return [{ type: "application/ld+json", children: JSON.stringify(data) }];
}
