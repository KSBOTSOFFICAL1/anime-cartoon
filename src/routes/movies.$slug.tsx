import { createFileRoute, notFound } from "@tanstack/react-router";
import { PostDetail } from "@/components/PostDetail";
import { defaultPosts } from "@/data/content";
import { usePosts } from "@/lib/content-store";

export const Route = createFileRoute("/movies/$slug")({
  head: ({ params }) => {
    const post = defaultPosts.find((p) => p.slug === params.slug);
    const title = post ? `${post.title} Download — Atoz Toonsverse` : "Movie — Atoz Toonsverse";
    const description = post
      ? `Download ${post.title} in ${post.quality} with ${post.languages}.`
      : "Cartoon movie download page.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: MoviePage,
});

function MoviePage() {
  const { slug } = Route.useParams();
  const posts = usePosts();
  const post = posts.find((p) => p.slug === slug && p.type === "movie");
  if (!post) throw notFound();
  return <PostDetail post={post} />;
}
