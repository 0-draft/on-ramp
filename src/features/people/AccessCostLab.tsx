import { useState } from "react";
import { useLang } from "@/i18n/useLang";
import { Slider } from "@/components/ui/Slider";
import { monthlyCost } from "./chooser";
import { C } from "./data";

/**
 * Client VPN (billed per person-hour) against Verified Access (billed per
 * app-hour) for the same people. Client VPN gets a neutral layer colour: it
 * is a people door too, not the site-to-site VPN route.
 */
export function AccessCostLab() {
  const { t } = useLang();
  const [users, setUsers] = useState(100);
  const [apps, setApps] = useState(3);
  const hours = 160;
  const c = monthlyCost({ azs: 2, users, hoursPerUser: hours, apps });
  const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const max = Math.max(c.clientVpn, c.ava, 1);
  const bar = (v: number, color: string, label: string, pattern?: boolean) => (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <span className="text-sm font-bold sm:w-36 sm:shrink-0">{label}</span>
      <div className="flex flex-1 items-center gap-3">
        <div className="h-6 flex-1 rounded bg-[var(--paper-2)]">
          <div
            className="h-6 rounded"
            style={{
              width: `${(v / max) * 100}%`,
              background: pattern
                ? `repeating-linear-gradient(135deg, ${color} 0 6px, transparent 6px 9px), ${color}`
                : color,
            }}
          />
        </div>
        <span className="num w-20 shrink-0 text-right font-bold">{fmt(v)}</span>
      </div>
    </div>
  );
  const usersText = t({ en: `${users} people`, ja: `${users} 人` });
  const appsText = t({ en: `${apps} apps`, ja: `${apps} 個` });
  return (
    <div className="panel p-4 sm:p-5">
      <p className="font-bold">
        {t({
          en: "Per-user or per-app? A monthly bill in Tokyo",
          ja: "ユーザー課金かアプリ課金か: 東京の月額",
        })}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider
          label={{ en: "People", ja: "利用者" }}
          min={10}
          max={1000}
          step={10}
          value={users}
          onChange={setUsers}
          format={() => usersText}
        />
        <Slider
          label={{ en: "Internal web apps", ja: "社内 Web アプリ" }}
          min={1}
          max={40}
          value={apps}
          onChange={setApps}
          format={() => appsText}
        />
      </div>
      <div className="mt-4 space-y-2">
        {bar(c.clientVpn, "var(--layer-2)", "Client VPN", true)}
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
