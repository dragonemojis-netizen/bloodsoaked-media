"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { libraryFields, libraryVoice } from "@/config/library-voice";
import type { LibraryArtifactImage } from "@/types/library";

interface LibraryArtifactLightboxProps {
  images: LibraryArtifactImage[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  workTitle: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.35;

function resolveFullSrc(image: LibraryArtifactImage): string {
  return image.fullSrc ?? image.src;
}

/**
 * Museum inspection viewer — enlarge, zoom, pan, keyboard navigation.
 * No third-party lightbox dependency.
 */
export function LibraryArtifactLightbox({
  images,
  index,
  open,
  onClose,
  onIndexChange,
  workTitle,
}: LibraryArtifactLightboxProps) {
  const titleId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const image = images[index];
  const count = images.length;

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const changeIndex = useCallback(
    (nextIndex: number) => {
      resetView();
      onIndexChange(nextIndex);
    },
    [onIndexChange, resetView],
  );

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        changeIndex((index - 1 + count) % count);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        changeIndex((index + 1) % count);
        return;
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
        return;
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        setZoom((z) => {
          const next = Math.max(MIN_ZOOM, z - ZOOM_STEP);
          if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
          return next;
        });
        return;
      }
      if (event.key === "0") {
        event.preventDefault();
        resetView();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, index, count, onClose, changeIndex, resetView]);

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta));
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (zoom <= MIN_ZOOM) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPan({
      x: drag.panX + (event.clientX - drag.originX),
      y: drag.panY + (event.clientY - drag.originY),
    });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  if (!open || !image) return null;

  const docs = [
    { label: libraryFields.artifactView, value: image.view },
    { label: libraryFields.captured, value: image.captured ?? "" },
    { label: libraryFields.resolution, value: image.resolution ?? "" },
    { label: libraryFields.edition, value: image.edition ?? "" },
    { label: libraryFields.region, value: image.region ?? "" },
  ].filter((row) => row.value.trim().length > 0);

  return (
    <div
      className="library-artifact-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="library-artifact-lightbox-scrim"
        aria-label={libraryVoice.record.lightboxClose}
        onClick={onClose}
      />

      <div className="library-artifact-lightbox-chrome">
        <div className="library-artifact-lightbox-toolbar">
          <p id={titleId} className="library-artifact-lightbox-title">
            <span className="text-foreground-muted/70">{workTitle}</span>
            <span aria-hidden="true" className="mx-2 text-foreground-muted/30">
              ·
            </span>
            <span>{image.view}</span>
            {image.kind && (
              <>
                <span aria-hidden="true" className="mx-2 text-foreground-muted/30">
                  ·
                </span>
                <span className="text-foreground-muted/55">{image.kind}</span>
              </>
            )}
            <span className="ml-3 text-foreground-muted/45">
              {index + 1} / {count}
            </span>
          </p>

          <div className="library-artifact-lightbox-actions">
            <button
              type="button"
              className="library-artifact-lightbox-btn"
              onClick={() =>
                setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))
              }
              aria-label={libraryVoice.record.lightboxZoomOut}
            >
              −
            </button>
            <button
              type="button"
              className="library-artifact-lightbox-btn"
              onClick={resetView}
              aria-label={libraryVoice.record.lightboxReset}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className="library-artifact-lightbox-btn"
              onClick={() =>
                setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
              }
              aria-label={libraryVoice.record.lightboxZoomIn}
            >
              +
            </button>
            <button
              type="button"
              className="library-artifact-lightbox-btn"
              onClick={onClose}
              aria-label={libraryVoice.record.lightboxClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="library-artifact-lightbox-stage-wrap">
          {count > 1 && (
            <button
              type="button"
              className="library-artifact-lightbox-nav library-artifact-lightbox-nav--prev"
              onClick={() => changeIndex((index - 1 + count) % count)}
              aria-label={libraryVoice.record.lightboxPrevious}
            >
              ←
            </button>
          )}

          <div
            ref={stageRef}
            className={`library-artifact-lightbox-stage ${zoom > 1 ? "is-zoomed" : ""}`}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Full-resolution inspection — native img preserves detail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveFullSrc(image)}
              alt={`${workTitle} — ${image.view}`}
              className="library-artifact-lightbox-image"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
              draggable={false}
            />
          </div>

          {count > 1 && (
            <button
              type="button"
              className="library-artifact-lightbox-nav library-artifact-lightbox-nav--next"
              onClick={() => changeIndex((index + 1) % count)}
              aria-label={libraryVoice.record.lightboxNext}
            >
              →
            </button>
          )}
        </div>

        {image.note && (
          <p className="library-artifact-lightbox-caption">{image.note}</p>
        )}

        {docs.length > 0 && (
          <dl className="library-artifact-lightbox-docs">
            {docs.map((row) => (
              <div key={row.label} className="library-artifact-lightbox-doc">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
