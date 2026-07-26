# Bloodsoaked Media

Independent publication for games, film, music, television, and long-form cultural writing — built with Next.js, TypeScript, Tailwind CSS, and Markdown.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and set your production URL for SEO, RSS, and sitemap:

```
NEXT_PUBLIC_SITE_URL=https://bloodsoakedmedia.com

# Leave unset (or omit) to keep recovered legacy articles off the live site:
# NEXT_PUBLIC_LEGACY_ARCHIVE_PUBLIC=true

# Curator Mode — Workbench is available in `npm run dev` automatically.
# Set only on explicit curator/staging hosts — never on production:
# NEXT_PUBLIC_CURATOR_MODE=true
```

## Writing content

Add Markdown files to `content/posts/`:

```md
---
title: "Your Article Title"
date: "2026-05-30"
excerpt: "A short summary for cards and SEO."
category: games
type: review
tags: ["horror", "retro"]
featured: false
verdict: "Recommended"
---

Your article body in Markdown.
```

### Frontmatter fields

| Field | Required | Values |
|-------|----------|--------|
| `title` | yes | string |
| `date` | yes | ISO date `YYYY-MM-DD` |
| `excerpt` | yes | string |
| `category` | yes | `games`, `film`, `television`, `music`, `culture` |
| `type` | yes | `review`, `essay`, `retrospective`, `collection`, `editorial` |
| `tags` | yes | string array |
| `featured` | no | boolean — surfaces on home |
| `verdict` | no | reviews only — see below |
| `coverImage` | no | path for future hero images |

### Review verdicts (no numeric scores)

- `Recommended`
- `Recommended With Caveats`
- `For Fans Only`
- `Not Recommended`

## Navigation

Primary header/footer links: Home, Articles, Media Log, Collections, The Vault, The Archives, About.

Reviews, Essays, Catalog (`/archive`), Timeline, and Search are reached from within those sections — not top-level nav.

## Site structure

| Route | Purpose |
|-------|---------|
| `/` | Featured stories, editor column, sidebar |
| `/articles` | All written content |
| `/media-log` | Consumption journal (not all reviews) |
| `/reviews` | Reviews only |
| `/essays` | Essays only |
| `/collections` | Curated archives (museum exhibits) |
| `/collections/[slug]` | Single collection exhibit |
| `/archive` | Catalog — browse current publication by year, mood, tag |
| `/the-archives` | Legacy recovered artifacts |
| `/timeline` | Publication timeline |
| `/about` | Mission and standards |
| `/search` | Full-text search + tag browse |
| `/articles/[slug]` | Article page |
| `/media-log/[slug]` | Media log entry |
| `/feed.xml` | RSS feed |
| `/sitemap.xml` | SEO sitemap |

## Editorial content (non-article)

### Media Log — `content/media-log/*.md`

```md
---
title: "Dragon Quest VII"
date: "2026-05-22"
mediaType: Game
status: finished
notes: "Short journal note."
score: "Optional label"
coverImage: "/images/media-log/cover.jpg"
reviewSlug: optional-article-slug
---
```

`mediaType`: Game, Film, Music, TV, Book  
`status`: finished, started, rewatched, listened, completed, reading

### Currently Experiencing — `content/editorial/currently-experiencing.json`

```json
{
  "playing": "Game title",
  "watching": "Film or show",
  "listening": "Album or artist",
  "reading": "Book title",
  "updated": "2026-05-30"
}
```

### From the Editor — `content/editorial/from-the-editor.md`

YAML frontmatter: `introduction`, `whatItIs`, `whyItExists`, optional `monthlyUpdate`, `updated`.

### Collections — `content/collections/*.json`

```json
{
  "title": "Collection Name",
  "description": "Museum-style description.",
  "coverImage": "/images/collections/optional.jpg",
  "items": [
    { "title": "Item", "year": 1994, "platform": "SNES", "notes": "..." }
  ]
}
```

Collection *features* (written articles) remain Markdown posts with `type: collection` in `content/posts/`.

### Article mood metadata — `content/posts/*.md`

```yaml
medium: game
era: "2001"
mood: Melancholic
authorNote: "Optional note from the editor's desk."
editorPick: true
inVault: true
coverImage: "/images/articles/cover.jpg"
```

Moods: Bleak, Comforting, Melancholic, Cult Classic, Obsessive, Atmospheric, Nostalgic, Unsettling

Browse moods at `/archive/mood`.

### The Vault — `content/vault.json`

Permanent shelf for desert-island media. Link entries to articles or media log slugs.

### Catalog

Hub at `/archive` — browse **current** Bloodsoaked Media writing by year, month, category, tag, and mood. Legacy recovered writing lives at `/the-archives`, not here.

### Legacy archive — `content/legacy/*.md`

Preserved writing from earlier publications (Metal Lifestyle, original Bloodsoaked Media, etc.). **Do not rewrite or modernize** archived body text — only fix broken media, dead links, and formatting.

```yaml
legacy: true
originalPublication: "Metal Lifestyle"
originalPublicationDate: "2012-08-14"
originalSite: "Metal Lifestyle"
archiveDate: "2026-06-01"
date: "2026-06-01"          # filing date in this archive
restorationNote: "Optional editor note — shown separately from the article."
collections: ["the-archives"]
```

| Route | Purpose |
|-------|---------|
| `/the-archives` | Recovered artifacts collection |
| `/timeline` | Publication history milestones |
| `/articles/[slug]` | Same URL for current and legacy posts |

Timeline milestones: `content/timeline.json`. Collection copy: `content/collections/the-archives.json`. Template: `content/legacy/_template.md`.

### Metal Lifestyle recovery (Weebly)

Pipeline in `recovery/metal-lifestyle/` — crawl [metallifestyle.weebly.com](https://metallifestyle.weebly.com), filter to Dakota-authored work only, import into `content/legacy/`.

```bash
npm run recovery:ml:audit      # Comprehensive discovery audit (run first)
npm run recovery:ml:gap-list   # Compare audit vs prior inventory
npm run recovery:ml:crawl      # Author-filtered inventory (after audit)
npm run recovery:ml:import     # Paused until audit gaps are reviewed
```

See `recovery/metal-lifestyle/README.md` for review queue workflow.

## Stack

- **Next.js 16** — App Router, static generation
- **TypeScript**
- **Tailwind CSS v4** — dark atmospheric theme
- **Markdown** — `gray-matter`, `remark`, `remark-html`
- **RSS** — `/feed.xml`
- **SEO** — metadata, Open Graph, sitemap, robots

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

## Design notes

The default theme is dark-only: deep blacks, blood-red accents, subtle CRT scanlines and film grain. Readability is prioritized over effect. Customize colors in `src/app/globals.css` and copy in `src/config/site.ts`.
