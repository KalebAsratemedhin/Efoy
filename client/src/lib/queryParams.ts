/** Build a query string from an object, omitting undefined / null / empty string. */
export function toQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/** Read a positive number from URL search params, or undefined. */
export function readNumberParam(
  params: URLSearchParams,
  key: string
): number | undefined {
  const raw = params.get(key);
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}
