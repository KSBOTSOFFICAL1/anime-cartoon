import { createFileRoute, notFound } from "@tanstack/react-router";
import { PromoDetail } from "@/components/PromoDetail";
import { usePostsState } from "@/lib/content-store";

export const Route = createFileRoute("/promo/$slug")({
  head: () => ({
    meta: [
      { title: "New Promo — Anime Cartoon" },
      { name: "description", content: "Watch the latest cartoon promo video and upcoming release details." },
      { property: "og:title", content: "New Promo — Anime Cartoon" },
      { property: "og:description", content: "Watch the latest cartoon promo video and release date." },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PromoPage,
});

function PromoPage() {
  const { slug } = Route.useParams();
  const { posts, ready } = usePostsState();
  const post = posts.find((p) => p.slug === slug && p.type === "promo");
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
  return <PromoDetail post={post} />;
}
