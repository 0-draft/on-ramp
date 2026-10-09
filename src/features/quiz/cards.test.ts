import { NAV } from "@/data/nav";
import { CARDS } from "./cards";

describe("quiz cards", () => {
  it("every card points at a real exit", () => {
    const ids = new Set(NAV.map((n) => n.id));
    for (const c of CARDS) expect(ids.has(c.to)).toBe(true);
  });
  it("mixes myths and facts", () => {
    expect(CARDS.some((c) => c.fact)).toBe(true);
    expect(CARDS.some((c) => !c.fact)).toBe(true);
  });
});
