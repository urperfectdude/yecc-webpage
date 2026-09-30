import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// SITE_URL and BASE_PATH come from the deploy workflow. Locally the site runs at the root of localhost.
// When this version moves to its own domain, set SITE_URL to that domain and leave BASE_PATH unset.
export default defineConfig({
  site: process.env.SITE_URL || "http://localhost:4180",
  base: process.env.BASE_PATH || "/",
  trailingSlash: "always",
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
