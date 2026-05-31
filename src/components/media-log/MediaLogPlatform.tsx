interface MediaLogPlatformProps {
  platform: string;
  className?: string;
}

export function MediaLogPlatform({ platform, className = "" }: MediaLogPlatformProps) {
  return (
    <p
      className={`media-log-platform font-mono text-body-sm uppercase tracking-[0.12em] text-foreground ${className}`}
    >
      {platform}
    </p>
  );
}
