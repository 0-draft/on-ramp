import { humanDuration, transferSeconds } from "./transfer";

describe("transferSeconds", () => {
  it("moves 1 TB over 1 Gbps in 8,000 seconds at full rate", () => {
    expect(transferSeconds(1, 1)).toBeCloseTo(8000, 6);
  });
  it("scales with utilization", () => {
    expect(transferSeconds(1, 1, 0.5)).toBeCloseTo(16000, 6);
  });
  it("handles edge cases", () => {
    expect(transferSeconds(0, 10)).toBe(0);
    expect(transferSeconds(1, 0)).toBe(Infinity);
  });
});

describe("humanDuration", () => {
  it("picks a sensible unit", () => {
    expect(humanDuration(90)).toEqual({ value: 2, unit: "min" });
    expect(humanDuration(8000)).toEqual({ value: 2.2, unit: "h" });
    expect(humanDuration(800000)).toEqual({ value: 9.3, unit: "d" });
    expect(humanDuration(Infinity).value).toBe(Infinity);
  });
});
