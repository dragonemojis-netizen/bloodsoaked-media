import Link from "next/link";
import { DISCOVERY_LINKS } from "@/lib/metal-lifestyle-discovery";
import { CONTEXT_LINKS } from "@/config/metal-lifestyle-context";
import type { MetalLifestyleCatalogStats } from "@/lib/metal-lifestyle-discovery";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

interface Props {
  stats: MetalLifestyleCatalogStats;
}

/** Museum catalog placard — discovery layer, not part of the original site. */
export function MetalLifestyleCatalogPlacard({ stats }: Props) {
  return (
    <section className="ml-finding-aid" aria-label="Archival catalog">
      <p className="ml-finding-aid-eyebrow">Archival Catalog</p>
      <h1 className="ml-finding-aid-title">Metal Lifestyle</h1>
      <p className="ml-finding-aid-subtitle">
        Preserved independent publication · {stats.publicationYears}
      </p>
      <p className="ml-finding-aid-history">{stats.briefHistory}</p>

      <dl className="ml-catalog-grid">
        <div>
          <dt>Publication years</dt>
          <dd>{stats.publicationYears}</dd>
        </div>
        <div>
          <dt>Restored articles</dt>
          <dd>
            {stats.articlesRestored}
            <span className="ml-catalog-muted"> / {stats.articlesTotal}</span>
          </dd>
        </div>
        <div>
          <dt>Restored pages</dt>
          <dd>
            {stats.pagesRestored}
            <span className="ml-catalog-muted"> / {stats.pagesTotal}</span>
          </dd>
        </div>
        <div>
          <dt>Preserved media</dt>
          <dd>{stats.mediaAssets}</dd>
        </div>
        <div>
          <dt>Completeness</dt>
          <dd>{stats.restorationPercent}%</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{stats.restorationStatus}</dd>
        </div>
        <div>
          <dt>Last preservation pass</dt>
          <dd>{stats.lastPreservationPass ?? "—"}</dd>
        </div>
        <div>
          <dt>Recorded bylines</dt>
          <dd>{stats.authors}</dd>
        </div>
      </dl>

      <p className="ml-finding-group-label">Finding aids</p>
      <nav className="ml-finding-nav" aria-label="Finding aids">
        {DISCOVERY_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <p className="ml-finding-group-label">Archival context</p>
      <nav className="ml-finding-nav" aria-label="Archival context">
        {CONTEXT_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <p className="ml-finding-enter">
        <Link href={`${METAL_LIFESTYLE_BASE}/blog`}>
          Enter the publication as preserved →
        </Link>
      </p>
    </section>
  );
}
