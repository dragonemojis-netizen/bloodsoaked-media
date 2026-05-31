interface CatalogMarkProps {
  children: React.ReactNode;
  className?: string;
}

/** Archive / inventory markings — ghosted catalog typography */
export function CatalogMark({ children, className = "" }: CatalogMarkProps) {
  return (
    <span
      className={`catalog-mark font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted/50 ${className}`}
    >
      {children}
    </span>
  );
}
