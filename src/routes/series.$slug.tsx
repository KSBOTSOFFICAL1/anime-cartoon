import { createFileRoute, notFound } from "@tanstack/react-router";
import { PostDetail } from "@/components/PostDetail";
import { defaultPosts } from "@/data/content";
import { usePosts } from "@/lib/content-store";

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
  const posts = usePosts();
  const post = posts.find((p) => p.slug === slug && p.type === "series");
  if (!post) throw notFound();
  return <PostDetail post={post} />;
}
