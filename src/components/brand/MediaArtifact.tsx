interface MediaArtifactProps {
  label: string;
  variant?: "default" | "accent" | "vhs";
  className?: string;
}

const variantClass = {
  default: "border-border text-foreground-muted",
  accent: "border-accent/40 bg-accent/10 text-accent-bright",
  vhs: "border-accent/30 bg-background-panel text-foreground-muted",
};

export function MediaArtifact({
  label,
  variant = "default",
  className = "",
}: MediaArtifactProps) {
  return (
    <span
      className={`media-artifact inline-block border px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.2em] ${variantClass[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
