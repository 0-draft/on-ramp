import type { L } from "@/i18n/lang";

/**
 * Maximum packet sizes per path, from docs/12-security-and-operations.md
 * (MTU and MSS across all paths), docs/02 (VPN MTU by algorithm) and docs/03
 * (GRE overhead). Sizes are IP packet sizes in bytes; MSS is MTU minus 40
 * (20-byte IPv4 header + 20-byte TCP header), which is how AWS's own pairs
 * line up (1446 / 1406, 1406 / 1366).
 */

export type MtuPathId =
  | "internet"
  | "vpnGcm"
  | "vpnCbc"
  | "privateVif"
  | "transitVif"
  | "connect"
  | "privatelink";

/** Whether Path MTU Discovery rescues an oversize packet on this path. */
export type Pmtud = "yes" | "no" | "undocumented";

export interface Wrapper {
  label: L;
  bytes: number;
  /** Encrypted payload under this wrapper (drawn hatched). */
  encrypts?: boolean;
}

export interface MtuPath {
  id: MtuPathId;
  route: "internet" | "vpn" | "dx" | "sdwan" | "private";
  name: L;
  /** Largest inner IP packet that fits. */
  mtu: number;
  /** Outer packet size the wrappers ride in, if this path encapsulates. */
  outer?: number;
  wrappers: Wrapper[];
  pmtud: Pmtud;
  /** AWS rewrites the TCP MSS on this path, so TCP never sends too big. */
  /** MSS clamping by AWS: true on this path, "tgw" when only a Transit Gateway
   * termination is documented to clamp (a VGW is not), false when not. */
  clamp: boolean | "tgw";
  note: L;
}

export const IP_TCP = 40;

