import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { Callout, MetaphorLimit, Section, Sources, Spec } from "@/components/ui";
import { Stepper } from "@/components/ui/Stepper";
import {
  monthlyCost,
  nextQuestion,
  recommend,
  type Answers,
  type Product,
  type Question,
} from "./chooser";

const C = "var(--r-people)";

interface Row {
  id: Product;
  name: string;
  who: L;
  wire: L;
  reach: L;
  inbound: L;
  cost: L;
}

/** docs/07-user-access.md, "At a glance", with Tokyo prices. */
const ROWS: Row[] = [
  {
    id: "clientvpn",
    name: "AWS Client VPN",
    who: {
      en: "Anyone with the AWS VPN Client or an OpenVPN client",
      ja: "AWS VPN Client か OpenVPN クライアントを持つ人",
    },
    wire: {
      en: "OpenVPN (TLS), UDP or TCP, port 443 or 1194",
      ja: "OpenVPN (TLS)、UDP か TCP、443 か 1194 番",
    },
    reach: {
      en: "Whole networks you authorize, on-prem included",
      ja: "許可したネットワーク全体 (オンプレも)",
    },
    inbound: {
      en: "Targets allow the endpoint ENIs",
      ja: "宛先はエンドポイント ENI を許可",
    },
    cost: {
      en: "$0.15 per subnet association-hour + $0.05 per connection-hour",
      ja: "サブネット関連付け 1 時間 $0.15 + 接続 1 時間 $0.05",
    },
  },
  {
    id: "ava",
    name: "AWS Verified Access",
    who: {
      en: "Users signed in through your IdP, optionally with device posture",
      ja: "IdP で認証した利用者 (端末の状態チェックも可)",
    },
    wire: {
      en: "HTTPS; TCP/SSH/RDP via the Connectivity Client",
      ja: "HTTPS。TCP/SSH/RDP は Connectivity Client 経由",
    },
    reach: { en: "One application per endpoint", ja: "エンドポイントごとに 1 アプリ" },
    inbound: { en: "App never exposed publicly", ja: "アプリは公開しない" },
    cost: {
      en: "$0.35 per HTTP app-hour (+$0.02/GB); $0.26 per TCP endpoint-hour",
      ja: "HTTP アプリ 1 時間 $0.35 (+$0.02/GB)。TCP エンドポイント 1 時間 $0.26",
    },
  },
  {
    id: "ssm",
    name: "Session Manager",
    who: {
      en: "IAM principals (console or CLI + plugin)",
      ja: "IAM プリンシパル (コンソール / CLI + プラグイン)",
    },
    wire: {
      en: "HTTPS/WebSocket to ssmmessages; the agent dials out",
      ja: "ssmmessages への HTTPS/WebSocket。エージェントが外へ接続",
    },
    reach: {
      en: "A shell, or port forwarding through a node",
      ja: "シェル、またはノード経由のポートフォワード",
    },
    inbound: { en: "None", ja: "不要" },
    cost: {
      en: "Free on EC2; $0.05 per session on hybrid nodes (from 2026-09-30)",
      ja: "EC2 は無料。ハイブリッドノードは 1 セッション $0.05 (2026-09-30〜)",
    },
  },
  {
    id: "eice",
    name: "EC2 Instance Connect Endpoint",
    who: {
      en: "IAM principals with SSH or RDP clients",
      ja: "SSH / RDP クライアントを使う IAM プリンシパル",
    },
    wire: {
      en: "WebSocket tunnel to the endpoint, then TCP in the VPC",
      ja: "エンドポイントへの WebSocket トンネル、VPC 内は TCP",
    },
    reach: {
      en: "Instances' private IPs (SSH, RDP)",
      ja: "インスタンスのプライベート IP (SSH・RDP)",
    },
    inbound: { en: "Target allows the endpoint", ja: "宛先はエンドポイントを許可" },
    cost: {
      en: "No extra charge (cross-AZ data transfer applies)",
      ja: "追加料金なし (AZ 間転送料は発生)",
    },
  },
  {
    id: "workspaces",
    name: "WorkSpaces family",
    who: {
      en: "Anyone with a client or a browser",
      ja: "クライアントかブラウザがあれば誰でも",
    },
    wire: {
      en: "Streaming protocol or HTTPS; only pixels leave AWS",
      ja: "ストリーミング か HTTPS。AWS から出るのは画面だけ",
    },
    reach: {
      en: "Whatever the desktop in AWS can reach",
      ja: "AWS 内のデスクトップから届く範囲",
    },
    inbound: { en: "None to your workloads", ja: "ワークロード側は不要" },
    cost: { en: "Per user per month, or per hour", ja: "ユーザー月額、または時間課金" },
  },
  {
    id: "bastion",
    name: "Bastion host",
    who: {
      en: "Anyone with SSH/RDP keys and network reach",
      ja: "SSH/RDP の鍵とネットワーク到達性がある人",
    },
    wire: { en: "SSH (22) or RDP (3389)", ja: "SSH (22) か RDP (3389)" },
    reach: { en: "Whatever the bastion can reach", ja: "踏み台から届く範囲" },
    inbound: {
      en: "Yes: SSH/RDP open on the bastion",
      ja: "必要: 踏み台に SSH/RDP を開放",
    },
    cost: {
      en: "EC2 hours + public IPv4 ($0.005/h)",
      ja: "EC2 時間 + パブリック IPv4 ($0.005/時)",
    },
  },
];

