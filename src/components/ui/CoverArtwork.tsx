import { CoverFrame } from "@/components/ui/CoverFrame";

interface CoverArtworkProps {
  src?: string;
  alt: string;
  label?: string;
  sizes: string;
  quality?: number;
  className?: string;
}

/**
 * Official release artwork — archival presentation.
 *
 * Single implementation of the Library's cover rules for both the Archive Entry
 * hero and the Library shelf card. The field is a consistent optical plane;
 * the artwork scales inside it. Cropping, stretching, and platform-specific
 * framing are never permitted.
 *
 * Preserved with the object: platform branding, ratings, publisher marks,
 * and complete cover edges.
 */
export function CoverArtwork({
  src,
  alt,
  label,
  sizes,
  quality = 90,
  className = "",
}: CoverArtworkProps) {
  return (
    <CoverFrame
      src={src}
      alt={alt}
      label={label}
      aspect="archive"
      fit="contain"
      sizes={sizes}
      quality={quality}
      className={`cover-artwork ${className}`.trim()}
    />
  );
}
