/** Metal Lifestyle preserved publication — full restoration of metallifestyle.weebly.com */

export const METAL_LIFESTYLE_BASE = "/the-archives/metal-lifestyle";

export const METAL_LIFESTYLE_ORIGIN = "https://metallifestyle.weebly.com";

export const metalLifestyleNav = [
  {
    label: "Metal Lifestyle",
    href: `${METAL_LIFESTYLE_BASE}/blog`,
    restored: true,
    hub: null as string | null,
  },
  {
    label: "Dysphoria",
    href: `${METAL_LIFESTYLE_BASE}/page/dysphoria`,
    originalPath: "/dysphoria.html",
    restored: true,
    hub: "dysphoria",
  },
  {
    label: "American Metalcore Project",
    href: `${METAL_LIFESTYLE_BASE}/page/american-metalcore-project`,
    originalPath: "/american-metalcore-project.html",
    restored: true,
    hub: "american-metalcore-project",
  },
  {
    label: "Prisms: Local Show Recap",
    href: `${METAL_LIFESTYLE_BASE}/page/prisms-local-show-recap`,
    originalPath: "/prisms-local-show-recap.html",
    restored: true,
    hub: "prisms-local-show-recap",
  },
  {
    label: "FEAR: Short Horror Tales from the Team",
    href: `${METAL_LIFESTYLE_BASE}/page/fear-short-horror-tales-from-the-team`,
    originalPath: "/fear-short-horror-tales-from-the-team.html",
    restored: true,
    hub: "fear-short-horror-tales-from-the-team",
  },
  {
    label: "Curtains: Movie & TV Reviews",
    href: `${METAL_LIFESTYLE_BASE}/page/curtains-movie--tv-reviews`,
    originalPath: "/curtains-movie--tv-reviews.html",
    restored: true,
    hub: "curtains-movie--tv-reviews",
  },
  {
    label: "About Us: Meet the Staff",
    href: `${METAL_LIFESTYLE_BASE}/page/about-us-meet-the-staff`,
    originalPath: "/about-us-meet-the-staff.html",
    restored: true,
    hub: "about-us-meet-the-staff",
  },
  {
    label: "Gaming Corner",
    href: `${METAL_LIFESTYLE_BASE}/page/gaming-corner`,
    originalPath: "/gaming-corner.html",
    restored: true,
    hub: "gaming-corner",
  },
  {
    label: "Gallery",
    href: `${METAL_LIFESTYLE_BASE}/page/gallery`,
    originalPath: "/gallery.html",
    restored: true,
    hub: "gallery",
  },
] as const;

export const metalLifestyleSidebar = {
  title: "Metal Lifestyle",
  blurb: [
    "Owner Operator: Dakota Gochee",
    "Editors: Brian Lesmes & Alex Bugella",
    "Staff Writers: Alex Brown, Cesar Gonzalez, Caleb Porter",
    "Social Media Manager: ???",
  ],
  categories: "Metal, Music, Video Games, Personal, Opinion.",
  social: [
    {
      label: "Facebook",
      href: "https://www.facebook.com/metallifestylewebsite/",
    },
    { label: "Twitter", href: "https://twitter.com/MLTeamBlog" },
    { label: "Instagram", href: "https://instagram.com/dakotalifestyle" },
    { label: "YouTube", href: "https://youtube.com/user/metallifestyle" },
  ],
} as const;
