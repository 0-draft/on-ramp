/**
 * "We have Direct Connect, so we're private" hides four separate gaps
 * (docs/14-why-hybrid-is-hard.md). Each one closes only when its own layer
 * is fixed; fixing one says nothing about the others.
 */
export type Gap = "encryption" | "dns" | "endpoint" | "location";

export interface Fixes {
  /** MACsec on the port, or an IPsec VPN on top of DX. */
  encryption: boolean;
  /** A Resolver inbound endpoint plus a conditional forwarder on-prem. */
  dns: boolean;
  /** Interface endpoints instead of gateway endpoints. */
  endpoint: boolean;
  /** A second DX location. */
  location: boolean;
}

export const GAPS: Gap[] = ["encryption", "dns", "endpoint", "location"];

export function openGaps(f: Fixes): Gap[] {
  return GAPS.filter((g) => !f[g]);
}

/**
 * Which of the five layers (1 underlay … 5 service, as drawn in the stack)
 * each gap lives on.
 */
export const LAYER_OF: Record<Gap, number> = {
  location: 1,
  encryption: 2,
  dns: 4,
  endpoint: 4,
};

/** Per layer: "open" if any of its gaps is open, "closed" if all are fixed, else none. */
export function layerState(f: Fixes, layer: number): "open" | "closed" | null {
  const here = GAPS.filter((g) => LAYER_OF[g] === layer);
  if (here.length === 0) return null;
  return here.some((g) => !f[g]) ? "open" : "closed";
}
