# YourERPCoach website

Two versions of the YourERPCoach.com site, each its own [Astro](https://astro.build) project, published side by side on GitHub Pages.

| Folder | What it is | Published at |
| --- | --- | --- |
| `v1/` | The current site design | `/v1/` |
| `v2/` | The new design | `/v2/` |

## v2

Astro components with Tailwind CSS v4. Design tokens (the logo's blue, red and white, plus shades of the blue) are in the `@theme` block of `src/styles/global.css`; the site's components sit in Tailwind's `components` layer in the same file.

- `src/pages/` one file per page; course, cohort and blog pages are generated from `src/data/*.json`
- `src/components/`, `src/layouts/Layout.astro` shared building blocks, header, footer and SEO tags
- `src/scripts/site.js` menu, auto-advancing SHERPA tabs, testimonial scroller, contact form
- `tools/fetch_courses.py` refreshes `src/data/courses.json` and the course artwork from www.yourerpcoach.com

```
cd v2
npm install
npm run dev      # http://localhost:4180
npm run build    # output in dist/
```

## v1

The current site was built on the Ploy platform with Astro and Tailwind, and its source lives there. This project holds each page's built HTML (`src/saved/`) and the compiled Tailwind stylesheet (`public/site.css`), and serves them through one Astro route that fixes links, titles and SEO tags for hosting here. To change v1's content or design, edit it on Ploy and re-save the pages.

```
cd v1
npm install
npm run dev      # http://localhost:4174
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds both projects and publishes them to GitHub Pages. Each build reads two environment variables:

- `SITE_URL` the site's origin, used for canonical links and the sitemap
- `BASE_PATH` the sub-path the version is served from (`/yecc-webpage/v1`, `/yecc-webpage/v2`)

To put a version on its own domain, build it with `SITE_URL` set to that domain and `BASE_PATH` unset.
