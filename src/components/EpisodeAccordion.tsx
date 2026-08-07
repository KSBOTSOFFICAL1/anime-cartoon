import { useState } from "react";
import { ChevronDown, Download, Send } from "lucide-react";
import type { Episode } from "@/data/content";
import { shortenUrl } from "@/lib/shortener.functions";

async function openShortened(url: string) {
  if (!url) return;
  const win = window.open("", "_blank");
  try {
    const res = await shortenUrl({ data: { url } });
    if (win) win.location.href = res.url || url;
  } catch {
    if (win) win.location.href = url;
  }
}

export function EpisodeAccordion({ episodes }: { episodes: Episode[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!episodes.length) return null;

  return (
    <section className="mt-8 space-y-3">
      <h2 className="border-l-4 border-primary pl-3 text-lg font-bold uppercase tracking-wide text-foreground">
        Episodes
      </h2>

      {episodes.map((ep, i) => {
        const isOpen = open === i;
        return (
          <div
            key={`${ep.label}-${i}`}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-secondary/60 active:bg-secondary"
            >
              <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-card-foreground">
                {ep.label}
                {ep.isNew ? (
                  <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase text-destructive-foreground">
                    New!
                  </span>
                ) : null}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-3 border-t border-border px-4 py-4">
                  {ep.thumbnail ? (
                    <img
                      src={ep.thumbnail}
                      alt={`${ep.label} thumbnail`}
                      loading="lazy"
                      className="w-full rounded-lg object-cover"
                    />
                  ) : null}
                  {ep.description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">{ep.description}</p>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ep.telegramUrl || ep.url ? (
                      <button
                        type="button"
                        onClick={() => openShortened(ep.telegramUrl || ep.url)}
                        className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-accent-foreground"
                      >
                        <Send className="h-4 w-4" /> Telegram
                      </button>
                    ) : null}
                    {ep.driveUrl ? (
                      <button
                        type="button"
                        onClick={() => openShortened(ep.driveUrl!)}
                        className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
                      >
                        <Download className="h-4 w-4" /> Drive
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
