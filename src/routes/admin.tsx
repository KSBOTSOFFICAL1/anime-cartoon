import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Save, LogOut, KeyRound } from "lucide-react";
import type { Post } from "@/data/content";
import { emptyPost, savePosts, usePosts } from "@/lib/content-store";
import { AdminLogin } from "@/components/AdminLogin";
import { adminChangePassword, adminLogout, getAdminStatus } from "@/lib/admin-gate.functions";
import { embedUrl } from "@/lib/video";


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Atoz Toonsverse" },
      { name: "description", content: "Manage cartoon movie and series posts, links and episodes." },
      { property: "og:title", content: "Admin Panel — Atoz Toonsverse" },
      { property: "og:description", content: "Manage cartoon posts, download links and episodes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const status = useServerFn(getAdminStatus);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    status({}).then((r) => setUnlocked(r.unlocked)).catch(() => setUnlocked(false));
  }, [status]);

  if (unlocked === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }
  if (!unlocked) return <AdminLogin onUnlocked={() => setUnlocked(true)} />;
  return <AdminPanel />;
}

function AdminPanel() {
  const stored = usePosts();
  const [draft, setDraft] = useState<Post[]>(stored);
  const [activeId, setActiveId] = useState<string>(stored[0]?.id ?? "");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const logout = useServerFn(adminLogout);


  useEffect(() => {
    setDraft(stored);
    setActiveId((id) => (stored.some((p) => p.id === id) ? id : (stored[0]?.id ?? "")));
  }, [stored]);

  const active = draft.find((p) => p.id === activeId);

  const update = (patch: Partial<Post>) =>
    setDraft((d) => d.map((p) => (p.id === activeId ? { ...p, ...patch } : p)));

  const commit = async () => {
    const res = await savePosts(draft);
    if (res?.ok === false) {
      alert(res.error ?? "Could not save posts");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const addPost = (type: Post["type"]) => {
    const p = emptyPost(type);
    p.title = type === "movie" ? "New Movie" : type === "series" ? "New Series" : "New Promo";
    p.slug = `new-${type}-${Date.now()}`;
    setDraft((d) => [...d, p]);
    setActiveId(p.id);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-extrabold text-foreground">Admin Panel</h1>
          <div className="flex gap-2">
            <Link
              to="/"
              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
            >
              View site
            </Link>
            <button
              onClick={commit}
              className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <Save className="h-3 w-3" /> {saved ? "Saved!" : "Save"}
            </button>
            <button
              onClick={async () => {
                await logout({});
                window.location.reload();
              }}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
            >
              <LogOut className="h-3 w-3" /> Logout
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-4">
          <button
            onClick={() => setShowPassword((v) => !v)}
            className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
          >
            <KeyRound className="h-3 w-3" /> {showPassword ? "Close" : "Change password"}
          </button>
          {showPassword && <ChangePassword />}
        </div>
      </header>



      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <aside className="space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Posts
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => addPost("movie")}
                className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-2 text-xs text-foreground"
              >
                <Plus className="h-3 w-3" /> Movie
              </button>
              <button
                onClick={() => addPost("promo")}
                className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-2 text-xs text-foreground"
              >
                <Plus className="h-3 w-3" /> Promo
              </button>
              <button
                onClick={() => addPost("series")}
                className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-2 text-xs text-foreground"
              >
                <Plus className="h-3 w-3" /> Series
              </button>
            </div>
            {draft
              .filter((p) => p.type !== "page")
              .map((p) => (
                <SidebarItem
                  key={p.id}
                  post={p}
                  active={p.id === activeId}
                  onClick={() => setActiveId(p.id)}
                />
              ))}
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Pages
            </p>
            <button
              onClick={() => addPost("page")}
              className="flex w-full items-center justify-center gap-1 rounded-md border border-border py-2 text-xs text-foreground"
            >
              <Plus className="h-3 w-3" /> Add Page
            </button>
            {draft
              .filter((p) => p.type === "page")
              .map((p) => (
                <SidebarItem
                  key={p.id}
                  post={p}
                  active={p.id === activeId}
                  onClick={() => setActiveId(p.id)}
                />
              ))}
          </div>
        </aside>

        {active ? (
          <section className="space-y-4 rounded-xl border border-border bg-card p-4">
            <Field label="Title" value={active.title} onChange={(v) => update({ title: v })} />
            <Field label="Slug (URL)" value={active.slug} onChange={(v) => update({ slug: v })} />
            <Field
              label="Poster photo link (4:6 vertical)"
              value={active.poster}
              onChange={(v) => update({ poster: v })}
            />
            {active.type === "promo" ? (
              <>
                <Field
                  label="Promo video link (YouTube)"
                  value={active.promoVideo ?? ""}
                  onChange={(v) => update({ promoVideo: v })}
                />
                {active.promoVideo?.trim() ? (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Video preview</p>
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-background">
                      <iframe
                        key={active.promoVideo}
                        src={embedUrl(active.promoVideo)}
                        title="Promo video preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                    <a
                      href={active.promoVideo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline"
                    >
                      Open link in new tab
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Paste a YouTube link to see the preview here.
                  </p>
                )}
                <Field
                  label="Release date (optional)"
                  value={active.releaseDate}
                  onChange={(v) => update({ releaseDate: v })}
                />
                <Toggle
                  label="Post views"
                  checked={active.showViews !== false}
                  onChange={(v) => update({ showViews: v })}
                />
                <Toggle
                  label="Comments"
                  checked={active.allowComments !== false}
                  onChange={(v) => update({ allowComments: v })}
                />
                <p className="text-xs text-muted-foreground">
                  Telegram join link is shown automatically on every promo page.
                </p>
              </>
            ) : (
              <>
              <Field
                label="Banner photo link (16:9 wide)"
                value={active.banner ?? ""}
                onChange={(v) => update({ banner: v })}
              />
              <Field
                label="Download photo link"
                value={active.downloadImage ?? ""}
                onChange={(v) => update({ downloadImage: v })}
              />
              <Field
                label="Drive Download link (optional)"
                value={active.driveUrl ?? ""}
                onChange={(v) => update({ driveUrl: v })}
              />
              <Field
                label="Telegram bot Download link (optional)"
                value={active.telegramUrl ?? ""}
                onChange={(v) => update({ telegramUrl: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Year" value={active.year} onChange={(v) => update({ year: v })} />
                <Field
                  label="Release date"
                  value={active.releaseDate}
                  onChange={(v) => update({ releaseDate: v })}
                />
              </div>
              <Field
                label="Genres (comma separated)"
                value={active.genres.join(", ")}
                onChange={(v) => update({ genres: v.split(",").map((g) => g.trim()).filter(Boolean) })}
              />
              <Field
                label="Languages"
                value={active.languages}
                onChange={(v) => update({ languages: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Duration"
                  value={active.duration}
                  onChange={(v) => update({ duration: v })}
                />
                <Field
                  label="File size"
                  value={active.fileSize}
                  onChange={(v) => update({ fileSize: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Quality"
                  value={active.quality}
                  onChange={(v) => update({ quality: v })}
                />
                <Field label="OTT platform" value={active.ott} onChange={(v) => update({ ott: v })} />
              </div>
              <Field
                label="Coming soon date (optional)"
                value={active.comingSoon ?? ""}
                onChange={(v) => update({ comingSoon: v })}
              />

              {active.type === "movie" ? (
                <Field
                  label="Download link"
                  value={active.downloadUrl}
                  onChange={(v) => update({ downloadUrl: v })}
                />
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Episodes</p>
                  {active.episodes.map((ep, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={ep.label}
                        onChange={(e) =>
                          update({
                            episodes: active.episodes.map((x, j) =>
                              j === i ? { ...x, label: e.target.value } : x,
                            ),
                          })
                        }
                        className="h-9 w-36 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        value={ep.url}
                        onChange={(e) =>
                          update({
                            episodes: active.episodes.map((x, j) =>
                              j === i ? { ...x, url: e.target.value } : x,
                            ),
                          })
                        }
                        className="h-9 flex-1 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={() =>
                          update({ episodes: active.episodes.filter((_, j) => j !== i) })
                        }
                        className="rounded-md border border-border px-2 text-muted-foreground"
                        aria-label="Remove episode"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      update({
                        episodes: [
                          ...active.episodes,
                          {
                            label: `Episode ${String(active.episodes.length + 1).padStart(2, "0")}`,
                            url: "",
                          },
                        ],
                      })
                    }
                    className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground"
                  >
                    + Add episode
                  </button>
                </div>
              )}
              </>
            )}

            <button
              onClick={() => {
                const next = draft.filter((p) => p.id !== activeId);
                setDraft(next);
                setActiveId(next[0]?.id ?? "");
              }}
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <Trash2 className="h-3 w-3" /> Delete this post
            </button>
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">No posts. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
          checked ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {checked ? "On" : "Off"}
      </button>
    </label>
  );
}

function ChangePassword() {
  const change = useServerFn(adminChangePassword);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await change({ data: { currentPassword: current, newPassword: next } });
      if (res.ok) {
        setMsg({ ok: true, text: "Password changed successfully" });
        setCurrent("");
        setNext("");
      } else {
        setMsg({ ok: false, text: res.error ?? "Could not change password" });
      }
    } catch {
      setMsg({ ok: false, text: "Something went wrong" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-3 grid gap-3 rounded-xl border border-border bg-card p-4 sm:max-w-sm"
    >
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">
          Current password
        </span>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">New password</span>
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      {msg && (
        <p className={`text-xs ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>
      )}
      <button
        type="submit"
        disabled={busy || !current || !next}
        className="h-10 rounded-md bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {busy ? "Saving..." : "Update password"}
      </button>
    </form>
  );
}

