interface PublicationStampProps {
  label?: string;
  sublabel?: string;
  detail?: string;
  className?: string;
}

export function PublicationStamp({
  label = "Bloodsoaked",
  sublabel = "Media",
  detail,
  className = "",
}: PublicationStampProps) {
  return (
    <div
      className={`publication-stamp publication-stamp--horror inline-flex flex-col items-center justify-center px-4 py-3 text-center ${className}`}
      aria-hidden="true"
    >
      <span className="font-mono text-[0.48rem] uppercase tracking-[0.4em] text-accent-bright">
        ★ {label} ★
      </span>
      <span className="mt-1 font-serif text-sm uppercase tracking-[0.18em] text-foreground">
        {sublabel}
      </span>
      {detail && (
        <span className="mt-1 font-mono text-[0.48rem] uppercase tracking-[0.2em] text-foreground-muted/80">
          {detail}
        </span>
      )}
    </div>
  );
}
