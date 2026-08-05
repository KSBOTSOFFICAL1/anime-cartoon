import { useEffect, useState } from "react";
import { defaultPosts, type Post } from "@/data/content";

const KEY = "atoz-posts-v2";

type Listener = () => void;
const listeners = new Set<Listener>();

function read(): Post[] {
  if (typeof window === "undefined") return defaultPosts;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultPosts;
    const parsed = JSON.parse(raw) as Post[];
    return Array.isArray(parsed) && parsed.length ? parsed : defaultPosts;
  } catch {
    return defaultPosts;
  }
}

export function savePosts(posts: Post[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(posts));
  }
  listeners.forEach((l) => l());
}

export function resetPosts() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

/** SSR-safe: renders defaults on the server, hydrates admin edits on the client. */
export function usePostsState() {
  const [state, setState] = useState<{ posts: Post[]; ready: boolean }>({
    posts: defaultPosts,
    ready: false,
  });

  useEffect(() => {
    const sync = () => setState({ posts: read(), ready: true });
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return state;
}

export function usePosts() {
  return usePostsState().posts;
}

export function emptyPost(type: Post["type"]): Post {
  return {
    id: `p${Date.now()}`,
    slug: "",
    type,
    title: "",
    poster: "",
    banner: "",
    downloadImage: "",
    driveUrl: "",
    telegramUrl: "",
    year: String(new Date().getFullYear()),
    releaseDate: "",
    genres: ["Animation", "Kids"],
    languages: "Hindi",
    duration: "",
    quality: "1080p FHD",
    fileSize: "",
    ott: "",
    encodedBy: "Anime Cartoon",
    downloadUrl: "",
    episodes: [],
    promoVideo: "",
    showViews: true,
    allowComments: true,
  };
}

/* ---------- views ---------- */
const VIEWS_KEY = "atoz-views-v1";

function readMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "{}") as Record<string, T>;
  } catch {
    return {};
  }
}

export function useViewCount(slug: string, enabled: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const map = readMap<number>(VIEWS_KEY);
    const next = (map[slug] ?? 0) + 1;
    map[slug] = next;
    window.localStorage.setItem(VIEWS_KEY, JSON.stringify(map));
    setCount(next);
  }, [slug, enabled]);
  return count;
}

/* ---------- comments ---------- */
export type Comment = { name: string; text: string; at: number };
const COMMENTS_KEY = "atoz-comments-v1";

export function useComments(slug: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    setComments(readMap<Comment[]>(COMMENTS_KEY)[slug] ?? []);
  }, [slug]);

  const add = (name: string, text: string) => {
    const map = readMap<Comment[]>(COMMENTS_KEY);
    const next = [...(map[slug] ?? []), { name, text, at: Date.now() }];
    map[slug] = next;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COMMENTS_KEY, JSON.stringify(map));
    }
    setComments(next);
  };

  return { comments, add };
}
