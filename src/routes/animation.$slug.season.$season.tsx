import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { EpisodeAccordion } from "@/components/EpisodeAccordion";
import type { Season } from "@/data/content";
import { getPostBySlug } from "@/lib/posts.functions";
import { buildMeta, canonicalLink, jsonLdScript, postImage, postJsonLd, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/animation/$slug/season/$season")({
  loader: ({ params }) => getPostBySlug({ data: { slug: params.slug, type: "animation" } }),
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: buildMeta({
          title: `Season — ${SITE_NAME}`,
          description: "Animation season page.",
          url: `/animation/${params.slug}/season/${params.season}`,
          noindex: true,
        }),
      };
    }
    const season = (post.seasons ?? []).find((s: Season) => s.number === params.season);
    const title = `${post.title} Season ${params.season} — Animation Download | ${SITE_NAME}`;
    const description = `Download ${post.title} Season ${params.season}${
      season ? ` (${season.episodes.length} episodes)` : ""
    } in ${post.quality || "HD"}${post.languages ? `, ${post.languages}` : ""}.`;
    return {
      meta: buildMeta({
        title,
        description,
        url: `/animation/${post.slug}/season/${params.season}`,
        image: season?.photo || postImage(post),
        type: "video.tv_show",
      }),
      links: canonicalLink(`/animation/${post.slug}/season/${params.season}`),
      scripts: jsonLdScript(postJsonLd(post, { season: params.season })),
    };
  },
  component: AnimationSeasonPage,
});

function AnimationSeasonPage() {
  const { post } = Route.useLoaderData();
  const { season: seasonNo, slug } = Route.useParams();
  if (!post) throw notFound();
  const season = (post.seasons ?? []).find((s: Season) => s.number === seasonNo);
  if (!season) throw notFound();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/animation/$slug" params={{ slug }} className="text-xs text-muted-foreground">
          ← {post.title}
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold text-foreground">
          {post.title} — Season {season.number}
        </h1>
        {season.photo ? (
          <img
            src={season.photo}
            alt={`${post.title} season ${season.number}`}
            className="mt-4 w-full rounded-xl border border-border object-cover"
          />
        ) : null}
        {season.link ? (
          <a
            href={season.link}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
          >
            Season Download
          </a>
        ) : null}
        <EpisodeAccordion episodes={season.episodes} />
      </div>
    </div>
  );
}
