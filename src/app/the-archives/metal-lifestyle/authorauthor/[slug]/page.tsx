import { redirect } from "next/navigation";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { getMetalLifestyleAuthors } from "@/lib/metal-lifestyle-archive";
import { metalLifestyleStaticParams } from "@/lib/metal-lifestyle-deploy";

export const dynamicParams = false;

export function generateStaticParams() {
  return metalLifestyleStaticParams(
    getMetalLifestyleAuthors().map((author) => ({ slug: author.slug })),
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

/** Typo route lock — canonical path is /author/[slug]. */
export default async function MetalLifestyleAuthorTypoRedirect({
  params,
}: Props) {
  const { slug } = await params;
  redirect(`${METAL_LIFESTYLE_BASE}/author/${slug}`);
}
