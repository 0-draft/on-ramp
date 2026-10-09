import { encrypted, VIF_FACTS } from "./model";

describe("DX model", () => {
  it("gives each VIF type its documented maximum MTU", () => {
    expect(VIF_FACTS.private.mtu).toBe(9001);
    expect(VIF_FACTS.transit.mtu).toBe(8500);
    expect(VIF_FACTS.public.mtu).toBe(1500);
  });

  it("DX alone encrypts nothing", () => {
    expect(encrypted("none")).toEqual({
      carrier: "no",
      crossConnect: "no",
      awsSide: "no",
    });
  });

  it("MACsec always covers the cross connect, the carrier only if Layer 2 transparent", () => {
    expect(encrypted("macsec")).toEqual({
      carrier: "maybe",
      crossConnect: "yes",
      awsSide: "no",
    });
  });

  it("Private IP VPN (IPsec to the TGW) covers every stretch", () => {
    expect(encrypted("ipsec")).toEqual({
      carrier: "yes",
      crossConnect: "yes",
      awsSide: "yes",
    });
  });
});
