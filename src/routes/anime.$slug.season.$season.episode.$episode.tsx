import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download } from "lucide-react";
import type { Episode, Season } from "@/data/content";
import { getPostBySlug } from "@/lib/posts.functions";
import { buildMeta, canonicalLink, jsonLdScript, postImage, postJsonLd, SITE_NAME } from "@/lib/seo";

function findEpisode(season: Season | undefined, num: string): Episode | undefined {
  if (!season) return undefined;
  return (
    season.episodes.find((e) => (e.number ?? "").trim() === num) ??
    season.episodes[Number(num) - 1]
  );
}

export const Route = createFileRoute("/anime/$slug/season/$season/episode/$episode")({
  loader: ({ params }) => getPostBySlug({ data: { slug: params.slug, type: "anime" } }),
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: buildMeta({
          title: `Episode — ${SITE_NAME}`,
          description: "Anime episode page.",
          url: `/anime/${params.slug}/season/${params.season}/episode/${params.episode}`,
          noindex: true,
        }),
      };
    }
    const season = (post.seasons ?? []).find((s: Season) => s.number === params.season);
    const ep = findEpisode(season, params.episode);
    const title = `${post.title} S${params.season}E${params.episode}${
      ep?.label ? ` — ${ep.label}` : ""
    } | ${SITE_NAME}`;
    const description =
      ep?.description?.trim() ||
      `Download ${post.title} Season ${params.season} Episode ${params.episode} in ${post.quality || "HD"}.`;
    return {
      meta: buildMeta({
        title,
        description,
        url: `/anime/${post.slug}/season/${params.season}/episode/${params.episode}`,
        image: ep?.thumbnail || season?.photo || postImage(post),
        type: "video.episode",
      }),
      links: canonicalLink(`/anime/${post.slug}/season/${params.season}/episode/${params.episode}`),
      scripts: jsonLdScript(
        postJsonLd(post, { season: params.season, episode: params.episode }),
      ),
    };
  },
  component: EpisodePage,
});

function EpisodePage() {
  const { post } = Route.useLoaderData();
  const { slug, season: seasonNo, episode: episodeNo } = Route.useParams();
  if (!post) throw notFound();
  const season = (post.seasons ?? []).find((s: Season) => s.number === seasonNo);
  const ep = findEpisode(season, episodeNo);
  if (!ep) throw notFound();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link
          to="/anime/$slug/season/$season"
          params={{ slug, season: seasonNo }}
          className="text-xs text-muted-foreground"
        >
          ← {post.title} Season {seasonNo}
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold text-foreground">{ep.label}</h1>
        {ep.thumbnail ? (
          <img
            src={ep.thumbnail}
            alt={ep.label}
            className="mt-4 w-full rounded-xl border border-border object-cover"
          />
        ) : null}
        {ep.description ? (
          <p className="mt-4 text-sm text-muted-foreground">{ep.description}</p>
        ) : null}
        <div className="mt-6 space-y-3">
          {ep.telegramUrl || ep.url ? (
            <a
              href={ep.telegramUrl || ep.url}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-accent-foreground"
            >
              <Download className="h-4 w-4" /> Telegram Download
            </a>
          ) : null}
          {ep.driveUrl ? (
            <a
              href={ep.driveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-secondary-foreground"
            >
              <Download className="h-4 w-4" /> Google Drive Download
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
