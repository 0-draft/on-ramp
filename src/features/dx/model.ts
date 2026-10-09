import type { L } from "@/i18n/lang";

/**
 * Direct Connect facts the DX section draws from, as plain data and pure
 * functions (docs/04-direct-connect.md, verified 2026-10-10). Depth (prefix
 * limits, SiteLink, the full MTU table) lives in Cross Connect, not here.
 */

export type Vif = "private" | "transit" | "public";

export interface VifFacts {
  /** What ends up reachable. */
  reach: L;
  /** The AWS object the VIF attaches to. */
  via: L;
  /** Largest MTU the VIF type carries. */
  mtu: number;
}

export const VIF_FACTS: Record<Vif, VifFacts> = {
  private: {
    reach: { en: "VPC private IPs", ja: "VPC のプライベート IP" },
    via: {
      en: "a VGW (same Region) or a DX gateway",
      ja: "VGW (同一リージョン) か DX ゲートウェイ",
    },
    mtu: 9001,
  },
  transit: {
    reach: {
      en: "VPCs behind Transit Gateways, or a Cloud WAN segment",
      ja: "Transit Gateway の先の VPC、または Cloud WAN のセグメント",
    },
    via: { en: "a DX gateway only", ja: "DX ゲートウェイのみ" },
    mtu: 8500,
  },
  public: {
    reach: {
      en: "AWS public endpoints in every public Region, not the internet",
      ja: "全パブリックリージョンの AWS パブリックエンドポイント (インターネットではない)",
    },
    via: { en: "AWS's own routers", ja: "AWS 自身のルーター" },
    mtu: 1500,
  },
};

/* ---------------------------------------------------------------------- */
/* The DX path, stretch by stretch: who owns it and what encrypts it.      */

export type Seg = "carrier" | "crossConnect" | "awsSide";
export type Crypto = "none" | "macsec" | "ipsec";
/** "maybe": depends on where your MACsec device sits (see below). */
export type Cover = "yes" | "no" | "maybe";

export const SEGMENTS: Seg[] = ["carrier", "crossConnect", "awsSide"];

/**
 * DX itself encrypts nothing. MACsec is hop by hop between your MACsec device
 * and the AWS device, which need a direct Layer 2 adjacency: it always covers
 * the cross connect, and covers the carrier circuit only if your device is at
 * your end and the carrier passes Layer 2 through. Private IP VPN is IPsec
 * from your router to the Transit Gateway, so every stretch.
 */
export function encrypted(c: Crypto): Record<Seg, Cover> {
  if (c === "ipsec") return { carrier: "yes", crossConnect: "yes", awsSide: "yes" };
  if (c === "macsec") return { carrier: "maybe", crossConnect: "yes", awsSide: "no" };
  return { carrier: "no", crossConnect: "no", awsSide: "no" };
}
