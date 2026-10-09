import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/features/hero/Hero";
import { InternetSection } from "@/features/internet/InternetSection";
import { VpnSection } from "@/features/vpn/VpnSection";
import { RoutingSection } from "@/features/routing/RoutingSection";
import { MtuSection } from "@/features/mtu/MtuSection";
import { CostSection } from "@/features/cost/CostSection";
import { PlanSection } from "@/features/plan/PlanSection";

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[var(--lane)] focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="mx-auto max-w-6xl px-4 sm:px-6">
        <span id="top" />
        <Hero />
        <InternetSection />
        <VpnSection />
        <RoutingSection />
        <MtuSection />
        <CostSection />
        <PlanSection />
      </main>
      <Footer />
    </>
  );
}
