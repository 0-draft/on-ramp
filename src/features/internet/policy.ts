/**
 * What an S3 bucket policy sees, depending on the road the request took
 * (docs/08-internet-paths.md, "Source IP allowlisting"):
 *
 * - `aws:SourceIp` is the requester's public IP, and is absent when the call
 *   comes through a VPC endpoint.
 * - Through an endpoint, `aws:SourceVpce` / `aws:SourceVpc` are set instead.
 *
 * Addresses are documentation ranges (RFC 5737).
 */

export type Arrival = "internet" | "endpoint" | "publicVif" | "nat";
export type Condition = "sourceIp" | "sourceVpce" | "both";

export const OFFICE_EGRESS = "203.0.113.10";
export const OFFICE_CIDR = "203.0.113.0/24";
export const VIF_PREFIX_IP = "198.51.100.20";
export const NAT_IP = "192.0.2.44";
export const VPCE_ID = "vpce-0abc";

export interface RequestContext {
  sourceIp: string | null;
  sourceVpce: string | null;
}

export function contextFor(arrival: Arrival): RequestContext {
  switch (arrival) {
    case "internet":
      // The corporate proxy / NAT egress address is what AWS sees.
      return { sourceIp: OFFICE_EGRESS, sourceVpce: null };
    case "publicVif":
      // Your own public prefix advertised on the VIF, not the office egress.
      return { sourceIp: VIF_PREFIX_IP, sourceVpce: null };
    case "nat":
      return { sourceIp: NAT_IP, sourceVpce: null };
    case "endpoint":
      return { sourceIp: null, sourceVpce: VPCE_ID };
  }
}

function inOfficeCidr(ip: string): boolean {
  return ip.startsWith("203.0.113.");
}

export interface Verdict {
  allowed: boolean;
  ctx: RequestContext;
  /** Which statement matched, if any. */
  matched: "sourceIp" | "sourceVpce" | null;
}

/** The bucket denies everything that does not match the condition. */
export function evaluate(arrival: Arrival, cond: Condition): Verdict {
  const ctx = contextFor(arrival);
  const ipOk =
    (cond === "sourceIp" || cond === "both") &&
    ctx.sourceIp !== null &&
    inOfficeCidr(ctx.sourceIp);
  const vpceOk = (cond === "sourceVpce" || cond === "both") && ctx.sourceVpce === VPCE_ID;
  return {
    allowed: ipOk || vpceOk,
    ctx,
    matched: ipOk ? "sourceIp" : vpceOk ? "sourceVpce" : null,
  };
}
