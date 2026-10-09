import { fireEvent, render, screen } from "@testing-library/react";
import { LangProvider } from "@/i18n/LangContext";
import type { Lang } from "@/i18n/lang";
import { WhySection } from "./WhySection";
import { BasicsSection } from "@/features/basics/BasicsSection";
import { QuizSection } from "@/features/quiz/QuizSection";
import { TimelineSection } from "@/features/timeline/TimelineSection";
import { GlossarySection } from "@/features/glossary/GlossarySection";

const SECTIONS = [
  WhySection,
  BasicsSection,
  QuizSection,
  TimelineSection,
  GlossarySection,
];

// Covers the sections in why/, basics/, quiz/, timeline/ and glossary/ only.
describe("sections render in both languages", () => {
  for (const lang of ["en", "ja"] as Lang[]) {
    it(lang, () => {
      const { container } = render(
        <LangProvider initial={lang}>
          {SECTIONS.map((S, i) => (
            <S key={i} />
          ))}
        </LangProvider>,
      );
      for (const id of ["why", "basics", "quiz", "timeline", "glossary"])
        expect(container.querySelector(`section#${id}`)).not.toBeNull();
    });
  }
});

describe("interactions", () => {
  const wrap = (el: React.ReactNode) =>
    render(<LangProvider initial="en">{el}</LangProvider>);

  it("why: closing every gap reports all closed", () => {
    wrap(<WhySection />);
    expect(screen.getByText("4 of 4 gaps still open.")).toBeInTheDocument();
    for (const s of screen.getAllByRole("switch")) fireEvent.click(s);
    expect(screen.getByText(/All four closed/)).toBeInTheDocument();
  });

  it("why: fixing a gap lights its layer as fixed", () => {
    wrap(<WhySection />);
    expect(screen.queryAllByText("✓ fixed")).toHaveLength(0);
    fireEvent.click(screen.getAllByRole("switch")[0]);
    expect(screen.getAllByText("✓ fixed").length).toBeGreaterThan(0);
  });

  it("timeline: defaults to the recent wave and can show everything", () => {
    wrap(<TimelineSection />);
    const all = screen.getByRole("button", { name: /^Show all \d+$/ });
    fireEvent.click(all);
    expect(screen.queryByRole("button", { name: /^Show all/ })).toBeNull();
    expect(screen.getByText(/^(\d+) of \1 launches shown$/)).toBeInTheDocument();
  });

  it("glossary: filter narrows and explains an empty result", () => {
    wrap(<GlossarySection />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzzz" } });
    expect(screen.getByText(/No terms match/)).toBeInTheDocument();
  });

  it("quiz: answering reveals the why and updates the tally", () => {
    wrap(<QuizSection />);
    fireEvent.click(screen.getAllByRole("button", { name: "Myth" })[0]);
    expect(screen.getByText("Right.")).toBeInTheDocument();
    expect(screen.getByText(/1 \/ \d+ answered · 1 right/)).toBeInTheDocument();
  });

  it("glossary: full-width IME input still finds TGW", () => {
    wrap(<GlossarySection />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ＴＧＷ" } });
    expect(screen.queryByText(/No terms match/)).toBeNull();
  });
});
