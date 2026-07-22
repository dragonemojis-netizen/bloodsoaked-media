export interface ArchivePublication {
  slug: string;
  title: string;
  description: string;
  publication: string;
  years: string;
  medium: string;
  href: string;
}

/** Case files on The Archives landing — preserved publications only. */
export const archivePublications: ArchivePublication[] = [
  {
    slug: "bloodsoaked-media",
    title: "Bloodsoaked Media (Legacy)",
    description:
      "Early versions of Bloodsoaked Media before the publication found its current identity.",
    publication: "Bloodsoaked Media",
    years: "—",
    medium: "Games • Reviews • Personal Writing",
    href: "/the-archives/bloodsoaked-media",
  },
  {
    slug: "metal-lifestyle",
    title: "Metal Lifestyle",
    description:
      "An independent music publication documenting heavy music, interviews, reviews, and scene coverage during its original run.",
    publication: "Metal Lifestyle",
    years: "2015–2019",
    medium: "Metal • Hardcore • Interviews • Reviews",
    href: "/the-archives/metal-lifestyle",
  },
];

export function getArchivePublication(
  slug: string,
): ArchivePublication | undefined {
  return archivePublications.find((entry) => entry.slug === slug);
}

export const ARCHIVE_SLUGS = archivePublications.map((entry) => entry.slug);
