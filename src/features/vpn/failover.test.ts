import { failoverFrame, FAILOVER_STEPS } from "./failover";

describe("tunnel failover", () => {
  it("with two tunnels, traffic always has a tunnel", () => {
    for (let s = 0; s < FAILOVER_STEPS; s++) {
      expect(failoverFrame(s, false).awsEgress).not.toBeNull();
    }
    expect(failoverFrame(3, false)).toEqual({ t1: "down", t2: "up", awsEgress: "t2" });
  });

  it("with one tunnel, routine replacement is an outage", () => {
    expect(failoverFrame(2, true).awsEgress).toBeNull();
    expect(failoverFrame(3, true)).toEqual({ t1: "down", t2: "off", awsEgress: null });
    expect(failoverFrame(4, true).awsEgress).toBe("t1");
  });

  it("clamps the step", () => {
    expect(failoverFrame(-1, false)).toEqual(failoverFrame(0, false));
    expect(failoverFrame(99, false)).toEqual(failoverFrame(FAILOVER_STEPS - 1, false));
  });
});
