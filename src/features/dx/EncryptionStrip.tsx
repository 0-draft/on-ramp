import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { encrypted, SEGMENTS, type Crypto, type Seg } from "./model";

const ROWS: { id: Crypto; label: L }[] = [
  { id: "none", label: { en: "DX as is", ja: "DX そのまま" } },
  { id: "macsec", label: { en: "+ MACsec", ja: "+ MACsec" } },
  { id: "ipsec", label: { en: "+ Private IP VPN", ja: "+ Private IP VPN" } },
];

const SEG: Record<Seg, L> = {
  carrier: { en: "Carrier circuit", ja: "事業者回線" },
  crossConnect: { en: "Cross connect", ja: "クロスコネクト" },
  awsSide: { en: "AWS side to the TGW", ja: "AWS 側 (TGW まで)" },
};

/**
 * Which stretch of a DX path each option encrypts, as a static grid. A
 * dashed red cell is plaintext, so the meaning never rests on colour alone.
 */
export function EncryptionStrip() {
  const { t } = useLang();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-separate border-spacing-1.5 text-sm">
        <thead>
          <tr>
            <th className="text-left font-bold" />
            {SEGMENTS.map((s) => (
              <th key={s} className="px-2 text-left font-bold">
                {t(SEG[s])}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => {
            const enc = encrypted(r.id);
            return (
              <tr key={r.id}>
                <th scope="row" className="pr-2 text-left font-bold whitespace-nowrap">
                  {t(r.label)}
                </th>
                {SEGMENTS.map((s) => (
                  <td
                    key={s}
                    className="rounded-md border-2 px-2 py-1.5 font-black"
                    style={{
                      borderColor: enc[s] ? "var(--ok)" : "var(--bad)",
                      borderStyle: enc[s] ? "solid" : "dashed",
                      color: enc[s] ? "var(--ok)" : "var(--bad)",
                    }}
                  >
                    {enc[s]
                      ? t({ en: "🔒 Encrypted", ja: "🔒 暗号化" })
                      : t({ en: "Plaintext", ja: "平文" })}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
