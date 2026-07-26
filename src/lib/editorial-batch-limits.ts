/**
 * Editorial Batch size guidance — shared by server and client.
 * Keep free of Node-only imports so client components may use these limits.
 */

export const EDITORIAL_BATCH_SIZE = {
  suggestedMin: 5,
  suggestedMax: 10,
  hardMax: 12,
} as const;
