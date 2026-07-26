import type { LibraryCatalogInformation, LibraryEntry } from "@/types/library";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import { formatLibraryFiledDate } from "@/lib/library";

export interface LibraryMetadataItem {
  label: string;
  value: string;
}

/** Accepts shelf cards or accession entries — platform may be flat or nested. */
type LibraryMetadataSource = Pick<
  LibraryEntry,
  "mediaTypeLabel" | "statusLabel" | "year" | "filedAt" | "shelfMark" | "subjects"
> & {
  platform?: string;
  publisher?: string;
  developer?: string;
  catalog?: Pick<
    LibraryCatalogInformation,
    "platform" | "publisher" | "developer"
  >;
};

interface LibraryMetadataProps {
  /** Prefer passing a shelf card or entry; items are derived automatically. */
  entry?: LibraryMetadataSource;
  /** Override or supplement derived fields. */
  items?: LibraryMetadataItem[];
  eyebrow?: string;
  className?: string;
  /** compact = inline stamps; card = filing-card panel */
  variant?: "card" | "inline";
}

function deriveItems(
  entry: NonNullable<LibraryMetadataProps["entry"]>,
): LibraryMetadataItem[] {
  const platform = entry.platform ?? entry.catalog?.platform;
  const publisher = entry.publisher ?? entry.catalog?.publisher;
  const developer = entry.developer ?? entry.catalog?.developer;

  const items: LibraryMetadataItem[] = [
    { label: libraryFields.medium, value: entry.mediaTypeLabel },
    { label: libraryFields.archivalStatus, value: entry.statusLabel },
  ];

  if (entry.year != null) {
    items.push({ label: libraryFields.year, value: String(entry.year) });
  }
  if (platform) {
    items.push({ label: libraryFields.platform, value: platform });
  }
  if (publisher) {
    items.push({
      label: libraryFields.publisher,
      value: publisher,
    });
  }
  if (developer) {
    items.push({
      label: libraryFields.developer,
      value: developer,
    });
  }

  items.push({
    label: libraryFields.filed,
    value: formatLibraryFiledDate(entry.filedAt),
  });
  items.push({
    label: libraryFields.shelfMark,
    value: entry.shelfMark,
  });

  return items;
}

/**
 * Catalog Information — compact filing stamps for shelf cards.
 * Full accession panels live on the Archive Entry template.
 */
export function LibraryMetadata({
  entry,
  items,
  eyebrow = libraryVoice.record.filingCardEyebrow,
  className = "",
  variant = "card",
}: LibraryMetadataProps) {
  const resolved = items ?? (entry ? deriveItems(entry) : []);
  if (resolved.length === 0) return null;

  if (variant === "inline") {
    return (
      <p
        className={`library-metadata-inline font-mono text-[0.55rem] uppercase tracking-[0.14em] text-foreground-muted/75 ${className}`}
      >
        {resolved.map((item, index) => (
          <span key={`${item.label}-${item.value}`}>
            {index > 0 && (
              <span aria-hidden="true" className="mx-1.5 text-foreground-muted/40">
                ·
              </span>
            )}
            <span className="text-foreground-muted/55">{item.label}</span>{" "}
            <span className="text-foreground-muted">{item.value}</span>
          </span>
        ))}
      </p>
    );
  }

  return (
    <aside
      className={`library-metadata library-metadata-card border border-border-subtle bg-background/40 ${className}`}
      aria-label={eyebrow}
    >
      <p className="font-mono text-[0.52rem] uppercase tracking-[0.22em] text-foreground-muted/70">
        {eyebrow}
      </p>
      <dl className="mt-4 space-y-3">
        {resolved.map((item) => (
          <div
            key={`${item.label}-${item.value}`}
            className="grid grid-cols-[minmax(0,7rem)_1fr] gap-3 border-b border-border-subtle/60 pb-3 last:border-0 last:pb-0"
          >
            <dt className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-foreground-muted/55">
              {item.label}
            </dt>
            <dd className="font-serif text-sm leading-snug text-foreground/90">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      {entry?.subjects && entry.subjects.length > 0 && (
        <ul
          className="mt-5 flex flex-wrap gap-2"
          aria-label={libraryFields.subjects}
        >
          {entry.subjects.map((subject) => (
            <li
              key={subject}
              className="border border-border px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-foreground-muted"
            >
              {subject}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
