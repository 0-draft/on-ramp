import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { LangProvider } from "@/i18n/LangContext";
import { NAV } from "@/data/nav";

describe("App", () => {
  for (const lang of ["en", "ja"] as const) {
    it(`renders every exit in ${lang}`, async () => {
      const { container } = render(
        <LangProvider initial={lang}>
          <App />
        </LangProvider>,
      );
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("On-ramp");
      // The tail exits load lazily; wait until none is a placeholder.
      await waitFor(() => expect(container.querySelector("[aria-busy=true]")).toBeNull());
      for (const n of NAV) {
        const section = container.querySelector(`section#${n.id}`);
        expect(section, n.id).not.toBeNull();
        // Each exit is labelled by its own sign heading.
        expect(section!.querySelector("h2")?.textContent, n.id).toBeTruthy();
      }
    });
  }
});
