/**
 * The two-tunnel failover story, step by step (docs/02-site-to-site-vpn.md,
 * "Two tunnels and why"). AWS replaces tunnel endpoints one tunnel at a time
 * and keeps the outside IP; with both tunnels configured you lose redundancy,
 * with one you lose connectivity.
 */

export type TunnelState = "up" | "replacing" | "down" | "off";

export interface FailoverFrame {
  t1: TunnelState;
  t2: TunnelState;
  /** The tunnel AWS uses to send traffic to you, or null if none works. */
  awsEgress: "t1" | "t2" | null;
  /**
   * Tunnel 1 has stopped answering but dead peer detection (or the BGP hold
   * timer) has not given up yet: traffic is still sent into it and lost.
   */
  detecting: boolean;
}

export const FAILOVER_STEPS = 5;

export function failoverFrame(step: number, oneTunnel: boolean): FailoverFrame {
  const t2: TunnelState = oneTunnel ? "off" : "up";
  switch (Math.max(0, Math.min(FAILOVER_STEPS - 1, step))) {
    case 0:
      return { t1: "up", t2, awsEgress: "t1", detecting: false };
    case 1:
      // Replacement has started but nothing has noticed yet.
      return { t1: "replacing", t2, awsEgress: "t1", detecting: false };
    case 2:
      // Tunnel 1 is gone, and until dead peer detection or the BGP hold timer
      // gives up (tens of seconds) traffic still goes into it: an outage
      // even with two tunnels.
      return { t1: "down", t2, awsEgress: null, detecting: true };
    case 3:
      return { t1: "down", t2, awsEgress: oneTunnel ? null : "t2", detecting: false };
    default:
      // Endpoint is back with the same outside IP once the CGW re-initiates.
      return { t1: "up", t2, awsEgress: oneTunnel ? "t1" : "t2", detecting: false };
  }
}
