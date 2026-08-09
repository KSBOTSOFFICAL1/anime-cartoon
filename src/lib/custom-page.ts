/** Helpers for admin-authored custom pages (HTML + CSS + JS). */

/**
 * Scopes every top-level CSS rule to the custom page container so page CSS
 * cannot leak into the site header, footer, navigation or the admin panel.
 */
export function scopeCss(css: string, scope: string): string {
  const source = String(css ?? "");
  if (!source.trim()) return "";

  let out = "";
  let i = 0;

  const readBlock = (start: number) => {
    let depth = 0;
    for (let j = start; j < source.length; j++) {
      if (source[j] === "{") depth++;
      else if (source[j] === "}") {
        depth--;
        if (depth === 0) return j;
      }
    }
    return source.length - 1;
  };

  while (i < source.length) {
    const braceIndex = source.indexOf("{", i);
    if (braceIndex === -1) break;
    const prelude = source.slice(i, braceIndex).trim();
    const end = readBlock(braceIndex);
    const body = source.slice(braceIndex + 1, end);

    if (prelude.startsWith("@")) {
      const atName = prelude.slice(1).split(/[\s(]/)[0]?.toLowerCase() ?? "";
      if (atName === "media" || atName === "supports" || atName === "layer" || atName === "container") {
        out += `${prelude}{${scopeCss(body, scope)}}`;
      } else {
        // @keyframes, @font-face, etc. are left untouched.
        out += `${prelude}{${body}}`;
      }
    } else {
      const selectors = prelude
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const normalized = s.replace(/^(html|body|:root)\b/i, "").trim();
          return normalized ? `${scope} ${normalized}` : scope;
        })
        .join(",");
      out += `${selectors}{${body}}`;
    }
    i = end + 1;
  }

  return out;
}

export function pageDescription(input: { description?: string | undefined; html?: string | undefined; title: string }): string {
  const fromField = input.description?.trim();
  if (fromField) return fromField.replace(/\s+/g, " ").slice(0, 158);
  const text = String(input.html ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (text || `${input.title} page`).slice(0, 158);
}
