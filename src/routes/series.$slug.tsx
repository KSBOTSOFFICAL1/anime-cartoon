import { createFileRoute, notFound } from "@tanstack/react-router";
import { PostDetail } from "@/components/PostDetail";
import { defaultPosts } from "@/data/content";
import { usePostsState } from "@/lib/content-store";

export const Route = createFileRoute("/series/$slug")({
  head: ({ params }) => {
    const post = defaultPosts.find((p) => p.slug === params.slug);
    const title = post ? `${post.title} Episodes Download — Atoz Toonsverse` : "Series — Atoz Toonsverse";
    const description = post
      ? `Download all episodes of ${post.title} in ${post.quality}, ${post.languages}.`
      : "Cartoon series download page.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: SeriesPage,
});

function SeriesPage() {
  const { slug } = Route.useParams();
  const { posts, ready } = usePostsState();
  const post = posts.find((p) => p.slug === slug && p.type === "series");
  if (!post) {
    if (!ready) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
          Loading...
        </div>
      );
    }
    throw notFound();
  }
  return <PostDetail post={post} />;
}
