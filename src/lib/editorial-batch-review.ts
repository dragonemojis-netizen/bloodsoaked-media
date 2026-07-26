/**
 * Editorial Review Pass — quiet cross-accession observations for a batch.
 *
 * Never rewrites prose. Never creates relationships.
 * Surfaces consistency questions for curator judgment.
 */

import { getAuthorityRecord, listAuthoritySlugsFromReferences } from "@/lib/authority";
import type { LibraryRecord } from "@/types/library";

export type EditorialObservationKind =
  | "readiness"
  | "authority"
  | "voice"
  | "relationship"
  | "documentation";

export interface EditorialBatchObservation {
  kind: EditorialObservationKind;
  text: string;
}

export interface EditorialBatchReview {
  observations: EditorialBatchObservation[];
  /** Quiet standing notes per accession slug — never scores. */
  accessionNotes: Record<string, string[]>;
}

function mark(record: LibraryRecord): string {
  return record.shelfMark ?? record.slug;
}

function countLabel(n: number, singular: string, plural: string): string {
  return n === 1 ? `One accession ${singular}` : `${n} accessions ${plural}`;
}

function normalizeTerm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function firstPersonSignal(text: string): boolean {
  return /\bI\b|\bI've\b|\bI'm\b|\bI'd\b|\bI'll\b|\bmy\b/i.test(text);
}

function preservationSignature(record: LibraryRecord): string {
  const p = record.preservation;
  if (!p) return "none";
  const parts = [
    p.playableOn?.trim() ? "access" : "",
    p.originalHardware?.trim() ? "hardware" : "",
    p.compatibility?.trim() ? "compat" : "",
    p.concerns?.trim() ? "concerns" : "",
    p.knownRevisions?.trim() ? "revisions" : "",
    p.availability?.trim() ? "access-status" : "",
  ].filter(Boolean);
  return parts.length === 0 ? "none" : parts.join("+");
}

function sharedPairs(
  records: LibraryRecord[],
  keyOf: (record: LibraryRecord) => string[],
): Array<{ key: string; members: LibraryRecord[] }> {
  const map = new Map<string, LibraryRecord[]>();
  for (const record of records) {
    for (const key of keyOf(record)) {
      if (!key.trim()) continue;
      const list = map.get(key) ?? [];
      list.push(record);
      map.set(key, list);
    }
  }
  return [...map.entries()]
    .filter(([, members]) => members.length >= 2)
    .map(([key, members]) => ({ key, members }));
}

function alreadyRelated(a: LibraryRecord, b: LibraryRecord): boolean {
  const aRelated = new Set(a.connections?.relatedEntrySlugs ?? []);
  const bRelated = new Set(b.connections?.relatedEntrySlugs ?? []);
  return aRelated.has(b.slug) || bRelated.has(a.slug);
}

/**
 * Build editorial observations for the accessions currently in a batch.
 */
