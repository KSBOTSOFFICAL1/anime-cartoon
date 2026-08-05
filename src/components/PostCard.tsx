import { Link } from "@tanstack/react-router";
import type { Post } from "@/data/content";

export function PostCard({ post }: { post: Post }) {
  const to =
    post.type === "movie"
      ? "/movies/$slug"
      : post.type === "series"
        ? "/series/$slug"
        : "/promo/$slug";
  return (
    <Link
      to={to}
      params={{ slug: post.slug }}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {post.poster ? (
          <img
            src={post.poster}
            alt={`${post.title} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          {post.type}
        </span>
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground">
          {post.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {post.year}
          {post.type === "series" ? ` • ${post.episodes.length}E` : ""}
        </p>
        {post.comingSoon ? (
          <p className="text-xs font-medium text-accent">🗓 {post.comingSoon}</p>
        ) : null}
      </div>
    </Link>
  );
}
