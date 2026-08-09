import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import type { Post, Season } from "@/data/content";
import { pathForPost } from "@/data/content";

function baseUrl(request: Request) {
  const configured = process.env["SITE_URL"];
  if (configured) return configured.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("posts")
          .select("data, updated_at")
          .order("position", { ascending: true });

        const BASE = baseUrl(request);
        const paths: string[] = ["/"];

        for (const row of data ?? []) {
          const post = row.data as unknown as Post;
          if (!post?.slug) continue;
          if (post.type === "page" && post.enabled === false) continue;
          const base = pathForPost(post);
          paths.push(base);
          for (const s of (post.seasons ?? []) as Season[]) {
            if (post.type !== "anime" && post.type !== "animation") continue;
            paths.push(`${base}/season/${s.number}`);
            if (post.type !== "anime") continue;
            s.episodes.forEach((e, i) => {
              const n = (e.number ?? "").trim() || String(i + 1);
              paths.push(`${base}/season/${s.number}/episode/${n}`);
            });
          }
        }

        const unique = Array.from(new Set(paths));
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...unique.map(
            (p) =>
              `  <url>\n    <loc>${BASE}${p}</loc>\n    <changefreq>${p === "/" ? "daily" : "weekly"}</changefreq>\n    <priority>${p === "/" ? "1.0" : "0.7"}</priority>\n  </url>`,
          ),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
