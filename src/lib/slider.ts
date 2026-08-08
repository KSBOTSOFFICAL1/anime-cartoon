import type { Post } from "@/data/content";

export const SLIDER_ROTATION_DAYS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

function time(value?: string) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Slider image fallback: explicit slider image → 16:9 banner → poster. */
export function sliderImage(post: Post): string {
  return post.slider?.image?.trim() || post.banner?.trim() || post.poster?.trim() || "";
}

/**
 * Eligible = slider enabled, published, not expired, not a page.
 * The 12-day rule only affects ordering inside the slider — never listings.
 * No records are duplicated: the same post object is reused when it returns.
 */
export function selectSliderPosts(posts: Post[], now = Date.now(), limit = 12): Post[] {
  const eligible = posts.filter((p) => {
    if (p.type === "page" || !p.slider?.enabled) return false;
    if (!sliderImage(p)) return false;
    const published = time(p.slider.publishedAt);
    if (published && published > now) return false;
    const expires = time(p.slider.expiresAt);
    if (expires && expires <= now) return false;
    return true;
  });

  const cutoff = now - SLIDER_ROTATION_DAYS * DAY_MS;
  const rank = (p: Post) => {
    const published = time(p.slider?.publishedAt);
    const lastShown = time(p.slider?.lastShownAt);
    if (published >= cutoff) return 0; // brand new content gets priority
    if (!lastShown || lastShown <= cutoff) return 1; // older content may return after 12 days
    return 2; // shown recently — only used when nothing else is available
  };

  return eligible
    .slice()
    .sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      const order = (a.slider?.order ?? 0) - (b.slider?.order ?? 0);
      if (order !== 0) return order;
      return time(b.slider?.publishedAt) - time(a.slider?.publishedAt);
    })
    .slice(0, limit);
}
