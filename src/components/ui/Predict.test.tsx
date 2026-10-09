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
  it("does not render the lab until the reader answers", () => {
    const onPick = setup();
    expect(screen.queryByText("lab control")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onPick).toHaveBeenCalledWith("a", false);
    expect(screen.getByText("Not quite.")).toBeInTheDocument();
    expect(screen.getByText("lab control")).toBeInTheDocument();
    // A wrong answer can be retried; the lab stays open.
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("lab control")).toBeInTheDocument();
  });

  it("lets the reader skip straight to the lab", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Skip and open the lab" }));
    expect(screen.getByText("lab control")).toBeInTheDocument();
    expect(screen.queryByText("Not quite.")).toBeNull();
  });

  it("ignores a second pick", () => {
    const onPick = setup();
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Right.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
});
