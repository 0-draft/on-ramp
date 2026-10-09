import { useState } from "react";
import type { ReactNode } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { ROUTE } from "@/data/routes";
import { Segmented, Shield, type SegOption } from "@/components/ui";
import { ANTI, DEFAULTS, REC, advise, type Answers } from "./advisor";

const YES_NO: SegOption<"yes" | "no">[] = [
  { id: "no", label: { en: "No", ja: "いいえ" } },
  { id: "yes", label: { en: "Yes", ja: "はい" } },
];

function Q({ q, children }: { q: L; children: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-1.5 border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0">
      <p className="text-sm font-bold">{t(q)}</p>
      {children}
    </div>
  );
}

export function PlanLab() {
  const { t } = useLang();
  const [a, setA] = useState<Answers>(DEFAULTS);
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) =>
    setA((x) => ({ ...x, [k]: v }));
  const yn = (
    k: "sdwan" | "manySmallSites" | "farFromRegion" | "encrypt" | "critical" | "overlap",
  ) => (
    <Segmented
      label={{ en: "Yes or no", ja: "はい / いいえ" }}
      options={YES_NO}
      value={a[k] ? "yes" : "no"}
      onChange={(v) => set(k, v === "yes")}
    />
  );
  const sites = a.who !== "people";
  const people = a.who !== "sites";
  // Questions about sites only matter when sites connect.
  const plan = advise(sites ? a : { ...a, transport: "internet", overlap: a.overlap });
  const internetPath = sites && !a.sdwan && a.transport === "internet" && a.bw !== "high";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <form
        className="panel flex flex-col gap-3 p-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <Q q={{ en: "Who needs to reach AWS?", ja: "誰が AWS につなぐ?" }}>
          <Segmented
            label={{ en: "Who connects", ja: "接続する主体" }}
            options={[
              {
                id: "sites",
                label: { en: "Sites (offices, DCs)", ja: "拠点 (オフィス・DC)" },
              },
              { id: "people", label: { en: "People", ja: "人" } },
              { id: "both", label: { en: "Both", ja: "両方" } },
            ]}
            value={a.who}
            onChange={(v) => set("who", v)}
          />
        </Q>
        {people && (
          <Q q={{ en: "What do people need?", ja: "人が必要とするのは?" }}>
            <Segmented
              label={{ en: "People need", ja: "人の用途" }}
              options={[
                {
                  id: "full",
                  label: { en: "The whole network", ja: "ネットワーク全体" },
                },
                { id: "apps", label: { en: "Specific apps", ja: "特定のアプリ" } },
                {
                  id: "nodata",
                  label: { en: "Data must stay in AWS", ja: "データを出さない" },
                },
                {
                  id: "admins",
                  label: { en: "Admins to servers", ja: "管理者がサーバーへ" },
                },
              ]}
              value={a.need}
              onChange={(v) => set("need", v)}
            />
          </Q>
        )}
        {sites && (
          <>
            <Q
              q={{
                en: "Do your sites already run SD-WAN?",
                ja: "拠点は既に SD-WAN を使っている?",
              }}
            >
              {yn("sdwan")}
            </Q>
            {!a.sdwan && (
              <>
                <Q
                  q={{
                    en: "May the traffic cross the internet?",
                    ja: "インターネットを通ってもよい?",
                  }}
                >
                  <Segmented
                    label={{ en: "Transport", ja: "トランスポート" }}
                    options={[
                      {
                        id: "internet",
                        label: { en: "Yes, encrypted is fine", ja: "暗号化すれば可" },
                      },
                      {
                        id: "steady",
                        label: { en: "Need steady latency", ja: "安定した遅延が必要" },
                      },
                      {
                        id: "closed",
                        label: { en: "Never (閉域)", ja: "絶対不可 (閉域)" },
                      },
                    ]}
                    value={a.transport}
                    onChange={(v) => set("transport", v)}
                  />
                </Q>
                <Q
                  q={{
                    en: "Sustained bandwidth per site?",
                    ja: "拠点あたりの継続的な帯域は?",
                  }}
                >
                  <Segmented
                    label={{ en: "Bandwidth", ja: "帯域" }}
                    options={[
                      {
                        id: "low",
                        label: { en: "Up to 1.25 Gbps", ja: "1.25 Gbps まで" },
                      },
                      { id: "mid", label: { en: "1.25 to 5 Gbps", ja: "1.25〜5 Gbps" } },
                      { id: "high", label: { en: "Over 5 Gbps", ja: "5 Gbps 超" } },
                    ]}
                    value={a.bw}
                    onChange={(v) => set("bw", v)}
                  />
                </Q>
                {internetPath && (
                  <>
                    <Q
                      q={{
                        en: "25 or more small sites, each under 100 Mbps?",
                        ja: "100 Mbps 未満の小拠点が 25 以上?",
                      }}
                    >
                      {yn("manySmallSites")}
                    </Q>
                    {a.bw === "low" && (
                      <Q
                        q={{
                          en: "Are sites far from the AWS Region?",
                          ja: "拠点が AWS リージョンから遠い?",
                        }}
                      >
                        {yn("farFromRegion")}
                      </Q>
                    )}
                  </>
                )}
              </>
            )}
            <Q q={{ en: "How many VPCs behind it?", ja: "その先の VPC の数は?" }}>
              <Segmented
                label={{ en: "VPCs", ja: "VPC" }}
                options={[
                  { id: "one", label: { en: "One", ja: "1 つ" } },
                  { id: "many", label: { en: "Many", ja: "複数" } },
                ]}
                value={a.vpcs}
                onChange={(v) => set("vpcs", v)}
              />
            </Q>
            {!internetPath && !a.sdwan && (
              <>
                <Q q={{ en: "How many AWS Regions?", ja: "AWS リージョンの数は?" }}>
                  <Segmented
                    label={{ en: "Regions", ja: "リージョン" }}
                    options={[
                      { id: "one", label: { en: "One", ja: "1 つ" } },
                      { id: "several", label: { en: "Several", ja: "複数" } },
                    ]}
                    value={a.regions}
                    onChange={(v) => set("regions", v)}
                  />
                </Q>
                <Q
                  q={{
                    en: "Must the link itself be encrypted?",
                    ja: "回線自体の暗号化が必須?",
                  }}
                >
                  {yn("encrypt")}
                </Q>
                <Q
                  q={{
                    en: "Is the workload business-critical?",
                    ja: "業務上クリティカルなワークロード?",
                  }}
                >
                  {yn("critical")}
                </Q>
              </>
            )}
          </>
        )}
        <Q
          q={{
            en: "Do AWS and on-prem CIDRs overlap (e.g. after an acquisition)?",
            ja: "AWS とオンプレの CIDR が重複している (買収後など)?",
          }}
        >
          {yn("overlap")}
        </Q>
      </form>

      <div className="flex flex-col gap-4">
        <div className="panel overflow-hidden" aria-live="polite">
          <div className="sign m-3 px-4 py-3">
            <p className="text-lg font-extrabold">
              {t({ en: "Your on-ramp", ja: "あなたの入口" })}
            </p>
          </div>
          <ol className="flex flex-col gap-0 px-4 pb-4">
            {plan.recs.map((r) => (
              <li
                key={r.id}
                className="relative flex gap-3 border-l-4 py-2 pl-4"
                style={{ borderColor: ROUTE[r.routes[0]].color }}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {r.routes.map((id) => (
                      <Shield
                        key={id}
                        label={ROUTE[id].shield}
                        color={ROUTE[id].color}
                        size="sm"
                      />
                    ))}
                    {r.pattern && (
                      <span className="rounded border border-[var(--line)] px-1.5 text-xs font-bold text-[var(--muted)]">
                        {r.pattern}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-bold">{t(REC[r.id].title)}</p>
                  <p className="text-sm text-[var(--muted)]">{t(REC[r.id].why)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {plan.avoid.length > 0 && (
          <div className="panel p-4">
            <p className="font-bold">
              {t({ en: "Wrong turns to avoid", ja: "避けるべき間違い" })}
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {plan.avoid.map((id) => (
                <li key={id} className="flex gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 rotate-45 items-center justify-center rounded-sm border-2 border-black bg-[var(--lane)]"
                  >
                    <span className="-rotate-45 text-xs font-black text-black">!</span>
                  </span>
                  <span>
                    <span className="font-bold">{t(ANTI[id].title)}</span>{" "}
                    <span className="text-[var(--muted)]">{t(ANTI[id].fix)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
