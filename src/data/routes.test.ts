import { NAV } from "./nav";
import { ROUTES, zoneOf } from "./routes";

describe("routes", () => {
  it("every route points at a real exit", () => {
    for (const r of ROUTES) expect(NAV.map((n) => n.id)).toContain(r.section);
  });

  it("stops run from your network to AWS and never go backwards", () => {
    const order = { you: 0, between: 1, aws: 2 };
    for (const r of ROUTES) {
      const zones = r.stops.map((s) => order[zoneOf(r, s)]);
      expect(zones[0], r.id).toBe(0);
      expect(zones.at(-1), r.id).toBe(2);
      expect([...zones].sort(), r.id).toEqual(zones);
    }
  });

  it("every string has both languages", () => {
    for (const r of ROUTES)
      for (const s of r.stops) {
        expect(s.name.en && s.name.ja && s.say.en && s.say.ja, r.id).toBeTruthy();
      }
  });
});
