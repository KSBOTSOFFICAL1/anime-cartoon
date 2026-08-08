import { Link } from "@tanstack/react-router";
import type { Post } from "@/data/content";
import { EpisodeAccordion } from "@/components/EpisodeAccordion";

/** Season list for anime / animation shows. Data comes from the database record. */
export function SeasonList({ post }: { post: Post }) {
  const seasons = post.seasons ?? [];
  if (seasons.length === 0) {
    return post.episodes.length ? <EpisodeAccordion episodes={post.episodes} /> : null;
  }

  const to =
    post.type === "animation"
      ? "/animation/$slug/season/$season"
      : "/anime/$slug/season/$season";

  return (
    <section className="mt-8 space-y-4">
      <h2 className="border-l-4 border-primary pl-3 text-lg font-bold uppercase tracking-wide text-foreground">
        Seasons
      </h2>
      {seasons.map((s) => (
        <div key={s.number} className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            {s.photo ? (
              <img
                src={s.photo}
                alt={`Season ${s.number}`}
                loading="lazy"
                className="h-16 w-28 rounded-lg object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-card-foreground">Season {s.number}</p>
              <p className="text-xs text-muted-foreground">{s.episodes.length} episodes</p>
            </div>
            <Link
              to={to}
              params={{ slug: post.slug, season: s.number }}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Open
            </Link>
          </div>
          {s.link ? (
            <a
              href={s.link}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-xs text-primary underline"
            >
              Season download link
            </a>
          ) : null}
        </div>
      ))}
    </section>
  );
}