const QUESTION: Record<Question, L> = {
  manyNetworks: {
    en: "Does the person need network-level access to many address ranges, including on-prem?",
    ja: "その人は、オンプレを含む多数のアドレス範囲にネットワークレベルで入る必要がある?",
  },
  adminToServer: {
    en: "Is it an admin reaching a server?",
    ja: "管理者がサーバーに入る用途?",
  },
  dataMayLeave: {
    en: "May corporate data leave AWS and land on the device?",
    ja: "社内データが AWS の外 (端末) に出てもよい?",
  },
};

function Chooser() {
  const { t } = useLang();
  const [a, setA] = useState<Answers>({});
  const q = nextQuestion(a);
  const rec = recommend(a);
  const asked = (["manyNetworks", "adminToServer", "dataMayLeave"] as Question[]).filter(
    (k) => a[k] !== undefined,
  );
  return (
    <div className="panel p-4 sm:p-5">
      <p className="font-bold">{t({ en: "Which door fits?", ja: "どの入口が合う?" })}</p>
      <ol className="mt-3 space-y-2">
        {asked.map((k) => (
          <li
            key={k}
            className="flex flex-wrap items-baseline gap-2 text-sm text-[var(--muted)]"
          >
            <span>{t(QUESTION[k])}</span>
            <b className="text-[var(--ink)]">
              {a[k] ? t({ en: "Yes", ja: "はい" }) : t({ en: "No", ja: "いいえ" })}
            </b>
          </li>
        ))}
      </ol>
      {q && (
        <div className="mt-3">
          <p className="font-semibold">{t(QUESTION[q])}</p>
          <div className="mt-2 flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setA({ ...a, [q]: v })}
                className="rounded-lg border-2 px-4 py-1.5 text-sm font-bold"
                style={{ borderColor: C }}
              >
                {v ? t({ en: "Yes", ja: "はい" }) : t({ en: "No", ja: "いいえ" })}
              </button>
            ))}
          </div>
        </div>
      )}
      {rec && (
        <div className="mt-3" aria-live="polite">
          <p className="text-lg font-extrabold" style={{ color: C }}>
            {rec
              .map((p) => ROWS.find((r) => r.id === p)!.name)
              .join(t({ en: " or ", ja: " または " }))}
          </p>
          {rec.includes("eice") && (
            <p className="text-sm">
              {t({
                en: "Session Manager by default; EC2 Instance Connect Endpoint when you want native SSH or RDP clients.",
                ja: "基本は Session Manager。手元の SSH / RDP クライアントをそのまま使いたいなら EC2 Instance Connect Endpoint。",
              })}
            </p>
          )}
        </div>
      )}
      {asked.length > 0 && (
        <button
          type="button"
          onClick={() => setA({})}
          className="mt-3 text-sm font-semibold underline"
        >
          {t({ en: "Start over", ja: "最初から" })}
        </button>
      )}
      <Compare highlight={rec ?? []} />
    </div>
  );
}

