import { Fragment } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { ROUTE } from "@/data/routes";

type Zone = "aws" | "between" | "onprem";

const ZONE: Record<Zone, L> = {
  aws: { en: "AWS", ja: "AWS" },
  between: { en: "Your private road", ja: "閉域の経路" },
  onprem: { en: "On-prem", ja: "オンプレ" },
};

const NODES: { name: L; zone: Zone }[] = [
  { name: { en: "App in a consumer VPC", ja: "利用側 VPC のアプリ" }, zone: "aws" },
  {
    name: {
      en: "Its own interface endpoint",
      ja: "自分のインターフェイスエンドポイント",
    },
    zone: "aws",
  },
  {
    name: { en: "Provider NLB (target type ip)", ja: "提供側 NLB (ターゲットタイプ ip)" },
    zone: "aws",
  },
  { name: { en: "DX or VPN", ja: "DX または VPN" }, zone: "between" },
  {
    name: {
      en: "On-prem service 10.20.5.10:443",
      ja: "オンプレのサービス 10.20.5.10:443",
    },
    zone: "onprem",
  },
];

/**
 * AWS → on-prem through PrivateLink, as a five-stop strip. The hop from the
 * endpoint to the NLB is the PrivateLink "service window": drawn as a
 * doorway, not a road, because it connects one service, not two networks.
 */
export function ReverseStrip() {
  const { t } = useLang();
  const pl = ROUTE.private.color;
  return (
    <ol
      className="mt-3 flex flex-col gap-0 md:flex-row md:items-stretch"
      aria-label={t({ en: "Hops from AWS to on-prem", ja: "AWS からオンプレへの経由地" })}
    >
      {NODES.map((n, i) => (
        <Fragment key={i}>
          <li className="flex min-w-0 flex-1 md:flex-col">
            <div
              className="flex w-full items-start gap-2 rounded-lg border-2 bg-[var(--paper)] p-2 text-sm"
              style={{
                borderColor:
                  n.zone === "aws"
                    ? "var(--hub)"
                    : n.zone === "between"
                      ? "var(--asphalt-2)"
                      : "var(--layer-1)",
                borderStyle: n.zone === "between" ? "dashed" : "solid",
              }}
            >
              <span
                aria-hidden="true"
                className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--hub)] text-xs font-black text-[var(--on-hub)]"
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-[var(--muted)]">
                  {t(ZONE[n.zone])}
                </span>
                <span className="font-semibold">{t(n.name)}</span>
              </span>
            </div>
          </li>
          {i < NODES.length - 1 && (
            <li
              aria-hidden="true"
              className="flex shrink-0 items-center justify-center py-1 md:px-1 md:py-0"
            >
              {i === 1 ? (
                // The PrivateLink hop: a window, not a road.
                <span
                  className="rounded px-1.5 py-0.5 text-[0.7rem] font-black text-[var(--on-color)]"
                  style={{ background: pl }}
                >
                  PL
                </span>
              ) : (
                <span className="text-lg leading-none text-[var(--muted)]">
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </span>
              )}
            </li>
          )}
        </Fragment>
      ))}
    </ol>
  );
}
