/**
 * Library Archival Voice — Bloodsoaked Media
 * ==========================================
 *
 * Internal style guide and reusable copy for the Library (Archival Wing).
 * Every user-facing string in `/library` should come from this module so the
 * wing speaks with one institutional voice.
 *
 * Architectural conscience (scaling, forbidden patterns, longevity):
 * → src/config/library-stewardship.ts
 *
 * Tone
 * ----
 * Quiet. Deliberate. Permanent. Human.
 * Museum archive, reading room, after-hours stacks — never SaaS, never inventory
 * software, never an admin panel.
 *
 * Principles
 * ----------
 * 1. Prefer institutional language over personal (“Bloodsoaked Media”, not “my”).
 * 2. Prefer verbs of care (filed, catalogued, preserved) over verbs of systems
 *    (added, uploaded, synced, indexed).
 * 3. Empty states describe a prepared room, not a missing query result.
 * 4. Labels on cards and placards should read as museum labels.
 * 5. Warmth over cold precision — readable sentences, measured rhythm.
 * 6. Do not invent decorative slogans to fill space. Restraint is the brand.
 *
 * Lexicon (software → archive)
 * ----------------------------
 * Search            → Catalog Lookup
 * Filter            → Catalog Facets
 * Result            → Filed Work
 * Collection        → Archive
 * Database          → Archive
 * Item              → Work
 * Entry             → Archive Entry
 * Added             → Filed
 * Description       → Curator Notes
 * Metadata          → Catalog Information
 * Details           → Preservation Record
 * Status            → Archival Status
 * Information       → Record
 * Tags              → Subjects
 *
 * Forbidden (never print in Library UI)
 * -------------------------------------
 * Database, Record (as in DB row), Asset, Inventory, Collection Manager,
 * Dashboard, Admin, Sync, Upload, Query, Results found, No items found,
 * Manage, CRUD, Dataset.
 *
 * Preferred vocabulary
 * --------------------
 * Archive, Preservation, Collection Notes, Filed, Catalogued, Reference Copy,
 * Curator Notes, Archival Status, Preservation Record, Shelf mark, Stacks,
 * Filing Card, Card Catalog, Catalog Facets, Filed Work, Subjects.
 */

/** Formal lexicon for authors and future pages — prefer `preferred`, never print `avoid`. */
export const LIBRARY_LEXICON = {
  search: { avoid: "Search", preferred: "Catalog Lookup" },
  filter: { avoid: "Filter", preferred: "Catalog Facets" },
  result: { avoid: "Result", preferred: "Filed Work" },
  collection: { avoid: "Collection", preferred: "Archive" },
  database: { avoid: "Database", preferred: "Archive" },
  item: { avoid: "Item", preferred: "Work" },
  entry: { avoid: "Entry", preferred: "Archive Entry" },
  added: { avoid: "Added", preferred: "Filed" },
  description: { avoid: "Description", preferred: "Curator Notes" },
  metadata: { avoid: "Metadata", preferred: "Catalog Information" },
  details: { avoid: "Details", preferred: "Preservation Record" },
  status: { avoid: "Status", preferred: "Archival Status" },
  information: { avoid: "Information", preferred: "Record" },
  tags: { avoid: "Tags", preferred: "Subjects" },
} as const;

/** Catalog field labels — museum placard language for cards and preservation records. */
export const libraryFields = {
  medium: "Medium",
  archivalStatus: "Archival Status",
  year: "Year",
  era: "Era",
  platform: "Platform",
  publisher: "Publisher",
  developer: "Developer",
  director: "Director",
  artist: "Artist",
  filed: "Filed",
  shelfMark: "Shelf mark",
  subjects: "Subjects",
  synopsis: "Synopsis",
  curatorNotes: "Curator Notes",
  collectionNotes: "Collection Documentation",
  preservationNotes: "Preservation Notes",
  catalogInformation: "Catalog Information",
  preservationRecord: "Preservation Record",
  archiveEntry: "Archive Entry",
  filedWork: "Filed Work",
  filingCard: "Filing Card",
  referenceCopy: "Reference Copy",
  connections: "Connections",
  artifactDocumentation: "Artifact Documentation",
  artifactView: "Artifact View",
  referencePhotograph: "Reference Photograph",
  captured: "Captured",
  resolution: "Resolution",
  edition: "Edition",
  originalTitle: "Original Title",
  release: "Release",
  region: "Region",
  owned: "Custody",
  physical: "Reference Copy",
  condition: "Condition Report",
  acquired: "Acquisition",
  playableOn: "Access Hardware",
  originalHardware: "Original Hardware",
  compatibility: "Playback Compatibility",
  concerns: "Preservation Concerns",
  knownRevisions: "Edition History",
  availability: "Access Status",
  relatedEntries: "Related Archive Entries",
  lineage: "Archival Lineage",
  series: "Series",
  mediaLog: "Media Log",
  articles: "Articles",
  collectionPhotos: "Collection Record",
  instagramPosts: "Acquisition Reference",
  futureReviews: "Editorial Record",
  archiveIdentifier: "Archive Identifier",
  lastCuratorialRevision: "Last Curatorial Revision",
  accessionSource: "Accession Source",
  acquisitionRecord: "Acquisition Record",
  acquisitionSource: "Source",
  steamAppId: "Steam App ID",
  acquiredThrough: "Acquired through",
  importDate: "Entered",
  lastSynchronized: "Provenance reconciled",
  playtime: "Recorded playtime",
  playtimeRecent: "Playtime · recent",
  storeReference: "Store listing",
  relationships: "Relationships",
  relatedHoldings: "Related Holdings",
  editorialStanding: "Editorial Standing",
  technicalDetails: "Technical record",
  holdingReference: "Holding reference",
  stewardshipHistory: "Stewardship History",
} as const;

