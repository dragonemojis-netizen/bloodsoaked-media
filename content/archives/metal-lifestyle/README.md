# Metal Lifestyle — Full Publication Archive

Preserved content recovered from [metallifestyle.weebly.com](https://metallifestyle.weebly.com).

**Status: sealed / historically complete (recoverable corpus).**  
See `PRESERVATION.lock.json` and **[STEWARDSHIP.md](./STEWARDSHIP.md)** for maintainer rules.

## Principle

Full publication stewardship. Recover what can be recovered.
When material cannot be recovered, store an explicit preservation notice —
never invent content. Favor historical authenticity over modernization.

Mutating recovery commands require `--force` while the archive is sealed.

## Commands

```bash
npm run recovery:ml:gap-fill:dry       # completeness dry-run (allowed)
npm run recovery:ml:gap-fill -- --force
npm run recovery:ml:steward-polish -- --force
npm run recovery:ml:rebuild-index      # rewrite manifest from on-disk bodies
npm run recovery:ml:consistency-audit  # read-only
npm run recovery:ml:fix-mangled-links # consistency repair
npm run recovery:ml:quality-audit      # stewardship quality report
# restore-full is locked — do not re-crawl unless expanding recovery with --force
```

## Routes

- `/the-archives/metal-lifestyle` — archival catalog (museum overview)
- `/the-archives/metal-lifestyle/blog` — publication blog as preserved
- `/the-archives/metal-lifestyle/post/[slug]` — articles (**canonical**)
- `/the-archives/metal-lifestyle/page/[slug]` — static / section pages
- `/the-archives/metal-lifestyle/author/[slug]` — author bibliographies
- `/the-archives/metal-lifestyle/timeline` — chronological finding aid
- `/the-archives/metal-lifestyle/series` — recurring editorial series
- `/the-archives/metal-lifestyle/search` — metadata search
- `/the-archives/metal-lifestyle/statistics` — catalog statistics
- `/the-archives/metal-lifestyle/category/[slug]` — category archives
- `/the-archives/metal-lifestyle/context/**` — interpretive materials

Gated by `NEXT_PUBLIC_LEGACY_ARCHIVE_PUBLIC=true`.
