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
    expect(
      screen.getByText("Site-to-Site VPN to a virtual private gateway"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Never (閉域)" }));
    expect(screen.getByText("Closed network: no internet anywhere")).toBeInTheDocument();
    expect(
      screen.getByText("S3 gateway endpoint for on-prem clients"),
    ).toBeInTheDocument();
  });
});
