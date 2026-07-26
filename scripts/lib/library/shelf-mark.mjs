/**
 * Shelf mark allocation — sequential LIB-NNNN accession numbers.
 */

const SHELF_MARK_PATTERN = /^LIB-(\d+)$/i;

export function parseShelfMarkNumber(mark) {
  if (typeof mark !== "string") return null;
  const match = mark.trim().match(SHELF_MARK_PATTERN);
  if (!match) return null;
  return Number(match[1]);
}

export function formatShelfMark(sequence) {
  const n = Number(sequence);
  if (!Number.isFinite(n) || n < 1) {
    throw new Error(`Invalid shelf mark sequence: ${sequence}`);
  }
  return `LIB-${String(n).padStart(4, "0")}`;
}

/**
 * Returns the next unused LIB-NNNN mark given existing Library records
 * (and optional extra marks already reserved in this run).
 */
export function nextShelfMark(records, { reserved = [] } = {}) {
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
