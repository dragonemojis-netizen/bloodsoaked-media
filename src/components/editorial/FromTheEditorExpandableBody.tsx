"use client";

import { useId, useState } from "react";

interface FromTheEditorExpandableBodyProps {
  paragraphs: string[];
  previewCount?: number;
}

export function FromTheEditorExpandableBody({
  paragraphs,
  previewCount = 3,
}: FromTheEditorExpandableBodyProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  if (paragraphs.length === 0) return null;

  const splitAt = Math.min(Math.max(previewCount, 1), paragraphs.length);
  const preview = paragraphs.slice(0, splitAt);
  const remainder = paragraphs.slice(splitAt);
  const canExpand = remainder.length > 0;

  return (
    <div className="mt-6 space-y-4 text-foreground-muted leading-relaxed">
      {preview.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      {canExpand && (
        <>
          <div
            id={panelId}
            hidden={!expanded}
            className={expanded ? "space-y-4" : undefined}
          >
            {remainder.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <button
            type="button"
            className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-accent-bright transition-colors hover:text-foreground"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less ↑" : "Continue reading →"}
          </button>
        </>
      )}
    </div>
  );
}
