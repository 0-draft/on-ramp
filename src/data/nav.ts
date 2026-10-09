import type { L } from "@/i18n/lang";

/**
 * Every exit on the page, in driving order. The order follows the obstacles
 * you hit in real life: the internet first, then what you add when it is not
 * enough, then how AWS chooses between roads, then the services and people
 * that ride on them, then the cross-cutting limits and your plan.
 */
export const NAV: { id: string; label: L }[] = [
  { id: "why", label: { en: "Why hard?", ja: "なぜ難しい?" } },
  { id: "basics", label: { en: "Rules of the road", ja: "交通ルール" } },
  { id: "internet", label: { en: "Internet", ja: "インターネット" } },
  { id: "vpn", label: { en: "VPN", ja: "VPN" } },
  { id: "dx", label: { en: "Direct Connect", ja: "Direct Connect" } },
  { id: "hubs", label: { en: "Hubs", ja: "ハブ" } },
  { id: "sdwan", label: { en: "SD-WAN", ja: "SD-WAN" } },
  { id: "routing", label: { en: "Path selection", ja: "経路選択" } },
  { id: "private", label: { en: "PrivateLink", ja: "PrivateLink" } },
  { id: "dns", label: { en: "DNS", ja: "DNS" } },
  { id: "people", label: { en: "People", ja: "人の接続" } },
  { id: "edge", label: { en: "Edge & data", ja: "エッジ・データ" } },
  { id: "mtu", label: { en: "MTU", ja: "MTU" } },
  { id: "cost", label: { en: "Cost", ja: "コスト" } },
  { id: "plan", label: { en: "Plan yours", ja: "設計する" } },
  { id: "quiz", label: { en: "Quiz", ja: "クイズ" } },
  { id: "timeline", label: { en: "Timeline", ja: "年表" } },
  { id: "glossary", label: { en: "Glossary", ja: "用語集" } },
];
