/**
 * Pure arithmetic: how long N terabytes take over a link of a given speed at
 * a given utilization. TB here is decimal (10^12 bytes), as storage vendors
 * and AWS pricing count it. Real transfers add protocol overhead and
 * per-file costs, so this is a lower bound.
 */
export function transferSeconds(tb: number, gbps: number, utilization = 1): number {
  if (tb <= 0) return 0;
  if (gbps <= 0 || utilization <= 0) return Infinity;
  const bits = tb * 1e12 * 8;
  return bits / (gbps * 1e9 * utilization);
}

/** A rough human duration: minutes, hours or days. */
export function humanDuration(s: number): { value: number; unit: "min" | "h" | "d" } {
  if (!Number.isFinite(s)) return { value: Infinity, unit: "d" };
  if (s < 3600) return { value: Math.max(1, Math.round(s / 60)), unit: "min" };
  if (s < 2 * 86400) return { value: Math.round((s / 3600) * 10) / 10, unit: "h" };
  return { value: Math.round((s / 86400) * 10) / 10, unit: "d" };
}