export function buildEditorialBatchReview(
  records: LibraryRecord[],
): EditorialBatchReview {
  const observations: EditorialBatchObservation[] = [];
  const accessionNotes: Record<string, string[]> = {};

  for (const record of records) {
    accessionNotes[record.slug] = [];
  }

  if (records.length === 0) {
    return {
      observations: [
        {
          kind: "readiness",
          text: "This batch is empty. Gather filed Editorial Drafts before review.",
        },
      ],
      accessionNotes,
    };
  }

  // —— Publication readiness (observations, not scores) ——
  const missingNotes = records.filter((r) => !r.curatorNotes?.trim());
  const missingCollection = records.filter((r) => !r.collectionNotes?.trim());
  const missingPreservation = records.filter(
    (r) => preservationSignature(r) === "none",
  );
  const missingAuthorities = records.filter(
    (r) => listAuthoritySlugsFromReferences(r.authorities).length === 0,
  );
  const missingRelationships = records.filter((r) => {
    const c = r.connections;
    if (!c) return true;
    return !(
      c.series?.trim() ||
      (c.relatedEntrySlugs?.length ?? 0) > 0 ||
      c.mediaLogSlug?.trim() ||
      (c.articleSlugs?.length ?? 0) > 0 ||
      c.futureReview?.trim()
    );
  });

  for (const record of missingNotes) {
    accessionNotes[record.slug]!.push("Awaiting curator notes.");
  }
  for (const record of missingAuthorities) {
    accessionNotes[record.slug]!.push("Authority references should be reviewed.");
  }
  for (const record of missingCollection) {
    accessionNotes[record.slug]!.push("Collection documentation incomplete.");
  }
  for (const record of missingPreservation) {
    accessionNotes[record.slug]!.push("Preservation language not yet entered.");
  }
  for (const record of missingRelationships) {
    accessionNotes[record.slug]!.push("Relationships not yet established.");
  }

  if (missingNotes.length > 0) {
    observations.push({
      kind: "readiness",
      text:
        missingNotes.length === records.length
          ? "Awaiting curator notes."
          : countLabel(
              missingNotes.length,
              "still awaits Curator Notes.",
              "still await Curator Notes.",
            ),
    });
  }

  if (missingAuthorities.length > 0) {
    observations.push({
      kind: "authority",
      text: "Authority references should be reviewed.",
    });
  }

  if (missingCollection.length > 0) {
    observations.push({
      kind: "documentation",
      text:
        missingCollection.length === records.length
          ? "Collection documentation incomplete."
          : countLabel(
              missingCollection.length,
              "still lacks Collection Documentation.",
              "still lack Collection Documentation.",
            ),
    });
  }

  if (missingPreservation.length > 0) {
    observations.push({
      kind: "documentation",
      text:
        missingPreservation.length === records.length
          ? "Preservation language has not yet been entered."
          : countLabel(
              missingPreservation.length,
              "describes preservation incompletely.",
              "describe preservation incompletely.",
            ),
    });
  }

  if (missingRelationships.length > 0) {
    observations.push({
      kind: "readiness",
      text: "Relationships not yet established.",
    });
  }

  const fullyTended = records.filter(
    (r) => (accessionNotes[r.slug] ?? []).length === 0,
  );
  for (const record of fullyTended) {
    accessionNotes[record.slug]!.push("Ready for publication.");
  }

  // —— Authority consistency ——
  const consistencyNotes: EditorialBatchObservation[] = [];

  const authorityFields: Array<{
    key: "developers" | "publishers" | "platforms";
    catalogKey: "developer" | "publisher" | "platform";
    label: string;
  }> = [
    { key: "developers", catalogKey: "developer", label: "developer" },
    { key: "publishers", catalogKey: "publisher", label: "publisher" },
    { key: "platforms", catalogKey: "platform", label: "platform" },
  ];

  for (const field of authorityFields) {
    const bySlug = new Map<string, LibraryRecord[]>();
    for (const record of records) {
      for (const authoritySlug of record.authorities?.[field.key] ?? []) {
        const list = bySlug.get(authoritySlug) ?? [];
        list.push(record);
        bySlug.set(authoritySlug, list);
      }
    }

    for (const [authoritySlug, members] of bySlug) {
      if (members.length < 2) continue;
      const authority = getAuthorityRecord(authoritySlug);
      const preferred = authority?.preferredName ?? authoritySlug;
      const freeTexts = members
        .map((r) => r.catalog?.[field.catalogKey]?.trim() ?? "")
        .filter(Boolean);
      const uniqueNormalized = [
        ...new Set(freeTexts.map(normalizeTerm)),
      ];

      if (uniqueNormalized.length > 1) {
        consistencyNotes.push({
          kind: "authority",
          text: `Two or more records use different terminology for the same ${field.label} (${preferred}).`,
        });
      }

      const preferredNorm = normalizeTerm(preferred);
      const mismatches = freeTexts.filter(
        (text) =>
          normalizeTerm(text) !== preferredNorm &&
          !normalizeTerm(text).includes(preferredNorm) &&
          !preferredNorm.includes(normalizeTerm(text)),
      );
      if (mismatches.length > 0) {
        consistencyNotes.push({
          kind: "authority",
          text: `${field.label.charAt(0).toUpperCase()}${field.label.slice(1)} naming should be reviewed against the Authority Record preferred name “${preferred}”.`,
        });
      }
    }
  }

  // —— Editorial voice (Curator Notes / preservation) ——
  const withNotes = records.filter((r) => r.curatorNotes?.trim());
  if (withNotes.length >= 2) {
    const firstPerson = withNotes.filter((r) =>
      firstPersonSignal(r.curatorNotes!),
    );
    if (firstPerson.length > 0 && firstPerson.length < withNotes.length) {
      consistencyNotes.push({
        kind: "voice",
        text: "The tone shifts noticeably between entries.",
      });
    }

    const lengths = withNotes.map((r) => r.curatorNotes!.trim().length);
    const min = Math.min(...lengths);
    const max = Math.max(...lengths);
    if (max > min * 3 && max - min > 400) {
      consistencyNotes.push({
        kind: "voice",
        text: "Curator Notes vary widely in length across the batch — review for editorial rhythm.",
      });
    }
  }

  const preservationForms = new Set(
    records
      .filter((r) => preservationSignature(r) !== "none")
      .map((r) => preservationSignature(r)),
  );
  if (preservationForms.size >= 2) {
    consistencyNotes.push({
      kind: "voice",
      text: `${preservationForms.size} accessions describe preservation differently.`,
    });
  }

  // —— Related works opportunities ——
  const seriesPairs = sharedPairs(records, (r) => {
    const keys: string[] = [];
    if (r.connections?.series?.trim()) {
      keys.push(`series:${normalizeTerm(r.connections.series)}`);
    }
    for (const slug of r.authorities?.series ?? []) {
      keys.push(`series-auth:${slug}`);
    }
    return keys;
  });

  for (const group of seriesPairs) {
    const unlinked: string[] = [];
    for (let i = 0; i < group.members.length; i++) {
      for (let j = i + 1; j < group.members.length; j++) {
        const a = group.members[i]!;
        const b = group.members[j]!;
        if (!alreadyRelated(a, b)) {
          unlinked.push(`${mark(a)} · ${mark(b)}`);
        }
      }
    }
    if (unlinked.length > 0) {
      consistencyNotes.push({
        kind: "relationship",
        text: "These accessions share a series — consider establishing archival relationships.",
      });
      break;
    }
  }

  const developerPairs = sharedPairs(
    records,
    (r) => (r.authorities?.developers ?? []).map((s) => `dev:${s}`),
  );
  for (const group of developerPairs) {
    let needsLink = false;
    for (let i = 0; i < group.members.length; i++) {
      for (let j = i + 1; j < group.members.length; j++) {
        if (!alreadyRelated(group.members[i]!, group.members[j]!)) {
          needsLink = true;
          break;
        }
      }
      if (needsLink) break;
    }
    if (needsLink) {
      const authoritySlug = group.key.replace(/^dev:/, "");
      const authority = getAuthorityRecord(authoritySlug);
      const name = authority?.preferredName ?? authoritySlug;
      consistencyNotes.push({
        kind: "relationship",
        text: `Several accessions share ${name} — related-work links may be appropriate.`,
      });
      break;
    }
  }

  const publisherPairs = sharedPairs(
    records,
    (r) => (r.authorities?.publishers ?? []).map((s) => `pub:${s}`),
  );
  for (const group of publisherPairs) {
    let needsLink = false;
    for (let i = 0; i < group.members.length; i++) {
      for (let j = i + 1; j < group.members.length; j++) {
        if (!alreadyRelated(group.members[i]!, group.members[j]!)) {
          needsLink = true;
          break;
        }
      }
      if (needsLink) break;
    }
    if (needsLink) {
      consistencyNotes.push({
        kind: "relationship",
        text: "Accessions share a publisher — consider whether archival relationships belong on the record.",
      });
      break;
    }
  }

  if (fullyTended.length === records.length) {
    if (consistencyNotes.length === 0) {
      observations.push({
        kind: "readiness",
        text: "Ready for publication.",
      });
    } else {
      observations.push({
        kind: "readiness",
        text: "Editorial fields are present. Review the observations below before publication.",
      });
    }
  }

  observations.push(...consistencyNotes);

  // Deduplicate identical observation texts
  const seen = new Set<string>();
  const deduped = observations.filter((obs) => {
    if (seen.has(obs.text)) return false;
    seen.add(obs.text);
    return true;
  });

  const order: EditorialObservationKind[] = [
    "readiness",
    "documentation",
    "authority",
    "voice",
    "relationship",
  ];
  deduped.sort(
    (a, b) => order.indexOf(a.kind) - order.indexOf(b.kind),
  );

  return { observations: deduped, accessionNotes };
}
