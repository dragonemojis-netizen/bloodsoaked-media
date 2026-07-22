/**
 * Museum-quality contextual material for Metal Lifestyle.
 * Lives outside the preserved publication — interpretation only.
 */

import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

export const ML_CONTEXT_BASE = `${METAL_LIFESTYLE_BASE}/context`;

export const CONTEXT_LINKS = [
  { href: ML_CONTEXT_BASE, label: "Context" },
  { href: `${ML_CONTEXT_BASE}/essay`, label: "Essay" },
  { href: `${ML_CONTEXT_BASE}/history`, label: "History" },
  { href: `${ML_CONTEXT_BASE}/highlights`, label: "Highlights" },
  { href: `${ML_CONTEXT_BASE}/collections`, label: "Special Collections" },
  { href: `${ML_CONTEXT_BASE}/methodology`, label: "Methodology" },
  { href: `${ML_CONTEXT_BASE}/restoration-log`, label: "Restoration Log" },
] as const;

export interface CollectionHighlight {
  slug: string;
  title: string;
  description: string;
  /** Match posts by category name, title prefix, or series slug */
  match: {
    categories?: string[];
    titleIncludes?: string[];
    seriesSlug?: string;
  };
}

export const COLLECTION_HIGHLIGHTS: CollectionHighlight[] = [
  {
    slug: "essential-reviews",
    title: "Essential Reviews",
    description:
      "A reading guide to album, EP, and single reviews filed during the publication’s active years. Drawn from historical titles — not a ranked best-of.",
    match: {
      titleIncludes: ["Review:", "Single Review:"],
    },
  },
  {
    slug: "local-scene-coverage",
    title: "Local Scene Coverage",
    description:
      "Writing concerned with regional shows, Connecticut and Northeast scene activity, and related live documentation.",
    match: {
      categories: ["Live"],
      titleIncludes: ["Prisms", "Hartford", "Webster", "Connecticut"],
    },
  },
  {
    slug: "interviews",
    title: "Interviews",
    description:
      "Interview features and conversation pieces recoverable from the blog record.",
    match: {
      categories: ["Interviews"],
      titleIncludes: ["Interview", "interview"],
    },
  },
  {
    slug: "gaming-coverage",
    title: "Gaming Coverage",
    description:
      "Video game writing filed on the main blog and through Gaming Corner.",
    match: {
      categories: ["Video Games"],
      titleIncludes: ["Gaming", "Kingdom Hearts", "PlayStation"],
    },
  },
  {
    slug: "horror-features",
    title: "Horror Features",
    description:
      "Horror-adjacent writing including FEAR: Short Horror Tales and related features where titles indicate the subject.",
    match: {
      titleIncludes: ["Horror", "FEAR", "Fear"],
    },
  },
  {
    slug: "year-end-lists",
    title: "Year-End Lists & Rankings",
    description:
      "Annual and quarterly ranked lists preserved with original bylines and wording.",
    match: {
      categories: ["Lists & Features"],
      titleIncludes: ["Top Ten", "Top 10", "Top 25", "Albums of"],
    },
  },
];

export interface SpecialCollectionDef {
  slug: string;
  title: string;
  hubPageSlug: string;
  description: string;
  /** Path prefix on restored page slugs (e.g. prisms-local-show-recap--) */
  pagePrefix: string;
  /** Optional blog title cues that also belong to this collection */
  blogTitleIncludes?: string[];
}

