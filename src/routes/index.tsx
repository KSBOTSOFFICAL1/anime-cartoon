import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/PostCard";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { usePosts } from "@/lib/content-store";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anime Cartoon — Download Cartoon Movies & Series in HD" },
      {
        name: "description",
        content:
          "Download the latest Hindi dubbed cartoon movies and series in 1080p FHD multi-audio. Fresh Little Singham, Chhota Bheem and Motu Patlu aur Anime Cartoon.",
      },
      { property: "og:title", content: "Anime Cartoon — Download Cartoon Movies & Series in HD" },
      {
        property: "og:description",
        content: "Download the latest Hindi dubbed cartoon movies and series in 1080p FHD multi-audio. Fresh Little Singham, Chhota Bheem and Motu Patlu aur Anime Cartoon.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const posts = usePosts();
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");

  const visible = useMemo(() => posts.filter((p) => !p.hidden), [posts]);

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return visible;
    return visible.filter((p) => p.title.toLowerCase().includes(t));
  }, [visible, term]);

  const movies = filtered.filter((p) => p.type === "movie");
  const series = filtered.filter((p) => p.type === "series");
  const promos = filtered.filter((p) => p.type === "promo");
  const pages = visible.filter((p) => p.type === "page");

  return (
    <div className="min-h-screen bg-background pb-16">
      <AnnouncementBanner />
      <header className="sticky top-12 z-20 mt-12 border-b border-border bg-background/95 backdrop-blur">

        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center">
            <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
              Anime Cartoon
            </span>
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



      <main className="mx-auto max-w-5xl px-4">
        <Section title="🎬 Movies" count={`Showing ${movies.length}`}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {movies.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </Section>

        {promos.length > 0 ? (
          <Section title="🎬 New Promo" count={`Showing ${promos.length}`}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {promos.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Section>
        ) : null}

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
        {pages.length > 0 ? (
          <nav className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {pages.map((p) => (
              <Link key={p.id} to="/page/$slug" params={{ slug: p.slug }} className="hover:text-primary">
                {p.title || "Untitled"}
              </Link>
            ))}
          </nav>
        ) : null}
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
