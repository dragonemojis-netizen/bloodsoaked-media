import Image from "next/image";
import { isRemoteCoverUrl } from "@/lib/media-log-cover";

interface CoverFrameProps {
  src?: string;
  alt: string;
  label?: string;
  aspect?: "archive" | "poster" | "square" | "wide";
  /** cover fills frame (cropped); contain shows full art with letterboxing */
  fit?: "cover" | "contain";
  className?: string;
  sizes?: string;
  quality?: number;
}

const aspectClasses = {
  /**
   * Neutral optical field for complete release artwork (used via CoverArtwork).
   * At 4:5, narrow cases use the field's height while wider cases use its
   * width — comparable presence without cropping or manual offsets.
   */
  archive: "aspect-[4/5]",
  poster: "aspect-[2/3]",
  square: "aspect-square",
  wide: "aspect-video",
};

export function CoverFrame({
  src,
  alt,
  label,
  aspect = "poster",
  fit = "cover",
  className = "",
  sizes = "(max-width: 768px) 120px, 160px",
  quality,
}: CoverFrameProps) {
  const remote = src ? isRemoteCoverUrl(src) : false;
  const objectClass = fit === "contain" ? "object-contain" : "object-cover";

  return (
    <div
      className={`relative overflow-hidden border border-border bg-background-panel ${aspectClasses[aspect]} ${className}`}
    >
      {src ? (
        remote ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className={`absolute inset-0 h-full w-full ${objectClass} vhs-hover-image`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            quality={quality}
            className={`${objectClass} vhs-hover-image`}
          />
        )
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-background-elevated to-background-panel p-3">
          {label && (
            <span className="font-mono text-meta-sm uppercase tracking-[0.2em] text-accent-bright">
              {label}
            </span>
          )}
          <span className="text-center font-serif text-xs leading-snug text-foreground-muted">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
}
