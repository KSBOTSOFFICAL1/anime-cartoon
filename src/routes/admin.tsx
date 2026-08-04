import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, RotateCcw, Save, LogOut } from "lucide-react";
import type { Post } from "@/data/content";
import { emptyPost, resetPosts, savePosts, usePosts } from "@/lib/content-store";
import { AdminLogin } from "@/components/AdminLogin";
import { adminLogout, getAdminStatus } from "@/lib/admin-gate.functions";

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
  const logout = useServerFn(adminLogout);

  useEffect(() => {
    setDraft(stored);
    setActiveId((id) => (stored.some((p) => p.id === id) ? id : (stored[0]?.id ?? "")));
  }, [stored]);

  const active = draft.find((p) => p.id === activeId);

  const update = (patch: Partial<Post>) =>
    setDraft((d) => d.map((p) => (p.id === activeId ? { ...p, ...patch } : p)));

  const commit = () => {
    savePosts(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const addPost = (type: Post["type"]) => {
    const p = emptyPost(type);
    p.title = type === "movie" ? "New Movie" : "New Series";
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
              onClick={() => resetPosts()}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
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
        <aside className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => addPost("movie")}
              className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-2 text-xs text-foreground"
            >
              <Plus className="h-3 w-3" /> Movie
            </button>
            <button
              onClick={() => addPost("series")}
              className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-2 text-xs text-foreground"
            >
              <Plus className="h-3 w-3" /> Series
            </button>
          </div>
          {draft.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`w-full rounded-md border px-3 py-2 text-left text-xs ${
                p.id === activeId
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span className="block truncate font-medium">{p.title || "Untitled"}</span>
              <span className="text-[10px] uppercase tracking-wide">{p.type}</span>
            </button>
          ))}
        </aside>

        {active ? (
          <section className="space-y-4 rounded-xl border border-border bg-card p-4">
            <Field label="Title" value={active.title} onChange={(v) => update({ title: v })} />
            <Field label="Slug (URL)" value={active.slug} onChange={(v) => update({ slug: v })} />
            <Field
              label="Poster image URL"
              value={active.poster}
              onChange={(v) => update({ poster: v })}
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
