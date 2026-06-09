/** Editorial terminology — tasteful publication voice */
export const publication = {
  featured: "Featured Stories",
  recent: "Recent Entries",
  catalog: "Catalog",
  catalogEyebrow: "Modern Publication",
  catalogDescription:
    "Browse current Bloodsoaked Media writing — filed by year, mood, tag, and category.",
  browseTheShelf: "Browse the Shelf",
  browseArticles: "Browse the Desk",
  viewCatalog: "View Catalog",
  mediaLog: "Media Log",
  mediaLogEyebrow: "Personal Archive",
  collection: "Collection",
  collectionEyebrow: "Preservation Hall",
  collectionDescription:
    "An archive of my love for media: acquisitions, discoveries, and preservation.\n\nEach artifact carries a story. It's up to you to connect the pages.\n\nThe filing slip beneath shares personal insights on each piece.",
  collectionHeroAttribution: "Maintained by",
  collectionFeaturedEyebrow: "Currently on Exhibit",
  collectionJournalEyebrow: "State of the Collection",
  collectionJournalSolo:
    "Public-use archive. Created 2026.\n\nEvery filing is intentional, personally annotated, and preserved forever.",
  collectionJournalSmall: (count: number) =>
    `${count} specimens on permanent record. The hall is young, but each artifact is filed with care — notes, context, and significance added as the collection matures.`,
  collectionJournalEstablished: (count: number) =>
    `${count} artifacts catalogued across acquisitions, discoveries, and preservation projects. The collection grows through deliberate filing — never as a feed, always as an archive.`,
  collectionJournalPreservation: (count: number) =>
    count > 0
      ? `${count} active preservation ${count === 1 ? "project" : "projects"} underway alongside catalogued specimens.`
      : "No active preservation projects at present.",
  collectionJournalLastFiling: "Most recent filing",
  collectionGridEyebrow: "Further Specimens",
  collectionGridDescription:
    "Additional artifacts on permanent display — each with its own acquisition story and curator annotation.",
  collectionEmptyArchive:
    "The public archive is empty. Synchronized Instagram acquisitions and curated entries will appear here once filed.",
  collectionCuratorPrefaceEyebrow: "From the Curator's Desk",
  collectionCuratorPrefaceSolo:
    "The collection hall awakens with only a single specimen. Not a placeholder, but a true unveiling.\n\nI file what crosses my brain consistently: games, movies, music, hardware. All bound by my love for preservation and physical media.\n\nInstagram captures the moment; this archive holds its notes and permanence.\n\nEnjoy.",
  collectionCuratorPrefaceSignatureSolo: "— D",
  collectionCuratorPrefaceSmall:
    "The collection is still forming. What you see here is deliberately small — each artifact chosen, photographed at acquisition, and filed for preservation. I add curator notes, context, and significance over time. The provenance beneath each piece never changes.",
  /** Foundational Collection identity — static; do not derive from archive data. */
  collectionArchivePrincipleEyebrow: "Archive Principle",
  collectionArchivePrinciple:
    "forever growing until the end of me, my labor of love.",
  collectionCuratorNoteEyebrow: "Curator Annotation",
  collectionCuratorAnnotationExpand: "Open Full Filing →",
  collectionCuratorAnnotationCollapse: "Return to Exhibit Placard ↑",
  collectionCuratorFilingClose: "Close Filing Drawer ↑",
  collectionCuratorFilingDrawerLabel: "Filing drawer open",
  collectionCuratorFilingEyebrow: "Curator Record",
  collectionCuratorFilingLead:
    "Complete curator annotation — filed separately from the exhibit placard and preserved for the permanent record.",
  collectionCuratorAnnotationExpandAria: (title: string) =>
    `Open full curator filing for ${title}`,
  collectionCuratorAnnotationCollapseAria:
    "Close curator filing and return to exhibit placard",
  collectionCuratorNotePending:
    "Annotation in progress. I return to each filing to add context, significance, and collection history as the archive matures.",
  collectionEnrichmentEyebrow: "Catalog Enrichment",
  collectionRelatedReading: "Related reading",
  collectionProvenanceEyebrow: "Original Filing Record",
  collectionProvenanceLead:
    "Preserved exactly as captured at acquisition. Curator notes and enrichment live separately and may evolve.",
  collectionProvenanceFoldLabel: "View original filing record",
  collectionFieldNoteEyebrow: "Recorded at acquisition",
  collectionCatalogueStamp: "Catalogued",
  collectionAcquiredStamp: "Acquired",
  collectionSourceInstagram: "Instagram acquisition",
  collectionSourceCurated: "Curated filing",
  collectionViewSource: "Source reference — original Instagram post",
  collectionArchiveRef: "Ref.",
  collectionCuratorRole: "Curator",
  /** @deprecated Plural label — retained for article metadata until Phase 3 */
  collections: "Collections",
  collectionsEyebrow: "Curated Shelves",
  fromTheEditor: "From the Editor",
  currentlyExperiencing: "Currently Experiencing",
  currentlyPlaying: "Currently Playing",
  collectionFeatures: "Collection Features",
  moods: "Browse by Mood",
  moodsEyebrow: "Atmosphere",
  theVault: "The Vault",
  vaultEyebrow: "Permanent Shelf",
  vaultEntry: "Vault Entry",
  vaultPermanent: "Permanent Shelf Space",
  vaultPreservation: "Archived for Preservation",
  authorNote: "From the Desk",
  relatedOnShelf: "You May Also Find This on the Shelf",
  filedUnder: "Filed Under",
  editorsPick: "Editor's Pick",
  latestLogEntry: "Latest Log Entry",
  recentlyCatalogued: "Recently Added to the Collection",
  inTheVault: "In the Vault",
  vaultRotatingNote: "Selections rotate. The shelf is never finished.",
  partOfCollection: (name: string) => `Part of the ${name}`,
  earlierInCatalog: "Earlier in the Catalog",
  laterInCatalog: "Later in the Catalog",
  byline: "Words by",
  theArchives: "The Archives",
  theArchivesEyebrow: "Recovered Artifacts",
  publicationTimeline: "Publication Timeline",
  timelineEyebrow: "Publication Record",
  legacyArchivedFrom: (source: string) => `Archived from ${source}`,
  legacyPreserved: "Preserved Writing",
  restorationNote: "Restoration Note",
  originallyPublished: "Originally Published",
  originalSource: "Original Source",
  archiveEra: "Archive Era",
  archivedOn: "Archived",
  /** Intentional empty-archive copy — no placeholder articles */
  emptyArticles: "No articles currently filed.",
  emptyReviews: "No reviews currently filed.",
  emptyEssays: "No essays currently filed.",
  emptyCatalog:
    "This shelf is awaiting cataloging. Archive space reserved for future entries.",
  emptyShelf: "This shelf is awaiting cataloging.",
  emptyRecent: "Writing in progress. New entries will appear here when filed.",
  emptySearch:
    "No matches in the catalog. Try another term or browse the Media Log and Vault.",
} as const;

export const categoryLabels: Record<string, string> = {
  games: "Games",
  film: "Film",
  television: "Television",
  music: "Music",
  culture: "Culture",
};

export const mediumLabels: Record<string, string> = {
  game: "Game",
  film: "Film",
  television: "Television",
  music: "Music",
  book: "Book",
  culture: "Culture",
};