function Compare({ highlight }: { highlight: Product[] }) {
  const { t } = useLang();
  const head: L[] = [
    { en: "Door", ja: "入口" },
    { en: "Who connects", ja: "誰が" },
    { en: "On the wire", ja: "通信" },
    { en: "What's reachable", ja: "届く範囲" },
    { en: "Inbound port on targets?", ja: "宛先の受信ポート" },
    { en: "Cost (Tokyo)", ja: "料金 (東京)" },
  ];
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-2 border-[var(--line)]">
            {head.map((h, i) => (
              <th key={i} scope="col" className="px-2 py-2 font-bold">
                {t(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => {
            const on = highlight.includes(r.id);
            return (
              <tr
                key={r.id}
                className="border-b border-[var(--line)] align-top"
                style={
                  on
                    ? {
                        background: "var(--paper-2)",
                        outline: `2px solid ${C}`,
                        outlineOffset: -2,
                      }
                    : undefined
                }
              >
                <th scope="row" className="px-2 py-2 font-bold whitespace-nowrap">
                  {on && (
                    <span className="sr-only">
                      {t({ en: "Recommended: ", ja: "おすすめ: " })}
                    </span>
                  )}
                  {r.name}
                </th>
                <td className="px-2 py-2">{t(r.who)}</td>
                <td className="px-2 py-2">{t(r.wire)}</td>
                <td className="px-2 py-2">{t(r.reach)}</td>
                <td className="px-2 py-2">{t(r.inbound)}</td>
                <td className="px-2 py-2">{t(r.cost)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** What a Session Manager session actually does, one step at a time. */
const SSM_STEPS: L[] = [
  {
    en: "The SSM Agent on the instance dials out over HTTPS 443 to ssm and ssmmessages. The instance has no inbound rule at all; it needs either a NAT path or interface endpoints.",
    ja: "インスタンスの SSM Agent が ssm と ssmmessages へ HTTPS 443 で外向きに接続。インスタンスに受信ルールは一切不要。NAT 経路かインターフェイスエンドポイントが必要です。",
  },
  {
    en: "You sign in through IAM Identity Center (federated from your corporate IdP) and get temporary credentials.",
    ja: "社内 IdP とフェデレーションした IAM Identity Center でサインインし、一時的な認証情報を得ます。",
  },
  {
    en: "Your CLI calls ssm:StartSession. IAM policy decides whether you may open a session on this node.",
    ja: "CLI が ssm:StartSession を呼びます。このノードにセッションを開けるかは IAM ポリシーが決めます。",
  },
  {
    en: "Your laptop also dials out: a WebSocket to ssmmessages. Both sides are now connected outward to the same AWS service.",
    ja: "PC も外向きに ssmmessages へ WebSocket を張ります。これで両側が同じ AWS サービスへ外向きにつながった状態。",
  },
  {
    en: "ssmmessages joins the two outbound connections. Shell bytes flow over TLS (1.3 by default), optionally with your own KMS key.",
    ja: "ssmmessages が 2 本の外向き接続をつなぎます。シェルのデータは TLS (デフォルト 1.3) で流れ、KMS キーで追加暗号化も可能。",
  },
  {
    en: "CloudTrail records the API calls; full session logs can go to S3 or CloudWatch Logs. Idle sessions end after 20 minutes by default.",
    ja: "API 呼び出しは CloudTrail に記録。セッションの全ログは S3 や CloudWatch Logs へ。アイドルはデフォルト 20 分で切断。",
  },
];

function SsmDiagram({ step }: { step: number }) {
  const { t } = useLang();
  const narrow = useNarrow();
  const agentOn = step === 0 || step >= 4;
  const userOn = step >= 3;
  const W = narrow ? 360 : 900;
  const H = narrow ? 520 : 260;
  const box = narrow
    ? { laptop: [50, 20], ssm: [50, 210], ec2: [50, 400] }
    : { laptop: [20, 90], ssm: [350, 90], ec2: [695, 90] };
  const bw = narrow ? 260 : 180;
  const bh = 80;
  const node = (k: keyof typeof box, title: L, sub: L, lit: boolean) => {
    const [x, y] = box[k];
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={bw}
          height={bh}
          rx={10}
          fill="var(--paper)"
          stroke={lit ? C : "var(--line)"}
          strokeWidth={lit ? 3 : 1.5}
        />
        <text
          x={x + bw / 2}
          y={y + 34}
          textAnchor="middle"
          fontSize={16}
          fill="var(--ink)"
        >
          {t(title)}
        </text>
        <text
          x={x + bw / 2}
          y={y + 56}
          textAnchor="middle"
          fontSize={13}
          fill="var(--muted)"
        >
          {t(sub)}
        </text>
      </g>
    );
  };
  // Both arrows point at the AWS service: nobody dials in.
  const userLine = narrow
    ? { x1: 180, y1: 100, x2: 180, y2: 204 }
    : { x1: 200, y1: 130, x2: 344, y2: 130 };
  const agentLine = narrow
    ? { x1: 180, y1: 400, x2: 180, y2: 296 }
    : { x1: 695, y1: 130, x2: 536, y2: 130 };
  const arrow = (l: typeof userLine, on: boolean, label: L, lx: number, ly: number) => (
    <g opacity={on ? 1 : 0.25}>
      <line
        {...l}
        stroke={on ? C : "var(--asphalt-2)"}
        strokeWidth={5}
        markerEnd="url(#ssm-arrow)"
      />
      <text x={lx} y={ly} textAnchor="middle" fontSize={13} fill="var(--ink)">
        {t(label)}
      </text>
    </g>
  );
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="diagram block h-auto w-full"
      role="img"
      aria-label={t({
        en: "Session Manager: both the laptop and the instance connect outward to ssmmessages",
        ja: "Session Manager: PC とインスタンスの両方が ssmmessages へ外向きに接続",
      })}
    >
      <defs>
        <marker
          id="ssm-arrow"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={C} />
        </marker>
      </defs>
      {!narrow && (
        <>
          <rect
            x={320}
            y={30}
            width={240}
            height={200}
            rx={12}
            fill="none"
            stroke="var(--sign)"
            strokeDasharray="6 5"
            strokeWidth={2}
          />
          <text x={332} y={52} fontSize={13} fill="var(--sign)">
            {t({ en: "AWS Region", ja: "AWS リージョン" })}
          </text>
          <rect
            x={680}
            y={30}
            width={210}
            height={200}
            rx={12}
            fill="none"
            stroke="var(--asphalt-2)"
            strokeWidth={1.5}
          />
          <text x={692} y={52} fontSize={13} fill="var(--muted)">
            {t({ en: "Private subnet", ja: "プライベートサブネット" })}
          </text>
          <text x={785} y={214} textAnchor="middle" fontSize={13} fill="var(--bad)">
            {t({ en: "inbound rules: none", ja: "受信ルール: なし" })}
          </text>
        </>
      )}
      {node(
        "laptop",
        { en: "Your laptop", ja: "あなたの PC" },
        step === 1
          ? { en: "Sign in via your IdP", ja: "IdP でサインイン" }
          : { en: "CLI + plugin", ja: "CLI + プラグイン" },
        step >= 1 && step <= 3,
      )}
      {node(
        "ssm",
        { en: "ssmmessages", ja: "ssmmessages" },
        step === 5
          ? { en: "CloudTrail, S3 logs", ja: "CloudTrail・S3 ログ" }
          : { en: "AWS endpoint", ja: "AWS エンドポイント" },
        step >= 4,
      )}
      {node(
        "ec2",
        { en: "EC2 instance", ja: "EC2 インスタンス" },
        { en: "SSM Agent", ja: "SSM Agent" },
        step === 0,
      )}
      {arrow(
        userLine,
        userOn || step === 2,
        step === 2
          ? { en: "StartSession", ja: "StartSession" }
          : { en: "WebSocket 443", ja: "WebSocket 443" },
        narrow ? 270 : 260,
        narrow ? 156 : 80,
      )}
      {arrow(
        agentLine,
        agentOn,
        { en: "HTTPS 443 out", ja: "外向き HTTPS 443" },
        narrow ? 270 : 620,
        narrow ? 352 : 80,
      )}
    </svg>
  );
}

function CostLab() {
  const { t } = useLang();
  const [users, setUsers] = useState(100);
  const [apps, setApps] = useState(3);
  const hours = 160;
  const c = monthlyCost({ azs: 2, users, hoursPerUser: hours, apps });
  const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const max = Math.max(c.clientVpn, c.ava, 1);
  const bar = (v: number, color: string, label: string) => (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-sm font-bold">{label}</span>
      <div className="h-6 flex-1 rounded bg-[var(--paper-2)]">
        <div
          className="h-6 rounded"
          style={{ width: `${(v / max) * 100}%`, background: color }}
        />
      </div>
      <span className="w-20 shrink-0 text-right font-mono font-bold">{fmt(v)}</span>
    </div>
  );
  return (
    <div className="panel p-4 sm:p-5">
      <p className="font-bold">
        {t({
          en: "Per-user or per-app? A monthly bill in Tokyo",
          ja: "ユーザー課金かアプリ課金か: 東京の月額",
        })}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          {t({ en: `People: ${users}`, ja: `利用者: ${users} 人` })}
          <input
            type="range"
            min={10}
            max={1000}
            step={10}
            value={users}
            onChange={(e) => setUsers(Number(e.target.value))}
            className="block w-full accent-[var(--r-people)]"
          />
        </label>
        <label className="text-sm font-semibold">
          {t({ en: `Internal web apps: ${apps}`, ja: `社内 Web アプリ: ${apps} 個` })}
          <input
            type="range"
            min={1}
            max={40}
            value={apps}
            onChange={(e) => setApps(Number(e.target.value))}
            className="block w-full accent-[var(--r-people)]"
          />
        </label>
      </div>
      <div className="mt-4 space-y-2">
        {bar(c.clientVpn, "var(--r-vpn)", "Client VPN")}
        {bar(c.ava, C, "Verified Access")}
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">
        {t({
          en: `Assumes Client VPN in 2 AZs and each person connected ${hours} hours a month; Verified Access for HTTP apps. Data transfer and processing excluded. Client VPN grows with people; Verified Access grows with apps, so a large catalog of small apps can cost more.`,
          ja: `Client VPN は 2 AZ、1 人あたり月 ${hours} 時間接続、Verified Access は HTTP アプリを想定。データ転送・処理料は除外。Client VPN は人数に、Verified Access はアプリ数に比例するので、小さなアプリが多いと Verified Access の方が高くつくこともあります。`,
        })}
      </p>
    </div>
  );
}

export function PeopleSection() {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  return (
    <Section
      id="people"
      title={{ en: "People, not sites", ja: "拠点ではなく「人」をつなぐ" }}
      lead={{
        en: "A laptop at home is not a branch office. For people AWS offers four very different doors: put them on the network (Client VPN), let them into one app (Verified Access), give them a shell with no open port (Session Manager, EC2 Instance Connect Endpoint), or keep the work in AWS and stream only pixels (WorkSpaces).",
        ja: "自宅の PC は支社ではありません。人向けに AWS はまったく違う 4 種類の入口を用意しています。ネットワークに入れる (Client VPN)、1 つのアプリだけに入れる (Verified Access)、ポートを開けずにシェルを渡す (Session Manager・EC2 Instance Connect Endpoint)、作業は AWS 内に置いて画面だけ送る (WorkSpaces)。",
      }}
    >
      <Chooser />

      <h3 className="mt-10 text-xl font-extrabold">
        {t({
          en: "How Session Manager works with no inbound port",
          ja: "受信ポートなしで Session Manager が動く仕組み",
        })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "The trick is that nobody dials in. Both your laptop and the instance connect outward to the same AWS service, which joins the two connections.",
          ja: "ポイントは「誰も内向きに接続しない」こと。PC もインスタンスも同じ AWS サービスへ外向きにつなぎ、サービスが 2 本をつなぎ合わせます。",
        })}
      </p>
      <div className="panel mt-4 p-4 sm:p-5">
        <Stepper steps={SSM_STEPS} index={step} onChange={setStep} color={C}>
          <SsmDiagram step={step} />
        </Stepper>
      </div>

      <div className="mt-10">
        <CostLab />
      </div>

      <dl className="panel mt-6 grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
        <Spec
          k={{ en: "Client VPN per user", ja: "Client VPN 1 人あたり" }}
          v={{ en: "50 Mbps baseline", ja: "ベースライン 50 Mbps" }}
        />
        <Spec
          k={{ en: "Client VPN connections", ja: "Client VPN 同時接続" }}
          v={{
            en: "7,000 with 1 subnet; 36,500 with 2",
            ja: "1 サブネットで 7,000、2 つで 36,500",
          }}
        />
        <Spec
          k={{ en: "EIC Endpoint", ja: "EIC Endpoint" }}
          v={{
            en: "1 per VPC, 20 connections, 1-hour tunnels",
            ja: "VPC に 1 つ、20 接続、トンネル 1 時間",
          }}
        />
        <Spec
          k={{ en: "Verified Access idle", ja: "Verified Access のアイドル" }}
          v={{ en: "HTTP 504 after 60 s", ja: "60 秒で HTTP 504" }}
        />
      </dl>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Callout
          tone="warn"
          title={{
            en: "Client VPN hides who is connecting",
            ja: "Client VPN では接続元が見えない",
          }}
        >
          {t({
            en: "With subnet associations, client IPs are NATed to the endpoint's ENI, so security groups and flow logs see the ENI, not the person. Since 2026-04-23 an endpoint can attach to a Transit Gateway instead, with no source NAT and the real client IP preserved.",
            ja: "サブネット関連付けでは、クライアント IP がエンドポイントの ENI に NAT されます。セキュリティグループやフローログに見えるのは ENI で、人ではありません。2026-04-23 からは Transit Gateway に直接つなげられ、送信元 NAT なしで実 IP が残ります。",
          })}
        </Callout>
        <Callout
          tone="info"
          title={{
            en: "Newest: device posture on Client VPN",
            ja: "最新: Client VPN の端末ポスチャ",
          }}
        >
          {t({
            en: "Since 2026-10-05, Client VPN can check device posture from CrowdStrike, Jamf or JumpCloud with Cedar policies, re-evaluated continuously. It needs AWS VPN Client 6.2.0 or later.",
            ja: "2026-10-05 から、Client VPN は CrowdStrike・Jamf・JumpCloud の端末状態を Cedar ポリシーで継続的に評価できます。AWS VPN Client 6.2.0 以降が必要。",
          })}
        </Callout>
      </div>

      <MetaphorLimit>
        {t({
          en: "These are not roads. Client VPN is a building pass that opens every floor; Verified Access is a guard checking ID at each office door; Session Manager is a receptionist who calls both of you and connects the line. None of them makes your laptop a branch of the corporate network.",
          ja: "これらは「道」ではありません。Client VPN は全フロアに入れる入館証、Verified Access は部屋ごとに身分証を確かめる警備員、Session Manager は双方に電話をかけて回線をつなぐ受付係。どれも PC を社内ネットワークの拠点にはしません。",
        })}
      </MetaphorLimit>

      <Sources
        doc="07-user-access.md"
        links={[
          {
            label: "Client VPN quotas",
            url: "https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/limits.html",
          },
          {
            label: "Client VPN with Transit Gateway",
            url: "https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/cvpn-tgw.html",
          },
          {
            label: "Verified Access pricing",
            url: "https://aws.amazon.com/verified-access/pricing/",
          },
          {
            label: "Session Manager VPC endpoints",
            url: "https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-create-vpc.html",
          },
          {
            label: "EC2 Instance Connect Endpoint quotas",
            url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/eice-quotas.html",
          },
        ]}
      />
    </Section>
  );
}
