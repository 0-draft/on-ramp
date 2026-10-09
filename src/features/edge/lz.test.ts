import { LZ } from "./lz";

describe("Local Zone paths (docs/11)", () => {
  it("only a private VIF to a VGW or the internet goes straight to the Local Zone", () => {
    expect(LZ.dxvgw.hairpin).toBe(false);
    expect(LZ.internet.hairpin).toBe(false);
  });

  it("Transit Gateway and Site-to-Site VPN hairpin through the parent Region", () => {
    expect(LZ.dxtgw.hairpin).toBe(true);
    expect(LZ.vpn.hairpin).toBe(true);
  });
});
