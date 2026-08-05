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
  };
}