/**
 * How filings entered the archive. Bulk sources added later read as archival
 * provenance, never as an integration name.
 */
export const libraryAccessionSourceLabels = {
  "private-acquisition": "Private acquisition",
  "collection-hall": "Collection Hall record",
  "digital-library": "Digital library holding",
  donation: "Donation",
  transfer: "Institutional transfer",
} as const;

/**
 * All Library UI copy. Import `libraryVoice` (or nested sections) in components
 * so future pages inherit the same institutional voice automatically.
 */
export const libraryVoice = {
  /** Nav / page title */
  name: "Library",
  eyebrow: "Archival Wing",
  institutionLine: "Bloodsoaked Media · Permanent Archive",

  description:
    "The permanent media archive of Bloodsoaked Media.\n\nWorks are catalogued here for preservation — filed, annotated, and kept in trust. Not a feed. Not a scoreboard. A reading room for what endures.",

  heroClosing: "Every filing is deliberate. Nothing is discarded.",

  /** Catalog Lookup (formerly “search”) */
  lookup: {
    eyebrow: "Catalog Lookup",
    label: "Catalog lookup across the stacks",
    placeholder: "Search the stacks…",
    submit: "Look Up",
    hint: "Titles, shelf marks, Steam App IDs, holdings, and Authority Records — once catalogued.",
  },

  /** Catalog Facets / card catalog (formerly “filters”) */
  facets: {
    eyebrow: "Catalog Facets",
    lead: "Open a platform or genre to narrow the shelves. Lookup works with every open drawer.",
    platform: libraryFields.platform,
    genre: "Genre",
    genreEmpty: "Genres appear as works are catalogued.",
    asideLabel: "Library card catalog",
    activeLabel: "Open catalog facets",
    clearAll: "Clear all",
    matchOne: "1 filed work matches",
    matchMany: (count: number) => `${count} filed works match`,
    removeChip: (label: string) => `Remove ${label}`,
  },

  /** Empty wing — archivist prepared the room */
  empty: {
    eyebrow: "Awaiting First Filing",
    title: "The archival wing is quiet",
    body: "The shelves await their first catalogued works. When titles enter the archive they will be filed with care — annotated, cross-referenced, and preserved as part of the permanent collection.",
    hint: "Nothing here is unfinished. The room is prepared, the ledger is open, and the first filing will be deliberate.",
    stamp: "Climate held · Light low · Ledger open",
    noMatch:
      "Nothing on the shelves answers that lookup. The archive will grow.",
    loading: "Opening the stacks…",
  },

  /** Shelf / grid of filed works */
  shelves: {
    eyebrow: "On the Shelves",
    description:
      "Catalogued works arranged for browsing — each placard a doorway into a full archival filing.",
    countOne: "1 filed work on the shelf",
    countMany: (count: number) => `${count} filed works on the shelves`,
    /** Quiet continuation — not “page N of M” pagination chrome. */
    continuationLabel: "Further along the shelves",
    furtherAlong: "Further along the shelf →",
    earlierOn: "← Earlier on the shelf",
    rangeOnShelf: (from: number, to: number, total: number) =>
      `${from}–${to} of ${total} filed works`,
  },

  /** Individual preservation record (detail page) */
  record: {
    backLink: "← Library",
    archiveEntry: libraryFields.archiveEntry,
    preservationRecord: libraryFields.preservationRecord,
    filedWork: libraryFields.filedWork,
    eyebrow: libraryFields.preservationRecord,
    synopsisEyebrow: libraryFields.synopsis,
    notesEyebrow: libraryFields.curatorNotes,
    collectionNotesEyebrow: libraryFields.collectionNotes,
    preservationNotesEyebrow: libraryFields.preservationNotes,
    filingCardEyebrow: libraryFields.filingCard,
    catalogInformationEyebrow: libraryFields.catalogInformation,
    archivalStatusEyebrow: libraryFields.archivalStatus,
    connectionsEyebrow: libraryFields.connections,
    relationshipsEyebrow: libraryFields.relationships,
    acquisitionRecordEyebrow: libraryFields.acquisitionRecord,
    acquisitionRecordLead:
      "How this digital copy entered archival custody — provenance for the holding, not the identity of the work.",
    storeListingLabel: "Steam store listing",
    /** Derived series lineage — reads as a shelf, not a sequel list. */
    lineageCurrentSuffix: "this filing",
    artifactDocumentationEyebrow: libraryFields.artifactDocumentation,
    artifactDocumentationLead:
      "Reference photography of the preserved copy held by Bloodsoaked Media. Each view records the edition, materials, and condition of the work in custody.",
    artifactDocumentationPrepared:
      "Space is reserved for official artwork verification, collection photography, scans, and supplementary archival media. Nothing is forced into the record until documentation is filed.",
    artifactDocumentationDigitalLead:
      "This filing is retained as a digital edition. Physical collection photography does not apply to the holding itself.",
    artifactDocumentationDigitalPrepared:
      "Supplementary archival media may be entered if documentation is later filed. Nothing is forced into the record.",
    editorialAwaiting: {
      curatorNotes: "Not yet entered.",
      collectionDocumentation: "Awaiting documentation.",
      preservationNotes: "Not yet entered.",
      relationships: "No archival relationships established.",
      relatedArticles: "No related articles filed.",
      mediaLog: "No Media Log references filed.",
      series: "No series relationship recorded.",
      relatedHoldings: "No related holdings recorded.",
      relatedEntries: "No related Library entries recorded.",
    },
    openArtifactAria: (view: string) =>
      `Inspect artifact documentation — ${view}`,
    lightboxClose: "Close",
    lightboxPrevious: "Previous image",
    lightboxNext: "Next image",
    lightboxZoomIn: "Zoom in",
    lightboxZoomOut: "Zoom out",
    lightboxReset: "Reset view",
    openAria: (title: string) => `Open preservation record for ${title}`,
    navigationLabel: "Library navigation",
    emptySection: "Nothing filed in this panel.",
    colophonLabel: "Record Colophon",
    stewardshipHistoryEyebrow: libraryFields.stewardshipHistory,
    stewardshipHistoryLead:
      "A permanent chronology of this archival record — filed, revised, and tended over time. Entries accumulate; none are erased.",
  },

  /** Shared stamps */
  filed: libraryFields.filed,
  shelfMark: libraryFields.shelfMark,
  subjects: libraryFields.subjects,
  archivalStatus: libraryFields.archivalStatus,
  medium: libraryFields.medium,
} as const;

