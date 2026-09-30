import type { APIRoute } from "astro";

// Points crawlers at this version's sitemap. On a domain of its own this file is served from the root;
// under a sub-path (the GitHub Pages preview) crawlers only read the root robots.txt, so it is informational there.
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(import.meta.env.BASE_URL.replace(/\/$/, "") + "/sitemap-index.xml", site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
