import { GLOSSARY, matches } from "./data";

const all = GLOSSARY.flatMap((g) => g.terms);

describe("glossary", () => {
  it("has unique English names", () => {
    const names = all.map((t) => t.en);
    expect(new Set(names).size).toBe(names.length);
  });
  it("matches English, Japanese and definitions, case-insensitively", () => {
    const tgw = all.find((t) => t.en === "Transit Gateway (TGW)")!;
    expect(matches(tgw, "transit")).toBe(true);
    expect(matches(tgw, "トランジット")).toBe(true);
    expect(matches(tgw, "L3")).toBe(true);
    expect(matches(tgw, "")).toBe(true);
    expect(matches(tgw, "snowball")).toBe(false);
  });
  it("finds propagation by its Japanese name", () => {
    expect(all.filter((t) => matches(t, "伝達")).map((t) => t.en)).toContain(
      "Propagation",
    );
  });
});
