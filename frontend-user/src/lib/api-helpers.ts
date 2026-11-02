/**
 * API helper functions
 */

/**
 * Extracts an array from a potentially wrapped or paginated API response.
 * Handles both { data: { data: [...] } } and { data: [...] } formats.
 */
export const extractArray = <T>(resp: unknown): T[] => {
  const safeResp = resp as Record<string, unknown>;
  const body = safeResp?.data as Record<string, unknown>;
  const inner = body?.data as Record<string, unknown> | unknown[];
  if (inner && !Array.isArray(inner) && Array.isArray(inner.data))
    return inner.data as T[];
  if (Array.isArray(inner)) return inner as T[];
  if (Array.isArray(body)) return body as T[];
  return [] as T[];
};
