import { road } from "./geometry";

describe("road", () => {
  it("is empty without points", () => {
    expect(road([])).toBe("");
  });

  it("draws level legs as straight lines", () => {
    expect(
      road([
        [0, 10],
        [100, 10],
      ]),
    ).toBe("M0 10 L100 10");
  });

  it("bends between levels with horizontal tangents", () => {
    expect(
      road([
        [0, 0],
        [100, 50],
      ]),
    ).toBe("M0 0 C50 0 50 50 100 50");
  });

  it("chains legs", () => {
    expect(
      road([
        [0, 0],
        [10, 0],
        [30, 20],
      ]),
    ).toBe("M0 0 L10 0 C20 0 20 20 30 20");
  });
});
