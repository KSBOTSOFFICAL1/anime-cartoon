import { createFileRoute, notFound } from "@tanstack/react-router";
import { PostDetail } from "@/components/PostDetail";
import { getPostBySlug } from "@/lib/posts.functions";
import { buildMeta, canonicalLink, jsonLdScript, postDescription, postImage, postJsonLd, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/anime/$slug")({
  loader: ({ params }) => getPostBySlug({ data: { slug: params.slug, type: "anime" } }),
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: buildMeta({
          title: `Anime — ${SITE_NAME}`,
          description: "Anime series download page.",
          url: `/anime/${params.slug}`,
          noindex: true,
        }),
      };
    }
    const title = `${post.title} — Anime Download | ${SITE_NAME}`;
    return {
      meta: buildMeta({
        title,
        description: postDescription(post),
        url: `/anime/${post.slug}`,
        image: postImage(post),
        type: "video.tv_show",
      }),
      links: canonicalLink(`/anime/${post.slug}`),
      scripts: jsonLdScript(postJsonLd(post)),
    };
  },
  component: AnimePage,
});

function AnimePage() {
  const { post } = Route.useLoaderData();
  if (!post) throw notFound();
  return <PostDetail post={post} />;
}
