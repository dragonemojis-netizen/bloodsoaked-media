import Link from "next/link";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

interface Props {
  page: number;
  totalPages: number;
  basePath?: string;
}

export function MetalLifestylePagination({
  page,
  totalPages,
  basePath = METAL_LIFESTYLE_BASE,
}: Props) {
  if (totalPages <= 1) return null;

  const older = page < totalPages ? page + 1 : null;
  const newer = page > 1 ? page - 1 : null;
  const hrefFor = (n: number) =>
    n === 1 ? basePath : `${basePath}?page=${n}`;

  return (
    <nav className="ml-blog-pager" aria-label="Blog pages">
      {newer && (
        <Link href={hrefFor(newer)} className="ml-blog-pager-newer">
          ← Newer Posts
        </Link>
      )}
      <span className="ml-blog-pager-status">
        Page {page} of {totalPages}
      </span>
      {older && (
        <Link href={hrefFor(older)} className="ml-blog-pager-older">
          Older Posts →
        </Link>
      )}
    </nav>
  );
}
