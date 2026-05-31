import Link from "next/link";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { IssueMark } from "./IssueMark";
import { MediaArtifact } from "./MediaArtifact";
import { site } from "@/config/site";

interface PublicationMastheadProps {
  compact?: boolean;
}

export function PublicationMasthead({ compact = false }: PublicationMastheadProps) {
  return (
    <div className={compact ? "masthead-block masthead-block--compact" : "masthead-block"}>
      <Link href="/" className="masthead-logo-link group inline-block">
        <SiteLogo variant="masthead" priority />
        <span className="sr-only">{site.name}</span>
      </Link>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <IssueMark />
          <MediaArtifact label="Cult Media" variant="accent" />
          <MediaArtifact label="VHS" variant="vhs" />
        </div>
      )}

      <p className="masthead-descriptor mt-2 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-accent-bright/90">
        {site.descriptor}
      </p>
      <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-foreground-muted">
        {site.curatorLine}
      </p>
    </div>
  );
}
