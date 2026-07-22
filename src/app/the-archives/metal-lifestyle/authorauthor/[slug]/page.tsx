import { redirect } from "next/navigation";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

/** Typo route lock — canonical path is /author/[slug]. */
export default async function MetalLifestyleAuthorTypoRedirect({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const page = (await searchParams).page;
  const qs = page ? `?page=${encodeURIComponent(page)}` : "";
  redirect(`${METAL_LIFESTYLE_BASE}/author/${slug}${qs}`);
}
