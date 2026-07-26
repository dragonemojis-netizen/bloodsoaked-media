"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import {
  addToBatchAction,
  createBatchAction,
  publishBatchAction,
  removeFromBatchAction,
  renameBatchAction,
  updateBatchIntroductionAction,
} from "@/app/workbench/actions";
import { workbenchVoice } from "@/config/workbench-voice";
import { EDITORIAL_BATCH_SIZE } from "@/lib/editorial-batch-limits";

export function CreateBatchForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await createBatchAction(name);
      setMessage(result.message);
      if (result.ok && result.batchId) {
        setName("");
        router.push(`/workbench/batches/${result.batchId}`);
        router.refresh();
      }
    });
  }

  return (
    <form className="workbench-batch-form" onSubmit={onSubmit}>
      <label className="workbench-batch-label" htmlFor="batch-name">
        {workbenchVoice.batches.nameLabel}
      </label>
      <div className="workbench-batch-form-row">
        <input
          id="batch-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={workbenchVoice.batches.namePlaceholder}
          className="workbench-batch-input"
          autoComplete="off"
          required
        />
        <button type="submit" className="workbench-action" disabled={pending}>
          {pending ? workbenchVoice.batches.creating : workbenchVoice.batches.create}
        </button>
      </div>
      {message ? <p className="workbench-action-note">{message}</p> : null}
    </form>
  );
}

export function RenameBatchForm({
  batchId,
  currentName,
}: {
  batchId: string;
  currentName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(currentName);
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await renameBatchAction(batchId, name);
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }

  return (
    <form className="workbench-batch-form" onSubmit={onSubmit}>
      <label className="workbench-batch-label" htmlFor={`rename-${batchId}`}>
        {workbenchVoice.batches.nameLabel}
      </label>
      <div className="workbench-batch-form-row">
        <input
          id={`rename-${batchId}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="workbench-batch-input"
          autoComplete="off"
          required
        />
        <button type="submit" className="workbench-action workbench-action--quiet" disabled={pending}>
          {pending ? workbenchVoice.batches.renaming : workbenchVoice.batches.rename}
        </button>
      </div>
      {message ? <p className="workbench-action-note">{message}</p> : null}
    </form>
  );
}

export function BatchIntroductionForm({
  batchId,
  editorialTitle = "",
  editorialNote = "",
}: {
  batchId: string;
  editorialTitle?: string;
  editorialNote?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(editorialTitle);
  const [note, setNote] = useState(editorialNote);
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateBatchIntroductionAction(batchId, title, note);
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }

  return (
    <form className="workbench-batch-intro-form" onSubmit={onSubmit}>
      <label className="workbench-batch-label" htmlFor={`intro-title-${batchId}`}>
        {workbenchVoice.batches.introductionTitleLabel}
      </label>
      <input
        id={`intro-title-${batchId}`}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={workbenchVoice.batches.introductionTitlePlaceholder}
        className="workbench-batch-input"
        autoComplete="off"
      />
      <label
        className="workbench-batch-label workbench-batch-label--spaced"
        htmlFor={`intro-note-${batchId}`}
      >
        {workbenchVoice.batches.introductionBodyLabel}
      </label>
      <textarea
        id={`intro-note-${batchId}`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={workbenchVoice.batches.introductionBodyPlaceholder}
        className="workbench-batch-textarea"
        rows={3}
      />
      <button type="submit" className="workbench-action" disabled={pending}>
        {pending
          ? workbenchVoice.batches.updatingIntroduction
          : workbenchVoice.batches.updateIntroduction}
      </button>
      {message ? <p className="workbench-action-note">{message}</p> : null}
    </form>
  );
}

export function AddToBatchForm({
  batchId,
  eligible,
  currentCount,
}: {
  batchId: string;
  eligible: Array<{ slug: string; title: string; shelfMark: string }>;
  currentCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const remaining = EDITORIAL_BATCH_SIZE.hardMax - currentCount;

  if (eligible.length === 0) {
    return (
      <p className="workbench-empty">{workbenchVoice.batches.eligibleEmpty}</p>
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const slugs = data.getAll("slug").map(String);
    if (slugs.length === 0) {
      setMessage("Select at least one accession.");
      return;
    }
    if (slugs.length > remaining) {
      setMessage(workbenchVoice.batches.sizeHardCap);
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await addToBatchAction(batchId, slugs);
      setMessage(result.message);
      if (result.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <form className="workbench-batch-add" onSubmit={onSubmit}>
      <p className="workbench-section-note">{workbenchVoice.batches.eligibleLead}</p>
      {remaining <= 0 ? (
        <p className="workbench-action-note">{workbenchVoice.batches.sizeHardCap}</p>
      ) : (
        <ul className="workbench-batch-eligible">
          {eligible.map((row) => (
            <li key={row.slug}>
              <label className="workbench-batch-check">
                <input type="checkbox" name="slug" value={row.slug} />
                <span className="workbench-batch-check-mark">{row.shelfMark}</span>
                <span className="workbench-batch-check-title">{row.title}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <button
        type="submit"
        className="workbench-action"
        disabled={pending || remaining <= 0}
      >
        {pending ? workbenchVoice.batches.adding : workbenchVoice.batches.add}
      </button>
      {message ? <p className="workbench-action-note">{message}</p> : null}
    </form>
  );
}

export function RemoveFromBatchButton({
  batchId,
  slug,
}: {
  batchId: string;
  slug: string;
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
          await removeFromBatchAction(batchId, [slug]);
          router.refresh();
        });
      }}
    >
      {pending ? workbenchVoice.batches.removing : workbenchVoice.batches.remove}
    </button>
  );
}

export function PublishBatchButton({
  batchId,
  disabled,
}: {
  batchId: string;
  disabled?: boolean;
}) {
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
          if (!window.confirm(workbenchVoice.batches.publishConfirm)) return;
          setMessage(null);
          startTransition(async () => {
            const result = await publishBatchAction(batchId);
            setMessage(result.message);
            router.refresh();
          });
        }}
      >
        {pending
          ? workbenchVoice.batches.publishing
          : workbenchVoice.batches.publish}
      </button>
      {message ? <p className="workbench-action-note">{message}</p> : null}
    </div>
  );
}
