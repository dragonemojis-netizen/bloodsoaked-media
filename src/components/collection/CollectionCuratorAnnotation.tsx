"use client";

import { publication } from "@/config/publication";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

/** Characters above which a placard preview is shown. */
const LONG_ANNOTATION_THRESHOLD = 320;

const FILING_FOCUS_DELAY_MS = 320;

export function isLongCuratorAnnotation(notes: string): boolean {
  if (notes.length > LONG_ANNOTATION_THRESHOLD) return true;
  return notes.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length > 2;
}

interface CuratorAnnotationContextValue {
  notes: string;
  specimenTitle: string;
  isLong: boolean;
  expanded: boolean;
  openFiling: () => void;
  closeFiling: () => void;
  filingId: string;
  toggleRef: RefObject<HTMLButtonElement | null>;
}

const CuratorAnnotationContext =
  createContext<CuratorAnnotationContextValue | null>(null);

function useCuratorAnnotation() {
  const context = useContext(CuratorAnnotationContext);
  if (!context) {
    throw new Error(
      "Collection curator annotation components must be used within CollectionCuratorAnnotationProvider",
    );
  }
  return context;
}

interface CollectionCuratorAnnotationProviderProps {
  notes: string;
  specimenTitle: string;
  children: ReactNode;
}

export function CollectionCuratorAnnotationProvider({
  notes,
  specimenTitle,
  children,
}: CollectionCuratorAnnotationProviderProps) {
  const [expanded, setExpanded] = useState(false);
  const filingId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isLong = isLongCuratorAnnotation(notes);

  const openFiling = useCallback(() => {
    setExpanded(true);
  }, []);

  const closeFiling = useCallback(() => {
    setExpanded(false);
    requestAnimationFrame(() => {
      toggleRef.current?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <CuratorAnnotationContext.Provider
      value={{
        notes,
        specimenTitle,
        isLong,
        expanded,
        openFiling,
        closeFiling,
        filingId,
        toggleRef,
      }}
    >
      {children}
    </CuratorAnnotationContext.Provider>
  );
}

export function CollectionCuratorAnnotationPlacard() {
  const {
    notes,
    specimenTitle,
    isLong,
    expanded,
    openFiling,
    closeFiling,
    filingId,
    toggleRef,
  } = useCuratorAnnotation();

  if (!isLong) {
    return (
      <blockquote className="vault-curator-note collection-curator-quote collection-curator-annotation mt-5 border-l-2 border-accent/35 pl-5 font-serif text-base leading-[1.72] text-foreground md:text-lg">
        {notes}
      </blockquote>
    );
  }

  return (
    <div className="collection-curator-placard collection-curator-placard--preview mt-5">
      <blockquote className="vault-curator-note collection-curator-quote collection-curator-annotation collection-curator-placard-body border-l-2 border-accent/35 pl-5 font-serif text-base leading-[1.72] text-foreground md:text-lg">
        {notes}
      </blockquote>

      <button
        ref={toggleRef}
        type="button"
        className="collection-curator-placard-toggle mt-4 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-foreground-muted transition-colors hover:text-accent-bright"
        aria-expanded={expanded}
        aria-controls={filingId}
        aria-label={
          expanded
            ? publication.collectionCuratorAnnotationCollapseAria
            : publication.collectionCuratorAnnotationExpandAria(specimenTitle)
        }
        onClick={() => (expanded ? closeFiling() : openFiling())}
      >
        <span aria-hidden="true">
          {expanded
            ? publication.collectionCuratorAnnotationCollapse
            : publication.collectionCuratorAnnotationExpand}
        </span>
      </button>
    </div>
  );
}

export function CollectionCuratorAnnotationFiling() {
  const {
    notes,
    specimenTitle,
    isLong,
    expanded,
    closeFiling,
    filingId,
  } = useCuratorAnnotation();
  const filingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!expanded || !filingRef.current) return;

    filingRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const focusTimer = window.setTimeout(() => {
      filingRef.current?.focus({ preventScroll: true });
    }, FILING_FOCUS_DELAY_MS);

    return () => window.clearTimeout(focusTimer);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFiling();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded, closeFiling]);

  if (!isLong || !expanded) return null;

  return (
    <section
      ref={filingRef}
      id={filingId}
      tabIndex={-1}
      aria-labelledby={`${filingId}-heading`}
      className="collection-curator-filing"
    >
      <div className="collection-curator-filing-drawer" aria-hidden="true">
        <div className="collection-curator-filing-divider px-6 md:px-10 lg:px-14">
          <span className="collection-curator-filing-divider-mark" />
        </div>
        <p className="collection-curator-filing-divider-label px-6 font-mono text-[0.5rem] uppercase tracking-[0.22em] text-foreground-muted/55 md:px-10 lg:px-14">
          {publication.collectionCuratorFilingDrawerLabel}
        </p>
      </div>

      <div className="collection-curator-filing-content">
        <div className="collection-curator-filing-inner px-6 py-8 md:px-10 md:py-10 lg:px-14 lg:py-12">
          <header className="collection-curator-filing-header border-b border-border-subtle pb-6">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-accent-bright">
              {publication.collectionCuratorFilingEyebrow}
            </p>
            <h3
              id={`${filingId}-heading`}
              className="mt-3 font-serif text-2xl leading-snug text-foreground md:text-[1.75rem]"
            >
              {specimenTitle}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground-muted">
              {publication.collectionCuratorFilingLead}
            </p>
          </header>

          <div className="collection-curator-filing-body vault-curator-note collection-curator-filing-text mt-8 font-serif text-lg leading-[1.82] text-foreground md:text-xl md:leading-[1.85]">
            {notes}
          </div>

          <button
            type="button"
            className="collection-curator-filing-close mt-10 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-foreground-muted transition-colors hover:text-accent-bright"
            aria-label={publication.collectionCuratorAnnotationCollapseAria}
            onClick={closeFiling}
          >
            <span aria-hidden="true">
              {publication.collectionCuratorFilingClose}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
