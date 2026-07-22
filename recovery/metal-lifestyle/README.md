# Metal Lifestyle Archive Recovery

Preservation pipeline for the complete Metal Lifestyle publication from
[metallifestyle.weebly.com](https://metallifestyle.weebly.com).

**The recoverable publication is sealed.** See
`content/archives/metal-lifestyle/PRESERVATION.lock.json` and
`content/archives/metal-lifestyle/STEWARDSHIP.md`.

Mutating scripts require `--force` while sealed.

## Gap-fill (preferred for new evidence)

```bash
npm run recovery:ml:gap-fill:dry
npm run recovery:ml:gap-fill -- --force
```

## Full restore (locked — expanding recovery only)

```bash
npm run recovery:ml:audit
npm run recovery:ml:restore-full -- --force
```

## Polish / audits

```bash
npm run recovery:ml:steward-polish -- --force
npm run recovery:ml:consistency-audit
npm run recovery:ml:fix-mangled-links
npm run recovery:ml:quality-audit
```

## Legacy Dakota-only pipeline (separate store)

```bash
npm run recovery:ml:crawl
npm run recovery:ml:import:dry
npm run recovery:ml:import
```

These write `content/legacy/` — **not** the sealed publication archive.
