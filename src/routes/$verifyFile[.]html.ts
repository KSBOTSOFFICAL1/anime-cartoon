import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Serves the Google Search Console verification file stored in the database.
 * The filename is dynamic and validated; nothing else is exposed.
 */
export const Route = createFileRoute("/$verifyFile.html")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const name = String((params as Record<string, string>)["verifyFile"] ?? "");
        if (!/^[A-Za-z0-9._-]{1,75}$/.test(name) || name.includes("..")) {
          return new Response("Not found", { status: 404 });
        }
        const requested = `${name}.html`;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("site_settings")
          .select("value")
          .eq("key", "google_verification")
          .maybeSingle();

        const record = (data?.value ?? null) as { filename?: string; content?: string } | null;
        if (!record?.filename || record.filename !== requested) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(record.content ?? `google-site-verification: ${requested}`, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      },
    },
  },
});
