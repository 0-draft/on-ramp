import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { C } from "./data";

/** Session Manager: both ends dial out to ssmmessages; nobody dials in. */
export function SsmDiagram({ step }: { step: number }) {
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
            stroke="var(--hub)"
            strokeDasharray="6 5"
            strokeWidth={2}
          />
          <text x={332} y={52} fontSize={13} fill="var(--ink)">
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
