import Link from "next/link";
import {
  seriesEntryHref,
  type SeriesMembership,
} from "@/lib/metal-lifestyle-discovery";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { formatMetalLifestyleDate } from "@/lib/metal-lifestyle";

interface Props {
  membership: SeriesMembership;
}

/**
 * Stewardship chrome — outside historical content.
 * Identifies recurring editorial series membership for discoverability.
 */
export function MetalLifestyleSeriesMembership({ membership }: Props) {
  const { series, nearby, position, total } = membership;

  return (
    <aside className="ml-series-membership" aria-label="Part of this series">
      <p className="ml-series-membership-eyebrow">Part of this Series</p>
      <h3 className="ml-series-membership-title">
        <Link href={`${METAL_LIFESTYLE_BASE}/series/${series.slug}`}>
          {series.title}
        </Link>
      </h3>
      <p className="ml-series-membership-note">
        A recurring editorial feature in the Metal Lifestyle publication. This
        piece is preserved as part of that series ({position} of {total} in
        chronological order).
      </p>
      <p className="ml-series-membership-link">
        <Link href={`${METAL_LIFESTYLE_BASE}/series/${series.slug}`}>
          Browse the full series →
        </Link>
      </p>
      {nearby.length > 0 && (
        <div className="ml-series-membership-nearby">
          <p className="ml-series-membership-nearby-label">Nearby in series</p>
          <ul>
            {nearby.map((entry) => (
              <li key={`${entry.kind}-${entry.slug}`}>
                <Link href={seriesEntryHref(entry)}>{entry.title}</Link>
                {entry.publicationDate ? (
                  <span className="ml-series-membership-date">
                    {formatMetalLifestyleDate(entry.publicationDate)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
