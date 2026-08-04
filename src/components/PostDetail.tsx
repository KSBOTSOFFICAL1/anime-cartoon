import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";
import type { Post } from "@/data/content";

export function PostDetail({ post }: { post: Post }) {
  const [episode, setEpisode] = useState(0);
  const isSeries = post.type === "series";
  const link = isSeries ? (post.episodes[episode]?.url ?? "#") : post.downloadUrl || "#";

  const rows: [string, string][] = isSeries
    ? [
        ["Series Name", post.title],
        ["Release Date", post.releaseDate],
        ["Total Parts", `${post.episodes.length} Episodes`],
        ["Duration", post.duration],
        ["File Size", post.fileSize],
        ["Languages", post.languages],
        ["Video Quality", post.quality],
        ["Encoded By", post.encodedBy],
      ]
    : [
        ["Movie Title", post.title],
        ["Release Year", post.releaseDate],
        ["Genre", post.genres.join(" | ")],
        ["Language", post.languages],
        ["Duration", post.duration],
        ["Quality", post.quality],
        ["OTT Platform", post.ott],
        ["Encoded By", post.encodedBy],
      ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="relative h-52 overflow-hidden">
        {post.poster ? (
          <img src={post.poster} alt="" className="h-full w-full object-cover object-top" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <Link
          to="/"
          className="absolute left-3 top-3 rounded-md bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur"
        >
          ← Back
        </Link>
        <h1 className="absolute bottom-3 left-4 right-4 text-xl font-bold text-foreground">
          {post.title}
        </h1>
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <div className="flex flex-wrap gap-2 py-4">
          <Chip>{post.releaseDate}</Chip>
          {post.genres.map((g) => (
            <Chip key={g}>{g}</Chip>
          ))}
          <Chip tone="primary">{post.quality.split(" ")[0]}</Chip>
          <Chip tone="accent">Multi Audio</Chip>
        </div>

        <div className="mx-auto max-w-xs overflow-hidden rounded-xl border border-accent/60 shadow-[var(--shadow-card)]">
          {post.poster ? (
            <img
              src={post.poster}
              alt={`${post.title} poster`}
              loading="lazy"
              className="w-full"
            />
          ) : null}
        </div>

        <dl className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-3 px-4 py-3 text-sm">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="col-span-2 text-card-foreground">{v}</dd>
            </div>
          ))}
        </dl>

        {isSeries && post.episodes.length > 0 ? (
          <div className="mt-6">
            <label className="text-sm text-muted-foreground" htmlFor="ep">
              Select Episode:
            </label>
            <select
              id="ep"
              value={episode}
              onChange={(e) => setEpisode(Number(e.target.value))}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              {post.episodes.map((ep, i) => (
                <option key={ep.label} value={i}>
                  {ep.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <h2 className="mt-8 border-l-4 border-primary pl-3 text-lg font-bold uppercase tracking-wide text-foreground">
          Download Links
        </h2>

        <div className="mt-3 rounded-xl border border-border bg-card p-3">
          {post.poster ? (
            <img
              src={post.poster}
              alt=""
              loading="lazy"
              className="h-40 w-full rounded-lg object-cover"
            />
          ) : null}
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            <Download className="h-4 w-4" />
            {isSeries ? "Download Episode" : "Download 1080p (Google Drive)"}
          </a>
        </div>
      </div>

      <footer className="mt-12 border-t border-border bg-card py-5 text-center text-xs text-muted-foreground">
        Copyright © 2026 <span className="text-primary">Anime Cartoon</span>
      </footer>
    </div>
  );
}

function Chip({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "primary" | "accent";
}) {
  const cls =
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : tone === "accent"
        ? "bg-accent text-accent-foreground"
        : "bg-secondary text-secondary-foreground";
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{children}</span>;
}
