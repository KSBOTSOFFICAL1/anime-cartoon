export type Episode = { label: string; url: string };

export type Post = {
  id: string;
  slug: string;
  type: "movie" | "series";
  title: string;
  poster: string;
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
