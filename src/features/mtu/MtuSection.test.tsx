import { fireEvent, render, screen } from "@testing-library/react";
import { LangProvider } from "@/i18n/LangContext";
import { MtuSection } from "./MtuSection";

describe("MtuSection", () => {
  it("opens a path's headers and reacts to the packet size", () => {
    render(
      <LangProvider initial="en">
        <MtuSection />
      </LangProvider>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Low clearance");
    // Default path is VPN AES-GCM: a 1500 B packet is black-holed.
    expect(screen.getByText("Too tall: silently dropped")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Internet \(internet gateway\)/ }));
    expect(screen.getByText("Fits under the bridge")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Packet size/), { target: { value: "1600" } });
    expect(screen.getByText("Too tall: told to shrink")).toBeInTheDocument();
  });
});
