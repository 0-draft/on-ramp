import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { Slider } from "@/components/ui/Slider";
import { plan, type Design } from "./scale";

const DESIGNS: { id: Design; name: L; how: L }[] = [
  {
    id: "vgw",
    name: { en: "VGW per VPC", ja: "VPC ごとに VGW" },
    how: {
      en: "A private VIF straight to each VPC's VGW",
      ja: "各 VPC の VGW にプライベート VIF を直結",
    },
  },
  {
    id: "dxgw",
    name: { en: "DX gateway + VGWs", ja: "DX ゲートウェイ + VGW" },
    how: {
      en: "Private VIFs to a DX gateway, VGWs behind it",
      ja: "DX ゲートウェイにプライベート VIF、その先に VGW",
    },
  },
  {
    id: "tgw",
    name: { en: "Transit Gateway", ja: "Transit Gateway" },
    how: {
      en: "Transit VIFs to a DX gateway, a TGW per Region",
      ja: "DX ゲートウェイにトランジット VIF、リージョンごとに TGW",
    },
  },
  {
    id: "cloudwan",
    name: { en: "Cloud WAN", ja: "Cloud WAN" },
    how: {
      en: "Transit VIFs to a DX gateway, one core network",
      ja: "DX ゲートウェイにトランジット VIF、コアネットワーク 1 つ",
    },
  },
];

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function ScaleLab() {
  const { t } = useLang();
  const [vpcs, setVpcs] = useState(12);
  const [regionsRaw, setRegions] = useState(2);
  // Never more Regions than VPCs: an empty Region needs no hub.
  const regions = Math.min(regionsRaw, vpcs);
  const [sites, setSites] = useState(2);

  const plans = DESIGNS.map((d) => ({ d, p: plan(d.id, { vpcs, regions, sites }) }));
  const objects = (p: (typeof plans)[number]["p"]) =>
    p.hubs + p.attachments + p.vifs + p.interRegion;
  const most = Math.max(...plans.map(({ p }) => objects(p)));

  return (
    <div className="panel p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider
          label={{ en: "VPCs", ja: "VPC の数" }}
          value={vpcs}
          min={1}
          max={60}
          onChange={setVpcs}
        />
        <Slider
          label={{ en: "Regions", ja: "リージョン数" }}
          value={regions}
          min={1}
          max={Math.max(1, Math.min(8, vpcs))}
          onChange={setRegions}
        />
        <Slider
          label={{ en: "Sites with a DX connection", ja: "DX 接続のある拠点" }}
          value={sites}
          min={1}
          max={4}
          onChange={setSites}
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {plans.map(({ d, p }) => {
          const blocked = !p.reachesAll;
          const n = objects(p);
          return (
            <article
              key={d.id}
              className="rounded-xl border-2 p-3"
              style={{ borderColor: blocked ? "var(--bad)" : "var(--line)" }}
            >
              <h4 className="font-extrabold">{t(d.name)}</h4>
              <p className="text-xs text-[var(--muted)]">{t(d.how)}</p>

              <div className="mt-3" aria-hidden="true">
                <div className="h-3 rounded-full bg-[var(--paper-2)]">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${(n / most) * 100}%`,
                      background: blocked ? "var(--bad)" : "var(--data)",
                    }}
                  />
                </div>
              </div>
              <p className="mt-1 text-sm">
                <span className="num text-2xl font-black">{n}</span>{" "}
                {t({ en: "things to build and run", ja: "個のリソースを構築・運用" })}
              </p>

              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <dt className="text-[var(--muted)]">
                  {t({ en: "Gateways / hubs", ja: "ゲートウェイ / ハブ" })}
                </dt>
                <dd className="num text-right font-bold">{p.hubs}</dd>
                <dt className="text-[var(--muted)]">
                  {t({ en: "Attachments", ja: "アタッチメント" })}
                </dt>
                <dd className="num text-right font-bold">{p.attachments}</dd>
                <dt className="text-[var(--muted)]">
                  {t({ en: "VIFs (BGP)", ja: "VIF (BGP)" })}
                </dt>
                <dd className="num text-right font-bold">{p.vifs}</dd>
                <dt className="text-[var(--muted)]">
                  {t({ en: "Region links", ja: "リージョン間接続" })}
                </dt>
                <dd className="num text-right font-bold">{p.interRegion}</dd>
                <dt className="text-[var(--muted)]">
                  {t({ en: "VPC ↔ VPC", ja: "VPC 間通信" })}
                </dt>
                <dd className="num text-right font-bold">
                  {p.vpcToVpc ? t({ en: "Yes", ja: "可" }) : t({ en: "No", ja: "不可" })}
                </dd>
                <dt className="text-[var(--muted)]">
                  {t({ en: "Hub charge", ja: "ハブ料金" })}
                </dt>
                <dd className="num text-right font-bold">
                  {usd(p.monthly)}
                  {t({ en: "/mo", ja: "/月" })}
                </dd>
              </dl>

              {p.limits.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-[var(--line)] pt-2 text-xs">
                  {p.limits.map((l, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span
                        className="mt-0.5 shrink-0 self-start rounded px-1 font-black text-[var(--on-color)]"
                        style={{ background: l.hard ? "var(--bad)" : "var(--warn)" }}
                      >
                        {l.hard
                          ? t({ en: "hard", ja: "固定" })
                          : t({ en: "note", ja: "注意" })}
                      </span>
                      <span>{t(l.text)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">
        {t({
          en: "Assumes one dedicated DX connection per site, VPCs spread evenly across Regions, and no more Regions than VPCs. Region links are Transit Gateway peerings you route with static routes. Hub charge is per month at Tokyo list prices, 730 hours: VPC, DX and peering attachment-hours (TGW $0.07/h, each peering counted once) or core network edges ($0.50/h) plus attachments ($0.09/h). Data processing ($0.02/GB on both), DX ports and data transfer come on top.",
          ja: "前提: 各拠点に専用 DX 接続 1 本、VPC はリージョンに均等配置、リージョン数は VPC 数以下。リージョン間接続は静的ルートで運用する Transit Gateway ピアリング。ハブ料金は東京の定価・730 時間の月額で、VPC・DX・ピアリングのアタッチメント時間 (TGW $0.07/時、ピアリングは 1 本 1 回分) またはコアネットワークエッジ ($0.50/時) + アタッチメント ($0.09/時)。データ処理料 (どちらも $0.02/GB)、DX ポート、データ転送は別途。",
        })}{" "}
        <a
          className="font-bold underline"
          href="https://0-draft.github.io/cross-connect/#pricing"
        >
          {t({
            en: "DX port and transfer prices: Cross Connect",
            ja: "DX のポート・転送料金: Cross Connect",
          })}
        </a>
      </p>
      <p className="sr-only" aria-live="polite">
        {plans
          .map(({ d, p }) => `${t(d.name)}: ${objects(p)}, ${usd(p.monthly)}`)
          .join("; ")}
      </p>
    </div>
  );
}
