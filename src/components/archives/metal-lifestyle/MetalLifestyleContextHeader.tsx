import Link from "next/link";
import { CONTEXT_LINKS, ML_CONTEXT_BASE } from "@/config/metal-lifestyle-context";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

interface Props {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}

/** Shared header for interpretive pages outside the publication. */
export function MetalLifestyleContextHeader({
  title,
  eyebrow = "Archival Context",
  children,
}: Props) {
  return (
    <header className="ml-tax-header ml-context-header">
      <p className="ml-tax-eyebrow">{eyebrow}</p>
      <h1 className="ml-tax-title">{title}</h1>
      {children}
      <nav className="ml-context-nav" aria-label="Contextual materials">
        {CONTEXT_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="ml-context-boundary">
        These pages surround the publication. They do not alter historical
        articles.{" "}
        <Link href={`${METAL_LIFESTYLE_BASE}/blog`}>Enter the publication</Link>
        {" · "}
        <Link href={METAL_LIFESTYLE_BASE}>Catalog</Link>
        {" · "}
        <Link href={ML_CONTEXT_BASE}>Context home</Link>
      </p>
    </header>
  );
}
