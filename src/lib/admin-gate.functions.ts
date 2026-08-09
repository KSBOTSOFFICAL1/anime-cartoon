import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

type AdminSession = { unlocked?: boolean };

function config() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "admin-gate",
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function hashWith(password: string, salt: string) {
  return createHash("sha256").update(`${salt}:${password}`, "utf8").digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = createHash("sha256").update(a, "utf8").digest();
  const y = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(x, y);
}

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(config());
  return { unlocked: Boolean(session.data.unlocked) };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("admin_settings")
      .select("password_hash, password_salt")
      .eq("id", "admin")
      .maybeSingle();

    let ok = false;
    if (row) {
      ok = safeEqual(hashWith(data.password, row.password_salt), row.password_hash);
    } else {
      const expected = process.env["ADMIN_PASSWORD"];
      if (!expected) throw new Error("ADMIN_PASSWORD is not set");
      ok = safeEqual(data.password, expected);
    }

    if (!ok) return { ok: false as const };
    const session = await useSession<AdminSession>(config());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminChangePassword = createServerFn({ method: "POST" })
  .inputValidator((data: { currentPassword: string; newPassword: string }) => data)
  .handler(async ({ data }) => {
    const session = await useSession<AdminSession>(config());
    if (!session.data.unlocked) return { ok: false as const, error: "Not logged in" };
    if (data.newPassword.length < 6) {
      return { ok: false as const, error: "New password must be at least 6 characters" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("admin_settings")
      .select("password_hash, password_salt")
      .eq("id", "admin")
      .maybeSingle();

    const currentOk = row
      ? safeEqual(hashWith(data.currentPassword, row.password_salt), row.password_hash)
      : safeEqual(data.currentPassword, process.env["ADMIN_PASSWORD"] ?? "");
    if (!currentOk) return { ok: false as const, error: "Current password is incorrect" };

    const salt = randomBytes(16).toString("hex");
    const { error } = await supabaseAdmin.from("admin_settings").upsert(
      {
        id: "admin",
        password_hash: hashWith(data.newPassword, salt),
        password_salt: salt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) return { ok: false as const, error: "Could not save new password" };
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(config());
  await session.clear();
  return { ok: true as const };
});
