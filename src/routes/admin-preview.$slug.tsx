import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Post } from "@/data/content";
import { getPagePreview } from "@/lib/posts.functions";
import { CustomPageRender } from "@/components/CustomPageRender";

export const Route = createFileRoute("/admin-preview/$slug")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Page preview — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { slug } = Route.useParams();
  const load = useServerFn(getPagePreview);
  const [state, setState] = useState<{ ready: boolean; allowed: boolean; post: Post | null }>({
    ready: false,
    allowed: false,
    post: null,
  });

  useEffect(() => {
    load({ data: { slug } })
      .then((r) => setState({ ready: true, allowed: r.allowed, post: (r.post as Post | null) ?? null }))
      .catch(() => setState({ ready: true, allowed: false, post: null }));
  }, [load, slug]);

  if (!state.ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading preview...
      </div>
    );
  }

  if (!state.allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <h1 className="text-xl font-bold text-foreground">Admin login required</h1>
        <Link to="/admin" className="text-sm text-primary underline">
          Go to admin panel
        </Link>
      </div>
    );
  }

  if (!state.post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <h1 className="text-xl font-bold text-foreground">Page not found</h1>
        <Link to="/admin" className="text-sm text-primary underline">
          Back to admin
        </Link>
      </div>
    );
  }

  const post = state.post;

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wide text-primary">
            Preview {post.enabled === false ? "· disabled" : "· enabled"}
          </span>
          <Link to="/admin" className="text-xs text-muted-foreground underline">
            Back to admin
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-extrabold text-foreground">{post.title}</h1>
        {post.poster ? (
          <img
            src={post.poster}
            alt={post.title}
            className="mb-6 w-full rounded-xl border border-border object-cover"
          />
        ) : null}
        <CustomPageRender html={post.pageHtml ?? ""} css={post.pageCss ?? ""} js={post.pageJs ?? ""} />
      </main>
    </div>
  );
}
