import Link from "next/link";

interface SectionBreadcrumbProps {
  items: { label: string; href?: string }[];
  className?: string;
}

export function SectionBreadcrumb({ items, className = "" }: SectionBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`font-mono text-[0.6rem] uppercase tracking-[0.15em] text-foreground-muted ${className}`}
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 && <span className="mx-2 text-border">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-accent-bright"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
