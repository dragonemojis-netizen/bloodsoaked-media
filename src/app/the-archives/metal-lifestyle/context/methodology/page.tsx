import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { ML_CONTEXT_BASE } from "@/config/metal-lifestyle-context";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";

export const metadata: Metadata = {
  title: "Preservation Methodology",
  description:
    "Conservation notes describing how Metal Lifestyle was recovered and stewarded.",
};

export default function MetalLifestyleMethodologyPage() {
  if (!hasMetalLifestyleArchive()) notFound();

  return (
    <MetalLifestyleShell activeHref={`${ML_CONTEXT_BASE}/methodology`}>
      <MetalLifestyleContextHeader title="Preservation Methodology">
        <p className="ml-tax-bio">
          Conservation notes for this digital special collection. Describes
          process — not editorial judgment of historical writing.
        </p>
      </MetalLifestyleContextHeader>

      <article className="ml-context-prose">
        <section>
          <h2>Recovery source</h2>
          <p>
            Primary recovery targeted the live Weebly host
            (metallifestyle.weebly.com), guided by a prior URL discovery audit
            that enumerated blog permalinks, legacy post paths, sitemaps, and
            internal links. Pages were fetched with an archival user agent and
            stored as raw HTML snapshots alongside structured records.
          </p>
        </section>
        <section>
          <h2>Articles and pages</h2>
          <p>
            Blog posts were stored with title, original URL, publication date
            when present in the source markup, extracted body HTML, and media
            references. Static hubs and nested section pages were stored the
            same way. Bodies keep original HTML structure for fidelity of
            headings, lists, embeds, and review formatting.
          </p>
        </section>
        <section>
          <h2>Duplicates</h2>
          <p>
            Weebly exposed both pretty permalinks (/metal-lifestyle/…) and
            legacy dated paths (/1/post/YYYY/MM/…). Pretty permalinks were
            preferred. Dated legacy duplicates that mirrored an existing pretty
            restoration were removed during stewardship so each piece appears
            once.
          </p>
        </section>
        <section>
          <h2>Unavailable material</h2>
          <p>
            When a URL returned an error or an empty body, the record was kept
            with a preservation notice stating that the page is known to have
            existed but could not yet be fully recovered. Historical material is
            never fabricated to fill gaps.
          </p>
        </section>
        <section>
          <h2>Media preservation</h2>
          <p>
            Linked images hosted on the original Weebly uploads path were copied
            into local archival storage when reachable. Missing images are
            replaced with layout-preserving placeholders that cite the original
            asset URL. Embeds such as YouTube players remain as external
            references.
          </p>
        </section>
        <section>
          <h2>Non-editorial chrome</h2>
          <p>
            Defunct AdSense and related advertising scripts were stripped during
            stewardship because they are non-functional commercial chrome, not
            editorial content. Article wording, bylines, and dates were not
            rewritten.
          </p>
        </section>
        <section>
          <h2>Archival metadata</h2>
          <p>
            Each restored record stores original URL, recovery source, recovery
            date, preservation status, missing asset list, and polish date.
            Metadata is exposed in a collapsed archival details panel on reading
            pages and powers finding aids (timeline, search, series, statistics).
          </p>
        </section>
        <section>
          <h2>Restoration principles</h2>
          <p>
            Preserve over redesign. Document gaps rather than inventing content.
            Keep interpretive and curatorial material outside the publication
            reading room. Maintain exact author bylines without merging
            identities. Prefer historical metadata over generated
            recommendations.
          </p>
        </section>
      </article>
    </MetalLifestyleShell>
  );
}
