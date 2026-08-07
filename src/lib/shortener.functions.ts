import { createServerFn } from "@tanstack/react-start";

/**
 * Wraps a URL with the configured ShrinkMe.io link shortener.
 * Falls back to the original URL when no API key is configured or the API fails.
 */
export const shortenUrl = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => data)
  .handler(async ({ data }) => {
    const url = data.url?.trim();
    if (!url) return { url: "" };

    const apiKey = process.env["SHRINKME_API_KEY"];
    if (!apiKey) return { url };

    try {
      const res = await fetch(
        `https://shrinkme.io/api?api=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(url)}`,
      );
      const json = (await res.json()) as { status?: string; shortenedUrl?: string };
      if (json.status === "success" && json.shortenedUrl) return { url: json.shortenedUrl };
      return { url };
    } catch {
      return { url };
    }
  });
