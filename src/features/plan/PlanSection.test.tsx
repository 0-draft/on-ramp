import { fireEvent, render, screen } from "@testing-library/react";
import { LangProvider } from "@/i18n/LangContext";
import { PlanSection } from "./PlanSection";

describe("PlanSection", () => {
  it("recommends a VPN by default and Direct Connect for a closed network", () => {
    render(
      <LangProvider initial="en">
        <PlanSection />
      </LangProvider>,
    );
    // Shown in the result panel and in the phone bar.
    expect(
      screen.getAllByText("Site-to-Site VPN to a virtual private gateway").length,
    ).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("radio", { name: "Never (閉域)" }));
    expect(screen.getByText("Closed network: no internet anywhere")).toBeInTheDocument();
    // Each yes/no group is named by its visible question.
    expect(
      screen.getByRole("radiogroup", { name: "Do your sites already run SD-WAN?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("S3 gateway endpoint for on-prem clients"),
    ).toBeInTheDocument();
  });
});
