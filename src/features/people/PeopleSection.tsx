import { useState } from "react";
import { useLang } from "@/i18n/useLang";
import { Callout, MetaphorLimit, Section, Sources, Spec } from "@/components/ui";
import { Stepper } from "@/components/ui/Stepper";
import { AccessCostLab } from "./AccessCostLab";
import { DoorChooser } from "./DoorChooser";
import { C, SSM_STEPS } from "./data";
import { SsmDiagram } from "./SsmDiagram";

export function PeopleSection() {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  return (
    <Section
      id="people"
      title={{ en: "People, not sites", ja: "拠点ではなく「人」をつなぐ" }}
      lead={{
        en: "A laptop at home is not a branch office. For people AWS offers four very different doors: put them on the network (Client VPN), let them into one app (Verified Access), give them a shell with no open port (Session Manager, EC2 Instance Connect Endpoint), or keep the work in AWS and stream only pixels (WorkSpaces).",
        ja: "自宅の PC は支社ではありません。人向けに AWS はまったく違う 4 種類の入口を用意しています。ネットワークに入れる (Client VPN)、1 つのアプリだけに入れる (Verified Access)、ポートを開けずにシェルを渡す (Session Manager・EC2 Instance Connect Endpoint)、作業は AWS 内に置いて画面だけ送る (WorkSpaces)。",
      }}
    >
      <DoorChooser />

      <h3 className="mt-10 text-xl font-extrabold">
        {t({
          en: "How Session Manager works with no inbound port",
          ja: "受信ポートなしで Session Manager が動く仕組み",
        })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "The trick is that nobody dials in. Both your laptop and the instance connect outward to the same AWS service, which joins the two connections.",
          ja: "ポイントは「誰も内向きに接続しない」こと。PC もインスタンスも同じ AWS サービスへ外向きにつなぎ、サービスが 2 本をつなぎ合わせます。",
        })}
      </p>
      <div className="panel mt-4 p-4 sm:p-5">
        <Stepper steps={SSM_STEPS} index={step} onChange={setStep} color={C}>
          <SsmDiagram step={step} />
        </Stepper>
      </div>

      <div className="mt-10">
        <AccessCostLab />
      </div>

      <dl className="panel mt-6 grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
        <Spec
          k={{ en: "Client VPN per user", ja: "Client VPN 1 人あたり" }}
          v={{ en: "50 Mbps baseline", ja: "ベースライン 50 Mbps" }}
        />
        <Spec
          k={{ en: "Client VPN connections", ja: "Client VPN 同時接続" }}
          v={{
            en: "7,000 with 1 subnet; 36,500 with 2",
            ja: "1 サブネットで 7,000、2 つで 36,500",
          }}
        />
        <Spec
          k={{ en: "EIC Endpoint", ja: "EIC Endpoint" }}
          v={{
            en: "1 per VPC, 20 connections, 1-hour tunnels",
            ja: "VPC に 1 つ、20 接続、トンネル 1 時間",
          }}
        />
        <Spec
          k={{ en: "Verified Access idle", ja: "Verified Access のアイドル" }}
          v={{ en: "HTTP 504 after 60 s", ja: "60 秒で HTTP 504" }}
        />
      </dl>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Callout
          tone="warn"
          title={{
            en: "Client VPN hides who is connecting",
            ja: "Client VPN では接続元が見えない",
          }}
        >
          {t({
            en: "With subnet associations, client IPs are NATed to the endpoint's ENI, so security groups and flow logs see the ENI, not the person. Since 2026-04-23 an endpoint can attach to a Transit Gateway instead, with no source NAT and the real client IP preserved.",
            ja: "サブネット関連付けでは、クライアント IP がエンドポイントの ENI に NAT されます。セキュリティグループやフローログに見えるのは ENI で、人ではありません。2026-04-23 からは Transit Gateway に直接つなげられ、送信元 NAT なしで実 IP が残ります。",
          })}
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: "Newest: device posture on Client VPN",
            ja: "最新: Client VPN の端末の状態 (ポスチャ)",
          }}
        >
          {t({
            en: "Since 2026-10-05, Client VPN can check device posture from CrowdStrike, Jamf or JumpCloud with Cedar policies, re-evaluated continuously. It needs AWS VPN Client 6.2.0 or later.",
            ja: "2026-10-05 から、Client VPN は CrowdStrike・Jamf・JumpCloud の端末状態を Cedar ポリシーで継続的に評価できます。AWS VPN Client 6.2.0 以降が必要。",
          })}
        </Callout>
      </div>

      <MetaphorLimit>
        {t({
          en: "These are not roads. Client VPN is a building pass that opens every floor; Verified Access is a guard checking ID at each office door; Session Manager is a receptionist who calls both of you and connects the line. None of them makes your laptop a branch of the corporate network.",
          ja: "これらは「道」ではありません。Client VPN は全フロアに入れる入館証、Verified Access は部屋ごとに身分証を確かめる警備員、Session Manager は双方に電話をかけて回線をつなぐ受付係。どれも PC を社内ネットワークの拠点にはしません。",
        })}
      </MetaphorLimit>

      <Sources
        doc="07-user-access.md"
        links={[
          {
            label: "Client VPN quotas",
            url: "https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/limits.html",
          },
          {
            label: "Client VPN with Transit Gateway",
            url: "https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/cvpn-tgw.html",
          },
          {
            label: "Verified Access pricing",
            url: "https://aws.amazon.com/verified-access/pricing/",
          },
          {
            label: "Session Manager VPC endpoints",
            url: "https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-create-vpc.html",
          },
          {
            label: "EC2 Instance Connect Endpoint quotas",
            url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/eice-quotas.html",
          },
        ]}
      />
    </Section>
  );
}
