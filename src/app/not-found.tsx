import { PublicationChrome } from "@/components/layout/PublicationChrome";
import { NotFoundBody } from "@/components/layout/NotFoundBody";

/**
 * Root 404 — used when no segment not-found applies (e.g. Workbench
 * non-disclosing rewrite). Wrap chrome here because root layout has none.
 */
export default function NotFound() {
  return (
    <PublicationChrome variant="default">
      <NotFoundBody />
    </PublicationChrome>
  );
}
