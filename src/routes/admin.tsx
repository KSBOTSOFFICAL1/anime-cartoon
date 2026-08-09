import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Save, LogOut, KeyRound, Pencil } from "lucide-react";
import type { MovieLink, Post, Season } from "@/data/content";
import { uniqueSlug } from "@/data/content";
import { getGoogleVerification, saveGoogleVerification } from "@/lib/seo.functions";
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
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    status({}).then((r) => {
      setUnlocked(r.unlocked);
      setSetupRequired(r.setupRequired);
    }).catch(() => setUnlocked(false));
  }, [status]);

  if (unlocked === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }
  if (!unlocked) return <AdminLogin setupRequired={setupRequired} onUnlocked={() => setUnlocked(true)} />;
  return <AdminPanel />;
}

function AdminPanel() {
  const stored = usePosts();
  const [draft, setDraft] = useState<Post[]>(stored);
  const [activeId, setActiveId] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const logout = useServerFn(adminLogout);


  useEffect(() => {
    setDraft(stored);
    setActiveId((id) => (stored.some((p) => p.id === id) ? id : ""));
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
    setActiveId("");
    setTimeout(() => setSaved(false), 1800);
  };


  const addPost = (type: Post["type"]) => {
    const p = emptyPost(type);
    p.title =
      type === "movie"
        ? "New Movie"
        : type === "series"
          ? "New Series"
          : type === "page"
            ? "New Page"
            : type === "anime"
              ? "New Anime"
              : type === "animation"
                ? "New Animation"
                : "New Promo";
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
          <SeoSettings />
        </div>
      </header>



      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <aside className="space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Posts
            </p>
            <div className="flex flex-wrap gap-2">
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
                onClick={() => addPost("anime")}
                className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-2 text-xs text-foreground"
              >
                <Plus className="h-3 w-3" /> Anime
              </button>
              <button
                onClick={() => addPost("animation")}
                className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-2 text-xs text-foreground"
              >
                <Plus className="h-3 w-3" /> Animation
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
            <Field
              label="Show / Title name"
              value={active.title}
              onChange={(v) =>
                update({
                  title: v,
                  ...(active.slug.startsWith("new-") ? { slug: uniqueSlug(v, draft, active.id) } : {}),
                })
              }
            />
            <Field label="Slug (URL)" value={active.slug} onChange={(v) => update({ slug: v })} />
            <Field
              label={
                active.type === "page"
                  ? "Page image link (optional)"
                  : "Poster photo link (4:6 vertical)"
              }
              value={active.poster}
              onChange={(v) => update({ poster: v })}
            />
            {active.type === "page" ? (
              <>
                <CodeEditor
                  label="HTML Code"
                  value={active.pageHtml ?? ""}
                  onChange={(v) => update({ pageHtml: v })}
                />
                <CodeEditor
                  label="CSS Code"
                  value={active.pageCss ?? ""}
                  onChange={(v) => update({ pageCss: v })}
                />
                <CodeEditor
                  label="JavaScript Code"
                  value={active.pageJs ?? ""}
                  onChange={(v) => update({ pageJs: v })}
                />
                <Toggle
                  label="Status (Enabled pages are public)"
                  checked={active.enabled !== false}
                  onChange={(v) => update({ enabled: v })}
                />
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/admin-preview/${active.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground"
                  >
                    Preview
                  </a>
                  {active.enabled !== false ? (
                    <a
                      href={`/page/${active.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      Open public page
                    </a>
                  ) : null}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Save first, then preview. Preview only works while you are logged in as admin.
                </p>
              </>
            ) : active.type === "promo" ? (
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
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Episodes</p>
                  {active.episodes.map((ep, i) => {
                    const patch = (v: Partial<typeof ep>) =>
                      update({
                        episodes: active.episodes.map((x, j) => (j === i ? { ...x, ...v } : x)),
                      });
                    return (
                      <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={ep.label}
                            onChange={(e) => patch({ label: e.target.value })}
                            placeholder="Episode 01 - Title"
                            className="h-9 flex-1 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                          />
                          <button
                            onClick={() =>
                              update({ episodes: active.episodes.filter((_, j) => j !== i) })
                            }
                            className="rounded-md border border-border px-2 py-2 text-muted-foreground"
                            aria-label="Remove episode"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <input
                          value={ep.thumbnail ?? ""}
                          onChange={(e) => patch({ thumbnail: e.target.value })}
                          placeholder="Episode thumbnail image link"
                          className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                        />
                        <textarea
                          value={ep.description ?? ""}
                          onChange={(e) => patch({ description: e.target.value })}
                          placeholder="Episode description"
                          rows={2}
                          className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                        />
                        <input
                          value={ep.telegramUrl ?? ep.url ?? ""}
                          onChange={(e) => patch({ telegramUrl: e.target.value, url: e.target.value })}
                          placeholder="Telegram download link"
                          className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                        />
                        <input
                          value={ep.driveUrl ?? ""}
                          onChange={(e) => patch({ driveUrl: e.target.value })}
                          placeholder="Google Drive download link"
                          className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                        />
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={ep.isNew === true}
                            onChange={(e) => patch({ isNew: e.target.checked })}
                          />
                          Mark as NEW!
                        </label>
                      </div>
                    );
                  })}
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

            {active.type === "anime" || active.type === "animation" ? (
              <>
                <Field
                  label="Subtitle (optional)"
                  value={active.subtitle ?? ""}
                  onChange={(v) => update({ subtitle: v })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Season No (optional)"
                    value={active.seasonNo ?? ""}
                    onChange={(v) => update({ seasonNo: v })}
                  />
                  <Field
                    label="Total Episodes (optional)"
                    value={active.totalEpisodes ?? ""}
                    onChange={(v) => update({ totalEpisodes: v })}
                  />
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Description (optional)
                  </span>
                  <textarea
                    value={active.description ?? ""}
                    onChange={(e) => update({ description: e.target.value })}
                    rows={4}
                    className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <SeasonsEditor
                  seasons={active.seasons ?? []}
                  onChange={(seasons) => update({ seasons })}
                />
                <MovieLinksEditor
                  links={active.movieLinks ?? []}
                  onChange={(movieLinks) => update({ movieLinks })}
                />
              </>
            ) : null}

            {active.type !== "page" ? (
              <SliderControls post={active} update={update} />
            ) : null}

            {active.type !== "page" ? (
              <Toggle
                label="Hide from home page (link still opens)"
                checked={active.hidden === true}
                onChange={(v) => update({ hidden: v })}
              />
            ) : null}

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <button
                onClick={commit}
                className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Save className="h-3 w-3" /> {saved ? "Saved!" : "Save Post"}
              </button>
              <button
                onClick={() => setActiveId("")}
                className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const next = draft.filter((p) => p.id !== activeId);
                  setDraft(next);
                  setActiveId("");
                }}
                className="flex items-center gap-1 text-xs font-medium text-destructive"
              >
                <Trash2 className="h-3 w-3" /> Delete this {active.type === "page" ? "page" : "post"}
              </button>
            </div>
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">
            {saved ? "Saved!" : "Select a post from the list to edit it."}
          </p>
        )}

      </div>
    </div>
  );
}

function SidebarItem({
  post,
  active,
  onClick,
}: {
  post: Post;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-xs ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{post.title || "Untitled"}</span>
        <span className="text-[10px] uppercase tracking-wide">
          {post.type === "page" ? `/page/${post.slug}` : post.type}
          {post.type === "page"
            ? post.enabled === false
              ? " · disabled"
              : " · enabled"
            : post.hidden
              ? " · hidden"
              : ""}
        </span>
      </span>
      <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
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

function CodeEditor({
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        rows={10}
        className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-ring"
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



function SliderControls({
  post,
  update,
}: {
  post: Post;
  update: (patch: Partial<Post>) => void;
}) {
  const slider = post.slider ?? {};
  const patch = (v: Partial<NonNullable<Post["slider"]>>) =>
    update({ slider: { ...slider, ...v } });

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Home horizontal slider
      </p>
      <Toggle
        label="Show in Home Horizontal Slider"
        checked={slider.enabled === true}
        onChange={(v) =>
          patch({
            enabled: v,
            publishedAt: slider.publishedAt || (v ? new Date().toISOString() : ""),
          })
        }
      />
      <Field
        label="Slider image (optional, 16:9 override)"
        value={slider.image ?? ""}
        onChange={(v) => patch({ image: v })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Slider order"
          value={String(slider.order ?? 0)}
          onChange={(v) => patch({ order: Number(v) || 0 })}
        />
        <Field
          label="Publish date (YYYY-MM-DD)"
          value={(slider.publishedAt ?? "").slice(0, 10)}
          onChange={(v) => patch({ publishedAt: v ? new Date(v).toISOString() : "" })}
        />
      </div>
      <Field
        label="Expiry date (optional, YYYY-MM-DD)"
        value={(slider.expiresAt ?? "").slice(0, 10)}
        onChange={(v) => patch({ expiresAt: v ? new Date(v).toISOString() : "" })}
      />
      <p className="text-[11px] text-muted-foreground">
        Last shown: {slider.lastShownAt ? new Date(slider.lastShownAt).toLocaleDateString() : "never"} •
        older items rotate back in after 12 days.
      </p>
    </div>
  );
}

function SeasonsEditor({
  seasons,
  onChange,
}: {
  seasons: Season[];
  onChange: (seasons: Season[]) => void;
}) {
  const patchSeason = (i: number, v: Partial<Season>) =>
    onChange(seasons.map((s, j) => (j === i ? { ...s, ...v } : s)));

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">Seasons</p>
      {seasons.map((s, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={s.number}
              onChange={(e) => patchSeason(i, { number: e.target.value })}
              placeholder="Season number"
              className="h-9 flex-1 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => onChange(seasons.filter((_, j) => j !== i))}
              className="rounded-md border border-border px-2 py-2 text-muted-foreground"
              aria-label="Remove season"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          <input
            value={s.link ?? ""}
            onChange={(e) => patchSeason(i, { link: e.target.value })}
            placeholder="Season link (optional)"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={s.photo ?? ""}
            onChange={(e) => patchSeason(i, { photo: e.target.value })}
            placeholder="Season photo (optional)"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
          />

          <p className="text-[11px] font-medium text-muted-foreground">Episodes</p>
          {s.episodes.map((ep, k) => {
            const patchEp = (v: Partial<typeof ep>) =>
              patchSeason(i, {
                episodes: s.episodes.map((x, m) => (m === k ? { ...x, ...v } : x)),
              });
            return (
              <div key={k} className="space-y-2 rounded-md border border-border p-2">
                <div className="flex items-center gap-2">
                  <input
                    value={ep.number ?? String(k + 1)}
                    onChange={(e) => patchEp({ number: e.target.value })}
                    placeholder="No."
                    className="h-8 w-16 rounded-md border border-border bg-background px-2 text-xs text-foreground"
                  />
                  <input
                    value={ep.label}
                    onChange={(e) => patchEp({ label: e.target.value })}
                    placeholder="Episode title"
                    className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-xs text-foreground"
                  />
                  <button
                    onClick={() =>
                      patchSeason(i, { episodes: s.episodes.filter((_, m) => m !== k) })
                    }
                    className="rounded-md border border-border px-2 py-1.5 text-muted-foreground"
                    aria-label="Remove episode"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <input
                  value={ep.telegramUrl ?? ep.url ?? ""}
                  onChange={(e) => patchEp({ telegramUrl: e.target.value, url: e.target.value })}
                  placeholder="Download link (optional)"
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
                />
                <input
                  value={ep.driveUrl ?? ""}
                  onChange={(e) => patchEp({ driveUrl: e.target.value })}
                  placeholder="Google Drive link (optional)"
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
                />
                <input
                  value={ep.thumbnail ?? ""}
                  onChange={(e) => patchEp({ thumbnail: e.target.value })}
                  placeholder="Photo link (optional)"
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
                />
                <textarea
                  value={ep.description ?? ""}
                  onChange={(e) => patchEp({ description: e.target.value })}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground"
                />
              </div>
            );
          })}
          <button
            onClick={() =>
              patchSeason(i, {
                episodes: [
                  ...s.episodes,
                  {
                    number: String(s.episodes.length + 1),
                    label: `Episode ${String(s.episodes.length + 1).padStart(2, "0")}`,
                    url: "",
                  },
                ],
              })
            }
            className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground"
          >
            ➕ Add Episode
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          onChange([...seasons, { number: String(seasons.length + 1), episodes: [] }])
        }
        className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground"
      >
        + Add season
      </button>
    </div>
  );
}

function MovieLinksEditor({
  links,
  onChange,
}: {
  links: MovieLink[];
  onChange: (links: MovieLink[]) => void;
}) {
  const patch = (i: number, v: Partial<MovieLink>) =>
    onChange(links.map((l, j) => (j === i ? { ...l, ...v } : l)));
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Movie links (optional)</p>
      {links.map((l, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={l.name}
              onChange={(e) => patch(i, { name: e.target.value })}
              placeholder="Movie name"
              className="h-9 flex-1 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            />
            <button
              onClick={() => onChange(links.filter((_, j) => j !== i))}
              className="rounded-md border border-border px-2 py-2 text-muted-foreground"
              aria-label="Remove movie"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          <input
            value={l.photo ?? ""}
            onChange={(e) => patch(i, { photo: e.target.value })}
            placeholder="Photo link"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
          />
          <input
            value={l.url ?? ""}
            onChange={(e) => patch(i, { url: e.target.value })}
            placeholder="Download link"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
          />
        </div>
      ))}
      <button
        onClick={() => onChange([...links, { name: "" }])}
        className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground"
      >
        + Add movie link
      </button>
    </div>
  );
}

function SeoSettings() {
  const load = useServerFn(getGoogleVerification);
  const save = useServerFn(saveGoogleVerification);
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    load({})
      .then((r) => {
        if (r.verification) {
          setFilename(r.verification.filename);
          setContent(r.verification.content);
        }
      })
      .catch(() => {});
  }, [open, load]);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
      >
        {open ? "Close SEO settings" : "SEO Settings"}
      </button>
      {open ? (
        <div className="mt-3 space-y-3 rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Google Search Console verification
          </p>
          <input
            type="file"
            accept=".html"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setFilename(file.name);
              setContent(await file.text());
            }}
            className="block w-full text-xs text-muted-foreground"
          />
          <input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="googleXXXXXXXXXXXX.html"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="google-site-verification: googleXXXXXXXXXXXX.html"
            className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground"
          />
          <button
            onClick={async () => {
              const res = await save({ data: { filename, content } });
              setMsg(res.ok ? `Saved — available at /${filename}` : (res.error ?? "Failed"));
            }}
            className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            Save verification file
          </button>
          {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
