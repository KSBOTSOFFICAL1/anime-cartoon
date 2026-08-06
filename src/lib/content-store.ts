import { useEffect, useState } from "react";
import { defaultPosts, type Post } from "@/data/content";
import { listPosts, savePostsRemote } from "@/lib/posts.functions";

type Listener = () => void;
const listeners = new Set<Listener>();

let cache: Post[] = defaultPosts;
let loaded = false;
let inflight: Promise<void> | null = null;

function load(force = false) {
  if (inflight && !force) return inflight;
  inflight = listPosts()
    .then((r) => {
      cache = r.posts ?? [];
      loaded = true;
    })
    .catch(() => {
      loaded = true;
    })
    .finally(() => {
      inflight = null;
      listeners.forEach((l) => l());
    });
  return inflight;
}

export async function savePosts(posts: Post[]) {
  cache = posts;
  listeners.forEach((l) => l());
  const res = await savePostsRemote({ data: { posts } });
  await load(true);
  return res;
}

/** SSR-safe: hydrates saved posts from the cloud database on the client. */
export function usePostsState() {
  const [state, setState] = useState<{ posts: Post[]; ready: boolean }>({
    posts: loaded ? cache : defaultPosts,
    ready: loaded,
  });

  useEffect(() => {
    const sync = () => setState({ posts: cache, ready: loaded });
    listeners.add(sync);
    if (loaded) sync();
    else load();
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
