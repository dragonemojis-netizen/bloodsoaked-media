import Link from "next/link";
import { publication } from "@/config/publication";

interface VaultMarkerProps {
  variant?: "entry" | "permanent" | "preservation";
}

const labels = {
  entry: publication.vaultEntry,
  permanent: publication.vaultPermanent,
  preservation: publication.vaultPreservation,
} as const;

export function VaultMarker({ variant = "entry" }: VaultMarkerProps) {
  return (
    <Link
      href="/vault"
      className="vault-marker group inline-flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.28em] text-foreground-muted/80 transition-colors hover:text-accent-bright"
    >
      <span
        className="h-px w-6 bg-accent/50 transition-all group-hover:w-8 group-hover:bg-accent-bright"
        aria-hidden="true"
      />
      {labels[variant]}
    </Link>
  );
}
