import { throughput, type ThroughputInput } from "./throughput";

const base: ThroughputInput = {
  hub: "tgw",
  size: "standard",
  connections: 1,
  routing: "bgp",
  ecmp: true,
  flows: 100,
};

describe("VPN throughput", () => {
  it("a VGW uses one tunnel: 1.25 Gbps no matter how many connections", () => {
    const r = throughput({ ...base, hub: "vgw", connections: 4 });
    expect(r).toMatchObject({
      ok: true,
      tunnels: 8,
      activeTunnels: 1,
      aggregateGbps: 1.25,
      single: "vgw",
    });
  });

  it("Large tunnels are not available on a VGW", () => {
    expect(throughput({ ...base, hub: "vgw", size: "large" })).toMatchObject({
      ok: false,
      problem: "largeOnVgw",
    });
  });

  it("two Large connections with ECMP on a TGW give 20 Gbps (4 x 5)", () => {
    const r = throughput({ ...base, size: "large", connections: 2 });
    expect(r).toMatchObject({
      ok: true,
      tunnels: 4,
      activeTunnels: 4,
      aggregateGbps: 20,
      singleFlowGbps: 5,
    });
    expect(r.perTunnelPps).toBe(400_000);
  });

  it("ECMP needs BGP and, on a TGW, the ECMP option", () => {
    expect(throughput({ ...base, connections: 2, routing: "static" })).toMatchObject({
      activeTunnels: 1,
      aggregateGbps: 1.25,
      single: "static",
    });
    expect(throughput({ ...base, connections: 2, ecmp: false })).toMatchObject({
      activeTunnels: 1,
      single: "ecmpOff",
    });
  });

  it("Cloud WAN spreads BGP VPNs across tunnels and refuses static", () => {
    expect(
      throughput({ ...base, hub: "cloudwan", connections: 2, ecmp: false }).aggregateGbps,
    ).toBe(5);
    expect(throughput({ ...base, hub: "cloudwan", routing: "static" })).toMatchObject({
      ok: false,
      problem: "staticOnCloudWan",
    });
  });

  it("one flow never beats one tunnel", () => {
    const r = throughput({ ...base, connections: 4, flows: 1 });
    expect(r.aggregateGbps).toBe(1.25);
    expect(r.singleFlowGbps).toBe(1.25);
    expect(throughput({ ...base, connections: 4, flows: 3 }).aggregateGbps).toBe(3.75);
  });

  it("clamps silly inputs", () => {
    expect(throughput({ ...base, connections: 0, flows: 0 })).toMatchObject({
      tunnels: 2,
      aggregateGbps: 1.25,
    });
  });
});
