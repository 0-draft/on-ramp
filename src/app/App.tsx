import { Header } from "@/components/layout/Header";
import { useLang } from "@/i18n/useLang";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/features/hero/Hero";
import { WhySection } from "@/features/why/WhySection";
import { BasicsSection } from "@/features/basics/BasicsSection";
import { PeopleSection } from "@/features/people/PeopleSection";
import { EdgeSection } from "@/features/edge/EdgeSection";
import { QuizSection } from "@/features/quiz/QuizSection";
import { TimelineSection } from "@/features/timeline/TimelineSection";
import { GlossarySection } from "@/features/glossary/GlossarySection";
import { InternetSection } from "@/features/internet/InternetSection";
import { VpnSection } from "@/features/vpn/VpnSection";
import { DxSection } from "@/features/dx/DxSection";
import { HubsSection } from "@/features/hubs/HubsSection";
import { SdwanSection } from "@/features/sdwan/SdwanSection";
import { RoutingSection } from "@/features/routing/RoutingSection";
import { PrivateSection } from "@/features/private/PrivateSection";
import { DnsSection } from "@/features/dns/DnsSection";
import { MtuSection } from "@/features/mtu/MtuSection";
import { CostSection } from "@/features/cost/CostSection";
import { PlanSection } from "@/features/plan/PlanSection";

export default function App() {
  const { t } = useLang();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[var(--lane)] focus:px-4 focus:py-2 focus:text-black"
      >
        {t({ en: "Skip to content", ja: "本文へスキップ" })}
      </a>
      <Header />
      <main id="main" className="mx-auto max-w-6xl px-4 sm:px-6">
        <span id="top" />
        <Hero />
        <WhySection />
        <BasicsSection />
        <InternetSection />
        <VpnSection />
        <DxSection />
        <HubsSection />
        <SdwanSection />
        <RoutingSection />
        <PrivateSection />
        <DnsSection />
        <PeopleSection />
        <EdgeSection />
        <MtuSection />
        <CostSection />
        <PlanSection />
        <QuizSection />
        <TimelineSection />
        <GlossarySection />
      </main>
      <Footer />
    </>
  );
}
