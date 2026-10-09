import { plan, Q } from "./scale";

const hard = (p: ReturnType<typeof plan>) => p.limits.filter((l) => l.hard).length;

describe("plan: VGW per VPC", () => {
  it("needs one VIF per VPC per site", () => {
    const p = plan("vgw", { vpcs: 3, regions: 1, sites: 2 });
    expect(p).toMatchObject({
      hubs: 3,
      attachments: 3,
      vifs: 6,
      vpcToVpc: false,
      monthly: 0,
    });
    expect(p.limits).toEqual([]);
  });
  it("cannot reach other Regions", () => {
    const p = plan("vgw", { vpcs: 2, regions: 2, sites: 1 });
    expect(hard(p)).toBe(1);
    expect(p.reachesAll).toBe(false);
  });
  it("hits the VIFs-per-connection limit past 50 VPCs", () => {
    expect(
      hard(plan("vgw", { vpcs: Q.vifsPerConnection + 1, regions: 1, sites: 1 })),
    ).toBe(1);
  });
  it("flags the adjustable VGW-per-Region quota", () => {
    const p = plan("vgw", { vpcs: 6, regions: 1, sites: 1 });
    expect(p.limits.some((l) => !l.hard)).toBe(true);
  });
});

describe("plan: DX gateway + VGWs", () => {
  it("one DX gateway covers up to 20 VPCs", () => {
    const p = plan("dxgw", { vpcs: 20, regions: 4, sites: 2 });
    expect(p).toMatchObject({ hubs: 21, attachments: 20, vifs: 2 });
  });
  it("21 VPCs need a second DX gateway and a second VIF per site", () => {
    const p = plan("dxgw", { vpcs: 21, regions: 5, sites: 2 });
    expect(p.vifs).toBe(4);
    expect(p.hubs).toBe(23);
  });
  it("always warns about the 100 propagated routes", () => {
    expect(plan("dxgw", { vpcs: 1, regions: 1, sites: 1 }).limits).toHaveLength(1);
  });
});

describe("plan: Transit Gateway", () => {
  it("one TGW per Region, peering mesh between them", () => {
    const p = plan("tgw", { vpcs: 30, regions: 3, sites: 2 });
    expect(p).toMatchObject({
      hubs: 4,
      attachments: 33,
      vifs: 2,
      interRegion: 3,
      vpcToVpc: true,
    });
    expect(p.monthly).toBeCloseTo(33 * 0.07 * 730);
  });
  it("seven Regions need a second DX gateway", () => {
    const p = plan("tgw", { vpcs: 7, regions: 7, sites: 1 });
    expect(p.vifs).toBe(2);
    expect(hard(p)).toBe(1);
  });
  it("one Region has no peering warning", () => {
    expect(plan("tgw", { vpcs: 5, regions: 1, sites: 1 }).limits).toEqual([]);
  });
});

describe("plan: Cloud WAN", () => {
  it("one edge per Region plus one DXGW attachment", () => {
    const p = plan("cloudwan", { vpcs: 10, regions: 2, sites: 3 });
    expect(p).toMatchObject({
      hubs: 3,
      attachments: 11,
      vifs: 3,
      interRegion: 0,
      vpcToVpc: true,
    });
    expect(p.monthly).toBeCloseTo(2 * 0.5 * 730 + 11 * 0.09 * 730);
  });
});
