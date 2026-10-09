import { LAUNCHES, RECENT_FROM, byYear, filterLaunches } from "./data";

describe("timeline data", () => {
  it("is in date order (month-only dates sort after dated ones in that month)", () => {
    const key = (d: string) => (d.length === 7 ? `${d}-99` : d);
    const dates = LAUNCHES.map((l) => key(l.date));
    expect([...dates].sort()).toEqual(dates);
  });
  it("uses YYYY-MM or YYYY-MM-DD dates and https links", () => {
    for (const l of LAUNCHES) {
      expect(l.date).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
      expect(l.url).toMatch(/^https:\/\//);
    }
  });
  it("groups by year, keeping order", () => {
    const years = byYear(LAUNCHES).map(([y]) => y);
    expect(years[0]).toBe("2009");
    expect(years.at(-1)).toBe("2026");
    expect(new Set(years).size).toBe(years.length);
  });
  it("filters to one family and to the recent wave", () => {
    const dx = filterLaunches(LAUNCHES, "dx", false);
    expect(dx.length).toBeGreaterThan(5);
    expect(dx.every((l) => l.family === "dx")).toBe(true);
    const recent = filterLaunches(LAUNCHES, "all", true);
    expect(recent.every((l) => l.date >= RECENT_FROM)).toBe(true);
    expect(recent.length).toBeLessThan(LAUNCHES.length);
    expect(filterLaunches(LAUNCHES, "all", false)).toHaveLength(LAUNCHES.length);
  });
  it("dates Interconnect multicloud GA to its What's New post (2026-04-14)", () => {
    const ga = LAUNCHES.find((l) => l.title.en === "Interconnect – multicloud GA");
    expect(ga?.date).toBe("2026-04-14");
  });
});
