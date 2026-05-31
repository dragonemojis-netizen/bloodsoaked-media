interface MediaLogTagsProps {
  tags: string[];
  className?: string;
}

export function MediaLogTags({ tags, className = "" }: MediaLogTagsProps) {
  if (tags.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} role="list" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>
          <span className="media-log-entry-tag">{tag}</span>
        </li>
      ))}
    </ul>
  );
}
