"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { fileHoldingAction, toggleStarAction } from "@/app/workbench/actions";
import { workbenchVoice } from "@/config/workbench-voice";

interface FileHoldingButtonProps {
  collectionId: string;
  disabled?: boolean;
}

export function FileHoldingButton({
  collectionId,
  disabled,
}: FileHoldingButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="workbench-action-cluster">
      <button
        type="button"
        className="workbench-action"
        disabled={disabled || pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await fileHoldingAction(collectionId);
            setMessage(result.message);
            if (result.ok && result.librarySlug) {
              router.push(`/workbench/accessions/${result.librarySlug}`);
              router.refresh();
            }
          });
        }}
      >
        {pending ? workbenchVoice.actions.filing : workbenchVoice.actions.file}
      </button>
      {message ? <p className="workbench-action-note">{message}</p> : null}
    </div>
  );
}

export function StarHoldingButton({
  collectionId,
  starred,
}: {
  collectionId: string;
  starred: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="workbench-action workbench-action--quiet"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await toggleStarAction(collectionId);
          router.refresh();
        });
      }}
    >
      {starred ? workbenchVoice.actions.unstar : workbenchVoice.actions.star}
    </button>
  );
}
