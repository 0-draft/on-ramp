import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { Segmented } from "@/components/ui";
import { encrypted, type Cover, type Crypto, type Seg } from "./model";

interface Stretch {
  id: "you" | Seg;
  owner: L;
  what: L;
  /** Owner colour from the layer palette (never a route colour), plus a pattern. */
  color: string;
  pattern: string;
  breaks: L;
}

const STRETCHES: Stretch[] = [
  {
    id: "you",
    owner: { en: "You", ja: "自社" },
    what: { en: "Your router and its BGP config", ja: "自社ルーターと BGP 設定" },
    color: "var(--layer-3)",
    pattern: "none",
    breaks: {
      en: "The link has light but BGP is down, often right after a change on your side: wrong VLAN, ASN, peer IP or MD5 key. You fix it.",
      ja: "光は来ているのに BGP が落ちている。自社側の変更直後に多い (VLAN・ASN・ピア IP・MD5 キーの誤り)。自社で直します。",
    },
  },
  {
    id: "carrier",
    owner: { en: "Carrier", ja: "通信事業者" },
    what: {
      en: "The circuit from your building to the DX location",
      ja: "自社拠点から DX ロケーションまでの回線",
    },
    color: "var(--layer-1)",
    pattern:
      "repeating-linear-gradient(45deg, transparent 0 5px, rgba(0,0,0,.22) 5px 7px)",
    breaks: {
      en: "The circuit drops and the port goes down. AWS cannot see past its own port, so the carrier is who you call.",
      ja: "回線断でポートが down に。AWS は自分のポートの先は見えないので、連絡先は通信事業者です。",
    },
  },
  {
    id: "crossConnect",
    owner: { en: "Colocation operator", ja: "コロケーション事業者" },
    what: {
      en: "The cross connect fiber in the building",
      ja: "施設内のクロスコネクト (光ファイバー)",
    },
    color: "var(--layer-2)",
    pattern:
      "repeating-linear-gradient(90deg, transparent 0 6px, rgba(0,0,0,.22) 6px 8px)",
    breaks: {
      en: "No light at AWS's port, typically at first turn-up when the patch does not match the LOA-CFA. The colocation operator re-patches it.",
      ja: "AWS のポートに光が来ない。初回開通時にパッチが LOA-CFA と合っていないことが多く、コロケーション事業者が繋ぎ直します。",
    },
  },
  {
    id: "awsSide",
    owner: { en: "AWS", ja: "AWS" },
    what: {
      en: "DX router, VIF, gateway and the backbone to the Region",
      ja: "DX ルーター・VIF・ゲートウェイ・リージョンまでのバックボーン",
    },
    color: "var(--hub)",
    pattern: "none",
    breaks: {
      en: "AWS's device or path fails, or a maintenance window starts: check AWS Health and DX maintenance notices, then open a Support case. A second location (or a VPN) is what keeps you up.",
      ja: "AWS の機器・経路の障害か、メンテナンスの開始。AWS Health と DX のメンテナンス通知を確認し、サポートケースを開きます。稼働を守るのは 2 つ目のロケーション (か VPN)。",
    },
  },
];

const CRYPTO: { id: Crypto; label: L }[] = [
  { id: "none", label: { en: "DX as is", ja: "DX そのまま" } },
  { id: "macsec", label: { en: "+ MACsec", ja: "+ MACsec" } },
  { id: "ipsec", label: { en: "+ Private IP VPN", ja: "+ プライベート IP VPN" } },
];

const COVER: Record<Cover, { label: L; color: string; border: string }> = {
  yes: {
    label: { en: "🔒 Encrypted", ja: "🔒 暗号化" },
    color: "var(--ok)",
    border: "solid",
  },
  no: { label: { en: "Plaintext", ja: "平文" }, color: "var(--bad)", border: "dashed" },
  maybe: {
    label: {
      en: "Only if Layer 2 transparent",
      ja: "L2 透過のときだけ",
    },
    color: "var(--warn)",
    border: "dotted",
  },
};

/**
 * One DX path drawn as four stretches, each in its owner's colour and pattern.
 * Tap a stretch to see what a failure there looks like and who fixes it; pick
 * an encryption option to see which stretches it covers.
 */
export function OwnerPath() {
  const { t } = useLang();
  const [crypto, setCrypto] = useState<Crypto>("none");
  const [sel, setSel] = useState<Stretch["id"]>("carrier");
  const enc = encrypted(crypto);
  const chosen = STRETCHES.find((s) => s.id === sel)!;

  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold">{t({ en: "Encryption", ja: "暗号化" })}</span>
        <Segmented
          label={{ en: "Encryption option", ja: "暗号化の選択肢" }}
          options={CRYPTO}
          value={crypto}
          onChange={setCrypto}
        />
      </div>

      <ol className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-1">
        {STRETCHES.map((s, i) => {
          const cover = s.id === "you" ? null : enc[s.id];
          const on = s.id === sel;
          return (
            <li key={s.id} className="min-w-0 sm:flex-1">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setSel(s.id)}
                className="flex h-full w-full flex-col overflow-hidden rounded-lg border-2 text-left"
                style={{ borderColor: on ? "var(--ink)" : "var(--line)" }}
              >
                <span
                  aria-hidden="true"
                  className="block h-3"
                  style={{ background: s.color, backgroundImage: s.pattern }}
                />
                <span className="flex flex-1 flex-col gap-1 p-3">
                  <span className="text-xs font-bold text-[var(--muted)]">
                    {i + 1}. {t(s.owner)}
                  </span>
                  <span className="text-sm font-semibold">{t(s.what)}</span>
                  <span
                    className="mt-auto inline-flex w-fit rounded-md border-2 px-2 py-0.5 text-xs font-bold"
                    style={
                      cover
                        ? {
                            color: COVER[cover].color,
                            borderColor: COVER[cover].color,
                            borderStyle: COVER[cover].border,
                          }
                        : { color: "var(--muted)", borderColor: "var(--line)" }
                    }
                  >
                    {cover
                      ? t(COVER[cover].label)
                      : t({ en: "Encryption starts here", ja: "暗号化はここから" })}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 rounded-lg bg-[var(--paper-2)] p-3" aria-live="polite">
        <p className="text-sm font-bold">
          {t({ en: "If it breaks here", ja: "ここが壊れたら" })}: {t(chosen.owner)}
        </p>
        <p className="mt-1 text-sm">{t(chosen.breaks)}</p>
      </div>
      {crypto === "macsec" && (
        <p className="mt-3 text-sm text-[var(--muted)]">
          {t({
            en: "MACsec is hop by hop between your MACsec device and AWS's, which need a direct Layer 2 adjacency. With your device in the colo cage it covers only the cross connect; it covers the carrier circuit only if your device is at your end and the carrier passes Layer 2 through. It needs a dedicated 10, 100 or 400 Gbps port.",
            ja: "MACsec は自社の MACsec 機器と AWS 機器の間のホップ単位で、両者は L2 で直接隣接している必要があります。機器をコロケーションのケージに置けば対象はクロスコネクトだけ。事業者回線まで守れるのは、機器を自社側に置き、事業者が L2 を透過する場合だけです。専用接続の 10・100・400 Gbps ポートが必要です。",
          })}
        </p>
      )}
    </div>
  );
}
