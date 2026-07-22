# Metal Lifestyle — Stewardship Guide

Internal documentation for maintaining the preserved publication.
Someone unfamiliar with the project should be able to operate without guessing.

**Status:** historically complete (recoverable corpus). Sealed via
`PRESERVATION.lock.json`.

---

## Preservation philosophy

1. **Preserve over redesign.** The reading room aims to resemble the original Weebly presentation.
2. **Never invent history.** Unavailable material gets preservation notices, not fabricated text.
3. **Exact bylines.** `Dakota G.`, `Dakota G`, and `DG` remain distinct index identities.
4. **Context beside, never inside.** Interpretive pages live under `/context/**`. Do not annotate articles.
5. **Baseline is authoritative.** Gap-fill only inserts demonstrably missing material.

Future work is limited to:

- recovering newly discovered historical material
- fixing factual preservation defects
- maintaining compatibility with platform updates

Nothing else.

---

## Archive architecture

```
content/archives/metal-lifestyle/     ← sealed historical store (source of truth)
  PRESERVATION.lock.json              ← sealed flag + canonical routes
  STEWARDSHIP.md                      ← this document
  README.md                           ← short operator overview
  manifest.json                       ← index of posts/pages
  authors.json                        ← byline indexes + biographies
  categories.json                     ← category indexes
  posts/*.json                        ← restored / unavailable articles
  pages/*.json                        ← restored / unavailable static pages

public/images/archives/metal-lifestyle/
  media/                              ← preserved image binaries
  background.jpg

recovery/metal-lifestyle/             ← tooling outputs (not the publication)
  reports/                            ← audits, gap-fill reports
  raw/ / gap-raw/                     ← HTML snapshots from recovery
  README.md

src/app/the-archives/metal-lifestyle/ ← Next.js routes (read-only consumers)
src/components/archives/metal-lifestyle/
src/lib/metal-lifestyle-archive.ts    ← loaders (fs read only)
src/config/metal-lifestyle*.ts        ← nav + interpretive config (not article bodies)
scripts/recovery/metal-lifestyle/     ← recovery / polish / gap-fill tooling
```

**Runtime is read-only.** No Next.js request path writes archive JSON.

**Isolation:** Archive content does not share storage with modern Bloodsoaked posts
(`content/posts`, `content/legacy`). Do not move restored articles into the modern CMS.

---

## Canonical routes

| Role | Path |
|------|------|
| Catalog | `/the-archives/metal-lifestyle` |
| Publication blog | `/the-archives/metal-lifestyle/blog` |
| Article | `/the-archives/metal-lifestyle/post/[slug]` |
| Static page | `/the-archives/metal-lifestyle/page/[slug]` |
| Author | `/the-archives/metal-lifestyle/author/[slug]` |

### Documented redirects

| From | To |
|------|----|
| `/…/authorauthor/[slug]` | `/…/author/[slug]` (typo lock) |
| `/…/sections/[section]` | `/…/page/[section]` |

### Deprecated

| Path | Note |
|------|------|
| `/the-archives/metal-lifestyle/[slug]` | Legacy Markdown (`content/legacy`) pipeline. Prefer `/post/[slug]`. |

Gated by `NEXT_PUBLIC_LEGACY_ARCHIVE_PUBLIC=true`.

---

## Provenance model

Each restored JSON record typically includes:

- `originalUrl` — Weebly source
- `restoredAt` / `gapFilledAt` / `preservation` — recovery timestamps
- `status` — `restored` | `unavailable` | `thin`
- `media[]` — original URL, local path, saved/missing
- `author` — exact byline string when known
- `contentHtml` — historical body (ads stripped; editorial text unchanged)

Manifest + authors + categories are **generated indexes**. Bodies in `posts/` and
`pages/` are the durable artifacts. Indexes may be rebuilt; bodies must not be
casually overwritten.

---

## Recovery pipeline (do not use lightly)

Sealed archive: mutating commands require `--force`.

| Command | Purpose |
|---------|---------|
| `recovery:ml:audit` | Discovery inventory (reports only) |
| `recovery:ml:restore-full --force` | Full crawl overwrite — **forbidden unless expanding recovery** |
| `recovery:ml:gap-fill --force` | Completeness pass — missing material only |
| `recovery:ml:gap-fill:dry` | Dry-run gap fill (allowed without --force) |
| `recovery:ml:steward-polish --force` | Formatting/metadata polish (preserves bios; does not fetch) |
| `recovery:ml:rebuild-index` | Rewrite `manifest.json` from on-disk posts/pages (no fetch) |
| `recovery:ml:quality-audit` | Consistency report (read-only) |

**Index authority:** Runtime catalog stats and blog pagination derive post/page
extent from on-disk JSON bodies, not from a possibly stale manifest array.
`rebuild-index` keeps the sidecar `manifest.json` aligned for tooling.

`recovery:ml:import` writes **`content/legacy/`** (Dakota-era Markdown). It is
**not** the publication archive. Do not confuse the two.

---

## Gap-fill workflow

1. Confirm new historical evidence exists (live host, Wayback, or other source).
2. `npm run recovery:ml:gap-fill:dry` — review candidates.
3. `npm run recovery:ml:gap-fill -- --force` — merge only absences.
4. File the report under `recovery/metal-lifestyle/reports/`.
5. Update restoration log (context config) with a field note.

Never run `restore-full` to “refresh” sealed content.

---

## Content boundaries

**Inside the publication (immutable historical material):**

- blog posts, section pages, Weebly nav labels, sidebar staff blurb as preserved
- article HTML bodies and captions

**Outside the publication (stewardship / interpretation):**

- catalog placard, preservation banner, finding aids, `/context/**`
- `STEWARDSHIP.md`, lock file, recovery reports

Do not add new discovery systems or context pages unless product owners
explicitly reopen that phase.

---

## Known unrecoverable material

As of the 2026-07-22 completeness pass (see `GAP-FILL-REPORT.md`):

- **Advocacy** — known dedicated section; no recoverable page bodies or media in current sources. Documented on Publication History and as a Known Section placeholder under Special Collections (`/context/collections/advocacy`). Do not reconstruct.
- ~33 blog articles still 404 on the live host (no Wayback body found on probe)
- ~33 Curtains nested reviews
- 6 FEAR nested tales; 3 Gaming Corner pages; 2 Prisms pages
- 2 Gallery pages exist as empty Weebly widgets (no image payload)
- Category descriptions were never present on the host
- Many restored posts lack extracted bylines (`author: null`) — do not invent them

Preserve as notices or documentation. Do not fabricate.

This archive distinguishes **recovered**, **known to have existed**, and **currently unrecoverable**. Advocacy is the third category.

---

## Safety rules for Bloodsoaked Media development

1. Do not import archive JSON into the modern post pipeline.
2. Do not share mutable design tokens that force archive redesign.
3. Keep `PageShell` immersive skip for `/the-archives/metal-lifestyle*`.
4. Do not add recovery scripts to `npm run build` or CI.
5. Prefer PR review when `content/archives/metal-lifestyle/**` or
   `public/images/archives/metal-lifestyle/**` change.
6. Platform upgrades: re-verify archive routes and CSS; do not “improve” HTML bodies.

---

## Consistency repairs

Allowed without reopening restoration:

- demangle broken internal archive links
- restore wiped biographies to authors.json
- fix route typos / redirects
- update documentation

Not allowed:

- modernizing copy
- merging byline identities
- redesigning Weebly chrome
- mass re-crawl
