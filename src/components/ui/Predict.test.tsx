import { fireEvent, render, screen } from "@testing-library/react";
import { LangProvider } from "@/i18n/LangContext";
import { Predict } from "./Predict";

function setup(onPick = vi.fn()) {
  render(
    <LangProvider initial="en">
      <Predict
        question={{ en: "Which?", ja: "どれ?" }}
        options={[
          { id: "a", label: { en: "A", ja: "A" } },
          { id: "b", label: { en: "B", ja: "B" } },
        ]}
        answer="b"
        why={<p>because</p>}
        onPick={onPick}
      >
        <button type="button">lab control</button>
      </Predict>
    </LangProvider>,
  );
  return onPick;
}

describe("Predict", () => {
  it("keeps the lab inert until the reader answers", () => {
    const onPick = setup();
    const lab = screen.getByText("lab control").parentElement!;
    expect(lab).toHaveAttribute("inert");
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onPick).toHaveBeenCalledWith("a", false);
    expect(screen.getByText("Not quite.")).toBeInTheDocument();
    expect(lab).not.toHaveAttribute("inert");
  });

  it("lets the reader skip straight to the lab", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Skip and show the lab" }));
    expect(screen.getByText("lab control").parentElement).not.toHaveAttribute("inert");
    expect(screen.queryByText("Not quite.")).toBeNull();
  });

  it("ignores a second pick", () => {
    const onPick = setup();
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Right.")).toBeInTheDocument();
  });
});
