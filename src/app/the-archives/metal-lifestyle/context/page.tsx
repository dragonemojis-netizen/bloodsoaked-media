import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleContextHeader } from "@/components/archives/metal-lifestyle/MetalLifestyleContextHeader";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  CONTEXT_LINKS,
  ML_CONTEXT_BASE,
} from "@/config/metal-lifestyle-context";
import { hasMetalLifestyleArchive } from "@/lib/metal-lifestyle-archive";

export const metadata: Metadata = {
  title: "Archival Context",
  description:
    "Museum-style interpretive materials surrounding the preserved Metal Lifestyle publication.",
};

export default function MetalLifestyleContextIndexPage() {
  if (!hasMetalLifestyleArchive()) notFound();

  return (
    <MetalLifestyleShell activeHref={ML_CONTEXT_BASE}>
      <MetalLifestyleContextHeader title="Archival Context">
        <p className="ml-tax-bio">
          Interpretive materials prepared for researchers and visitors. They
          document what Metal Lifestyle was, how this archive was assembled, and
          how to approach special collections — without rewriting or annotating
          historical pages.
        </p>
      </MetalLifestyleContextHeader>

      <ul className="ml-series-list">
        {CONTEXT_LINKS.filter((l) => l.href !== ML_CONTEXT_BASE).map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </MetalLifestyleShell>
  );
}
