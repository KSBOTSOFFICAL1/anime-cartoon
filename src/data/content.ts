export type Episode = {
  label: string;
  url: string;
  thumbnail?: string;
  description?: string;
  telegramUrl?: string;
  driveUrl?: string;
  isNew?: boolean;
  /** Optional explicit episode number, used for /episode/<n> routes. */
  number?: string;
};

export const TELEGRAM_JOIN_URL = "https://t.me/+-rRx3CW3SvEyNWY9";

/** A season belongs to an anime / animation / series post and holds its own episodes. */
export type Season = {
  number: string;
  link?: string;
  photo?: string;
  episodes: Episode[];
};

/** Optional movie links attached to an anime / animation show. */
export type MovieLink = {
  name: string;
  photo?: string;
  url?: string;
};

/** Home horizontal slider configuration stored with the content record itself. */
export type SliderConfig = {
  enabled?: boolean;
  image?: string;
  order?: number;
  publishedAt?: string;
  lastShownAt?: string;
  expiresAt?: string;
};

export type PostType = "movie" | "series" | "promo" | "page" | "anime" | "animation";

export type Post = {
  id: string;
  slug: string;
  type: PostType;
  content?: string;
  hidden?: boolean;
  title: string;
  poster: string;
  banner?: string;
  downloadImage?: string;
  driveUrl?: string;
  telegramUrl?: string;
  promoVideo?: string;
  showViews?: boolean;
  allowComments?: boolean;
  year: string;
  releaseDate: string;
  genres: string[];
  languages: string;
  duration: string;
  quality: string;
  fileSize: string;
  ott: string;
  encodedBy: string;
  comingSoon?: string;
  downloadUrl: string;
  episodes: Episode[];
  /** Anime / Animation extras (all optional, backward compatible). */
  subtitle?: string;
  seasonNo?: string;
  totalEpisodes?: string;
  description?: string;
  seasons?: Season[];
  movieLinks?: MovieLink[];
  slider?: SliderConfig;
};

export const defaultPosts: Post[] = [];

export const CATEGORY_LABEL: Record<PostType, string> = {
  movie: "🎬 Movie",
  series: "🖼️ Series",
  promo: "🎬 Promo",
  page: "Page",
  anime: "🎌 Anime",
  animation: "🎭 Animation",
};

/** Route path for a content type (used by cards, slider and sitemap). */
export function pathForPost(post: Pick<Post, "type" | "slug">): string {
  switch (post.type) {
    case "movie":
      return `/movies/${post.slug}`;
    case "series":
      return `/series/${post.slug}`;
    case "anime":
      return `/anime/${post.slug}`;
    case "animation":
      return `/animation/${post.slug}`;
    case "page":
      return `/page/${post.slug}`;
    default:
      return `/promo/${post.slug}`;
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Ensures the slug is unique across the given posts (never hardcoded). */
export function uniqueSlug(base: string, posts: Post[], selfId?: string): string {
  const root = slugify(base) || "untitled";
  let candidate = root;
  let n = 2;
  while (posts.some((p) => p.slug === candidate && p.id !== selfId)) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}
