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
      </div>

      <Predict
        question={{
          en: "Your data center normally reaches a VPC over Direct Connect into a Transit Gateway. DX fails and traffic moves to the BGP VPN backup. An app sends a 1500-byte UDP packet with Don't Fragment set. What happens?",
          ja: "データセンターは普段 Direct Connect から Transit Gateway 経由で VPC につながっています。DX が落ち、通信は BGP の VPN バックアップへ。アプリが DF ビット付きの 1500 バイトの UDP パケットを送ります。どうなる?",
        }}
        options={[
          { id: "fits", label: { en: "It arrives", ja: "届く" } },
          {
            id: "pmtud",
            label: { en: "Sender is told to shrink", ja: "縮めるよう通知される" },
          },
          { id: "drop", label: { en: "Silently dropped", ja: "黙って破棄される" } },
        ]}
        answer="drop"
        why={t({
          en: "The VPN tunnel fits 1446 at best and AWS does no PMTUD on VPN, so nobody tells the sender. TCP survives because MSS is clamped (a Transit Gateway clamps on VPN attachments; also set 1406 or lower on your router); UDP with DF set just vanishes. The lab below is set to exactly that: VPN path, 1500-byte packet.",
          ja: "VPN トンネルは最大でも 1446 で、AWS は VPN で PMTUD をしないため、送信元に誰も知らせません。TCP は MSS クランプで助かります (Transit Gateway は VPN アタッチメントでクランプ。ルーター側でも 1406 以下に) が、DF 付きの UDP はただ消えます。下のラボはちょうどその状態 (VPN 経路・1500 バイト) です。",
        })}
        // The takeaway would spoil the question, so it appears only once the
        // lab is open.
        after={
          <>
            <div className="prose-ish mt-6 max-w-3xl">
              <p>
                {t({
                  en: "The takeaway: the path MTU is the smallest clearance along the way, and AWS gives you no PMTUD on VPN or on Direct Connect into a Transit Gateway. A failover from DX to VPN quietly drops the clearance to 1446 (and with a VPN advertising the same prefix as a private VIF, AWS already caps that prefix at 1500). Set the MSS on your router (1406 or lower for VPN) and let ICMP 'fragmentation needed' through where PMTUD does exist.",
                  ja: "要点: 経路 MTU は途中で一番低い制限で決まります。AWS では VPN と、Direct Connect から Transit Gateway に入る通信には PMTUD がありません。DX から VPN へのフェイルオーバーで制限は黙って 1446 に下がります (プライベート VIF と同じプレフィックスを VPN が広告していれば、そのプレフィックスは最初から 1500)。ルーターで MSS を設定し (VPN なら 1406 以下)、PMTUD がある経路では ICMP 'fragmentation needed' を通してください。",
                })}
              </p>
            </div>

            <div className="mt-6">
              <Callout
                tone="bad"
                title={{
                  en: "The failover that shrinks your road",
                  ja: "道を狭くするフェイルオーバー",
                }}
              >
                {t({
                  en: "If a VPN (or a second VIF with a different MTU) advertises the same prefix as your jumbo DX path, AWS uses 1500 for that prefix. And when a transit VIF fails over to a VPN on a Transit Gateway, packets sized for 8500 hit a 1446 tunnel with no PMTUD to warn anyone. Clamp MSS on premises so the backup path works on the day you need it.",
                  ja: "VPN (あるいは MTU の違う 2 本目の VIF) がジャンボ対応の DX と同じプレフィックスを広告すると、AWS はそのプレフィックスに 1500 を使います。さらに Transit Gateway 上でトランジット VIF から VPN に切り替わると、8500 前提のパケットが 1446 のトンネルに当たり、PMTUD で知らせてくれる仕組みもありません。必要な日にバックアップが使えるよう、オンプレ側で MSS をクランプしておきましょう。",
                })}
              </Callout>
            </div>
            <MetaphorLimit>
              {t({
                en: "A truck that is too tall stops at the bridge and its driver sees why. A packet that is too big just disappears, or comes back as an ICMP note only if every device on the way lets it through. And unlike a truck, a packet can be cut into pieces (fragmented) before it reaches the bridge: AWS recommends doing that on your VPN router before encryption.",
                ja: "高すぎるトラックは橋の手前で止まり、運転手は理由が分かります。大きすぎるパケットはただ消えるか、途中の全機器が通した場合に限り ICMP の通知が返るだけ。またトラックと違い、パケットは橋の手前で分割 (フラグメント) できます。AWS は VPN ルーターで暗号化の前に分割することを推奨しています。",
              })}
            </MetaphorLimit>
          </>
        }
      >
        <MtuLab />
      </Predict>

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
