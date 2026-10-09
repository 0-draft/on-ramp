import { Section, Sources } from "@/components/ui";
import { RoutingLab } from "./RoutingLab";

export function RoutingSection() {
  return (
    <Section
      id="routing"
      title={{
        en: "Two roads: which one does AWS take?",
        ja: "道が 2 本: AWS はどちらを通る?",
      }}
      lead={{
        en: "With DX and a VPN (or two of anything), AWS has to choose a road for traffic coming back to you. Each hub decides with its own fixed checklist, and the checklists disagree. Pick a scenario, guess, then watch the hub walk its list.",
        ja: "DX と VPN (あるいは何でも 2 本) があると、社内へ戻る通信の道を AWS が選びます。ハブごとに固定のチェックリストがあり、しかもリストはハブごとに違います。シナリオを選び、予想してから、ハブがリストを順にたどる様子を見てください。",
      }}
    >
      <RoutingLab />
      <Sources
        doc="06-routing-and-path-selection.md"
        links={[
          {
            label: "VPC route priority",
            url: "https://docs.aws.amazon.com/vpc/latest/userguide/route-tables-priority.html",
          },
          {
            label: "Site-to-Site VPN route priority",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/vpn-route-priority.html",
          },
          {
            label: "Transit Gateway route evaluation order",
            url: "https://docs.aws.amazon.com/vpc/latest/tgw/how-transit-gateways-work.html",
          },
          {
            label: "Cloud WAN route evaluation",
            url: "https://docs.aws.amazon.com/network-manager/latest/cloudwan/cloudwan-route-evaluation.html",
          },
        ]}
      />
    </Section>
  );
}
