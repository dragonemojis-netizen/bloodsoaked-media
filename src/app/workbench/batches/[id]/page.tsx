import { notFound } from "next/navigation";
import { WorkbenchBatchDetailView } from "@/components/workbench/WorkbenchBatchDetailView";
import { getEditorialBatchDetail } from "@/lib/editorial-batches";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface BatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const batch = getEditorialBatchDetail(decodeURIComponent(id));
  return {
    title: batch ? batch.name : "Editorial Batch",
    robots: { index: false, follow: false },
  };
}

export default async function WorkbenchBatchPage({ params }: BatchPageProps) {
  const { id } = await params;
  const batch = getEditorialBatchDetail(decodeURIComponent(id));
  if (!batch) notFound();

  return <WorkbenchBatchDetailView batch={batch} />;
}
