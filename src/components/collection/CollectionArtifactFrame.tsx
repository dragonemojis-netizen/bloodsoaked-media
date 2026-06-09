import Image from "next/image";
import type { CSSProperties } from "react";
import type { CollectionImageDimensions } from "@/lib/collection-cover";
import { isRemoteCoverUrl } from "@/lib/media-log-cover";

interface CollectionArtifactFrameProps {
  src?: string;
  alt: string;
  variant?: "exhibit" | "catalog";
  sizes?: string;
  dimensions?: CollectionImageDimensions | null;
}

function frameStyle(
  dimensions: CollectionImageDimensions | null | undefined,
): CSSProperties {
  const width = dimensions?.width ?? 4;
  const height = dimensions?.height ?? 5;

  return {
    "--artifact-w": width,
    "--artifact-h": height,
    "--artifact-ratio": `${width} / ${height}`,
  } as React.CSSProperties;
}

export function CollectionArtifactFrame({
  src,
  alt,
  variant = "exhibit",
  sizes = "(max-width: 1024px) 100vw, 620px",
  dimensions = null,
}: CollectionArtifactFrameProps) {
  const remote = src ? isRemoteCoverUrl(src) : false;
  const frameClass =
    variant === "exhibit"
      ? "collection-artifact-frame collection-artifact-frame--exhibit"
      : "collection-artifact-frame collection-artifact-frame--catalog";

  const intrinsicWidth = dimensions?.width ?? 1200;
  const intrinsicHeight = dimensions?.height ?? 1500;

  return (
    <div className={frameClass} style={frameStyle(dimensions)}>
      <div className="collection-artifact-mount">
        {variant === "exhibit" && (
          <div className="collection-display-case" aria-hidden="true" />
        )}
        <div className="collection-artifact-stage">
          {src ? (
            remote ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt}
                width={intrinsicWidth}
                height={intrinsicHeight}
                className="collection-artifact-photo"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <Image
                src={src}
                alt={alt}
                width={intrinsicWidth}
                height={intrinsicHeight}
                sizes={sizes}
                className="collection-artifact-photo"
                priority={variant === "exhibit"}
              />
            )
          ) : (
            <div className="collection-artifact-placeholder flex h-full w-full flex-col items-center justify-center gap-2 p-6">
              <span className="text-center font-serif text-sm leading-snug text-foreground-muted">
                {alt}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
