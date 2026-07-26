export const site = {
  name: "Bloodsoaked Media",
  tagline:
    "Games, film, music, television, and the stories we carry away from them.",
  descriptor: "Horror · Games · Cult Cinema · Physical Media",
  curator: "Dakota",
  curatorLine: "Dakota's Archive",
  description:
    "An independent publication dedicated to games, film, music, television, and the stories we carry away from them. Part review outlet, part personal journal, and part cultural scrapbook.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bloodsoakedmedia.com",
  author: "Dakota",
  mission:
    "Bloodsoaked Media is an independent publication dedicated to games, film, music, television, and the stories we carry away from them. Part review outlet, part personal journal, and part cultural scrapbook, it explores the media that stays with us long after the credits roll.",
  logo: {
    src: "/images/logo-mark.png",
    alt: "Bloodsoaked Media",
    width: 1529,
    height: 699,
  },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61590606155212",
  },
} as const;

/** Primary navigation — reader-facing destinations only. */
import { isLegacyArchivePublic } from "@/lib/legacy-gate";

const allNavLinks = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/media-log", label: "Media Log" },
  { href: "/collection", label: "Collection" },
  { href: "/library", label: "Library" },
  { href: "/vault", label: "The Vault" },
  { href: "/the-archives", label: "The Archives" },
  { href: "/about", label: "About" },
] as const;

/** Nav entries visible on the live site (legacy archive hidden until enabled). */
export function getNavLinks() {
  if (isLegacyArchivePublic()) return [...allNavLinks];
  return allNavLinks.filter((link) => link.href !== "/the-archives");
}

/** @deprecated Use getNavLinks() for public header/footer */
export const navLinks = allNavLinks;
