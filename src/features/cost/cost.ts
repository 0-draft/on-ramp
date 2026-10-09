import type { L } from "@/i18n/lang";

/**
 * Monthly AWS charges for sending data from ap-northeast-1 (Tokyo) to your
 * data center, per path. List on-demand USD from the AWS Price List API as
 * recorded in docs/12-security-and-operations.md ("Unit prices for a
 * calculator"). Excludes tax, carrier circuits, colocation and partner fees.
 */

export const PRICES_AS_OF = "2026-10-10";
export const HOURS = 730;

export const P = {
  internetTiers: [
    { upTo: 10_240, perGb: 0.114 },
    { upTo: 10_240 + 40_960, perGb: 0.089 },
    { upTo: 10_240 + 40_960 + 102_400, perGb: 0.086 },
    { upTo: Infinity, perGb: 0.084 },
  ],
  freeTierGb: 100,
  dxDtoJapan: 0.041,
  dxDedicated1g: 0.285,
  dxDedicated10g: 2.142,
  dxHosted50m: 0.029,
  dxHosted500m: 0.19,
  dxHosted1g: 0.314,
  dxFlat10gTier1: 10.96,
  vpnConnection: 0.048,
  tgwAttachment: 0.07,
  tgwPerGb: 0.02,
  natHour: 0.062,
  natPerGb: 0.062,
} as const;

/** Tiered internet data transfer out. */
export function internetDto(gb: number, freeTier = false): number {
  let left = Math.max(0, gb - (freeTier ? P.freeTierGb : 0));
  let prev = 0;
  let cost = 0;
  for (const tier of P.internetTiers) {
    const inTier = Math.min(left, tier.upTo - prev);
    cost += inTier * tier.perGb;
    left -= inTier;
    prev = tier.upTo;
    if (left <= 0) break;
  }
  return cost;
}

export type OptionId =
  | "internet"
  | "internetNat"
  | "vpn"
  | "dx1g"
  | "dx10g"
  | "hosted50m"
  | "hosted500m"
  | "hosted1g"
  | "flat10g";

export interface Bill {
  id: OptionId;
  /** Port, connection or gateway hours. */
  hourly: number;
  /** Data transfer out. */
  transfer: number;
  /** Per-GB processing by a gateway (Transit Gateway, NAT gateway). */
  processing: number;
  total: number;
}

export interface Inputs {
  gb: number;
  /** Path lands on a Transit Gateway (2 attachments + per-GB processing). */
  viaTgw: boolean;
  freeTier: boolean;
}

export const OPTIONS: {
  id: OptionId;
  route: "internet" | "vpn" | "dx";
  name: L;
  tgw: boolean;
  /** What the option can carry, in Mbps. Undefined: no fixed ceiling. */
  capacityMbps?: number;
}[] = [
  {
    id: "internet",
    route: "internet",
    name: { en: "Internet (IGW)", ja: "インターネット (IGW)" },
    tgw: false,
  },
  {
    id: "internetNat",
    route: "internet",
    name: { en: "Internet via NAT gateway", ja: "インターネット (NAT ゲートウェイ経由)" },
    tgw: false,
  },
  {
    id: "vpn",
    capacityMbps: 1250,
    route: "vpn",
    name: { en: "Site-to-Site VPN", ja: "Site-to-Site VPN" },
    tgw: true,
  },
  {
    id: "hosted50m",
    capacityMbps: 50,
    route: "dx",
    name: { en: "DX hosted 50 Mbps", ja: "DX ホスト接続 50 Mbps" },
    tgw: true,
  },
  {
    id: "hosted500m",
    capacityMbps: 500,
    route: "dx",
    name: { en: "DX hosted 500 Mbps", ja: "DX ホスト接続 500 Mbps" },
    tgw: true,
  },
  {
    id: "hosted1g",
    capacityMbps: 1000,
    route: "dx",
    name: { en: "DX hosted 1 Gbps", ja: "DX ホスト接続 1 Gbps" },
    tgw: true,
  },
  {
    id: "dx1g",
    capacityMbps: 1000,
    route: "dx",
    name: { en: "DX dedicated 1 Gbps", ja: "DX 専用接続 1 Gbps" },
    tgw: true,
  },
  {
    id: "dx10g",
    capacityMbps: 10000,
    route: "dx",
    name: { en: "DX dedicated 10 Gbps", ja: "DX 専用接続 10 Gbps" },
    tgw: true,
  },
  {
    id: "flat10g",
    capacityMbps: 10000,
    route: "dx",
    name: { en: "DX 10 Gbps flat-rate, Tier 1", ja: "DX 10 Gbps 定額 (Tier 1)" },
    tgw: true,
  },
];

