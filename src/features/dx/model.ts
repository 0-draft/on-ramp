import type { L } from "@/i18n/lang";

/**
 * Direct Connect facts the DX section draws from, as plain data and pure
 * functions (docs/04-direct-connect.md, verified 2026-10-10).
 */

export type Vif = "private" | "transit" | "public";

export interface VifFacts {
  /** What ends up reachable. */
  reach: L;
  /** The AWS object the VIF attaches to. */
  via: L;
  mtu: number[];
  /** Prefixes you may advertise into AWS on one BGP session. */
  inbound: L;
  sitelink: L;
}

export const VIF_FACTS: Record<Vif, VifFacts> = {
  private: {
    reach: { en: "VPC private IPs", ja: "VPC のプライベート IP" },
    via: {
      en: "A VGW (same Region only) or a DX gateway (up to 20 VGWs)",
      ja: "VGW (同一リージョンのみ) か DX ゲートウェイ (VGW 最大 20 個)",
    },
    mtu: [1500, 9001],
    inbound: {
      en: "100 per address family by default, up to 1,000 with prefix controls (2026-08)",
      ja: "アドレスファミリーごとに既定 100、プレフィックス制御で最大 1,000 (2026-08)",
    },
    sitelink: {
      en: "Only when attached to a DX gateway",
      ja: "DX ゲートウェイに接続時のみ",
    },
  },
  transit: {
    reach: {
      en: "VPCs and VPNs behind Transit Gateways, or a Cloud WAN segment",
      ja: "Transit Gateway の先の VPC・VPN、または Cloud WAN のセグメント",
    },
    via: {
      en: "A DX gateway only (up to 6 TGWs, or one Cloud WAN attachment)",
      ja: "DX ゲートウェイのみ (TGW 最大 6 個、または Cloud WAN アタッチメント 1 つ)",
    },
    mtu: [1500, 8500],
    inbound: {
      en: "100 per address family by default, up to 1,000 with prefix controls (2026-08)",
      ja: "アドレスファミリーごとに既定 100、プレフィックス制御で最大 1,000 (2026-08)",
    },
    sitelink: { en: "Yes", ja: "可" },
  },
  public: {
    reach: {
      en: "AWS public endpoints in all public Regions, not the internet",
      ja: "全パブリックリージョンの AWS パブリックエンドポイント (インターネットではない)",
    },
    via: {
      en: "Nothing: AWS's own routers (ASN 7224)",
      ja: "なし: AWS 自身のルーター (ASN 7224)",
    },
    mtu: [1500],
    inbound: { en: "1,000, not adjustable", ja: "1,000 (変更不可)" },
    sitelink: { en: "No", ja: "不可" },
  },
};

/** Largest MTU a VIF type can carry. */
export function maxMtu(vif: Vif): number {
  return Math.max(...VIF_FACTS[vif].mtu);
}

/* ---------------------------------------------------------------------- */
/* Encryption: which stretch of the DX path is encrypted.                  */

export type Seg = "carrier" | "crossConnect" | "awsSide";
export type Crypto = "none" | "macsec" | "ipsec";

export const SEGMENTS: Seg[] = ["carrier", "crossConnect", "awsSide"];

/**
 * DX itself encrypts nothing. MACsec covers only the cross connect between
 * your device and AWS's (hop by hop). Private IP VPN over a transit VIF is
 * IPsec from your router to the Transit Gateway, so every stretch.
 */
export function encrypted(c: Crypto): Record<Seg, boolean> {
  return {
    carrier: c === "ipsec",
    crossConnect: c === "ipsec" || c === "macsec",
    awsSide: c === "ipsec",
  };
}
