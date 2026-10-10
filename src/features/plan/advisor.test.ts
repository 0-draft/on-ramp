import { advise, DEFAULTS, type Answers } from "./advisor";

const ids = (a: Partial<Answers>) => advise({ ...DEFAULTS, ...a }).recs.map((r) => r.id);

describe("advise (docs/13 codeable rules)", () => {
  it("rule 14: a carrier closed network gets Private IP VPN, not MACsec (no own port)", () => {
    expect(
      ids({ who: "sites", transport: "closed", bw: "high", encrypt: true }),
    ).toContain("privateIpVpn");
    expect(
      ids({ who: "sites", transport: "closed", bw: "high", encrypt: true }),
    ).not.toContain("macsec");
  });

  it("rule 7: one VPC, low bandwidth, internet OK -> VPN to VGW (P1)", () => {
    const p = advise({ ...DEFAULTS });
    expect(p.recs).toEqual([{ id: "vpnVgw", pattern: "P1", routes: ["vpn"] }]);
    expect(p.avoid).toContain("staticVpnFirewall");
  });

  it("rule 8: many VPCs -> VPN to TGW", () => {
    expect(ids({ vpcs: "many" })).toEqual(["vpnTgw"]);
  });

  it("rule 9: 1.25-5 Gbps over the internet -> large tunnels", () => {
    expect(ids({ bw: "mid" })).toEqual(["largeTunnel"]);
  });

  it("rule 10: far from the Region adds accelerated VPN, but never with large tunnels", () => {
    // Accelerated VPN needs a Transit Gateway, so even one VPC lands on a TGW.
    expect(ids({ farFromRegion: true })).toEqual(["vpnTgw", "accelerated"]);
    expect(ids({ farFromRegion: true, bw: "mid" })).toEqual(["largeTunnel"]);
  });

  it("rule 6: many small sites -> VPN Concentrator", () => {
    expect(ids({ manySmallSites: true })).toEqual(["concentrator"]);
  });

  it("rule 5: existing SD-WAN wins over transport rules", () => {
    expect(ids({ sdwan: true, transport: "steady" })).toEqual(["sdwan"]);
  });

  it("rule 11-12: steady latency in one Region -> P2 with resiliency", () => {
    const p = advise({ ...DEFAULTS, transport: "steady" });
    expect(p.recs.map((r) => r.id)).toEqual(["dxSingleRegion", "resilMax"]);
    expect(p.avoid).toEqual(
      expect.arrayContaining([
        "singleDx",
        "sameLocation",
        "moreSpecificBackup",
        "mixedMtu",
      ]),
    );
  });

  it("over 5 Gbps forces DX even if the internet is acceptable", () => {
    expect(ids({ bw: "high" })[0]).toBe("dxSingleRegion");
  });

  it("rule 13: several Regions -> P3 and warns about DXGW as a hub", () => {
    const p = advise({
      ...DEFAULTS,
      transport: "steady",
      regions: "several",
      critical: false,
    });
    expect(p.recs.map((r) => r.id)).toEqual(["dxMultiRegion", "resilHigh"]);
    expect(p.avoid).toContain("dxgwHub");
    expect(p.avoid).not.toContain("sameLocation");
  });

  it("rule 14: encryption on DX -> MACsec at high speed, Private IP VPN otherwise", () => {
    expect(ids({ transport: "steady", encrypt: true, bw: "high" })).toContain("macsec");
    expect(ids({ transport: "steady", encrypt: true, bw: "low" })).toContain(
      "privateIpVpn",
    );
    expect(advise({ ...DEFAULTS, transport: "steady", encrypt: true }).avoid).toContain(
      "dxEncrypted",
    );
  });

  it("rule 15: closed network -> DX plus P5", () => {
    const p = advise({ ...DEFAULTS, transport: "closed" });
    // The backup is a second DX location, not an internet VPN.
    expect(p.recs.map((r) => r.id)).toEqual([
      "dxSingleRegionClosed",
      "resilMax",
      "closed",
    ]);
    expect(p.recs[0].routes).toEqual(["dx"]);
    expect(p.avoid).toEqual(expect.arrayContaining(["s3Gateway", "publicDns"]));
  });

  it("rule 16: overlapping CIDRs -> P7", () => {
    expect(ids({ overlap: true })).toContain("overlap");
  });

  it("rules 1-4: people only", () => {
    expect(ids({ who: "people", need: "full" })).toEqual(["clientVpn"]);
    expect(ids({ who: "people", need: "apps" })).toEqual(["verifiedAccess"]);
    expect(ids({ who: "people", need: "nodata" })).toEqual(["workspaces"]);
    expect(ids({ who: "people", need: "admins" })).toEqual(["ssm"]);
  });

  it("both sites and people get both answers", () => {
    expect(ids({ who: "both", need: "apps", vpcs: "many" })).toEqual([
      "verifiedAccess",
      "vpnTgw",
    ]);
  });

  it("a distant single-VPC site gets accelerated VPN on a Transit Gateway, never a VGW", () => {
    const r = ids({ vpcs: "one", bw: "low", farFromRegion: true });
    expect(r).toEqual(["vpnTgw", "accelerated"]);
    expect(r).not.toContain("vpnVgw");
  });

  it("ignores the hidden transport answer when SD-WAN carries the sites", () => {
    const p = advise({ ...DEFAULTS, sdwan: true, transport: "closed" });
    expect(p.recs.map((r) => r.id)).toEqual(["sdwan"]);
    expect(p.avoid).not.toContain("s3Gateway");
  });

  it("ignores site answers for a people-only plan", () => {
    const p = advise({ ...DEFAULTS, who: "people", need: "apps", transport: "closed" });
    expect(p.recs.map((r) => r.id)).toEqual(["verifiedAccess"]);
    expect(p.avoid).toEqual([]);
  });
});