export const SPECIAL_COLLECTIONS: SpecialCollectionDef[] = [
  {
    slug: "american-metalcore-project",
    title: "American Metalcore Project",
    hubPageSlug: "american-metalcore-project",
    pagePrefix: "american-metalcore-project",
    description:
      "A dedicated Metal Lifestyle section documenting American metalcore history and related features. Hub and nested pages are preserved from the original site structure.",
  },
  {
    slug: "prisms",
    title: "Prisms: Local Show Recap",
    hubPageSlug: "prisms-local-show-recap",
    pagePrefix: "prisms-local-show-recap",
    description:
      "Live show documentation filed under Prisms. Includes the section hub and recoverable nested recap pages from the original navigation.",
    blogTitleIncludes: ["Prisms"],
  },
  {
    slug: "curtains",
    title: "Curtains: Movie & TV Reviews",
    hubPageSlug: "curtains-movie--tv-reviews",
    pagePrefix: "curtains-movie--tv-reviews",
    description:
      "Film and television coverage published under Curtains. Nested review pages are retained where recovery succeeded.",
  },
  {
    slug: "gaming-corner",
    title: "Gaming Corner",
    hubPageSlug: "gaming-corner",
    pagePrefix: "gaming-corner",
    description:
      "The Gaming Corner section of Metal Lifestyle — reviews, previews, and game writing hosted outside the main blog index.",
    blogTitleIncludes: ["Gaming Corner"],
  },
  {
    slug: "dysphoria",
    title: "Dysphoria",
    hubPageSlug: "dysphoria",
    pagePrefix: "dysphoria",
    description:
      "The Dysphoria section as linked from the original site navigation, preserved with its recoverable nested pages. Available evidence suggests Dysphoria succeeded an earlier Advocacy section that remains currently unrecoverable and is documented separately as a Known Section.",
  },
  {
    slug: "fear",
    title: "FEAR: Short Horror Tales from the Team",
    hubPageSlug: "fear-short-horror-tales-from-the-team",
    pagePrefix: "fear-short-horror-tales-from-the-team",
    description:
      "Short horror writing filed under FEAR. Only pages successfully recovered from the original host are listed.",
  },
  {
    slug: "gallery",
    title: "Gallery",
    hubPageSlug: "gallery",
    pagePrefix: "gallery",
    description:
      "The Gallery section from the original navigation. Recovered Gallery pages are retained structurally; Weebly gallery widgets often arrived without embedded image payloads, so some pages present as empty shells documenting that the section existed.",
  },
];

export interface RestorationLogEntry {
  date: string;
  title: string;
  note: string;
}

/** Archival field notes — stewardship record, not a software changelog. */
export const RESTORATION_LOG: RestorationLogEntry[] = [
  {
    date: "2026-07-22",
    title: "Full publication crawl",
    note: "Recovered article and page records from the live Weebly host using the prior discovery audit. Unique permalinks preferred over legacy /1/post/ duplicates.",
  },
  {
    date: "2026-07-22",
    title: "Article recovery count",
    note: "217 articles restored with readable bodies. Additional records remain unavailable and are held as preservation notices.",
  },
  {
    date: "2026-07-22",
    title: "Page recovery count",
    note: "160 static and nested section pages restored (including hubs for Prisms, Curtains, Gaming Corner, and related collections).",
  },
  {
    date: "2026-07-22",
    title: "Media assets",
    note: "607 image files copied into local archival storage where the original host still served them. Missing images retain layout placeholders.",
  },
  {
    date: "2026-07-22",
    title: "Stewardship polish",
    note: "Removed defunct AdSense chrome, rewrote internal links to restored routes, normalized metadata, and rebuilt author and category indexes. Historical wording left unaltered.",
  },
  {
    date: "2026-07-22",
    title: "Duplicate consolidation",
    note: "Removed forty dated legacy-path duplicate article files that mirrored existing pretty-permalink restorations. Junk feed and pagination URLs excised from the page set.",
  },
  {
    date: "2026-07-22",
    title: "Finding aids",
    note: "Timeline, series detection, archival search, and catalog statistics layered around the publication without modifying blog chrome.",
  },
  {
    date: "2026-07-22",
    title: "Author archives",
    note: "Author bibliographies generated from exact bylines as published. Identities were not merged (e.g. DG remains distinct from Dakota G.).",
  },
  {
    date: "2026-07-22",
    title: "Contextual materials",
    note: "Museum-style essay, history notes, methodology, highlights, special collections, and this restoration log added outside the preserved publication.",
  },
  {
    date: "2026-07-22",
    title: "Historical completeness pass",
    note: "Gap-fill against the live host recovered the full About Us staff roster (six profiles with biographies and portraits) previously truncated to a single writer. Gallery widgets remain empty on the host. Seventy-seven known URLs still return 404 with no recoverable Wayback body in this pass.",
  },
  {
    date: "2026-07-22",
    title: "Preservation seal",
    note: "Archive marked historically complete and sealed. Mutating recovery scripts require --force. Canonical author route corrected; mangled internal archive links repaired; stewardship documentation filed for long-term maintenance.",
  },
  {
    date: "2026-07-22",
    title: "Advocacy documented as unrecoverable",
    note: "Advocacy recorded as a known original section with no recoverable page bodies or media in current sources. Documented on Publication History and as a Known Section placeholder under Special Collections — content not reconstructed.",
  },
];

