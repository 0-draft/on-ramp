import { render, screen } from "@testing-library/react";
import App from "./App";
import { LangProvider } from "@/i18n/LangContext";

describe("App", () => {
  it("renders the title", () => {
    render(
      <LangProvider initial="en">
        <App />
      </LangProvider>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("On-ramp");
  });
});
