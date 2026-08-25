import { isArchivesLocal } from "@/lib/archives-gate";

/** Metal Lifestyle follows the Archives local-only boundary. */
export function isMetalLifestyleLocal(): boolean {
  return isArchivesLocal();
}
