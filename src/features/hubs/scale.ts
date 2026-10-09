import type { L } from "@/i18n/lang";

/**
 * What each hub design needs as you add VPCs, Regions and sites, and which
 * documented quota you run into first (docs/04-direct-connect.md and
 * docs/05-hubs.md, verified 2026-10-10).
 *
 * Assumptions, stated on screen too: every site has one dedicated DX
 * connection; VPCs are spread evenly across Regions, and there are never more
 * Regions than VPCs; only VPC, DX and peering attachment-hours or core network
 * edges are priced (Tokyo list prices, 730 h/month).
 */

export type Design = "vgw" | "dxgw" | "tgw" | "cloudwan";

export interface Input {
  vpcs: number;
  regions: number;
  sites: number;
}

export interface Limit {
  /** Hard stop (cannot be raised) or a quota you can raise. */
  hard: boolean;
  text: L;
}

export interface Plan {
  /** Gateways, TGWs or core network edges you run. */
  hubs: number;
  /** VGW associations or hub attachments. */
  attachments: number;
  /** VIFs you configure across all sites (one BGP session each per family). */
  vifs: number;
  /** Links between Regions you have to build and route yourself. */
  interRegion: number;
  vpcToVpc: boolean;
  /** False when some VPCs cannot be reached at all with this design. */
  reachesAll: boolean;
  /** Hub charges per month in USD, Tokyo, attachment/edge hours only. */
  monthly: number;
  limits: Limit[];
}

const H = 730;
export const PRICE = {
  tgwAttachment: 0.07,
  cwanEdge: 0.5,
  cwanAttachment: 0.09,
};

/** Quotas used below. */
export const Q = {
  vgwsPerDxgw: 20, // hard
  vifsPerDxgw: 30, // hard
  tgwsPerDxgw: 6, // hard
  vifsPerConnection: 50, // private/public VIFs on a dedicated connection
  transitVifsPerConnection: 4,
  vgwsPerRegion: 5, // default, adjustable
  propagatedRoutes: 100, // hard, per VPC route table
  tgwPeerings: 50, // default, adjustable
};

const ceil = Math.ceil;

