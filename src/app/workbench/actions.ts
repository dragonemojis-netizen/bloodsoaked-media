"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import {
  addAccessionsToBatch,
  createEditorialBatch,
  publishEditorialBatch,
  removeAccessionsFromBatch,
  renameEditorialBatch,
  updateEditorialBatchIntroduction,
} from "@/lib/editorial-batches";
import { isCuratorMode } from "@/lib/curator-gate";
import { fileCollectionAccession } from "@/lib/library-filing";
import { toggleStarred } from "@/lib/workbench-state";

export type WorkbenchActionResult =
  | { ok: true; message: string; librarySlug?: string; batchId?: string }
  | { ok: false; message: string };

/** Workbench mutations exist only under Curator Mode. */
function requireCuratorMode(): void {
  if (!isCuratorMode()) notFound();
}

function revalidateWorkbench(batchId?: string) {
  revalidatePath("/workbench");
  revalidatePath("/library");
  if (batchId) {
    revalidatePath(`/workbench/batches/${batchId}`);
  }
}

export async function fileHoldingAction(
  collectionId: string,
): Promise<WorkbenchActionResult> {
  requireCuratorMode();
  try {
    const result = fileCollectionAccession({ collectionId });
    revalidatePath("/workbench");
    revalidatePath(`/workbench/holdings/${collectionId}`);
    revalidatePath(`/workbench/accessions/${result.library.slug}`);
    return {
      ok: true,
      message: `Filed as ${result.library.shelfMark} · ${result.library.slug}`,
      librarySlug: result.library.slug,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error ? err.message : "Filing could not be completed",
    };
  }
}

export async function toggleStarAction(
  collectionId: string,
): Promise<WorkbenchActionResult> {
  requireCuratorMode();
  try {
    const state = toggleStarred(collectionId);
    const starred = state.starredIds.includes(collectionId);
    revalidatePath("/workbench");
    revalidatePath(`/workbench/holdings/${collectionId}`);
    return {
      ok: true,
      message: starred ? "Set aside for attention" : "Released from attention",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not update star",
    };
  }
}

export async function createBatchAction(
  name: string,
): Promise<WorkbenchActionResult> {
  requireCuratorMode();
  try {
    const batch = createEditorialBatch(name);
    revalidateWorkbench(batch.id);
    return {
      ok: true,
      message: `Opened Editorial Batch “${batch.name}”`,
      batchId: batch.id,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not open batch",
    };
  }
}

export async function renameBatchAction(
  batchId: string,
  name: string,
): Promise<WorkbenchActionResult> {
  requireCuratorMode();
  try {
    const batch = renameEditorialBatch(batchId, name);
    revalidateWorkbench(batchId);
    return {
      ok: true,
      message: `Renamed to “${batch.name}”`,
      batchId,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not rename batch",
    };
  }
}

export async function updateBatchIntroductionAction(
  batchId: string,
  editorialTitle: string,
  editorialNote: string,
): Promise<WorkbenchActionResult> {
  requireCuratorMode();
  try {
    updateEditorialBatchIntroduction(batchId, {
      editorialTitle,
      editorialNote,
    });
    revalidateWorkbench(batchId);
    return {
      ok: true,
      message: "Batch introduction saved",
      batchId,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error ? err.message : "Could not save introduction",
    };
  }
}

export async function addToBatchAction(
  batchId: string,
  slugs: string[],
): Promise<WorkbenchActionResult> {
  requireCuratorMode();
  try {
    const batch = addAccessionsToBatch(batchId, slugs);
    for (const slug of slugs) {
      revalidatePath(`/workbench/accessions/${slug}`);
    }
    revalidateWorkbench(batchId);
    return {
      ok: true,
      message: `Batch now holds ${batch.accessionSlugs.length} accession${batch.accessionSlugs.length === 1 ? "" : "s"}`,
      batchId,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not add accessions",
    };
  }
}

export async function removeFromBatchAction(
  batchId: string,
  slugs: string[],
): Promise<WorkbenchActionResult> {
  requireCuratorMode();
  try {
    removeAccessionsFromBatch(batchId, slugs);
    for (const slug of slugs) {
      revalidatePath(`/workbench/accessions/${slug}`);
    }
    revalidateWorkbench(batchId);
    return {
      ok: true,
      message: "Removed from the batch",
      batchId,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not remove accessions",
    };
  }
}

export async function publishBatchAction(
  batchId: string,
): Promise<WorkbenchActionResult> {
  requireCuratorMode();
  try {
    const result = publishEditorialBatch(batchId);
    for (const slug of result.published) {
      revalidatePath(`/workbench/accessions/${slug}`);
      revalidatePath(`/library/${slug}`);
    }
    revalidatePath("/library/authorities");
    revalidateWorkbench(batchId);

    const remaining = result.remaining.length;
    const published = result.published.length;
    const failNote =
      result.failed.length > 0
        ? ` ${result.failed.length} could not be published.`
        : "";

    return {
      ok: true,
      message:
        (published === 0
          ? "Nothing was published."
          : remaining === 0
            ? `Published ${published} accession${published === 1 ? "" : "s"}. The batch is clear.`
            : `Published ${published}. ${remaining} remain in the batch.`) +
        failNote,
      batchId,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not publish batch",
    };
  }
}
