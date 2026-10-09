import { SCENARIO, SCENARIOS } from "./flows";

describe("hybrid DNS flows", () => {
  it("only uses declared participants", () => {
    for (const s of SCENARIOS)
      for (const h of s.hops) {
        expect(s.parties).toContain(h.from);
        expect(s.parties).toContain(h.to);
      }
  });

  it("starts with the asker and ends by answering it", () => {
    for (const s of SCENARIOS) {
      const asker = s.parties[0];
      expect(s.hops[0].from).toBe(asker);
      expect(s.hops.at(-1)!.to).toBe(asker);
    }
  });

  it("successful lookups end in an answer, broken ones in a failure", () => {
    for (const s of SCENARIOS) {
      const last = s.hops.at(-1)!;
      if (s.ok) expect(last.kind).toBe("answer");
      if (s.id === "base2") {
        expect(last.kind).toBe("fail");
        expect(s.answer).toBeNull();
      }
    }
  });

  it("uses the inbound endpoint for on-prem lookups and the outbound endpoint for EC2", () => {
    expect(SCENARIO.endpoint.hops.some((h) => h.to === "inbound")).toBe(true);
    expect(SCENARIO.phz.hops.some((h) => h.to === "inbound")).toBe(true);
    expect(SCENARIO.outbound.hops.some((h) => h.to === "outbound")).toBe(true);
    expect(SCENARIO.base2.hops.some((h) => h.to === "inbound")).toBe(false);
  });

  it("answers match the worked flows in docs/10", () => {
    expect(SCENARIO.endpoint.answer).toBe("10.0.1.15, 10.0.2.15");
    expect(SCENARIO.phz.answer).toBe("10.0.3.25");
    expect(SCENARIO.outbound.answer).toBe("10.10.5.30");
  });

  it("has a caption in both languages for every hop", () => {
    for (const s of SCENARIOS)
      for (const h of s.hops) {
        expect(h.caption.en).not.toBe("");
        expect(h.caption.ja).not.toBe("");
      }
  });
});
