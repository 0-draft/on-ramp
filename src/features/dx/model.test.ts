import { encrypted, maxMtu, VIF_FACTS } from "./model";

describe("VIF MTU", () => {
  it("private 9001, transit 8500, public 1500", () => {
    expect(maxMtu("private")).toBe(9001);
    expect(maxMtu("transit")).toBe(8500);
    expect(maxMtu("public")).toBe(1500);
    expect(VIF_FACTS.public.mtu).toEqual([1500]);
  });
});

describe("encrypted", () => {
  it("DX alone encrypts nothing", () => {
    expect(Object.values(encrypted("none")).some(Boolean)).toBe(false);
  });
  it("MACsec covers only the cross connect", () => {
    expect(encrypted("macsec")).toEqual({
      carrier: false,
      crossConnect: true,
      awsSide: false,
    });
  });
  it("Private IP VPN covers every stretch", () => {
    expect(Object.values(encrypted("ipsec")).every(Boolean)).toBe(true);
  });
});
