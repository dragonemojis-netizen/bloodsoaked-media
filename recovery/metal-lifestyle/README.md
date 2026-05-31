# Metal Lifestyle Archive Recovery

Preservation pipeline for Dakota-authored writing from [metallifestyle.weebly.com](https://metallifestyle.weebly.com).

**Not in scope:** cloning the full site, importing other contributors' work, or rewriting recovered copy.

## Commands

```bash
# Comprehensive discovery audit (run before any import)
npm run recovery:ml:audit
npm run recovery:ml:report      # Regenerate RECOVERY-AUDIT.md from audit.json
npm run recovery:ml:gap-list    # Articles missing from prior inventory.json

# Phase 1 — author-filtered inventory (approved / review / excluded)
npm run recovery:ml:crawl

# Phase 2 — import approved entries into content/legacy/ (dry run first)
npm run recovery:ml:import:dry
npm run recovery:ml:import
```

**Import is paused** until `RECOVERY-AUDIT.md` is reviewed and gaps are reconciled.

## Outputs

| Path | Purpose |
|------|---------|
| `reports/inventory.json` | Master inventory with eligibility groups |
| `raw/*.html` | Cached source HTML per URL |
| `content/legacy/*.md` | Imported archive articles (after import) |

## Author filtering

Auto-import only when signatures match Dakota (Gochee, Dakota, Dakota G., DG, D. with caution).

- **approvedForImport** — safe to run `recovery:ml:import`
- **requiresReview** — manual authorship check before import
- **excluded** — other authors, group reviews, or non-articles

When uncertain, entries stay out of auto-import.

## Frontmatter on import

```yaml
author: Dakota
originalPublication: Metal Lifestyle
originalUrl: https://metallifestyle.weebly.com/...
originalPublicationDate: YYYY-MM-DD
archiveEra: Metal Lifestyle Era (2015-2019)
collections: [the-archives, metal-lifestyle-era, ...]
restorationNote: "..."
```

Review queue items: inspect `requiresReview` in `inventory.json`, confirm authorship, move to approved manually or import by hand.
