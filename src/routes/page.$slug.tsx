import { createFileRoute, Link } from "@tanstack/react-router";
import { usePostsState } from "@/lib/content-store";

export const Route = createFileRoute("/page/$slug")({
  head: () => ({
    meta: [
      { title: "Page — Anime Cartoon" },
      { name: "description", content: "Information page on Anime Cartoon." },
      { property: "og:title", content: "Page — Anime Cartoon" },
      { property: "og:description", content: "Information page on Anime Cartoon." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PageView,
});

function PageView() {
  const { slug } = Route.useParams();
  const { posts, ready } = usePostsState();
  const page = posts.find((p) => p.type === "page" && p.slug === slug);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <h1 className="text-xl font-bold text-foreground">Page not found</h1>
        <Link to="/" className="text-sm text-primary underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link to="/" className="text-sm text-muted-foreground">
            ← Back to home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-extrabold text-foreground">{page.title}</h1>
        {page.poster ? (
          <img
            src={page.poster}
            alt={page.title}
            className="mb-6 w-full rounded-xl border border-border object-cover"
          />
        ) : null}
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          {(page.content ?? "")
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
        </div>
      </main>
    </div>
  );
}
