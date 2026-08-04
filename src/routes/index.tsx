import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/lib/content-store";
import logoAsset from "@/assets/anime-cartoon-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anime Cartoon — Download Cartoon Movies & Series in HD" },
      {
        name: "description",
        content:
          "Download the latest Hindi dubbed cartoon movies and series in 1080p FHD multi-audio. Fresh Little Singham, Chhota Bheem and Motu Patlu releases.",
      },
      { property: "og:title", content: "Anime Cartoon — Cartoon Movies & Series in HD" },
      {
        property: "og:description",
        content: "Latest cartoon movies and series in 1080p multi-audio, ready to download.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const posts = usePosts();
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(t));
  }, [posts, term]);

  const movies = filtered.filter((p) => p.type === "movie");
  const series = filtered.filter((p) => p.type === "series");

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center">
            <img
              src={logoAsset.url}
              alt="Anime Cartoon"
              className="h-9 w-auto rounded-md"
            />
          </Link>
          <Link
            to="/admin"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin
          </Link>
        </div>
        <div className="mx-auto flex max-w-5xl gap-2 px-4 pb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setTerm(query)}
            placeholder="Search cartoons..."
            className="h-11 flex-1 rounded-lg border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => setTerm(query)}
            className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            Search
          </button>
        </div>
      </header>

      <div className="border-b border-border bg-[image:var(--gradient-hero)] px-4 py-3 text-center text-sm font-medium text-primary-foreground">
        ✈️ Get notified instantly when new cartoons drop
      </div>

      <main className="mx-auto max-w-5xl px-4">
        <Section title="🎬 Movies" count={`Showing ${movies.length}`}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {movies.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </Section>

        <Section title="📺 Series" count={`Showing ${series.length}`}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {series.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </Section>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No cartoons match “{term}”.
          </p>
        ) : null}
      </main>

      <footer className="mt-12 border-t border-border bg-card py-5 text-center text-xs text-muted-foreground">
        Copyright © 2026 <span className="text-primary">Anime Cartoon</span>
      </footer>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>
      {children}
    </section>
  );
}
