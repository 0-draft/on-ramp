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
  it("a wrong pick neither reveals the answer nor opens the lab", () => {
    const onPick = setup();
    expect(screen.queryByText("lab control")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onPick).toHaveBeenCalledWith("a", false);
    expect(screen.getByText("Not quite. Try another.")).toBeInTheDocument();
    expect(screen.queryByText("because")).toBeNull();
    expect(screen.queryByText("lab control")).toBeNull();
    // The second try finds it: the why and the lab appear.
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(screen.getByText("because")).toBeInTheDocument();
    expect(screen.getByText("lab control")).toBeInTheDocument();
  });

  it("can reveal the answer after a wrong pick", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    fireEvent.click(screen.getByRole("button", { name: "Show the answer" }));
    expect(screen.getByText("because")).toBeInTheDocument();
    expect(screen.getByText("lab control")).toBeInTheDocument();
  });

  it("lets the reader skip straight to the lab", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Skip and open the lab" }));
    expect(screen.getByText("lab control")).toBeInTheDocument();
    expect(screen.queryByText("Not quite. Try another.")).toBeNull();
  });

  it("locks the options once solved", () => {
    const onPick = setup();
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Right.")).toBeInTheDocument();
  });
});
