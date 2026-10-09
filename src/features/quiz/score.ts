import type { QuizCard } from "./cards";

/** The reader's pick per card index. */
export type Answers = Partial<Record<number, "myth" | "fact">>;

/** How many cards are answered, and how many of those are right. */
export function tally(cards: QuizCard[], answers: Answers) {
  let answered = 0;
  let right = 0;
  cards.forEach((c, i) => {
    const a = answers[i];
    if (a === undefined) return;
    answered++;
    if ((a === "fact") === c.fact) right++;
  });
  return { answered, right };
}
