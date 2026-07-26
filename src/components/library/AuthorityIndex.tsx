import Link from "next/link";
import { authorityVoice } from "@/config/authority-voice";
import type { AuthorityEntry } from "@/types/authority";

interface AuthorityIndexProps {
  entries: AuthorityEntry[];
}

/**
 * Authority File — quiet index of controlled identities.
 * Reference cards in a ledger, not a directory of profiles.
 */
export function AuthorityIndex({ entries }: AuthorityIndexProps) {
  if (entries.length === 0) {
    return (
      <p className="authority-index-empty border border-border/70 bg-background-panel/50 px-8 py-10 font-serif text-base italic leading-relaxed text-foreground-muted">
        {authorityVoice.indexEmpty}
      </p>
    );
  }

  return (
    <ul className="authority-index-list">
      {entries.map((entry) => (
        <li key={entry.slug} className="authority-index-row">
          <Link href={entry.href} className="authority-index-link">
            <span className="authority-index-id">{entry.authorityId}</span>
            <span className="authority-index-name">{entry.preferredName}</span>
            <span className="authority-index-type">{entry.typeLabel}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
