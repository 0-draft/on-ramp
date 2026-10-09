import { failoverFrame, FAILOVER_STEPS } from "./failover";

describe("tunnel failover", () => {
  it("with two tunnels, only the detection window is an outage", () => {
    // Until DPD or the BGP hold timer gives up, traffic still goes into the
    // dead tunnel.
    expect(failoverFrame(2, false)).toEqual({
      t1: "down",
      t2: "up",
      awsEgress: null,
      detecting: true,
    });
    expect(failoverFrame(3, false)).toEqual({
      t1: "down",
      t2: "up",
      awsEgress: "t2",
      detecting: false,
    });
    for (const s of [0, 1, 3, 4])
      expect(failoverFrame(s, false).awsEgress).not.toBeNull();
  });

  it("with one tunnel, routine replacement is an outage", () => {
    expect(failoverFrame(2, true).awsEgress).toBeNull();
    expect(failoverFrame(3, true)).toEqual({
      t1: "down",
      t2: "off",
      awsEgress: null,
      detecting: false,
    });
    expect(failoverFrame(4, true).awsEgress).toBe("t1");
  });

  it("clamps the step", () => {
    expect(failoverFrame(-1, false)).toEqual(failoverFrame(0, false));
    expect(failoverFrame(99, false)).toEqual(failoverFrame(FAILOVER_STEPS - 1, false));
  });
});
