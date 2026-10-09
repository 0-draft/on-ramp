import { contains, ipToInt, parseCidr } from "./cidr";

describe("cidr", () => {
  it("parses addresses", () => {
    expect(ipToInt("10.0.1.5")).toBe(167772421);
    expect(ipToInt("255.255.255.255")).toBe(4294967295);
    expect(ipToInt("10.0.1")).toBeNull();
    expect(ipToInt("10.0.1.256")).toBeNull();
    expect(ipToInt("a.b.c.d")).toBeNull();
  });

  it("parses and normalizes prefixes", () => {
    expect(parseCidr("10.0.1.7/24")).toEqual({ base: ipToInt("10.0.1.0"), len: 24 });
    expect(parseCidr("0.0.0.0/0")).toEqual({ base: 0, len: 0 });
    expect(parseCidr("10.0.0.0/33")).toBeNull();
    expect(parseCidr("10.0.0.0")).toBeNull();
    expect(parseCidr("10.0.0.0/24/x")).toBeNull();
  });

  it("tests membership", () => {
    const c = parseCidr("10.0.0.0/16")!;
    expect(contains(c, ipToInt("10.0.255.1")!)).toBe(true);
    expect(contains(c, ipToInt("10.1.0.1")!)).toBe(false);
    expect(contains(parseCidr("0.0.0.0/0")!, ipToInt("8.8.8.8")!)).toBe(true);
    expect(contains(parseCidr("192.168.1.1/32")!, ipToInt("192.168.1.1")!)).toBe(true);
  });
});
