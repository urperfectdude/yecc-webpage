import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// SITE_URL and BASE_PATH come from the deploy workflow. Locally the site runs at the root of localhost.
export default defineConfig({
  site: process.env.SITE_URL || "http://localhost:4174",
  base: process.env.BASE_PATH || "/",
  trailingSlash: "always",
  integrations: [sitemap()],
});
