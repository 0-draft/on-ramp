import type { L } from "@/i18n/lang";

/**
 * Can a client reach an AWS service through a given kind of endpoint?
 * Encoded from docs/09-private-service-access.md. The one rule behind most
 * answers: traffic that enters a VPC from VPN, DX, peering or a transit
 * gateway cannot leave through that VPC's gateway endpoint, internet gateway
 * or NAT gateway. Only an IP address that lives in the VPC is reachable.
 */

export type Client = "onprem" | "sameVpc" | "otherVpc";
export type Target =
  | "gateway"
  | "interface"
  | "s3Inbound"
  | "publicVif"
  | "latticeAssoc"
  | "latticeEndpoint";

/** yes: works. partial: packets get there, but a catch applies.
 * no: no path. na: the combination does not apply. */
export type Result = "yes" | "partial" | "no" | "na";

export interface Verdict {
  result: Result;
  why: L;
}

const TRANSITIVE: L = {
  en: "A gateway endpoint is only a route-table target (a prefix list), not an IP address. Traffic that enters the VPC from VPN, DX, peering or a transit gateway cannot leave through it: AWS docs say gateway endpoints do not allow access from on-premises networks, from peered VPCs in other Regions, or through a transit gateway.",
  ja: "ゲートウェイ型エンドポイントはルートテーブルのターゲット (プレフィックスリスト) で、IP アドレスを持ちません。VPN・DX・ピアリング・Transit Gateway から VPC に入った通信はそこから出られません。AWS ドキュメントにも、オンプレミス、他リージョンのピア VPC、Transit Gateway 経由ではアクセスできないと明記されています。",
};

const LINK_LOCAL: L = {
  en: "A service network VPC association answers with link-local addresses (169.254.171.0/24 and fd00:ec2:80::/64). Those exist only inside that VPC and are never routable over DX, VPN or a transit gateway.",
  ja: "サービスネットワークの VPC 関連付けはリンクローカルアドレス (169.254.171.0/24 と fd00:ec2:80::/64) で応答します。これはその VPC の中だけのアドレスで、DX・VPN・Transit Gateway 越しには絶対にルーティングされません。",
};

