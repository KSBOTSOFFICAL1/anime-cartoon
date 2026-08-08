import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

type AdminSession = { unlocked?: boolean };

export type GoogleVerification = { filename: string; content: string; updatedAt: string } | null;

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "admin-gate",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

/** Only a safe, flat "googleXXXX.html" style filename is accepted (no path traversal). */
function safeFilename(input: string): string | null {
  const name = String(input ?? "").trim();
  if (!/^[A-Za-z0-9._-]{5,80}\.html$/.test(name)) return null;
  if (name.includes("..") || name.includes("/") || name.includes("\\")) return null;
  return name;
}

export const getGoogleVerification = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "google_verification")
    .maybeSingle();
  return { verification: (data?.value ?? null) as GoogleVerification };
});

export const saveGoogleVerification = createServerFn({ method: "POST" })
  .inputValidator((data: { filename: string; content: string }) => data)
  .handler(async ({ data }) => {
    const session = await useSession<AdminSession>(sessionConfig());
    if (!session.data.unlocked) return { ok: false as const, error: "Not logged in" };

    const filename = safeFilename(data.filename);
    if (!filename) {
      return { ok: false as const, error: "Filename must look like google1234abcd.html" };
    }
    const content = String(data.content ?? "").slice(0, 4000);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("site_settings").upsert(
      {
        key: "google_verification",
        value: { filename, content, updatedAt: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) return { ok: false as const, error: "Could not save verification file" };
    return { ok: true as const, filename };
  });

export const deleteGoogleVerification = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  if (!session.data.unlocked) return { ok: false as const, error: "Not logged in" };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("site_settings").delete().eq("key", "google_verification");
  return { ok: true as const };
});
