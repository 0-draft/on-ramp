import { contains, parseCidr } from "@/lib/cidr";

export function intToIp(n: number): string {
  return [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
}

export interface PrefixInfo {
  network: string;
  first: string;
  last: string;
  /** Total addresses in the block, as AWS counts them before reserving any. */
  count: number;
}

/** What a prefix length means for a block: its range and size. */
export function prefixInfo(ip: string, len: number): PrefixInfo | null {
  const c = parseCidr(`${ip}/${len}`);
  if (!c) return null;
  const count = 2 ** (32 - c.len);
  const last = c.base + count - 1;
  return {
    network: `${intToIp(c.base)}/${c.len}`,
    first: intToIp(c.base),
    last: intToIp(last),
    count,
  };
}

export interface SignRoute {
  prefix: string;
  target: string;
}

/**
 * Longest prefix match over a route table: every matching route is a
 * candidate and the most specific one wins. Returns the winner's index, or -1.
 */
export function longestMatch(dst: number, routes: SignRoute[]): number {
  let best = -1;
  let bestLen = -1;
  routes.forEach((r, i) => {
    const c = parseCidr(r.prefix);
    if (c && contains(c, dst) && c.len > bestLen) {
      best = i;
      bestLen = c.len;
    }
  });
  return best;
}