/** Archival status labels — never print raw software enums in the UI. */
export const libraryStatusLabels = {
  catalogued: "Catalogued · Permanent Record",
  "in-progress": "Editorial Draft · Under Review",
  archived: "Preserved · Closed Record",
  wishlist: "Sought",
} as const;

/** Medium labels for placards and facets. */
export const libraryMediumLabels = {
  game: "Game",
  film: "Film",
  television: "Television",
  music: "Music",
  book: "Book",
  other: "Other",
} as const;

/**
 * Convenience: flat aliases matching the old `publication.library*` shape,
 * for gradual migration and SEO metadata.
 */
export const libraryPublicationAliases = {
  library: libraryVoice.name,
  libraryEyebrow: libraryVoice.eyebrow,
  libraryInstitutionLine: libraryVoice.institutionLine,
  libraryDescription: libraryVoice.description,
  libraryHeroClosing: libraryVoice.heroClosing,
  librarySearchEyebrow: libraryVoice.lookup.eyebrow,
  librarySearchPlaceholder: libraryVoice.lookup.placeholder,
  librarySearchLabel: libraryVoice.lookup.label,
  librarySearchSubmit: libraryVoice.lookup.submit,
  librarySearchHint: libraryVoice.lookup.hint,
  libraryFiltersEyebrow: libraryVoice.facets.eyebrow,
  libraryFiltersLead: libraryVoice.facets.lead,
  libraryFilterPlatform: libraryVoice.facets.platform,
  libraryFilterGenre: libraryVoice.facets.genre,
  libraryEmptyEyebrow: libraryVoice.empty.eyebrow,
  libraryEmptyTitle: libraryVoice.empty.title,
  libraryEmptyBody: libraryVoice.empty.body,
  libraryEmptyHint: libraryVoice.empty.hint,
  libraryEmptyStamp: libraryVoice.empty.stamp,
  libraryEmptyNoMatch: libraryVoice.empty.noMatch,
  libraryGridEyebrow: libraryVoice.shelves.eyebrow,
  libraryGridDescription: libraryVoice.shelves.description,
  libraryDetailBackLink: libraryVoice.record.backLink,
  libraryDetailEyebrow: libraryVoice.record.eyebrow,
  libraryDetailSynopsisEyebrow: libraryVoice.record.synopsisEyebrow,
  libraryDetailNotesEyebrow: libraryVoice.record.notesEyebrow,
  libraryDetailMetaEyebrow: libraryVoice.record.filingCardEyebrow,
  libraryDetailOpenAria: libraryVoice.record.openAria,
  libraryFiledStamp: libraryVoice.filed,
  libraryRef: libraryVoice.shelfMark,
} as const;
