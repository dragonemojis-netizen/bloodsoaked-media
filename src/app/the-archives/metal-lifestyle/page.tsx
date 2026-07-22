import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MetalLifestyleCatalogPlacard } from "@/components/archives/metal-lifestyle/MetalLifestyleCatalogPlacard";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";
import { getMetalLifestyleCatalogStats } from "@/lib/metal-lifestyle-discovery";

export const metadata: Metadata = {
  title: "Metal Lifestyle — Archival Catalog",
  description:
    "Archival catalog for the preserved Metal Lifestyle publication (2015–2019).",
};

export default function MetalLifestyleCatalogHomePage() {
  if (!hasMetalLifestyleArchive()) {
    notFound();
  }

  const stats = getMetalLifestyleCatalogStats();
  if (!stats) notFound();

  return (
    <MetalLifestyleShell activeHref={METAL_LIFESTYLE_BASE}>
      <MetalLifestyleCatalogPlacard stats={stats} />
    </MetalLifestyleShell>
  );
}
