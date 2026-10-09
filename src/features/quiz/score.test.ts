import { CARDS } from "./cards";
import { tally } from "./score";

describe("quiz tally", () => {
  it("starts at zero", () => {
    expect(tally(CARDS, {})).toEqual({ answered: 0, right: 0 });
  });
  it("counts answers and right answers", () => {
    const first = CARDS[0].fact ? "fact" : "myth";
    const wrong = CARDS[1].fact ? "myth" : "fact";
    expect(tally(CARDS, { 0: first, 1: wrong })).toEqual({ answered: 2, right: 1 });
  });
});
