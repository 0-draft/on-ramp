/**
 * Site-to-Site VPN throughput, AWS to your network (docs/02-site-to-site-vpn.md):
 *
 * - Standard tunnel 1.25 Gbps / 140,000 PPS; Large 5 Gbps / 400,000 PPS.
 * - Large tunnels exist on Transit Gateway and Cloud WAN only.
 * - A VGW picks one egress tunnel across all its connections: no ECMP,
 *   aggregate up to 1.25 Gbps.
 * - Transit Gateway / Cloud WAN spread flows across every tunnel with ECMP,
 *   BGP only (TGW also needs its VPN ECMP option on). Cloud WAN VPNs are BGP only.
 * - One flow is hashed onto one tunnel, so it never exceeds one tunnel.
 */

export type VpnHub = "vgw" | "tgw" | "cloudwan";
export type TunnelSize = "standard" | "large";

export interface ThroughputInput {
  hub: VpnHub;
  size: TunnelSize;
  connections: number;
  routing: "bgp" | "static";
  /** Transit Gateway's VPN ECMP option. */
  ecmp: boolean;
  flows: number;
}

export type Problem = "largeOnVgw" | "staticOnCloudWan";

export interface ThroughputResult {
  ok: boolean;
  problem?: Problem;
  perTunnelGbps: number;
  perTunnelPps: number;
  tunnels: number;
  /** Tunnels that can carry traffic at the same time. */
  activeTunnels: number;
  /** Why only one tunnel is active, if so. */
  single?: "vgw" | "static" | "ecmpOff";
  /** Best case: flows hash perfectly across active tunnels. */
  aggregateGbps: number;
  singleFlowGbps: number;
}

export const TUNNEL = {
  standard: { gbps: 1.25, pps: 140_000 },
  large: { gbps: 5, pps: 400_000 },
} as const;

export function throughput(i: ThroughputInput): ThroughputResult {
  const per = TUNNEL[i.size];
  const tunnels = 2 * Math.max(1, Math.floor(i.connections));
  const base = {
    perTunnelGbps: per.gbps,
    perTunnelPps: per.pps,
    tunnels,
    singleFlowGbps: per.gbps,
  };
  if (i.hub === "vgw" && i.size === "large") {
    return {
      ...base,
      ok: false,
      problem: "largeOnVgw",
      activeTunnels: 0,
      aggregateGbps: 0,
      singleFlowGbps: 0,
    };
  }
  if (i.hub === "cloudwan" && i.routing === "static") {
    return {
      ...base,
      ok: false,
      problem: "staticOnCloudWan",
      activeTunnels: 0,
      aggregateGbps: 0,
      singleFlowGbps: 0,
    };
  }

  let single: ThroughputResult["single"];
  if (i.hub === "vgw") single = "vgw";
  else if (i.routing === "static") single = "static";
  else if (i.hub === "tgw" && !i.ecmp) single = "ecmpOff";

  const flows = Math.max(1, Math.floor(i.flows));
  const activeTunnels = single ? 1 : tunnels;
  const used = Math.min(activeTunnels, flows);
  return {
    ...base,
    ok: true,
    activeTunnels,
    single,
    aggregateGbps: round(used * per.gbps),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
