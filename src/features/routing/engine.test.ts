import { decide, type Advert } from "./engine";

const dx = (o: Partial<Advert> = {}): Advert => ({
  id: "dx",
  path: "dx",
  prefix: "10.0.0.0/16",
  asPath: 1,
  up: true,
  ...o,
});
const vpn = (o: Partial<Advert> = {}): Advert => ({
  id: "vpn",
  path: "vpn",
  prefix: "10.0.0.0/16",
  vpnRouting: "bgp",
  asPath: 1,
  up: true,
  ...o,
});

describe("decide: worked examples from docs/06", () => {
  it("example 1: a more specific /24 over VPN beats /16 over DX on every hub", () => {
    for (const hub of ["vgw", "tgw", "cloudwan"] as const) {
      const d = decide(hub, "10.0.1.5", [dx(), vpn({ prefix: "10.0.1.0/24" })]);
      expect(d.winners).toEqual(["vpn"]);
      expect(d.steps.find((s) => s.rule === "longest")?.dropped).toEqual(["dx"]);
    }
    // Outside the /24, DX carries it.
    expect(
      decide("tgw", "10.0.9.9", [dx(), vpn({ prefix: "10.0.1.0/24" })]).winners,
    ).toEqual(["dx"]);
  });

  it("example 2: same prefix, VPN with shorter AS_PATH: VGW/TGW pick DX, Cloud WAN picks VPN", () => {
    const ads = [dx({ asPath: 3 }), vpn({ asPath: 1 })];
    expect(decide("vgw", "10.0.0.1", ads).winners).toEqual(["dx"]);
    expect(decide("tgw", "10.0.0.1", ads).winners).toEqual(["dx"]);
    expect(decide("cloudwan", "10.0.0.1", ads).winners).toEqual(["vpn"]);
  });

  it("example 3: static VPN vs DX: VGW picks DX, TGW picks the static VPN", () => {
    const ads = [dx(), vpn({ vpnRouting: "static" })];
    expect(decide("vgw", "10.0.0.1", ads).winners).toEqual(["dx"]);
    expect(decide("tgw", "10.0.0.1", ads).winners).toEqual(["vpn"]);
  });

  it("cloud WAN refuses static VPN", () => {
    const d = decide("cloudwan", "10.0.0.1", [vpn({ vpnRouting: "static" })]);
    expect(d.winners).toEqual([]);
    expect(d.steps[0]).toEqual({ rule: "unsupported", kept: [], dropped: ["vpn"] });
  });

  it("equal routes on Cloud WAN fall back to attachment type: DX first", () => {
    expect(decide("cloudwan", "10.0.0.1", [vpn(), dx()]).winners).toEqual(["dx"]);
  });

  it("a VGW has no Connect attachments", () => {
    const c: Advert = {
      id: "c",
      path: "connect",
      prefix: "10.0.0.0/16",
      asPath: 1,
      up: true,
    };
    expect(decide("vgw", "10.0.0.1", [c]).winners).toEqual([]);
    expect(decide("tgw", "10.0.0.1", [c, vpn()]).winners).toEqual(["c"]);
  });

  it("health beats everything: DX down, VPN takes over", () => {
    expect(decide("tgw", "10.0.0.1", [dx({ up: false }), vpn()]).winners).toEqual([
      "vpn",
    ]);
    expect(
      decide("tgw", "10.0.0.1", [dx({ up: false }), vpn({ up: false })]).winners,
    ).toEqual([]);
  });

  it("no match means no route", () => {
    expect(decide("tgw", "192.168.0.1", [dx(), vpn()]).winners).toEqual([]);
    expect(decide("tgw", "not-an-ip", [dx()]).winners).toEqual([]);
  });

  it("example 8: two BGP VPNs on a TGW use ECMP only when enabled", () => {
    const ads = [vpn({ id: "a" }), vpn({ id: "b" })];
    expect(decide("tgw", "10.0.0.1", ads, { vpnEcmp: true })).toMatchObject({
      winners: ["a", "b"],
      ecmp: true,
    });
    expect(decide("tgw", "10.0.0.1", ads, { vpnEcmp: false })).toMatchObject({
      winners: ["a"],
      ecmp: false,
    });
    // A longer AS_PATH removes one from the race.
    expect(
      decide("tgw", "10.0.0.1", [vpn({ id: "a" }), vpn({ id: "b", asPath: 2 })], {
        vpnEcmp: true,
      }).winners,
    ).toEqual(["a"]);
  });

  it("a VGW never does ECMP", () => {
    const d = decide("vgw", "10.0.0.1", [vpn({ id: "a" }), vpn({ id: "b" })]);
    expect(d).toMatchObject({ winners: ["a"], ecmp: false });
    expect(d.steps.at(-1)?.rule).toBe("pick");
  });

  it("DXGW routes with identical attributes ECMP on a TGW", () => {
    expect(decide("tgw", "10.0.0.1", [dx({ id: "a" }), dx({ id: "b" })]).ecmp).toBe(true);
  });

  it("TGW default MEDs: an explicit lower MED on VPN does not beat DX (type comes first)", () => {
    expect(decide("tgw", "10.0.0.1", [dx(), vpn({ med: 0 })]).winners).toEqual(["dx"]);
  });

  it("MED breaks AS_PATH ties between two VPNs on a VGW", () => {
    expect(
      decide("vgw", "10.0.0.1", [vpn({ id: "a", med: 200 }), vpn({ id: "b", med: 50 })])
        .winners,
    ).toEqual(["b"]);
  });
});
