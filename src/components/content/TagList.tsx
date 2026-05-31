import Link from "next/link";

interface TagListProps {
  tags: string[];
  limit?: number;
}

export function TagList({ tags, limit }: TagListProps) {
  const visible = limit ? tags.slice(0, limit) : tags;

  if (visible.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Tags">
      {visible.map((tag) => (
        <li key={tag}>
          <Link
            href={`/search?q=${encodeURIComponent(tag)}`}
            className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-foreground-muted transition-colors hover:text-accent-bright"
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
