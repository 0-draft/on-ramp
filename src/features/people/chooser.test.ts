import { monthlyCost, nextQuestion, recommend } from "./chooser";

describe("people chooser", () => {
  it("asks questions in order and stops as soon as it can decide", () => {
    expect(nextQuestion({})).toBe("manyNetworks");
    expect(nextQuestion({ manyNetworks: true })).toBeNull();
    expect(nextQuestion({ manyNetworks: false })).toBe("adminToServer");
    expect(nextQuestion({ manyNetworks: false, adminToServer: false })).toBe(
      "dataMayLeave",
    );
  });

  it("follows the documented decision tree", () => {
    expect(recommend({})).toBeNull();
    expect(recommend({ manyNetworks: true })).toEqual(["clientvpn"]);
    expect(recommend({ manyNetworks: false, adminToServer: true })).toEqual([
      "ssm",
      "eice",
    ]);
    expect(
      recommend({ manyNetworks: false, adminToServer: false, dataMayLeave: true }),
    ).toEqual(["ava"]);
    expect(
      recommend({ manyNetworks: false, adminToServer: false, dataMayLeave: false }),
    ).toEqual(["workspaces"]);
  });
});

describe("monthlyCost", () => {
  it("matches the doc's idle HA Client VPN example (2 AZs in Tokyo, about USD 219)", () => {
    expect(
      monthlyCost({ azs: 2, users: 0, hoursPerUser: 0, apps: 0 }).clientVpn,
    ).toBeCloseTo(219, 0);
  });
  it("matches the doc's one-app Verified Access example (USD 255.50)", () => {
    expect(monthlyCost({ azs: 0, users: 0, hoursPerUser: 0, apps: 1 }).ava).toBeCloseTo(
      255.5,
      2,
    );
  });
  it("adds connection-hours per user", () => {
    expect(
      monthlyCost({ azs: 0, users: 100, hoursPerUser: 160, apps: 0 }).clientVpn,
    ).toBeCloseTo(800, 6);
  });
});
