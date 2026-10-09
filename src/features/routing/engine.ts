import { contains, ipToInt, parseCidr } from "@/lib/cidr";

/**
 * How each AWS hub picks between routes your network advertises, encoded
 * from the documented evaluation orders (docs/06-routing-and-path-selection.md):
 *
 * - VGW: health > longest prefix > DX BGP > VPN static > VPN BGP > AS_PATH > MED (AS_PATH
 *   and MED only between BGP VPN routes); one path, no ECMP.
 * - TGW: health > longest prefix > static (incl. VPN static) > DXGW > Connect > VPN BGP
 *   > AS_PATH > MED (defaults DX 0, VPN/Connect 100) > ECMP for VPN (if enabled), DXGW, Connect.
 * - Cloud WAN: health > longest prefix > (static) > AS_PATH > MED > DXGW > Connect > VPN
 *   > ECMP for BGP VPN (vpn-ecmp-support, default on) and Connect. Static VPNs cannot
 *   attach to Cloud WAN, and the lab has no other static routes, so the static tier
 *   never decides anything here.
 *
 * Static VPN routes carry no AS_PATH, so AS_PATH never knocks one out.
 */

export type Hub = "vgw" | "tgw" | "cloudwan";
export type PathKind = "dx" | "vpn" | "connect";

export interface Advert {
  id: string;
  path: PathKind;
  prefix: string;
  /** Only for VPN. */
  vpnRouting?: "bgp" | "static";
  /** Number of ASes in AS_PATH as AWS sees it (1 = no prepend). */
  asPath: number;
  /** MED if you send one. */
  med?: number;
  /** BGP up / tunnel up. */
  up: boolean;
}

export type Rule =
  | "unsupported"
  | "health"
  | "match"
  | "longest"
  | "type"
  | "aspath"
  | "med"
  | "ecmp"
  | "pick";

export interface Step {
  rule: Rule;
  /** Candidates still in the race after this step. */
  kept: string[];
  /** Candidates knocked out at this step. */
  dropped: string[];
}

export interface Decision {
  winners: string[];
  ecmp: boolean;
  steps: Step[];
}

/** Lower rank wins. */
function typeRank(hub: Hub, a: Advert): number {
  const static_ = a.path === "vpn" && a.vpnRouting === "static";
  if (hub === "vgw") return a.path === "dx" ? 0 : static_ ? 1 : 2;
  if (hub === "tgw") {
    if (static_) return 0;
    return { dx: 1, connect: 2, vpn: 3 }[a.path];
  }
  // Cloud WAN compares attachment type only after AS_PATH and MED.
  return { dx: 0, connect: 1, vpn: 2 }[a.path];
}

const isStaticVpn = (a: Advert) => a.path === "vpn" && a.vpnRouting === "static";
const isBgpVpn = (a: Advert) => a.path === "vpn" && a.vpnRouting !== "static";

/** AS_PATH length as compared; a static route has none, so it is never longer. */
const pathLen = (a: Advert) => (isStaticVpn(a) ? 0 : a.asPath);

function medOf(hub: Hub, a: Advert): number {
  if (a.med !== undefined) return a.med;
  if (hub === "tgw") return a.path === "dx" ? 0 : 100;
  return 0;
}

function unsupported(hub: Hub, a: Advert): boolean {
  // A VGW has no Connect attachments; Cloud WAN VPN attachments must use BGP.
  if (hub === "vgw" && a.path === "connect") return true;
  if (hub === "cloudwan" && a.path === "vpn" && a.vpnRouting === "static") return true;
  return false;
}

function keepMin(
  steps: Step[],
  rule: Rule,
  pool: Advert[],
  score: (a: Advert) => number,
): Advert[] {
  if (pool.length === 0) return pool;
  const best = Math.min(...pool.map(score));
  const kept = pool.filter((a) => score(a) === best);
  steps.push({
    rule,
    kept: kept.map((a) => a.id),
    dropped: pool.filter((a) => score(a) !== best).map((a) => a.id),
  });
  return kept;
}

function filterStep(
  steps: Step[],
  rule: Rule,
  pool: Advert[],
  ok: (a: Advert) => boolean,
): Advert[] {
  const kept = pool.filter(ok);
  steps.push({
    rule,
    kept: kept.map((a) => a.id),
    dropped: pool.filter((a) => !ok(a)).map((a) => a.id),
  });
  return kept;
}

export function decide(
  hub: Hub,
  dst: string,
  adverts: Advert[],
  opts: { vpnEcmp?: boolean } = {},
): Decision {
  const steps: Step[] = [];
  const ip = ipToInt(dst);
  let pool = filterStep(steps, "unsupported", adverts, (a) => !unsupported(hub, a));
  pool = filterStep(steps, "health", pool, (a) => a.up);
  pool = filterStep(steps, "match", pool, (a) => {
    const c = parseCidr(a.prefix);
    return ip !== null && c !== null && contains(c, ip);
  });
  pool = keepMin(steps, "longest", pool, (a) => -parseCidr(a.prefix)!.len);

  if (hub === "cloudwan") {
    // BGP attributes first, attachment type last.
    pool = keepMin(steps, "aspath", pool, pathLen);
    pool = keepMin(steps, "med", pool, (a) => medOf(hub, a));
    pool = keepMin(steps, "type", pool, (a) => typeRank(hub, a));
  } else {
    pool = keepMin(steps, "type", pool, (a) => typeRank(hub, a));
    // A VGW compares AS_PATH and MED only between BGP VPN routes; a TGW
    // compares them within one attachment type, which is all that is left.
    if (hub === "tgw" || (pool.length > 0 && pool.every(isBgpVpn))) {
      pool = keepMin(steps, "aspath", pool, pathLen);
      pool = keepMin(steps, "med", pool, (a) => medOf(hub, a));
    }
  }

  if (pool.length <= 1) {
    return { winners: pool.map((a) => a.id), ecmp: false, steps };
  }

  // Several identical routes are left. Only TGW and Cloud WAN spread traffic
  // across them, never across attachment types, and never for static VPNs.
  // A VGW always uses one. Cloud WAN's VPN ECMP (vpn-ecmp-support) is on by
  // default; AWS documents no Cloud WAN ECMP across DX gateway attachments.
  const kind = pool[0].path;
  const sameKind = pool.every((a) => a.path === kind);
  const anyStatic = pool.some(isStaticVpn);
  const ecmp =
    sameKind &&
    !anyStatic &&
    ((hub === "tgw" &&
      (kind === "dx" || kind === "connect" || (kind === "vpn" && !!opts.vpnEcmp))) ||
      (hub === "cloudwan" && (kind === "connect" || kind === "vpn")));
  if (ecmp) {
    steps.push({ rule: "ecmp", kept: pool.map((a) => a.id), dropped: [] });
    return { winners: pool.map((a) => a.id), ecmp: true, steps };
  }
  steps.push({
    rule: "pick",
    kept: [pool[0].id],
    dropped: pool.slice(1).map((a) => a.id),
  });
  return { winners: [pool[0].id], ecmp: false, steps };
}
