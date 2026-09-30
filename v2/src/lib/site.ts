// Shared site facts and URL helpers.

export const SITE_NAME = "YourERPCoach";
export const TAGLINE = "Oracle Cloud ERP enablement, documentation & training for System Integrators and consultants.";
export const LOGIN = "https://www.yourerpcoach.com/";
export const FORM = "/book-a-discussion#discussion-form";
export const VIDEO = "https://cdn.ploy.ai/793769cf-b7a4-4bc2-a4e6-490b75f7c3cc/user/bbb32fc3-yecc-sherpa-pitch-video.mp4";
export const EMAIL = "sales@yecc.tech";
export const PHONE = "+91 99208 15714";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Internal link: adds the deploy base path and the trailing slash every page URL uses. */
export function to(href: string): string {
  if (!href.startsWith("/")) return href;
  const [path, hash] = href.split("#");
  return base + (path.endsWith("/") ? path : path + "/") + (hash ? "#" + hash : "");
}

export const isExternal = (href: string) => /^https?:/.test(href);

export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Partnerships",
    href: "/partnerships",
    children: [
      { label: "Overview", href: "/partnerships" },
      { label: "EUT-as-a-Service", href: "/partnerships#implementation-enablement" },
      { label: "Documentation-as-a-Service", href: "/partnerships#ams-enablement" },
      { label: "Resource Augmentation Service", href: "/partnerships#daas" },
    ],
  },
  { label: "SHERPA", href: "/sherpa" },
  {
    label: "Consulting Training",
    href: "/talent-pathways",
    children: [
      { label: "Self-paced Courses", href: "/courses" },
      { label: "Corporate Fresher Training for SIs", href: "/talent-pathways#corporate-fresher-training" },
      { label: "Fresher Training Cohorts", href: "/upcoming-cohorts" },
    ],
  },
  { label: "ERPNext", href: "/erpnext-implementation" },
];

export const SOCIAL = [
  { icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/yourerpcoach" },
  { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/yourerpcoach/" },
  { icon: "youtube", label: "YouTube", href: "https://www.youtube.com/channel/UCIJTIeb8X_EzNZAsa4SwFvg" },
  { icon: "facebook", label: "Facebook", href: "https://www.facebook.com/profile.php?id=100078172584965#" },
];

/** Course page slug on this site, from the old site's course path ("name-13/lesson-11" -> "name"). */
export const courseSlug = (oldPath: string) => oldPath.split("/")[0].replace(/-\d+$/, "");
