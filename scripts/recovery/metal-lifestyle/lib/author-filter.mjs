/** Dakota-only import rules — when uncertain, exclude from auto-import. */

const DAKOTA_SIGNATURE_PATTERNS = [
  { pattern: /\bDakota\s+Gochee\b/i, label: "Dakota Gochee" },
  { pattern: /(?:^|\n)\s*[-–—]\s*Dakota\s+G\.?\s*$/im, label: "Dakota G." },
  { pattern: /(?:^|\n)\s*[-–—]\s*Dakota\s*$/im, label: "Dakota" },
  { pattern: /(?:^|\n)\s*[-–—]\s*DG\s*$/im, label: "DG" },
  { pattern: /(?:^|\n)\s*[-–—]\s*D\.\s*$/im, label: "D." },
];

const OTHER_AUTHOR_PATTERNS = [
  { pattern: /\bAlex Brown\b/i, label: "Alex Brown" },
  { pattern: /\bAlex Bugella\b/i, label: "Alex Bugella" },
  { pattern: /\bBrian Lesmes\b/i, label: "Brian Lesmes" },
  { pattern: /\bCesar Gonzalez\b/i, label: "Cesar Gonzalez" },
  { pattern: /\bCaleb Porter\b/i, label: "Caleb Porter" },
  { pattern: /\bThe Metal Lifestyle Team\b/i, label: "Metal Lifestyle Team" },
  { pattern: /\bWilliam Harrison\b/i, label: "William Harrison" },
];

const TITLE_EXCLUDE_PATTERNS = [
  /\bAlex Brown\b/i,
  /\bGroup Review\b/i,
  /\bTeam\b/i,
  /\bGallery\b/i,
  /\bMeet the Staff\b/i,
];

const PAGE_EXCLUDE_PATHS = [
  "/gallery",
  "/about-us",
  "/blog.html",
  "/index.html",
];

export function isExcludedPagePath(pathname) {
  const lower = pathname.toLowerCase();
  return PAGE_EXCLUDE_PATHS.some((p) => lower.includes(p));
}

const DAKOTA_TITLE_ATTRIBUTION =
  /\bdakota'?s\s+(?:top|best|favorite|most|201\d|q\d)/i;

export function classifyAuthorship({ title, text, url }) {
  const detectedDakota = [];
  const detectedOthers = [];

  if (DAKOTA_TITLE_ATTRIBUTION.test(title)) {
    return {
      importEligibility: "approved",
      eligibilityReason: "Title attributes the piece to Dakota.",
      authorAttribution: "Dakota",
      detectedSignatures: ["Dakota (title)"],
    };
  }

  for (const { pattern, label } of DAKOTA_SIGNATURE_PATTERNS) {
    if (pattern.test(text)) detectedDakota.push(label);
  }
  for (const { pattern, label } of OTHER_AUTHOR_PATTERNS) {
    if (pattern.test(text)) detectedOthers.push(label);
  }

  if (TITLE_EXCLUDE_PATTERNS.some((p) => p.test(title))) {
    return {
      importEligibility: "excluded",
      eligibilityReason: `Title indicates non-Dakota or multi-author content: "${title}"`,
      authorAttribution: detectedOthers[0] ?? null,
      detectedSignatures: [...detectedDakota, ...detectedOthers],
    };
  }

  const hasDakota = detectedDakota.length > 0;
  const hasOther = detectedOthers.length > 0;

  if (hasDakota && !hasOther) {
    const primary =
      detectedDakota.find((l) => l.includes("Gochee")) ??
      detectedDakota.find((l) => l.includes("G.")) ??
      detectedDakota[0];
    return {
      importEligibility: "approved",
      eligibilityReason: `Signed or attributed to Dakota (${primary}).`,
      authorAttribution: primary ?? "Dakota",
      detectedSignatures: detectedDakota,
    };
  }

  if (hasOther && !hasDakota) {
    return {
      importEligibility: "excluded",
      eligibilityReason: `Attributed to other contributor(s): ${detectedOthers.join(", ")}.`,
      authorAttribution: detectedOthers.join(", "),
      detectedSignatures: detectedOthers,
    };
  }

  if (hasDakota && hasOther) {
    return {
      importEligibility: "requires_review",
      eligibilityReason: `Both Dakota and other author signals detected: ${[...detectedDakota, ...detectedOthers].join(", ")}.`,
      authorAttribution: null,
      detectedSignatures: [...detectedDakota, ...detectedOthers],
    };
  }

  if (detectedDakota.includes("D.")) {
    return {
      importEligibility: "requires_review",
      eligibilityReason:
        'Only ambiguous "D." signature found — confirm Dakota before import.',
      authorAttribution: null,
      detectedSignatures: detectedDakota,
    };
  }

  return {
    importEligibility: "requires_review",
    eligibilityReason:
      "No confident Dakota signature found. Manual authorship check required.",
    authorAttribution: null,
    detectedSignatures: [],
  };
}
