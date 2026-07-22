import Link from "next/link";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { DISCOVERY_LINKS } from "@/lib/metal-lifestyle-discovery";
import { CONTEXT_LINKS } from "@/config/metal-lifestyle-context";

/** Understated archival context — visually separate from the original publication. */
export function MetalLifestylePreservationBanner() {
  return (
    <aside className="ml-preservation-banner" role="note">
      <p className="ml-preservation-banner__label">Archived Publication</p>
      <p className="ml-preservation-banner__meta">
        Originally published between 2015 and 2019.
      </p>
      <p className="ml-preservation-banner__copy">
        This publication is preserved by{" "}
        <Link href="/">Bloodsoaked Media</Link> as a historical archive and is
        no longer actively maintained.{" "}
        <Link href="/the-archives">Return to The Archives</Link>
        {" · "}
        <Link href={METAL_LIFESTYLE_BASE}>Catalog</Link>
        {" · "}
        <Link href={`${METAL_LIFESTYLE_BASE}/blog`}>Publication</Link>
      </p>
      <nav className="ml-banner-finding-aids" aria-label="Finding aids">
        {DISCOVERY_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <nav className="ml-banner-finding-aids" aria-label="Archival context">
        {CONTEXT_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
