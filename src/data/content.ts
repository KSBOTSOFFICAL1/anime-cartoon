export type Episode = { label: string; url: string };

export const TELEGRAM_JOIN_URL = "https://t.me/+-rRx3CW3SvEyNWY9";

export type Post = {
  id: string;
  slug: string;
  type: "movie" | "series" | "promo" | "page";
  content?: string;
  hidden?: boolean;
  title: string;
  poster: string;
  banner?: string;
  downloadImage?: string;
  driveUrl?: string;
  telegramUrl?: string;
  promoVideo?: string;
  showViews?: boolean;
  allowComments?: boolean;
  year: string;
  releaseDate: string;
  genres: string[];
  languages: string;
  duration: string;
  quality: string;
  fileSize: string;
  ott: string;
  encodedBy: string;
  comingSoon?: string;
  downloadUrl: string;
  episodes: Episode[];
};

export const defaultPosts: Post[] = [];
