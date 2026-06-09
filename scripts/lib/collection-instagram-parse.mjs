const EVENT_HASHTAGS = {
  acquisition: new Set(["acquisition", "bsm-acquisition"]),
  discovery: new Set(["discovery", "bsm-discovery"]),
  preservation: new Set(["preservation", "bsm-preservation"]),
  expansion: new Set(["expansion", "bsm-expansion"]),
  arrival: new Set(["arrival", "bsm-arrival"]),
};

export function extractHashtags(caption = "") {
  return [...caption.matchAll(/#([\w-]+)/gi)].map((match) =>
    match[1].toLowerCase(),
  );
}

export function captionIncludesHashtag(caption, tag) {
  const normalized = tag.replace(/^#/, "").toLowerCase();
  return extractHashtags(caption).includes(normalized);
}

export function inferEventType(hashtags) {
  for (const [eventType, tags] of Object.entries(EVENT_HASHTAGS)) {
    if (hashtags.some((tag) => tags.has(tag))) return eventType;
  }
  return "acquisition";
}

export function inferStatus(hashtags, eventType) {
  if (hashtags.includes("bsm-pipeline") || hashtags.includes("pipeline")) {
    return "Pipeline";
  }
  if (
    hashtags.includes("bsm-preservation") ||
    (eventType === "preservation" && hashtags.includes("preservation"))
  ) {
    return "Preservation";
  }
  // Synced Instagram posts are visible by default — no promotion step required.
  return "Catalogued";
}

export function deriveTitle(caption = "") {
  const firstLine = caption.split("\n")[0]?.trim() ?? "";
  const withoutTags = firstLine.replace(/#[\w-]+/g, "").replace(/\s+/g, " ").trim();
  if (withoutTags.length > 0) return withoutTags.slice(0, 120);
  return "Untitled Archive Event";
}

export function archiveIdForMedia(mediaId, existingId = null) {
  if (existingId) return existingId;
  return `ig-${mediaId}`;
}

export function toIsoDate(timestamp) {
  if (!timestamp) return new Date().toISOString().slice(0, 10);
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function toIsoDateTime(timestamp) {
  if (!timestamp) return new Date().toISOString();
  return new Date(timestamp).toISOString();
}

export function parseTagsForEnrichment(hashtags) {
  const ignored = new Set([
    "bsm-collection",
    "catalogued",
    "bsm-catalogued",
    "pipeline",
    "bsm-pipeline",
    "bsm-preservation",
    ...Object.values(EVENT_HASHTAGS).flatMap((set) => [...set]),
  ]);

  return hashtags.filter((tag) => !ignored.has(tag));
}
