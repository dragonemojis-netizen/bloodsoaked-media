import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";
import { getMetalLifestyleTimeline } from "@/lib/metal-lifestyle-discovery";
import { formatMetalLifestyleDate } from "@/lib/metal-lifestyle";

export const metadata: Metadata = {
  title: "Publication Timeline",
  description:
    "Chronological finding aid for the Metal Lifestyle publication archive.",
};

export default function MetalLifestyleTimelinePage() {
  if (!hasMetalLifestyleArchive()) notFound();
  const years = getMetalLifestyleTimeline();

  return (
    <MetalLifestyleShell activeHref={`${METAL_LIFESTYLE_BASE}/timeline`}>
      <header className="ml-tax-header">
        <p className="ml-tax-eyebrow">Finding Aid</p>
        <h1 className="ml-tax-title">Publication Timeline</h1>
        <p className="ml-tax-bio">
          Articles arranged by historical publication date. Periods without
          recovered dated material are omitted — dates are never invented.
        </p>
        <p>
          <Link href={METAL_LIFESTYLE_BASE}>← Catalog</Link>
        </p>
      </header>

      <div className="ml-timeline">
        {years.map((year) => (
          <section key={year.year} className="ml-timeline-year">
            <h2>{year.year}</h2>
            <p className="ml-timeline-count">
              {year.articleCount} article{year.articleCount === 1 ? "" : "s"}
            </p>
            {year.months.map((month) => (
              <div key={month.key} className="ml-timeline-month">
                <h3>
                  {month.label} {month.year}
                </h3>
                <ul>
                  {month.posts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`${METAL_LIFESTYLE_BASE}/post/${post.slug}`}
                      >
                        {post.title}
                      </Link>
                      <span className="ml-timeline-meta">
                        {post.publicationDate
                          ? formatMetalLifestyleDate(post.publicationDate)
                          : ""}
                        {post.author ? ` · ${post.author}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </MetalLifestyleShell>
  );
}
