import { NotFoundBody } from "@/components/layout/NotFoundBody";

/**
 * Immersive Metal Lifestyle 404 — no Bloodsoaked publication chrome
 * (matches former PageShell immersive skip for this path).
 */
export default function MetalLifestyleNotFound() {
  return (
    <NotFoundBody
      homeHref="/the-archives/metal-lifestyle"
      homeLabel="Return to archive"
    />
  );
}
