import { createFileRoute, notFound } from "@tanstack/react-router";
import { PostDetail } from "@/components/PostDetail";
import { getPostBySlug } from "@/lib/posts.functions";
import { buildMeta, canonicalLink, jsonLdScript, postDescription, postImage, postJsonLd, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/animation/$slug")({
  loader: ({ params }) => getPostBySlug({ data: { slug: params.slug, type: "animation" } }),
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: buildMeta({
          title: `Animation — ${SITE_NAME}`,
          description: "Animation series download page.",
          url: `/animation/${params.slug}`,
          noindex: true,
        }),
      };
    }
    const title = `${post.title} — Animation Download | ${SITE_NAME}`;
    return {
      meta: buildMeta({
        title,
        description: postDescription(post),
        url: `/animation/${post.slug}`,
        image: postImage(post),
        type: "video.tv_show",
      }),
      links: canonicalLink(`/animation/${post.slug}`),
      scripts: jsonLdScript(postJsonLd(post)),
    };
  },
  component: AnimationPage,
});

function AnimationPage() {
  const { post } = Route.useLoaderData();
  if (!post) throw notFound();
  return <PostDetail post={post} />;
}