export interface HistoryMilestone {
  period: string;
  title: string;
  evidence: string;
  /** Optional stewardship note (e.g. known-but-unrecoverable holdings) */
  preservationNote?: string;
}

/** Only milestones supported by recoverable archive evidence. */
export const PUBLICATION_HISTORY: HistoryMilestone[] = [
  {
    period: "2015",
    title: "Earliest dated blog material in this archive",
    evidence:
      "Restored articles with 2015 publication dates establish activity in that year (16 dated pieces currently filed).",
  },
  {
    period: "2015–2019",
    title: "Active Weebly publication years",
    evidence:
      "Dated restored posts span 2015 through early 2019. The archival banner and catalog record this as the original run.",
  },
  {
    period: "Year range uncertain",
    title: "Advocacy section currently unrecovered",
    evidence:
      "Original navigation, surviving references, and restoration research establish that Advocacy existed as a dedicated section of the publication. Available evidence suggests this early editorial direction later evolved into Dysphoria. While evidence supports Advocacy’s existence, no recoverable page content, media, or complete captures have been located through the archival sources used during restoration.",
    preservationNote:
      "The absence of recoverable material is documented rather than concealed. Recovery efforts remain open to new verifiable sources. If historical content is discovered through future archives, backups, contributor material, or other reliable sources, it will be incorporated using the established gap-fill workflow without altering already-preserved material.",
  },
  {
    period: "2016–2017",
    title: "Peak dated output in the recovered set",
    evidence:
      "Among restored, dated articles, 2017 holds the largest count (96), followed by 2016 (58). Counts reflect what was recovered, not a claim of total historical output.",
  },
  {
    period: "Navigation structure",
    title: "Sectioned publication (non-blog hubs)",
    evidence:
      "Original site navigation preserved in this archive includes Dysphoria, American Metalcore Project, Prisms, FEAR, Curtains, About Us, Gaming Corner, and Gallery. Those hubs and nested pages are retained where recovery succeeded. Advocacy is documented separately as a known section that is currently unrecoverable.",
  },
  {
    period: "Contributors",
    title: "Multi-author bylines",
    evidence:
      "Sidebar staff listing and article signatures record Dakota Gochee as owner/operator with editors and staff writers including Brian Lesmes, Alex Bugella, Alex Brown, Cesar Gonzalez, and Caleb Porter. Bylines in restored articles are kept exactly as published.",
  },
  {
    period: "2019",
    title: "Latest dated articles in the recovered set",
    evidence:
      "Four restored articles carry 2019 dates, ending with material from March 2019 in the current archive.",
  },
];

/**
 * Sections known to have existed but currently without recoverable bodies.
 * Documented for honesty — not populated collections.
 */
export interface KnownUnrecoverableSection {
  slug: string;
  title: string;
  kind: "Known Section";
  status: "Currently Unrecoverable";
  /** Evidence-backed description only — no reconstructed content */
  description: string;
  placeholder: string;
}

