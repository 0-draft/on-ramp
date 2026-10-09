import { capacity, fits, greInnerMtu } from "./connect";

describe("capacity", () => {
  it("GRE peers add 5 Gbps each, up to 4", () => {
    expect(capacity("tgw-gre", 1)).toBe(5);
    expect(capacity("tgw-gre", 4)).toBe(20);
    expect(capacity("tgw-gre", 9)).toBe(20);
    expect(capacity("cwan-gre", 2)).toBe(10);
    expect(capacity("tgw-gre", 0)).toBe(0);
  });
  it("tunnel-less is bounded by the VPC attachment", () => {
    expect(capacity("cwan-tunnelless", 1)).toBe(100);
    expect(capacity("cwan-tunnelless", 4)).toBe(100);
  });
});

describe("greInnerMtu", () => {
  it("subtracts the 24-byte GRE header", () => {
    expect(greInnerMtu(1500)).toBe(1476);
  });
});

describe("fits", () => {
  it("10 Gbps does not fit one GRE peer", () => {
    expect(fits("tgw-gre", 1, 10)).toBe(false);
    expect(fits("tgw-gre", 2, 10)).toBe(true);
  });
});
