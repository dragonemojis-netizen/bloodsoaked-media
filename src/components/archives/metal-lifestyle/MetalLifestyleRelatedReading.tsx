import Link from "next/link";
import type { RelatedReadingItem } from "@/lib/metal-lifestyle-discovery";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { formatMetalLifestyleDate } from "@/lib/metal-lifestyle";

interface Props {
  items: RelatedReadingItem[];
}

export function MetalLifestyleRelatedReading({ items }: Props) {
  if (!items.length) return null;

  return (
    <aside className="ml-related" aria-label="Related reading">
      <h3 className="ml-related-title">Related in the archive</h3>
      <p className="ml-related-note">
        Suggested from publication metadata — same author, category, period, or
        series.
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`${METAL_LIFESTYLE_BASE}/post/${item.slug}`}>
              {item.title}
            </Link>
            <span className="ml-related-meta">
              {item.reason}
              {item.publicationDate
                ? ` · ${formatMetalLifestyleDate(item.publicationDate)}`
                : ""}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
