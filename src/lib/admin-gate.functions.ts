import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import bcrypt from "bcryptjs";

type AdminSession = { unlocked?: boolean };

type AdminRow = { password_hash: string | null; setup_completed: boolean | null };

function config() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "admin-gate",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

async function getAdminRow(): Promise<AdminRow | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("password_hash, setup_completed")
    .eq("id", "admin")
    .maybeSingle();
  if (error) throw new Error("Could not read admin settings");
  return data as AdminRow | null;
}

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(config());
  const row = await getAdminRow();
  return { unlocked: Boolean(session.data.unlocked), setupRequired: !row?.password_hash };
});

export const adminCreatePassword = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; confirmPassword: string }) => data)
  .handler(async ({ data }) => {
    if (data.password.length < 6 || data.password !== data.confirmPassword) {
      return { ok: false as const, error: "Passwords must match and be at least 6 characters" };
    }
    const existing = await getAdminRow();
    if (existing?.password_hash) return { ok: false as const, error: "Admin password already exists" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const passwordHash = await bcrypt.hash(data.password, 12);
    const { error } = await supabaseAdmin.from("admin_settings").upsert(
      { id: "admin", password_hash: passwordHash, password_salt: "bcrypt", setup_completed: true, updated_at: new Date().toISOString() },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) return { ok: false as const, error: "Could not save admin password" };
    const saved = await getAdminRow();
    if (!saved?.password_hash) return { ok: false as const, error: "Could not save admin password" };
    const session = await useSession<AdminSession>(config());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const row = await getAdminRow();
    if (!row?.password_hash) return { ok: false as const };
    const ok = await bcrypt.compare(data.password, row.password_hash);
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

    const row = await getAdminRow();
    const currentOk = Boolean(row?.password_hash) && await bcrypt.compare(data.currentPassword, row.password_hash);
    if (!currentOk) return { ok: false as const, error: "Current password is incorrect" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("admin_settings")
      .update({
        password_hash: await bcrypt.hash(data.newPassword, 12),
        password_salt: "bcrypt",
        updated_at: new Date().toISOString(),
      })
      .eq("id", "admin");
    if (error) return { ok: false as const, error: "Could not save new password" };
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(config());
  await session.clear();
  return { ok: true as const };
});
