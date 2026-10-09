import { ipToInt } from "@/lib/cidr";
import { intToIp, longestMatch, prefixInfo } from "./prefix";

describe("prefixInfo", () => {
  it("describes a /16", () => {
    expect(prefixInfo("10.0.0.0", 16)).toEqual({
      network: "10.0.0.0/16",
      first: "10.0.0.0",
      last: "10.0.255.255",
      count: 65536,
    });
  });

  it("normalizes host bits and handles the extremes", () => {
    expect(prefixInfo("10.0.1.77", 24)?.network).toBe("10.0.1.0/24");
    expect(prefixInfo("10.0.1.77", 32)?.count).toBe(1);
    expect(prefixInfo("0.0.0.0", 0)?.last).toBe("255.255.255.255");
    expect(prefixInfo("10.0.0.0", 40)).toBeNull();
  });

  it("round-trips addresses", () => {
    expect(intToIp(ipToInt("172.16.254.1")!)).toBe("172.16.254.1");
  });
});

describe("longestMatch", () => {
  const routes = [
    { prefix: "0.0.0.0/0", target: "igw" },
    { prefix: "10.0.0.0/8", target: "vpn" },
    { prefix: "10.0.0.0/16", target: "dx" },
    { prefix: "10.0.1.0/24", target: "tgw" },
  ];
  it("picks the most specific matching route", () => {
    expect(longestMatch(ipToInt("10.0.1.9")!, routes)).toBe(3);
    expect(longestMatch(ipToInt("10.0.9.9")!, routes)).toBe(2);
    expect(longestMatch(ipToInt("10.9.9.9")!, routes)).toBe(1);
    expect(longestMatch(ipToInt("8.8.8.8")!, routes)).toBe(0);
  });
  it("returns -1 when nothing matches", () => {
    expect(longestMatch(ipToInt("8.8.8.8")!, routes.slice(1))).toBe(-1);
  });
});
