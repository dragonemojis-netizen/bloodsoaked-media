/**
 * Shelf mark allocation — sequential LIB-NNNN accession numbers.
 */

const SHELF_MARK_PATTERN = /^LIB-(\d+)$/i;

export function parseShelfMarkNumber(mark: string | undefined | null): number | null {
  if (typeof mark !== "string") return null;
  const match = mark.trim().match(SHELF_MARK_PATTERN);
  if (!match) return null;
  return Number(match[1]);
}

export function formatShelfMark(sequence: number): string {
  if (!Number.isFinite(sequence) || sequence < 1) {
    throw new Error(`Invalid shelf mark sequence: ${sequence}`);
  }
  return `LIB-${String(sequence).padStart(4, "0")}`;
}

export function nextShelfMark(
  records: Array<{ shelfMark?: string }>,
  { reserved = [] }: { reserved?: string[] } = {},
): string {
  let max = 0;
  for (const record of records) {
    const n = parseShelfMarkNumber(record?.shelfMark);
    if (n != null && n > max) max = n;
  }
  for (const mark of reserved) {
    const n = parseShelfMarkNumber(mark);
    if (n != null && n > max) max = n;
  }
  return formatShelfMark(max + 1);
}
