import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Send } from "lucide-react";
import { TELEGRAM_JOIN_URL, type Post } from "@/data/content";
import { useComments, useViewCount } from "@/lib/content-store";
import { embedUrl } from "@/lib/video";

export function PromoDetail({ post }: { post: Post }) {
  const views = useViewCount(post.slug, post.showViews !== false);
  const { comments, add } = useComments(post.slug);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border px-4 py-3">
        <Link to="/" className="text-sm font-medium text-muted-foreground">
          ← Back
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        <div className="flex gap-4">
          <div className="w-28 shrink-0 overflow-hidden rounded-xl border border-accent/60">
            {post.poster ? (
              <img src={post.poster} alt={`${post.title} poster`} className="w-full" />
            ) : null}
          </div>
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
              🎬 Promo
            </span>
            <h1 className="text-xl font-bold text-foreground">{post.title}</h1>
            {post.releaseDate ? (
              <p className="text-sm text-muted-foreground">
                Releasing: <span className="text-primary">{post.releaseDate}</span>
              </p>
            ) : null}
            {post.showViews !== false ? (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" /> {views} views
              </p>
            ) : null}
          </div>
        </div>

        {post.promoVideo ? (
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-border bg-card">
            <iframe
              src={embedUrl(post.promoVideo)}
              title={`${post.title} promo video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : null}

        <a
          href={TELEGRAM_JOIN_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          <Send className="h-4 w-4" /> Join us on Telegram for updates!
        </a>

        {post.allowComments !== false ? (
          <section className="mt-8">
            <h2 className="border-l-4 border-primary pl-3 text-lg font-bold text-foreground">
              Comments
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!text.trim()) return;
                add(name.trim() || "Guest", text.trim());
                setText("");
              }}
              className="mt-3 space-y-2"
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="h-10 rounded-lg bg-secondary px-5 text-sm font-semibold text-secondary-foreground"
              >
                Post comment
              </button>
            </form>

            <ul className="mt-4 space-y-3">
              {comments.map((c) => (
                <li key={c.at} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs font-semibold text-primary">{c.name}</p>
                  <p className="text-sm text-card-foreground">{c.text}</p>
                </li>
              ))}
              {comments.length === 0 ? (
                <li className="text-sm text-muted-foreground">No comments yet.</li>
              ) : null}
            </ul>
          </section>
        ) : null}
      </main>

      <footer className="mt-12 border-t border-border bg-card py-5 text-center text-xs text-muted-foreground">
        Copyright © 2026 <span className="text-primary">Anime Cartoon</span>
      </footer>
    </div>
  );
}
