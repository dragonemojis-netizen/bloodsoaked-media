import Link from "next/link";
import type { MetalLifestyleRecord } from "@/lib/metal-lifestyle-archive";
import {
  slugifyMetalLifestyleAuthor,
  slugifyMetalLifestyleCategory,
} from "@/lib/metal-lifestyle-archive";
import { formatMetalLifestyleDate } from "@/lib/metal-lifestyle";
import { MetalLifestyleArchivalDetails } from "@/components/archives/metal-lifestyle/MetalLifestyleArchivalDetails";
import { MetalLifestyleSeriesMembership } from "@/components/archives/metal-lifestyle/MetalLifestyleSeriesMembership";
import { getSeriesMembership } from "@/lib/metal-lifestyle-discovery";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

interface Props {
  record: MetalLifestyleRecord;
  showMeta?: boolean;
}

export function MetalLifestyleArchiveBody({
  record,
  showMeta = true,
}: Props) {
  const date = record.publicationDate
    ? formatMetalLifestyleDate(record.publicationDate)
    : record.dateRaw;
  const kind = record.kind === "page" ? "page" : "post";
  const membership = getSeriesMembership(record.slug, kind);

  return (
    <article className="ml-blog-post ml-blog-post--full">
      {showMeta && (
        <>
          <div className="ml-blog-header">
            <h2 className="ml-blog-title">{record.title}</h2>
            {date && (
              <p className="ml-blog-date">
                <span>{date}</span>
              </p>
            )}
            {record.kind === "post" && (
              <p className="ml-blog-comments">
                <span>0 Comments</span>
              </p>
            )}
            {record.author && (
              <p className="ml-blog-author">
                <Link
                  href={`${METAL_LIFESTYLE_BASE}/author/${slugifyMetalLifestyleAuthor(record.author)}`}
                >
                  {record.author}
                </Link>
              </p>
            )}
            {record.category && (
              <p className="ml-blog-category">
                <Link
                  href={`${METAL_LIFESTYLE_BASE}/category/${slugifyMetalLifestyleCategory(record.category)}`}
                >
                  {record.category}
                </Link>
              </p>
            )}
          </div>
          <div className="ml-blog-separator" aria-hidden="true" />
        </>
      )}
      <div
        className="ml-blog-content"
        dangerouslySetInnerHTML={{ __html: record.contentHtml }}
      />
      {membership && <MetalLifestyleSeriesMembership membership={membership} />}
      <MetalLifestyleArchivalDetails
        preservation={record.preservation}
        originalUrl={record.originalUrl}
      />
    </article>
  );
}
