/**
 * Connect attachment capacity and GRE overhead
 * (docs/03-sd-wan-and-connect.md, verified as of AS_OF in @/data/asOf).
 */

export type Mode = "tgw-gre" | "cwan-gre" | "cwan-tunnelless";

export const PEERS_MAX = 4;
export const GBPS_PER_GRE_PEER = 5;
/** Tunnel-less Connect is bounded by the VPC attachment: 100 Gbps per AZ. */
export const GBPS_TUNNELLESS_PER_AZ = 100;
export const GRE_OVERHEAD = 24;

/** Aggregate Gbps a Connect attachment can carry with `peers` peers. */
export function capacity(mode: Mode, peers: number): number {
  const n = Math.max(0, Math.min(PEERS_MAX, Math.floor(peers)));
  if (mode === "cwan-tunnelless") return n > 0 ? GBPS_TUNNELLESS_PER_AZ : 0;
  return n * GBPS_PER_GRE_PEER;
}

/** Largest inner packet that fits a GRE tunnel over the given outer MTU. */
export function greInnerMtu(outer: number): number {
  return outer - GRE_OVERHEAD;
}

/**
 * One GRE tunnel is one flow to EC2 (hashed on source, destination,
 * protocol), so a single peer never exceeds 5 Gbps however big the box.
 */
export function fits(mode: Mode, peers: number, demandGbps: number): boolean {
  return demandGbps <= capacity(mode, peers);
}
