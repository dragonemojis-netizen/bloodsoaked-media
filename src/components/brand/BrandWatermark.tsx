import { site } from "@/config/site";

type WatermarkIntensity = "whisper" | "low" | "medium";

const intensityClass: Record<WatermarkIntensity, string> = {
  whisper: "brand-watermark--whisper",
  low: "brand-watermark--low",
  medium: "brand-watermark--medium",
};

interface BrandWatermarkProps {
  intensity?: WatermarkIntensity;
  className?: string;
}

/** Faded logo printed into the page — not a content image */
export function BrandWatermark({
  intensity = "low",
  className = "",
}: BrandWatermarkProps) {
  return (
    <div
      className={`brand-watermark pointer-events-none ${intensityClass[intensity]} ${className}`}
      style={{ backgroundImage: `url(${site.logo.src})` }}
      aria-hidden="true"
    />
  );
}
