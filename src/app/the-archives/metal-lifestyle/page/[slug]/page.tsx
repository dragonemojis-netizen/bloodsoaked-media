import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MetalLifestyleArchiveBody } from "@/components/archives/metal-lifestyle/MetalLifestyleArchiveBody";
import { MetalLifestyleShell } from "@/components/archives/metal-lifestyle/MetalLifestyleShell";
import {
  METAL_LIFESTYLE_BASE,
  METAL_LIFESTYLE_ORIGIN,
  metalLifestyleNav,
} from "@/config/metal-lifestyle";
import {
  getMetalLifestylePage,
  listMetalLifestylePageSlugs,
} from "@/lib/metal-lifestyle-archive";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return listMetalLifestylePageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getMetalLifestylePage(slug);
  if (!page) return { title: "Metal Lifestyle" };
  return { title: page.title };
}

export default async function MetalLifestyleRestoredPage({ params }: Props) {
  const { slug } = await params;
  const page = getMetalLifestylePage(slug);

  const navItem = metalLifestyleNav.find((item) => item.hub === slug);
  const activeHref = navItem?.href ?? `${METAL_LIFESTYLE_BASE}/page/${slug}`;
  const originalPath =
    navItem && "originalPath" in navItem ? navItem.originalPath : undefined;

  if (!page) {
    // Page not yet restored — preserve structure with clear notice
    return (
      <MetalLifestyleShell activeHref={activeHref}>
        <div className="ml-section-notice">
          <h1>{navItem?.label ?? slug}</h1>
          <p>
            <strong>Preservation notice:</strong> This page has not been
            recovered yet, or is unavailable from the original publication host.
          </p>
          {originalPath && (
            <p>
              <a
                href={`${METAL_LIFESTYLE_ORIGIN}${originalPath}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Attempt original URL on metallifestyle.weebly.com
              </a>
            </p>
          )}
          <p>
            <Link href={METAL_LIFESTYLE_BASE}>← Back to Metal Lifestyle</Link>
          </p>
        </div>
      </MetalLifestyleShell>
    );
  }

  return (
    <MetalLifestyleShell activeHref={activeHref}>
      <MetalLifestyleArchiveBody
        record={page}
        showMeta={page.pageType === "blog"}
      />
    </MetalLifestyleShell>
  );
}
