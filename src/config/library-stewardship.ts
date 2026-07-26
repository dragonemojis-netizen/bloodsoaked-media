/**
 * Library Stewardship Charter — Bloodsoaked Media
 * ===============================================
 *
 * This module is the architectural conscience of the Archival Wing.
 * It does not render UI. It exists so future work inherits the same
 * restraint that made the first filing feel permanent.
 *
 * Read this before adding metadata, facets, panels, or browse behavior.
 */

/** Enduring design principles — do not dilute for convenience. */
export const LIBRARY_STEWARDSHIP_PRINCIPLES = [
  "Whitespace is intentional. Do not fill it with interface.",
  "Typography carries meaning. Decoration do not.",
  "The archive is quiet, confident, and permanent.",
  "Richer over time must not mean busier over time.",
  "Document works, preserved artifacts, and relationships — not completeness.",
  "One filing and five thousand filings must feel like the same institution.",
] as const;

/** Patterns that would compromise archival identity if introduced. */
export const LIBRARY_FORBIDDEN_PATTERNS = [
  "Dashboard layouts, KPI strips, or admin-panel chrome",
  "Collection-management software aesthetics (bulk actions, checkboxes, toolbars)",
  "Social-media patterns (feeds, infinite scroll as engagement, reaction counts)",
  "Encyclopedic density competing with Wikipedia / IGDB / Steam",
  "Visual decoration without archival purpose",
  "Solving emptiness by adding UI chrome",
] as const;

/**
 * Scaling contract.
 *
 * Browse (the shelves) must never require opening full accession records.
 * Accession pages (preservation records) load exactly one filing.
 * Artifact galleries grow by count, not by redesign.
 */
export const LIBRARY_SCALING_CONTRACT = {
  /** Cards shown on one shelf page — enough for presence, never a warehouse dump. */
  shelfPageSize: 24,
  /**
   * Browse projections only. Full curator notes, preservation text, and artifact
   * arrays stay on the accession page.
   */
  browseUsesShelfCardsOnly: true,
  /** Detail routes hydrate a single Archive Entry. */
  accessionLoadsOneEntry: true,
  /** Catalog index carries shelf summaries so thousands of filings stay quiet. */
  indexCarriesShelfSummaries: true,
} as const;

/**
 * Accession sources.
 *
 * Every filing records how it entered the archive. A future bulk source — a
 * digital storefront library, a physical shelf inventory — is added as another
 * value in LIBRARY_ACCESSION_SOURCES with a label in library-voice, and it
 * inherits the existing accession template, browse shelves, and voice.
 *
 * A new source must never introduce: its own route, its own card design, its
 * own detail template, its own badge, or storefront vocabulary in the UI.
 * If a source cannot be described in archival language, it is not ready to file.
 */
export const LIBRARY_ACCESSION_SOURCE_RULES = [
  "Sources are provenance, not integrations. Name them as custody, not as services.",
  "Bulk sources file through the same schema; no parallel content directory.",
  "Imported filings are hidden until curated — visibility defaults to review, not publish.",
  "An unwritten Curator Note is preferable to a generated one.",
  "Scale belongs in the index and the shelf pager, never in new interface density.",
] as const;

/** Guidance when new metadata arrives. */
export const LIBRARY_METADATA_STEWARDSHIP = [
  "Integrate new fields into existing accession panels when they belong there.",
  "Prefer optional omission over empty placeholders.",
  "Never crowd the hero. Identity stays title, year, medium, shelf mark, cover.",
  "Preserve editorial rhythm: hairline rules, generous margins, short placards.",
  "If a field cannot be spoken as museum language, it does not belong in the UI.",
] as const;

/** Philosophical boundary of the Bloodsoaked Archive. */
export const LIBRARY_ARCHIVAL_PHILOSOPHY = {
  documents: [
    "Works (identity of the media)",
    "Preserved artifacts (custody of the physical copy)",
    "Relationships (connections across the publication)",
  ],
  doesNot: [
    "Chase completeness",
    "Compete with encyclopedias or storefronts",
    "Reduce culture to inventory",
  ],
  existsTo: "Preserve context.",
} as const;