export function reach(client: Client, target: Target): Verdict {
  switch (target) {
    case "gateway":
      if (client === "sameVpc")
        return {
          result: "yes",
          why: {
            en: "Inside its own VPC a gateway endpoint works and is free: the subnet route table sends S3 or DynamoDB prefixes to it.",
            ja: "自分の VPC の中ならゲートウェイ型エンドポイントは使え、しかも無料。サブネットのルートテーブルが S3 / DynamoDB のプレフィックスをそこへ送ります。",
          },
        };
      return { result: "no", why: TRANSITIVE };

    case "interface":
      if (client === "sameVpc")
        return {
          result: "yes",
          why: {
            en: "With private DNS on (the default for AWS services), the normal service name resolves to the endpoint's private IPs inside the VPC.",
            ja: "プライベート DNS が有効 (AWS サービスの既定) なら、VPC 内では通常のサービス名がエンドポイントのプライベート IP に解決されます。",
          },
        };
      if (client === "onprem")
        return {
          result: "partial",
          why: {
            en: "The endpoint is one ENI per AZ with a private IP, so packets over DX or VPN get there. The catch is DNS: the private DNS records are visible only to that VPC's Resolver. Forward the service name to a Resolver inbound endpoint, or use the endpoint-specific vpce- name, or on-prem gets public IPs.",
            ja: "エンドポイントは AZ ごとの ENI でプライベート IP を持つので、DX / VPN 越しにパケットは届きます。落とし穴は DNS: プライベート DNS のレコードはその VPC の Resolver にしか見えません。サービス名を Resolver インバウンドエンドポイントへ転送するか、エンドポイント固有の vpce- 名を使わないと、オンプレはパブリック IP を引きます。",
          },
        };
      return {
        result: "partial",
        why: {
          en: "Spokes can route to endpoint IPs in a hub VPC through a transit gateway, but the private DNS zone only applies to the hub VPC. Share it with Route 53 Profiles (interface endpoint association since 2025-04-28) or self-managed private hosted zones.",
          ja: "スポーク VPC は Transit Gateway 経由でハブ VPC のエンドポイント IP に到達できますが、プライベート DNS のゾーンはハブ VPC にしか効きません。Route 53 Profiles (2025-04-28 からインターフェイスエンドポイントを関連付け可能) か自前のプライベートホストゾーンで共有します。",
        },
      };

    case "s3Inbound":
      if (client === "onprem")
        return {
          result: "yes",
          why: {
            en: "This is what the option is for. A query that arrives through a Resolver inbound endpoint gets the interface endpoint's private IPs, so on-prem traffic rides DX or VPN to the endpoint ($0.01/GB processing).",
            ja: "まさにこのためのオプション。Resolver インバウンドエンドポイント経由で届いたクエリにはインターフェイスエンドポイントのプライベート IP が返るので、オンプレの通信は DX / VPN でエンドポイントへ ($0.01/GB の処理料金)。",
          },
        };
      if (client === "sameVpc")
        return {
          result: "yes",
          why: {
            en: "Same name, different answer: from inside the VPC, S3 names resolve to public IPs, so traffic uses the free gateway endpoint. That is why the option requires a gateway endpoint in the VPC.",
            ja: "同じ名前で答えが違う: VPC の中からは S3 の名前がパブリック IP に解決され、無料のゲートウェイ型エンドポイントを通ります。だからこのオプションには VPC 内のゲートウェイ型エンドポイントが必須です。",
          },
        };
      return {
        result: "partial",
        why: {
          en: "Packets can reach the endpoint IPs through a transit gateway, but the private DNS zone only applies to the endpoint's own VPC. Use the vpce- name or share the endpoint with Route 53 Profiles.",
          ja: "Transit Gateway 経由でエンドポイント IP には届きますが、プライベート DNS のゾーンはエンドポイント自身の VPC にしか効きません。vpce- 名を使うか、Route 53 Profiles でエンドポイントを共有します。",
        },
      };

    case "publicVif":
      if (client === "onprem")
        return {
          result: "partial",
          why: {
            en: "A public VIF gives DX bandwidth to all AWS public endpoints: a private path to public addresses. You need public IPs you own (or AWS-provided ones), and you cannot attach endpoint policies or security groups to it.",
            ja: "パブリック VIF は AWS のパブリックエンドポイント全体へ DX の帯域を提供します。経路は閉域でも宛先はパブリックアドレス。自社所有 (または AWS 提供) のパブリック IP が必要で、エンドポイントポリシーやセキュリティグループは付けられません。",
          },
        };
      return {
        result: "na",
        why: {
          en: "A public VIF is a Direct Connect construct for your routers. VPCs reach public endpoints their own way (gateway endpoint, interface endpoint, NAT or internet gateway).",
          ja: "パブリック VIF は社内ルーター向けの Direct Connect の仕組み。VPC はパブリックエンドポイントへ自前の経路 (ゲートウェイ型 / インターフェイス型エンドポイント、NAT、インターネットゲートウェイ) で到達します。",
        },
      };

    case "latticeAssoc":
      if (client === "sameVpc")
        return {
          result: "yes",
          why: {
            en: "Inside the associated VPC, Lattice services resolve to link-local addresses that the VPC handles for you.",
            ja: "関連付けた VPC の中では、Lattice サービスは VPC が面倒を見るリンクローカルアドレスに解決されます。",
          },
        };
      return { result: "no", why: LINK_LOCAL };

    case "latticeEndpoint":
      return {
        result: "yes",
        why: {
          en: "A service network VPC endpoint (December 2024) consumes real IPs from your subnets, so anything that can route to the VPC, including on-prem over DX or VPN, can use it. Its generated DNS names are public and answer with those private IPs.",
          ja: "サービスネットワーク VPC エンドポイント (2024 年 12 月) はサブネットの実 IP を使うので、DX / VPN 越しのオンプレを含め VPC にルーティングできる相手なら使えます。生成される DNS 名はパブリックで、そのプライベート IP を返します。",
        },
      };
  }
}
