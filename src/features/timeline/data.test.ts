import { LAUNCHES, byYear } from "./data";

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
});
