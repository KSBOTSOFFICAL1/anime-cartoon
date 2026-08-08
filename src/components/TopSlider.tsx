import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Post } from "@/data/content";
import { CATEGORY_LABEL, pathForPost } from "@/data/content";
import { selectSliderPosts, sliderImage } from "@/lib/slider";
import { touchSliderShown } from "@/lib/posts.functions";

/** Top horizontal slider — reads existing content records, never duplicates them. */
export function TopSlider({ posts }: { posts: Post[] }) {
  const items = useMemo(() => selectSliderPosts(posts), [posts]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched || items.length === 0) return;
    setTouched(true);
    touchSliderShown({ data: { ids: items.map((p) => p.id) } }).catch(() => {});
  }, [items, touched]);

  if (items.length === 0) return null;

  const scrollBy = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="relative py-6">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">🔥 Featured</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="h-8 w-8 rounded-full border border-border text-muted-foreground"
          >
            ‹
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="h-8 w-8 rounded-full border border-border text-muted-foreground"
          >
            ›
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((post) => (
          <Link
            key={post.id}
            to={pathForPost(post)}
            className="group relative w-[260px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] sm:w-[320px]"
          >
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img
                src={sliderImage(post)}
                alt={`${post.title} cover`}
                loading="lazy"
                onError={(e) => {
                  const fallback = post.poster?.trim();
                  const el = e.currentTarget;
                  if (fallback && el.src !== fallback) el.src = fallback;
                  else el.style.visibility = "hidden";
                }}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="space-y-1 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {CATEGORY_LABEL[post.type]}
              </p>
              <h3 className="line-clamp-1 text-sm font-semibold text-card-foreground">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
