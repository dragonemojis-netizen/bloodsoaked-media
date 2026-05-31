import Link from "next/link";

export interface ExploreLink {
  href: string;
  label: string;
}

interface SectionExploreProps {
  links: ExploreLink[];
  className?: string;
}

/** Secondary destinations within a section — not primary navigation. */
export function SectionExplore({ links, className = "" }: SectionExploreProps) {
  if (links.length === 0) return null;

  return (
    <nav
      aria-label="Explore within this section"
      className={`flex flex-wrap gap-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] ${className}`}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="border border-border px-3 py-1.5 text-foreground-muted transition-colors hover:border-accent/50 hover:text-accent-bright vhs-button"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
