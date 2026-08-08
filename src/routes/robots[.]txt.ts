import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const configured = process.env["SITE_URL"];
        const base = configured ? configured.replace(/\/+$/, "") : new URL(request.url).origin;
        const body = [
          "User-agent: *",
          "Allow: /",
          "",
          "Disallow: /admin",
          "Disallow: /admin/",
          "Disallow: /api/admin/",
          "",
          `Sitemap: ${base}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
