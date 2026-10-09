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
