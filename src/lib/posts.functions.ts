import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import type { Post } from "@/data/content";

type AdminSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "admin-gate",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

export const listPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("data, position")
    .order("position", { ascending: true });
  if (error) return { posts: [] as Post[] };
  return { posts: (data ?? []).map((r) => r.data as unknown as Post) };
});

export const savePostsRemote = createServerFn({ method: "POST" })
  .inputValidator((data: { posts: Post[] }) => data)
  .handler(async ({ data }) => {
    const session = await useSession<AdminSession>(sessionConfig());
    if (!session.data.unlocked) return { ok: false as const, error: "Not logged in" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = data.posts.map((p, i) => ({
      id: p.id,
      slug: p.slug,
      type: p.type,
      position: i,
      data: p as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    }));

    const keep = rows.map((r) => r.id);
    if (keep.length) {
      const { error: upErr } = await supabaseAdmin.from("posts").upsert(rows, { onConflict: "id" });
      if (upErr) return { ok: false as const, error: "Could not save posts" };
      await supabaseAdmin
        .from("posts")
        .delete()
        .not("id", "in", `(${keep.map((k) => `"${k}"`).join(",")})`);
    } else {
      await supabaseAdmin.from("posts").delete().neq("id", "");
    }

    return { ok: true as const };
  });
