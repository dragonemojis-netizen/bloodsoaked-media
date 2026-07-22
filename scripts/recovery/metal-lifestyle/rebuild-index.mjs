/**
 * Rebuild manifest.json from on-disk posts/pages (authoritative bodies).
 * Consistency repair — does not fetch or alter article HTML.
 *
 * Usage: npm run recovery:ml:rebuild-index
 */
import { rebuildManifestFromDisk } from "./lib/rebuild-manifest-from-disk.mjs";

const manifest = rebuildManifestFromDisk();
console.log(
  JSON.stringify(
    {
      posts: manifest.posts.length,
      pages: manifest.pages.length,
      ...manifest.summary,
    },
    null,
    2,
  ),
);
