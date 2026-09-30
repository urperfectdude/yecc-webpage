// v1 is the site as it was built on Ploy (Astro + Tailwind). Its source lives on that platform, so what
// this project holds is each page's built HTML (src/saved) and the compiled Tailwind stylesheet
// (public/site.css). This module cleans those pages up for hosting here.

const files = import.meta.glob<string>("../saved/*.html", { query: "?raw", import: "default", eager: true });
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export type SavedPage = {
  /** Route, e.g. "blogs/my-post". The home page has none. */
  slug: string | undefined;
  title: string;
  description: string;
  image: string;
  bodyClass: string;
  body: string;
};

const meta = (html: string, pattern: RegExp) => (html.match(pattern)?.[1] ?? "").replaceAll("&amp;", "&");

/** Internal links get the deploy base path and the trailing slash every page URL uses. */
function link(href: string): string {
  const [path, hash] = href.split("#");
  return base + (path.endsWith("/") ? path : path + "/") + (hash ? "#" + hash : "");
}

function clean(html: string): string {
  let body = html.slice(html.indexOf(">", html.indexOf("<body")) + 1, html.lastIndexOf("</body>"));
  // The "Made by Ploy" badge, its styles and everything after it.
  const badge = body.search(/<style>\s*\.ploy-badge/);
  if (badge !== -1) body = body.slice(0, badge);
  return body
    // Platform scripts (analytics, experiments, hydration). Their files are not available outside Ploy.
    .replace(/<script\b[\s\S]*?<\/script>/g, "")
    .replace(/<\/?astro-island\b[^>]*>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/href="(\/[^"]*)"/g, (_, href) => `href="${link(href)}"`);
}

export const pages: SavedPage[] = Object.entries(files).map(([file, html]) => {
  const name = file.split("/").pop()!.replace(".html", "");
  return {
    slug: name === "home" ? undefined : name.replaceAll("__", "/"),
    title: meta(html, /<title>([\s\S]*?)<\/title>/).replace(" | Ploy Astro Starter", ""),
    description: meta(html, /<meta name="description" content="([^"]*)"/),
    image: meta(html, /<meta property="og:image" content="([^"]*)"/),
    bodyClass: meta(html, /<body class="([^"]*)"/),
    body: clean(html),
  };
});
