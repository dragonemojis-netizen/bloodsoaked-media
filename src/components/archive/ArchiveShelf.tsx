import Link from "next/link";
import { ShelfSpine } from "./ShelfSpine";
import { publication } from "@/config/publication";
import type { PostMeta } from "@/types/content";

interface ArchiveShelfProps {
  title: string;
  description?: string;
  posts: PostMeta[];
  breadcrumbs: { label: string; href?: string }[];
}

export function ArchiveShelf({
  title,
  description,
  posts,
  breadcrumbs,
}: ArchiveShelfProps) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-foreground-muted"
      >
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.label}>
            {i > 0 && <span className="mx-2 text-border">/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-accent-bright"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <header className="mb-10 border-b border-border-subtle pb-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-accent-bright">
          {publication.browseTheShelf}
        </p>
        <h1 className="mt-2 font-serif text-4xl text-foreground">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-foreground-muted leading-relaxed">
            {description}
          </p>
        )}
        <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-foreground-muted">
          {posts.length} {posts.length === 1 ? "entry" : "entries"} on this shelf
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="py-12 text-center text-foreground-muted">
          {publication.emptyShelf}
        </p>
      ) : (
        <ul className="space-y-3" role="list">
          {posts.map((post) => (
            <ShelfSpine key={post.slug} post={post} />
          ))}
        </ul>
      )}

      <p className="mt-12 text-center">
        <Link
          href="/archive"
          className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-accent-bright transition-colors hover:text-foreground"
        >
          ← {publication.catalog}
        </Link>
      </p>
    </div>
  );
}
