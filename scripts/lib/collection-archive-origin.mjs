export const RECORD_ORIGINS = new Set(["instagram", "curated", "development"]);

export function isDevelopmentRecord(record) {
  return record?.origin === "development";
}

export function isAuthenticRecord(record) {
  return record && record.origin !== "development";
}

export function inferOrigin(record) {
  if (record.origin && RECORD_ORIGINS.has(record.origin)) return record.origin;
  if (record.source?.platform === "instagram" || record.id?.startsWith("ig-")) {
    return "instagram";
  }
  if (record.developmentMeta?.synthetic) return "development";
  if (record.source?.provenanceNote?.toLowerCase().includes("seed")) {
    return "development";
  }
  return "curated";
}
