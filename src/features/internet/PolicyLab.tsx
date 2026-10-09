import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { Segmented } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { evaluate, OFFICE_CIDR, VPCE_ID, type Arrival, type Condition } from "./policy";

const ARRIVALS: { id: Arrival; label: L }[] = [
  {
    id: "internet",
    label: { en: "Office, over the internet", ja: "オフィスからインターネット経由" },
  },
  {
    id: "endpoint",
    label: { en: "On-prem via VPC endpoint", ja: "オンプレから VPC エンドポイント経由" },
  },
  {
    id: "publicVif",
    label: { en: "On-prem via DX public VIF", ja: "オンプレから DX パブリック VIF 経由" },
  },
  {
    id: "nat",
    label: { en: "EC2 via NAT gateway", ja: "EC2 から NAT ゲートウェイ経由" },
  },
];

const CONDITIONS: { id: Condition; label: L }[] = [
  { id: "sourceIp", label: { en: "aws:SourceIp", ja: "aws:SourceIp" } },
  { id: "sourceVpce", label: { en: "aws:SourceVpce", ja: "aws:SourceVpce" } },
  {
    id: "both",
    label: { en: "Either (two statements)", ja: "どちらか (2 つのステートメント)" },
  },
];

const POLICY: Record<Condition, string> = {
  sourceIp: `"Condition": { "NotIpAddress": { "aws:SourceIp": "${OFFICE_CIDR}" } }`,
  sourceVpce: `"Condition": { "StringNotEquals": { "aws:SourceVpce": "${VPCE_ID}" } }`,
  both: `allow if aws:SourceIp in ${OFFICE_CIDR}\n  or aws:SourceVpce = ${VPCE_ID}`,
};

const WHY: Record<Arrival, L> = {
  internet: {
    en: "From the office over the internet, AWS sees your proxy's public egress IP in aws:SourceIp, and no endpoint key at all.",
    ja: "オフィスからインターネット経由だと、AWS が aws:SourceIp に見るのはプロキシのパブリック出口 IP。エンドポイント系のキーは一切ありません。",
  },
  endpoint: {
    en: "Through a VPC endpoint aws:SourceIp is absent from the request, so an IP allowlist denies everything. You get aws:SourceVpce (and aws:SourceVpc, aws:VpcSourceIp) instead. This is the classic break when traffic moves from the internet to DX.",
    ja: "VPC エンドポイント経由ではリクエストに aws:SourceIp が含まれないので、IP 許可リストは全部拒否します。代わりに aws:SourceVpce (と aws:SourceVpc、aws:VpcSourceIp) が入ります。インターネットから DX に移したときに壊れる典型例。",
  },
  publicVif: {
    en: "Over a public VIF the source is your own public prefix advertised on the VIF (here 198.51.100.0/24), not the office internet egress. The request reaches S3 without touching the internet, but the IP allowlist has to include that prefix.",
    ja: "パブリック VIF 経由の送信元は、VIF で広告している自社のパブリックプレフィックス (ここでは 198.51.100.0/24) で、オフィスのインターネット出口ではありません。インターネットは通らずに S3 に届きますが、IP 許可リストにそのプレフィックスを入れる必要があります。",
  },
  nat: {
    en: "EC2 behind a NAT gateway shows up as the NAT gateway's public IP. The traffic stays on the AWS network, but it is neither your office IP nor your endpoint. (A free S3 gateway endpoint would avoid the NAT charge too.)",
    ja: "NAT ゲートウェイの背後の EC2 は、NAT ゲートウェイのパブリック IP として見えます。通信は AWS のネットワーク内に留まりますが、オフィスの IP でもエンドポイントでもありません (無料の S3 ゲートウェイエンドポイントなら NAT 料金も不要)。",
  },
};

/** Will S3 let this request in? Pick the road and the policy, guess, reveal. */
export function PolicyLab() {
  const { t } = useLang();
  const [arrival, setArrival] = useState<Arrival>("endpoint");
  const [cond, setCond] = useState<Condition>("sourceIp");
  const v = evaluate(arrival, cond);

  return (
    <div className="panel grid gap-4 p-4 sm:p-5 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-bold">
            {t({ en: "1. How the request arrives", ja: "1. リクエストの来かた" })}
          </p>
          <Segmented
            label={{ en: "How the request arrives", ja: "リクエストの来かた" }}
            options={ARRIVALS}
            value={arrival}
            onChange={setArrival}
            color="var(--r-internet)"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">
            {t({
              en: "2. What the bucket policy allows",
              ja: "2. バケットポリシーが許可する条件",
            })}
          </p>
          <Segmented
            label={{ en: "Bucket policy condition", ja: "バケットポリシーの条件" }}
            options={CONDITIONS}
            value={cond}
            onChange={setCond}
            color="var(--r-internet)"
          />
          <div className="mt-2 overflow-x-auto rounded-lg bg-[var(--paper-2)] p-3">
            <pre className="font-mono text-xs leading-relaxed whitespace-pre">
              {POLICY[cond]}
            </pre>
          </div>
        </div>
      </div>
      <Predict
        question={{ en: "Does S3 let the request in?", ja: "S3 はリクエストを通す?" }}
        options={[
          { id: "allow", label: { en: "Allowed", ja: "許可" } },
          { id: "deny", label: { en: "Denied", ja: "拒否" } },
        ]}
        answer={v.allowed ? "allow" : "deny"}
        resetKey={`${arrival}-${cond}`}
        why={
          <div className="text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono">
              <dt className="text-[var(--muted)]">aws:SourceIp</dt>
              <dd>{v.ctx.sourceIp ?? t({ en: "(absent)", ja: "(なし)" })}</dd>
              <dt className="text-[var(--muted)]">aws:SourceVpce</dt>
              <dd>{v.ctx.sourceVpce ?? t({ en: "(absent)", ja: "(なし)" })}</dd>
            </dl>
            <p className="mt-2">{t(WHY[arrival])}</p>
            <p className="mt-2 font-semibold">
              {v.allowed
                ? t({ en: "Result: allowed.", ja: "結果: 許可。" })
                : t({ en: "Result: denied.", ja: "結果: 拒否。" })}
            </p>
          </div>
        }
      />
    </div>
  );
}