const round = (n: number) => Math.round(n * 100) / 100;

export function bill(id: OptionId, { gb, viaTgw, freeTier }: Inputs): Bill {
  let hourly = 0;
  let transfer = 0;
  let processing = 0;
  const dx = gb * P.dxDtoJapan;
  switch (id) {
    case "internet":
      transfer = internetDto(gb, freeTier);
      break;
    case "internetNat":
      transfer = internetDto(gb, freeTier);
      hourly = P.natHour * HOURS;
      processing = gb * P.natPerGb;
      break;
    case "vpn":
      // VPN data transfer out is priced like the internet.
      transfer = internetDto(gb, freeTier);
      hourly = P.vpnConnection * HOURS;
      break;
    case "dx1g":
      hourly = P.dxDedicated1g * HOURS;
      transfer = dx;
      break;
    case "dx10g":
      hourly = P.dxDedicated10g * HOURS;
      transfer = dx;
      break;
    case "hosted50m":
      hourly = P.dxHosted50m * HOURS;
      transfer = dx;
      break;
    case "hosted500m":
      hourly = P.dxHosted500m * HOURS;
      transfer = dx;
      break;
    case "hosted1g":
      hourly = P.dxHosted1g * HOURS;
      transfer = dx;
      break;
    case "flat10g":
      // Data transfer to Regions inside the tier is included.
      hourly = P.dxFlat10gTier1 * HOURS;
      break;
  }
  const opt = OPTIONS.find((o) => o.id === id)!;
  if (viaTgw && opt.tgw) {
    // Two attachments (the VPC and the VPN or DX gateway) plus processing,
    // which flat-rate pricing does not cover.
    hourly += 2 * P.tgwAttachment * HOURS;
    processing += gb * P.tgwPerGb;
  }
  return {
    id,
    hourly: round(hourly),
    transfer: round(transfer),
    processing: round(processing),
    total: round(hourly + transfer + processing),
  };
}

export function bills(inputs: Inputs): Bill[] {
  return OPTIONS.map((o) => bill(o.id, inputs));
}

/** Average bit rate of a monthly volume, in Mbps (GB = 10^9 bytes). */
export function avgMbps(gb: number): number {
  return (gb * 8e9) / (HOURS * 3600) / 1e6;
}

/**
 * True when the option cannot carry the month's volume even at a perfectly
 * flat average rate, before any peak or failover headroom. (A VPN is capped
 * by one 1.25 Gbps tunnel's worth of AWS-to-you egress on a VGW.)
 */
export function tooSmall(id: OptionId, gb: number): boolean {
  const cap = OPTIONS.find((o) => o.id === id)!.capacityMbps;
  return cap !== undefined && avgMbps(gb) > cap;
}

/**
 * Monthly GB at which a DX option's fixed hours are paid back by its cheaper
 * per-GB rate versus the internet's first tier.
 */
export function dxBreakEvenGb(hourly: number): number {
  return (hourly * HOURS) / (P.internetTiers[0].perGb - P.dxDtoJapan);
}

/**
 * Monthly GB at which one 10G flat-rate port (Tier 1) beats one 10G
 * pay-as-you-go port plus $0.041/GB. A redundant port-pair compares
 * differently; Cross Connect's pricing section covers pairs.
 */
export function flatBreakEvenGb(): number {
  return ((P.dxFlat10gTier1 - P.dxDedicated10g) * HOURS) / P.dxDtoJapan;
}

/** The volume slider is logarithmic: 10 GB to 500 TB in one sweep. */
export const SLIDER = { min: 1, max: Math.log10(512_000), step: 0.01 } as const;

/** Slider position (log10 GB) to a round volume (2 significant figures). */
export function gbAt(pos: number): number {
  const g = 10 ** pos;
  const mag = 10 ** Math.max(0, Math.floor(Math.log10(g)) - 1);
  return Math.round(g / mag) * mag;
}