export const KNOWN_UNRECOVERABLE_SECTIONS: KnownUnrecoverableSection[] = [
  {
    slug: "advocacy",
    title: "Advocacy",
    kind: "Known Section",
    status: "Currently Unrecoverable",
    description:
      "A dedicated Metal Lifestyle section attested by original navigation, surviving references, and restoration research. Available evidence suggests Advocacy represented an early editorial direction that later evolved into Dysphoria. No page bodies, media, or complete captures have been recovered from the sources used during this preservation effort.",
    placeholder:
      "This section is known to have existed in the original Metal Lifestyle publication. At the time of restoration, no recoverable page content has been located through available archival sources. This placeholder preserves the historical record of its existence. Should verifiable material become available in the future, it will be merged into the archive without altering existing preserved content.",
  },
];

export const PUBLICATION_ESSAY = {
  title: "Metal Lifestyle: An Archival Note",
  sections: [
    {
      heading: "Origins",
      body: [
        "Metal Lifestyle was an independent online publication hosted on Weebly at metallifestyle.weebly.com. It operated as a multi-section media site with a central blog and dedicated areas for live coverage, film and television, gaming, horror writing, and long-form metalcore documentation.",
        "The recovered record places dated blog activity between 2015 and 2019. This archive does not claim those dates exhaust the site’s full historical output; they describe what has been preserved here.",
      ],
    },
    {
      heading: "Editorial focus",
      body: [
        "The publication’s recoverable writing centers on heavy music — metal, hardcore, metalcore, and adjacent scenes — alongside interviews, live documentation, lists, and opinion. Parallel sections extended coverage into film and television (Curtains), games (Gaming Corner), horror shorts (FEAR), and historical metalcore research (American Metalcore Project).",
        "Tone and format vary by author and section. Review pieces frequently open with title, rating, and purchasing links; live writing documents specific shows and venues; lists and year-end features recur under named bylines.",
      ],
    },
    {
      heading: "Publication years",
      body: [
        "Within this archive, restored articles with publication dates fall between 2015 and 2019. Volume in the recovered set is highest in 2017. Later 2019 material is sparse relative to earlier years.",
        "Static section hubs and nested pages do not always carry blog-style dates; they are preserved as structural artifacts of the original site.",
      ],
    },
    {
      heading: "Major sections",
      body: [
        "The recoverable navigation retained in this archive lists: Metal Lifestyle (blog), Dysphoria, American Metalcore Project, Prisms: Local Show Recap, FEAR: Short Horror Tales from the Team, Curtains: Movie & TV Reviews, About Us: Meet the Staff, Gaming Corner, and Gallery.",
        "Advocacy is documented as a known dedicated section that is currently unrecoverable — attested by original navigation, surviving references, and restoration research, but without recoverable page bodies in the sources used here. Available evidence suggests it represented an early editorial direction that later evolved into Dysphoria; this archive does not reconstruct Advocacy content from that relationship.",
      ],
    },
    {
      heading: "Contributors",
      body: [
        "The preserved sidebar identifies Dakota Gochee as owner/operator, with editors Brian Lesmes and Alex Bugella, and staff writers including Alex Brown, Cesar Gonzalez, and Caleb Porter.",
        "Article bylines in the restored set include Alex Brown, Dakota G., DG, Dakota G, Cesar Gonzalez, Alex Bugella, and The Metal Lifestyle Team. Exact spellings are preserved; identities are not merged in indexes.",
      ],
    },
    {
      heading: "Restoration philosophy",
      body: [
        "This project treats Metal Lifestyle as a historical publication. The goal is preservation and navigability, not redesign. Layout, typography, and navigation of the restored reading room aim to resemble the original Weebly presentation.",
        "Contextual pages — this essay, history notes, methodology, highlights, and special collections — sit outside the publication. They do not annotate, rewrite, or insert commentary into historical articles.",
      ],
    },
    {
      heading: "Preservation methodology",
      body: [
        "Pages were recovered from the live Weebly host where still available, guided by a prior URL audit. Article bodies retain original HTML structure after removal of non-functional advertising scripts. Images were copied locally when reachable; missing media receive archival placeholders that keep page structure intact.",
        "Unavailable URLs remain in the collection as preservation notices. Internal links are remapped to restored routes when a target exists; otherwise original destinations are left in place. Full conservation notes appear on the Methodology page.",
      ],
    },
  ],
} as const;
