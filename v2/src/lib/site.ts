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

export type NavItem = { label: string; href: string; children?: { label: string; href: string; group?: string }[] };

export const APP = "/consultants#get-the-app";
export const APP_STORE = "https://apps.apple.com/in/app/yecc/id6738484557";
export const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.yourerpcoach.app&hl=en_IN";
export const ECAMPUS = "https://ecampus.yourerpcoach.com";

// The site has two audiences, each with its own menu. The header shows a plain link across to the other one.
export const NAV: NavItem[] = [
  { label: "EUTaaS", href: "/partnerships#implementation-enablement" },
  { label: "DaaS", href: "/partnerships#ams-enablement" },
  { label: "Resource Augmentation", href: "/partnerships#daas" },
  { label: "Consulting Training", href: "/talent-pathways#corporate-fresher-training" },
  { label: "SHERPA", href: "/sherpa" },
];

export const CONSULTANT_NAV: NavItem[] = [
  { label: "Cohorts", href: "/upcoming-cohorts" },
  { label: "Self-paced Courses", href: "/courses" },
  { label: "Mobile App", href: APP },
  { label: "eCampus", href: ECAMPUS },
];

/** Landing pages whose hero tiles already list the menu, so the menu only shows once the hero is scrolled past. */
export const LANDING_PATHS = ["/", "/consultants"];

/** Pages that belong to the Oracle consultants side of the site. */
export const CONSULTANT_PATHS = ["/consultants", "/courses", "/upcoming-cohorts"];

export const SOCIAL = [
  { icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/yourerpcoach" },
  { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/yourerpcoach/" },
  { icon: "youtube", label: "YouTube", href: "https://www.youtube.com/channel/UCIJTIeb8X_EzNZAsa4SwFvg" },
  { icon: "facebook", label: "Facebook", href: "https://www.facebook.com/profile.php?id=100078172584965#" },
];

/** Course page slug on this site, from the old site's course path ("name-13/lesson-11" -> "name"). */
export const courseSlug = (oldPath: string) => oldPath.split("/")[0].replace(/-\d+$/, "");
