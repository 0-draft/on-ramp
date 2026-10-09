import type { L } from "@/i18n/lang";

export type LzPath = "dxvgw" | "dxtgw" | "vpn" | "internet";
export const LZ: Record<LzPath, { label: L; hairpin: boolean; why: L }> = {
  dxvgw: {
    label: { en: "DX → VGW", ja: "DX → VGW" },
    hairpin: false,
    why: {
      en: "A private VIF to a VGW takes the shortest path to the Local Zone, not through the parent Region.",
      ja: "VGW へのプライベート VIF は最短経路で Local Zone へ。親リージョンを経由しません。",
    },
  },
  dxtgw: {
    label: { en: "DX → Transit Gateway", ja: "DX → Transit Gateway" },
    hairpin: true,
    why: {
      en: "Transit Gateway cannot attach Local Zone subnets, so traffic detours through the parent Region and loses the latency benefit.",
      ja: "Transit Gateway は Local Zone のサブネットをアタッチできないため、親リージョンを迂回して低遅延の利点が消えます。",
    },
  },
  vpn: {
    label: { en: "Site-to-Site VPN", ja: "Site-to-Site VPN" },
    hairpin: true,
    why: {
      en: "The VPN terminates in the parent Region (VGW or TGW), so it hairpins too. A self-managed VPN on EC2 in the Local Zone is the workaround.",
      ja: "VPN は親リージョン (VGW / TGW) で終端するので、これも迂回します。回避策は Local Zone 内 EC2 で自前の VPN。",
    },
  },
  internet: {
    label: { en: "Internet", ja: "インターネット" },
    hairpin: false,
    why: {
      en: "Internet traffic enters and leaves from the Local Zone itself.",
      ja: "インターネット通信は Local Zone 自体から出入りします。",
    },
  },
};
