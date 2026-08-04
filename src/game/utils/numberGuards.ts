/** Sanitize a number: replace NaN/Infinity with 0, clamp negatives to 0. */
export function guardNumber(v: number): number {
  if (!Number.isFinite(v) || Number.isNaN(v)) return 0;
  return Math.max(0, v);
}
