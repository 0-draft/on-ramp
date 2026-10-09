import { fireEvent, render, screen } from "@testing-library/react";
import { LangProvider } from "@/i18n/LangContext";
import type { Lang } from "@/i18n/lang";
import { WhySection } from "./WhySection";
import { BasicsSection } from "@/features/basics/BasicsSection";
import { PeopleSection } from "@/features/people/PeopleSection";
import { EdgeSection } from "@/features/edge/EdgeSection";
import { QuizSection } from "@/features/quiz/QuizSection";
import { TimelineSection } from "@/features/timeline/TimelineSection";
import { GlossarySection } from "@/features/glossary/GlossarySection";

const SECTIONS = [
  WhySection,
  BasicsSection,
  PeopleSection,
  EdgeSection,
  QuizSection,
  TimelineSection,
  GlossarySection,
];

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
      for (const id of [
        "why",
        "basics",
        "people",
        "edge",
        "quiz",
        "timeline",
        "glossary",
      ])
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

  it("people: answering the chooser recommends Client VPN", () => {
    wrap(<PeopleSection />);
    fireEvent.click(screen.getAllByRole("button", { name: "Yes" })[0]);
    expect(screen.getAllByText("AWS Client VPN").length).toBeGreaterThan(1);
  });

  it("glossary: filter narrows and explains an empty result", () => {
    wrap(<GlossarySection />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzzz" } });
    expect(screen.getByText(/No terms match/)).toBeInTheDocument();
  });

  it("quiz: answering reveals the why", () => {
    wrap(<QuizSection />);
    fireEvent.click(screen.getAllByRole("button", { name: "Myth" })[0]);
    expect(screen.getByText("Right.")).toBeInTheDocument();
  });
});
