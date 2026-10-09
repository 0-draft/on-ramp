/** IPv4 helpers for the labs. Addresses are unsigned 32-bit integers. */

export function ipToInt(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

export interface Cidr {
  base: number;
  len: number;
}

export function parseCidr(s: string): Cidr | null {
  const [ip, l] = s.trim().split("/");
  const base = ipToInt(ip ?? "");
  const len = Number(l);
  if (base === null || !/^\d{1,2}$/.test(l ?? "") || len > 32) return null;
  return { base: (base & maskOf(len)) >>> 0, len };
}

function maskOf(len: number): number {
  return len === 0 ? 0 : (~0 << (32 - len)) >>> 0;
}

export function contains(c: Cidr, ip: number): boolean {
  return (ip & maskOf(c.len)) >>> 0 === c.base;
}
