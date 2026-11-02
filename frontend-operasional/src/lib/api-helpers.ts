/**
 * API helper functions
 */

/**
 * Extracts an array from a potentially wrapped or paginated API response.
 * Handles both { data: { data: [...] } } and { data: [...] } formats.
 */
export const extractArray = <T>(resp: unknown): T[] => {
  const body = (resp as { data?: any })?.data;
  const inner = body?.data;
  if (inner?.data && Array.isArray(inner.data)) return inner.data as T[];
  if (Array.isArray(inner)) return inner as T[];
  if (Array.isArray(body)) return body as T[];
  return [] as T[];
};
