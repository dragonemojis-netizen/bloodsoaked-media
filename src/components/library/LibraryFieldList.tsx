export interface LibraryFieldSegment {
  text: string;
  href?: string;
}

export interface LibraryFieldRow {
  label: string;
  value: string;
  /** Optional external or internal reference — quiet link, not a button. */
  href?: string;
  /** Multiple linked names in one field (e.g. dual publishers). */
  segments?: LibraryFieldSegment[];
}

interface LibraryFieldListProps {
  rows: LibraryFieldRow[];
  className?: string;
}

/**
 * Museum label list — hairline rows, no nested cards.
 * Renders nothing when every value is empty.
 */
export function LibraryFieldList({
  rows,
  className = "",
}: LibraryFieldListProps) {
  const visible = rows.filter((row) => row.value.trim().length > 0);
  if (visible.length === 0) return null;

  return (
    <dl className={`library-field-list ${className}`}>
      {visible.map((row) => (
        <div key={`${row.label}-${row.value}`} className="library-field-row">
          <dt className="library-field-label">{row.label}</dt>
          <dd className="library-field-value">
            <FieldValue row={row} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function FieldValue({ row }: { row: LibraryFieldRow }) {
  if (row.segments && row.segments.length > 0) {
    return (
      <>
        {row.segments.map((segment, index) => (
          <span key={`${segment.text}-${index}`}>
            {index > 0 ? (
              <span className="library-field-segment-sep"> · </span>
            ) : null}
            {segment.href ? (
              <a
                href={segment.href}
                className="library-field-link"
                rel="noopener noreferrer"
                target={segment.href.startsWith("http") ? "_blank" : undefined}
              >
                {segment.text}
              </a>
            ) : (
              segment.text
            )}
          </span>
        ))}
      </>
    );
  }

  if (row.href) {
    return (
      <a
        href={row.href}
        className="library-field-link"
        rel="noopener noreferrer"
        target={row.href.startsWith("http") ? "_blank" : undefined}
      >
        {row.value}
      </a>
    );
  }

  return <>{row.value}</>;
}
