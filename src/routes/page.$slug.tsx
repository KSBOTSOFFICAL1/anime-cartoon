import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPostBySlug } from "@/lib/posts.functions";
import { CustomPageRender } from "@/components/CustomPageRender";
import { pageDescription } from "@/lib/custom-page";
import { buildMeta, canonicalLink, jsonLdScript, SITE_NAME, absolute, siteUrl } from "@/lib/seo";

export const Route = createFileRoute("/page/$slug")({
  loader: async ({ params }) => {
    const { post } = await getPostBySlug({ data: { slug: params.slug, type: "page" } });
    if (!post || post.enabled === false) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    const post = loaderData?.post;
    const url = `/page/${params.slug}`;
    if (!post) {
      return {
        meta: [{ title: `Page not found — ${SITE_NAME}` }, { name: "robots", content: "noindex" }],
      };
    }
    const description = pageDescription({
      description: post.description,
      html: post.pageHtml,
      title: post.title,
    });
    const image = post.poster?.trim() || post.banner?.trim() || "";
    return {
      meta: buildMeta({
        title: `${post.title} — ${SITE_NAME}`,
        description,
        url,
        image,
        type: "article",
      }),
      links: canonicalLink(url),
      scripts: jsonLdScript({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: post.title,
        url: absolute(url),
        description,
        ...(image ? { image: absolute(image) } : {}),
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: siteUrl() },
      }),
    };
  },
  notFoundComponent: PageMissing,
  errorComponent: PageMissing,
  component: PageView,
});

function PageMissing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <h1 className="text-xl font-bold text-foreground">Page not found</h1>
      <Link to="/" className="text-sm text-primary underline">
        Go home
      </Link>
    </div>
  );
}

function PageView() {
  const { post } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link to="/" className="text-sm text-muted-foreground">
            ← Back to home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-extrabold text-foreground">{post.title}</h1>
        {post.poster ? (
          <img
            src={post.poster}
            alt={post.title}
            className="mb-6 w-full rounded-xl border border-border object-cover"
          />
        ) : null}
        {post.pageHtml || post.pageCss || post.pageJs ? (
          <CustomPageRender html={post.pageHtml ?? ""} css={post.pageCss ?? ""} js={post.pageJs ?? ""} />
        ) : (
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {(post.content ?? "")
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para: string, i: number) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
