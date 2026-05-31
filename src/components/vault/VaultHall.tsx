import Link from "next/link";
import { CoverFrame } from "@/components/ui/CoverFrame";
import { publication } from "@/config/publication";
import { resolveVaultCover } from "@/lib/vault-cover";
import type { Vault, VaultEntry } from "@/types/vault";

function formatVaultMeta(entry: VaultEntry): string {
  const parts = [entry.mediaType, String(entry.year)];
  if (entry.artist) parts.splice(1, 0, entry.artist);
  return parts.join(" · ");
}

function vaultCoverAspect(entry: VaultEntry): "poster" | "square" {
  return entry.mediaType === "Music" ? "square" : "poster";
}

function VaultDisplayCase({ entry }: { entry: VaultEntry }) {
  const href = entry.articleSlug
    ? `/articles/${entry.articleSlug}`
    : entry.mediaLogSlug
      ? `/media-log/${entry.mediaLogSlug}`
      : null;

  const coverSrc = resolveVaultCover(entry.title, entry.coverArt, entry.coverSlug);
  const status = entry.vaultStatus ?? publication.vaultPermanent;

  const inner = (
    <div className="flex flex-col gap-6">
      {coverSrc && (
        <CoverFrame
          src={coverSrc}
          alt={entry.title}
          label={entry.mediaType}
          aspect={vaultCoverAspect(entry)}
          fit="contain"
          className="mx-auto w-full max-w-[10.5rem] shrink-0 sm:max-w-[11.5rem]"
          sizes="(max-width: 768px) 168px, 184px"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-mono text-meta uppercase tracking-[0.2em] text-accent-bright">
          {status}
        </p>
        <h3 className="mt-3 font-serif text-2xl leading-snug text-foreground">
          {entry.title}
        </h3>
        <p className="mt-1.5 font-mono text-meta uppercase tracking-[0.12em] text-foreground-muted">
          {formatVaultMeta(entry)}
        </p>
        <p className="vault-curator-note mt-4 whitespace-pre-line leading-relaxed text-foreground-muted">
          {entry.note}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group vault-plaque vault-display-case vhs-card block border border-border bg-background-panel/80 p-6 md:p-8"
      >
        {inner}
        <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-accent-bright opacity-0 transition-opacity group-hover:opacity-100">
          View in catalog →
        </p>
      </Link>
    );
  }

  return (
    <div className="vault-plaque vault-display-case border border-border bg-background-panel/80 p-6 md:p-8">
      {inner}
    </div>
  );
}

function vaultIntroductionParagraphs(introduction: Vault["introduction"]): string[] {
  if (Array.isArray(introduction)) {
    return introduction.filter((p) => p.length > 0);
  }
  return introduction ? [introduction] : [];
}

export function VaultHall({ vault }: { vault: Vault }) {
  const introParagraphs = vaultIntroductionParagraphs(vault.introduction);

  return (
    <div>
      <div className="max-w-2xl space-y-4">
        {introParagraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="vault-lead leading-relaxed text-foreground-muted"
          >
            {paragraph}
          </p>
        ))}
      </div>
      {vault.rotatingNote && (
        <p className="vault-rotating-note mt-6 max-w-2xl font-mono text-meta uppercase tracking-[0.14em] text-foreground-muted/85">
          {vault.rotatingNote}
        </p>
      )}
      <ul className="mt-12 grid gap-6 md:grid-cols-2" role="list">
        {vault.entries.map((entry) => (
          <li key={entry.title}>
            <VaultDisplayCase entry={entry} />
          </li>
        ))}
      </ul>
      <p className="mt-12 font-mono text-meta uppercase tracking-[0.14em] text-foreground-muted/80">
        {publication.inTheVault} — earned through memory, replay, and return visits
      </p>
    </div>
  );
}