export const MTU_PATHS: MtuPath[] = [
  {
    id: "internet",
    route: "internet",
    name: {
      en: "Internet (internet gateway)",
      ja: "インターネット (インターネットゲートウェイ)",
    },
    mtu: 1500,
    wrappers: [],
    pmtud: "yes",
    clamp: false,
    note: {
      en: "1500 through an internet gateway. Path MTU Discovery works, but only if your firewalls let ICMP type 3 code 4 (fragmentation needed) through.",
      ja: "インターネットゲートウェイ経由は 1500。パス MTU 検出 (PMTUD) は機能するが、ファイアウォールが ICMP type 3 code 4 (fragmentation needed) を通す場合に限る。",
    },
  },
  {
    id: "vpnGcm",
    route: "vpn",
    name: {
      en: "Site-to-Site VPN, AES-GCM, no NAT-T",
      ja: "Site-to-Site VPN (AES-GCM、NAT-T なし)",
    },
    mtu: 1446,
    outer: 1500,
    wrappers: [
      {
        label: { en: "Outer IP + ESP (IPsec)", ja: "外側 IP + ESP (IPsec)" },
        bytes: 54,
        encrypts: true,
      },
    ],
    pmtud: "no",
    clamp: "tgw",
    note: {
      en: "The best case: MTU 1446, MSS 1406, reachable only with AES-GCM and NAT-T off. No jumbo frames, no PMTUD. A Transit Gateway clamps MSS on VPN attachments (a VGW is not documented to), so set MSS 1406 or lower on your customer gateway too and fragment before encryption.",
      ja: "最良のケース: MTU 1446・MSS 1406 (AES-GCM で NAT-T 無効のときのみ)。ジャンボフレームも PMTUD もなし。Transit Gateway は VPN アタッチメントで MSS をクランプする (VGW は記載なし) が、カスタマーゲートウェイでも MSS を 1406 以下にし、暗号化の前にフラグメントする。",
    },
  },
  {
    id: "vpnCbc",
    route: "vpn",
    name: {
      en: "Site-to-Site VPN, AES-CBC + SHA2-512, NAT-T",
      ja: "Site-to-Site VPN (AES-CBC + SHA2-512、NAT-T あり)",
    },
    mtu: 1406,
    outer: 1500,
    wrappers: [
      {
        label: {
          en: "Outer IP + UDP 4500 (NAT-T) + ESP",
          ja: "外側 IP + UDP 4500 (NAT-T) + ESP",
        },
        bytes: 94,
        encrypts: true,
      },
    ],
    pmtud: "no",
    clamp: "tgw",
    note: {
      en: "The worst case in AWS's table: bigger cipher padding, a bigger integrity check and the NAT-T UDP header leave 1406 bytes (MSS 1366).",
      ja: "AWS の表で最悪のケース: CBC のパディング、大きな整合性チェック値、NAT-T の UDP ヘッダーで 1406 バイト (MSS 1366) まで減る。",
    },
  },
  {
    id: "privateVif",
    route: "dx",
    name: {
      en: "Direct Connect private VIF (jumbo)",
      ja: "Direct Connect プライベート VIF (ジャンボ)",
    },
    mtu: 9001,
    wrappers: [],
    pmtud: "undocumented",
    clamp: false,
    note: {
      en: "1500 or 9001. Switching to jumbo can flap the connection for up to 30 seconds. If a VPN or another VIF advertises the same prefix with a different MTU, AWS uses 1500 for that prefix.",
      ja: "1500 か 9001。ジャンボへの変更で接続が最大 30 秒フラップすることがある。VPN や別の VIF が同じプレフィックスを異なる MTU で広告すると、そのプレフィックスは 1500 になる。",
    },
  },
  {
    id: "transitVif",
    route: "dx",
    name: {
      en: "Direct Connect transit VIF → Transit Gateway",
      ja: "Direct Connect トランジット VIF → Transit Gateway",
    },
    mtu: 8500,
    wrappers: [],
    pmtud: "no",
    clamp: true,
    note: {
      en: "1500 or 8500, not 9001. Transit Gateway clamps MSS on all packets, but does PMTUD only for traffic entering on VPC and Connect attachments, not on DX.",
      ja: "1500 か 8500 で、9001 ではない。Transit Gateway は全パケットで MSS をクランプするが、PMTUD は VPC と Connect アタッチメントから入る通信だけで、DX からは対象外。",
    },
  },
  {
    id: "connect",
    route: "sdwan",
    name: {
      en: "Transit Gateway Connect (GRE over a 1500 path)",
      ja: "Transit Gateway Connect (1500 の経路上の GRE)",
    },
    mtu: 1476,
    outer: 1500,
    wrappers: [{ label: { en: "Outer IP + GRE", ja: "外側 IP + GRE" }, bytes: 24 }],
    pmtud: "undocumented",
    // TGW clamps only to its own 8500; it cannot see the 1500 underlay.
    clamp: false,
    note: {
      en: "GRE costs 24 bytes: 1476 inside a 1500 underlay. Transit Gateway takes 8500 on Connect and clamps MSS only to its own 8500, so over a 1500 underlay set MSS 1436 on your SD-WAN appliance. Whether anyone reports a too-big packet below 8500 depends on that appliance. GRE is not encryption.",
      ja: "GRE は 24 バイト: 下回りが 1500 なら内側 1476。Transit Gateway は Connect で 8500 まで受け、MSS クランプも自身の 8500 基準。下回りが 1500 なら SD-WAN 機器側で MSS を 1436 に。8500 未満で大きすぎるパケットを誰が知らせるかもその機器次第。GRE は暗号化ではありません。",
    },
  },
  {
    id: "privatelink",
    route: "private",
    name: {
      en: "PrivateLink interface endpoint",
      ja: "PrivateLink インターフェイスエンドポイント",
    },
    mtu: 8500,
    wrappers: [],
    pmtud: "no",
    clamp: true,
    note: {
      en: "8500 bytes. Larger packets are dropped, there is no PMTUD, and MSS is clamped, so TCP is fine and large UDP is not.",
      ja: "8500 バイト。超えると破棄され、PMTUD はなく、MSS はクランプされる。TCP は問題ないが、大きな UDP は通らない。",
    },
  },
];

export const MTU_PATH: Record<MtuPathId, MtuPath> = Object.fromEntries(
  MTU_PATHS.map((p) => [p.id, p]),
) as Record<MtuPathId, MtuPath>;

export function mssOf(p: MtuPath): number {
  return p.mtu - IP_TCP;
}

/** Bytes of wrapping added around the inner packet. */
export function overheadOf(p: MtuPath): number {
  return p.wrappers.reduce((n, w) => n + w.bytes, 0);
}

/**
 * What happens to one packet with the Don't Fragment bit set:
 * - fits: goes through.
 * - pmtud: too big, the sender is told the size and resends smaller.
 * - blackhole: too big, silently dropped. The connection hangs.
 * - unknown: too big, and AWS does not document PMTUD on this path.
 */
export type Outcome = "fits" | "pmtud" | "blackhole" | "unknown";

export function classify(p: MtuPath, size: number): Outcome {
  if (size <= p.mtu) return "fits";
  if (p.pmtud === "yes") return "pmtud";
  if (p.pmtud === "no") return "blackhole";
  return "unknown";
}

/** The smallest MTU along a chain of segments: the path MTU. */
export function pathMtu(segments: number[]): number {
  return segments.length === 0 ? 0 : Math.min(...segments);
}
