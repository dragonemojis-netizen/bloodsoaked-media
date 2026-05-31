interface PublicationEmptyNoticeProps {
  message: string;
  className?: string;
}

export function PublicationEmptyNotice({
  message,
  className = "",
}: PublicationEmptyNoticeProps) {
  return (
    <p
      className={`border border-border-subtle bg-background-panel/30 px-6 py-10 text-center font-serif text-lg leading-relaxed text-foreground-muted ${className}`.trim()}
    >
      {message}
    </p>
  );
}
