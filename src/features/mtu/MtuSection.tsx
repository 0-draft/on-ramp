import { useLang } from "@/i18n/useLang";
import { Callout, MetaphorLimit, Section, Sources } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { MtuLab } from "./MtuLab";

export function MtuSection() {
  const { t } = useLang();
  return (
    <Section
      id="mtu"
      title={{
        en: "Low clearance: how big a packet fits",
        ja: "高さ制限: どこまで大きいパケットが通るか",
      }}
      lead={{
        en: "Every road has a clearance. Inside a VPC an instance sends 9001-byte packets; a transit VIF takes 8500; a VPN tunnel takes 1446 at best, because the tunnel's own headers eat the rest. When a packet is too tall, it is either told to shrink or silently dropped, and which one depends on the path.",
        ja: "どの道にも高さ制限があります。VPC の中ではインスタンスが 9001 バイトのパケットを送り、トランジット VIF は 8500、VPN トンネルは良くて 1446。トンネル自身のヘッダーが残りを食うからです。高すぎるパケットは「縮めて」と通知されるか、黙って捨てられるか。どちらになるかは経路次第です。",
      }}
    >
      <div className="prose-ish mb-6 max-w-3xl">
        <p>
          {t({
            en: "Pick a path to open its packet. Wrapping a packet (IPsec, GRE) adds headers, and those bytes come out of the room left for your data. Then drag the packet size and watch the truck meet the bridge.",
            ja: "経路を選ぶとパケットの中身が開きます。IPsec や GRE で包むとヘッダーが増え、その分だけデータに使える余地が減ります。次にパケットサイズを動かして、トラックが橋にぶつかるか見てみてください。",
          })}
        </p>
        <p>
          {t({
            en: "The takeaway: the path MTU is the smallest clearance along the way, AWS gives you no PMTUD on VPN or on Direct Connect into a Transit Gateway, and a failover from DX to VPN quietly drops the clearance from 8500 or 9001 to 1446. Set the MSS on your router (1406 or lower for VPN) and let ICMP 'fragmentation needed' through where PMTUD does exist.",
            ja: "要点: 経路 MTU は途中で一番低い制限で決まる。AWS では VPN と、Direct Connect から Transit Gateway に入る通信には PMTUD がない。DX から VPN へのフェイルオーバーで、制限は 8500 や 9001 から 1446 に黙って下がる。ルーターで MSS を設定し (VPN なら 1406 以下)、PMTUD がある経路では ICMP 'fragmentation needed' を通すこと。",
          })}
        </p>
      </div>

      <MtuLab />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Predict
          question={{
            en: "An instance with MTU 9001 sends to your data center over a transit VIF and a Transit Gateway. What is the largest packet that gets there intact?",
            ja: "MTU 9001 のインスタンスが、トランジット VIF と Transit Gateway 経由でデータセンターへ送ります。無傷で届く最大のパケットは?",
          }}
          options={[
            { id: "9001", label: { en: "9001", ja: "9001" } },
            { id: "8500", label: { en: "8500", ja: "8500" } },
            { id: "1500", label: { en: "1500", ja: "1500" } },
          ]}
          answer="8500"
          why={t({
            en: "The path MTU is the smallest clearance: Transit Gateway and a transit VIF both top out at 8500, even though the instance and a private VIF allow 9001.",
            ja: "経路 MTU は途中の最小値。インスタンスとプライベート VIF は 9001 でも、Transit Gateway とトランジット VIF は 8500 が上限です。",
          })}
        />
        <Callout
          tone="bad"
          title={{
            en: "The failover that shrinks your road",
            ja: "道を狭くするフェイルオーバー",
          }}
        >
          {t({
            en: "If a VPN (or a second VIF with a different MTU) advertises the same prefix as your jumbo DX path, AWS uses 1500 for that prefix. And when DX fails over to the VPN, packets sized for 8500 hit a 1446 tunnel with no PMTUD to warn anyone. Clamp MSS on premises so the backup path works on the day you need it.",
            ja: "VPN (あるいは MTU の違う 2 本目の VIF) がジャンボ対応の DX と同じプレフィックスを広告すると、AWS はそのプレフィックスに 1500 を使います。さらに DX から VPN に切り替わると、8500 前提のパケットが 1446 のトンネルに当たり、PMTUD で知らせてくれる仕組みもありません。必要な日にバックアップが使えるよう、オンプレ側で MSS をクランプしておきましょう。",
          })}
        </Callout>
      </div>

      <MetaphorLimit>
        {t({
          en: "A truck that is too tall stops at the bridge and its driver sees why. A packet that is too big just disappears, or comes back as an ICMP note only if every device on the way lets it through. And unlike a truck, a packet can be cut into pieces (fragmented) before it reaches the bridge: AWS recommends doing that on your VPN router before encryption.",
          ja: "高すぎるトラックは橋の手前で止まり、運転手は理由が分かります。大きすぎるパケットはただ消えるか、途中の全機器が通した場合に限り ICMP の通知が返るだけ。またトラックと違い、パケットは橋の手前で分割 (フラグメント) できます。AWS は VPN ルーターで暗号化の前に分割することを推奨しています。",
        })}
      </MetaphorLimit>

      <Sources
        doc="12-security-and-operations.md"
        links={[
          {
            label: "EC2 network MTU",
            url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/network_mtu.html",
          },
          {
            label: "Site-to-Site VPN customer gateway best practices (MTU by algorithm)",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/cgw-best-practice.html",
          },
          {
            label: "Direct Connect virtual interfaces (MTU)",
            url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/WorkingWithVirtualInterfaces.html",
          },
          {
            label: "Transit Gateway quotas (MTU, PMTUD)",
            url: "https://docs.aws.amazon.com/vpc/latest/tgw/transit-gateway-quotas.html",
          },
        ]}
      />
    </Section>
  );
}
