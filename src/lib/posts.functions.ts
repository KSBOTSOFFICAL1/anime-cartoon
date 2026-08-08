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

/** Public, read-only lookup used by route loaders so metadata is server-rendered. */
export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string; type?: string }) => ({
    slug: String(data.slug ?? "").slice(0, 120),
    type: data.type ? String(data.type).slice(0, 20) : undefined,
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin.from("posts").select("data").eq("slug", data.slug);
    if (data.type) query = query.eq("type", data.type);
    const { data: rows, error } = await query.limit(1);
    if (error || !rows?.length) return { post: null as Post | null };
    return { post: rows[0]!.data as unknown as Post };
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
      data: JSON.parse(JSON.stringify(p)),
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

/**
 * Records slider rotation state (last_shown_at) on the EXISTING post records.
 * Never inserts or duplicates content rows.
 */
export const touchSliderShown = createServerFn({ method: "POST" })
  .inputValidator((data: { ids: string[] }) => ({
    ids: (data.ids ?? []).slice(0, 24).map((id) => String(id).slice(0, 64)),
  }))
  .handler(async ({ data }) => {
    if (!data.ids.length) return { ok: true as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("posts")
      .select("id, data")
      .in("id", data.ids);
    const now = new Date().toISOString();
    for (const row of rows ?? []) {
      const post = row.data as unknown as Post;
      if (!post?.slider?.enabled) continue;
      post.slider = { ...post.slider, lastShownAt: now };
      await supabaseAdmin
        .from("posts")
        .update({ data: JSON.parse(JSON.stringify(post)) })
        .eq("id", row.id);
    }
    return { ok: true as const };
  });