export function plan(design: Design, input: Input): Plan {
  const { vpcs, sites } = input;
  // A Region with no VPC needs no hub: clamp so the counts stay meaningful.
  const regions = Math.max(1, Math.min(input.regions, vpcs));
  const perRegion = ceil(vpcs / regions);
  const limits: Limit[] = [];

  if (design === "vgw") {
    // A private VIF straight to each VPC's VGW, from every site.
    const vifs = vpcs * sites;
    if (regions > 1)
      limits.push({
        hard: true,
        text: {
          en: "A private VIF attaches to a VGW in the same Region only: VPCs in other Regions are unreachable this way.",
          ja: "プライベート VIF を直接つなげる VGW は同じリージョンのものだけ。他リージョンの VPC にはこの方法では届きません。",
        },
      });
    if (vpcs > Q.vifsPerConnection)
      limits.push({
        hard: true,
        text: {
          en: `More than ${Q.vifsPerConnection} private/public VIFs on one dedicated connection.`,
          ja: `1 本の専用接続にプライベート/パブリック VIF が ${Q.vifsPerConnection} 個を超える。`,
        },
      });
    if (perRegion > Q.vgwsPerRegion)
      limits.push({
        hard: false,
        text: {
          en: `More than ${Q.vgwsPerRegion} VGWs in a Region (default quota, adjustable).`,
          ja: `1 リージョンの VGW が ${Q.vgwsPerRegion} 個を超える (既定クォータ、引き上げ可)。`,
        },
      });
    return {
      hubs: vpcs,
      attachments: vpcs,
      vifs,
      interRegion: 0,
      vpcToVpc: false,
      reachesAll: regions === 1,
      monthly: 0,
      limits,
    };
  }

  if (design === "dxgw") {
    // One DX gateway per 20 VGWs; each site needs a private VIF to each DXGW.
    const dxgws = ceil(vpcs / Q.vgwsPerDxgw);
    const vifs = sites * dxgws;
    if (dxgws > 1)
      limits.push({
        hard: true,
        text: {
          en: `${Q.vgwsPerDxgw} VGWs per DX gateway (hard): you need ${dxgws} DX gateways and a VIF from every site to each.`,
          ja: `DX ゲートウェイあたり VGW は ${Q.vgwsPerDxgw} 個まで (固定): DX ゲートウェイが ${dxgws} 個必要で、各拠点からそれぞれに VIF を張ります。`,
        },
      });
    if (sites > Q.vifsPerDxgw)
      limits.push({
        hard: true,
        text: {
          en: `More than ${Q.vifsPerDxgw} VIFs on one DX gateway (hard).`,
          ja: `1 つの DX ゲートウェイに VIF が ${Q.vifsPerDxgw} 個を超える (固定)。`,
        },
      });
    if (perRegion > Q.vgwsPerRegion)
      limits.push({
        hard: false,
        text: {
          en: `More than ${Q.vgwsPerRegion} VGWs in a Region (default quota, adjustable).`,
          ja: `1 リージョンの VGW が ${Q.vgwsPerRegion} 個を超える (既定クォータ、引き上げ可)。`,
        },
      });
    limits.push({
      hard: true,
      text: {
        en: `Each VPC route table takes at most ${Q.propagatedRoutes} propagated routes from its VGW (hard), however many prefixes the VIF accepts.`,
        ja: `各 VPC ルートテーブルが VGW から受け取れる伝播ルートは ${Q.propagatedRoutes} 個まで (固定)。VIF 側の上限とは無関係。`,
      },
    });
    return {
      hubs: vpcs + dxgws,
      attachments: vpcs,
      vifs,
      interRegion: 0,
      vpcToVpc: false,
      reachesAll: true,
      monthly: 0,
      limits,
    };
  }

  if (design === "tgw") {
    // One Transit Gateway per Region; one DX gateway per 6 TGWs; transit VIFs.
    const dxgws = ceil(regions / Q.tgwsPerDxgw);
    const vifs = sites * dxgws;
    const peerings = (regions * (regions - 1)) / 2;
    const attachments = vpcs + regions;
    if (dxgws > 1)
      limits.push({
        hard: true,
        text: {
          en: `${Q.tgwsPerDxgw} Transit Gateways per DX gateway (hard): you need ${dxgws} DX gateways.`,
          ja: `DX ゲートウェイあたり Transit Gateway は ${Q.tgwsPerDxgw} 個まで (固定): DX ゲートウェイが ${dxgws} 個必要。`,
        },
      });
    if (dxgws > Q.transitVifsPerConnection)
      limits.push({
        hard: true,
        text: {
          en: `More than ${Q.transitVifsPerConnection} transit VIFs on one dedicated connection.`,
          ja: `1 本の専用接続にトランジット VIF が ${Q.transitVifsPerConnection} 個を超える。`,
        },
      });
    if (regions - 1 > Q.tgwPeerings)
      limits.push({
        hard: false,
        text: {
          en: "More than 50 peerings on one TGW.",
          ja: "1 つの TGW のピアリングが 50 を超える。",
        },
      });
    if (peerings > 0)
      limits.push({
        hard: false,
        text: {
          en: `${peerings} Transit Gateway ${peerings === 1 ? "peering" : "peerings"} between Regions, static routes only: no automatic failover between Regions.`,
          ja: `リージョン間に Transit Gateway ピアリングが ${peerings} 本。静的ルートのみで、リージョン間の自動フェイルオーバーはなし。`,
        },
      });
    return {
      hubs: regions + dxgws,
      attachments,
      vifs,
      interRegion: peerings,
      vpcToVpc: true,
      reachesAll: true,
      // A peering is billed as an attachment-hour too (at least once; whether
      // both owners pay per peering is not documented, so count it once).
      monthly: (attachments + peerings) * PRICE.tgwAttachment * H,
      limits,
    };
  }

  // Cloud WAN: one core network edge per Region, one DX gateway attachment.
  const attachments = vpcs + 1;
  return {
    hubs: regions + 1,
    attachments,
    vifs: sites,
    interRegion: 0,
    vpcToVpc: true,
    reachesAll: true,
    monthly: regions * PRICE.cwanEdge * H + attachments * PRICE.cwanAttachment * H,
    limits: [
      {
        hard: false,
        text: {
          en: "Every core network edge bills $0.50/hour in every Region, traffic or not.",
          ja: "コアネットワークエッジは通信の有無に関係なく、リージョンごとに 1 時間 $0.50 かかります。",
        },
      },
    ],
  };
}
