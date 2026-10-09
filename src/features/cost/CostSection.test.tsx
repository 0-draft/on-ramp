import { fireEvent, render, screen, within } from "@testing-library/react";
import { LangProvider } from "@/i18n/LangContext";
import { CostSection } from "./CostSection";

describe("CostSection", () => {
  it("shows the 10 TB example and updates with the Transit Gateway toggle", () => {
    render(
      <LangProvider initial="ja">
        <CostSection />
      </LangProvider>,
    );
    const list = screen.getByRole("list", { name: "経路ごとの月額 AWS 料金" });
    expect(within(list).getByText(/\$627\.89/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: /Transit Gateway 経由/ }));
    expect(within(list).getByText(/\$934\.89/)).toBeInTheDocument();
  });
});
