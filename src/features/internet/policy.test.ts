import { contextFor, evaluate, OFFICE_EGRESS, VPCE_ID } from "./policy";

describe("bucket policy lab", () => {
  it("office over the internet: the proxy egress IP is the source", () => {
    expect(contextFor("internet")).toEqual({ sourceIp: OFFICE_EGRESS, sourceVpce: null });
    expect(evaluate("internet", "sourceIp")).toMatchObject({
      allowed: true,
      matched: "sourceIp",
    });
    expect(evaluate("internet", "sourceVpce").allowed).toBe(false);
  });

  it("through a VPC endpoint aws:SourceIp is absent, so an IP allowlist denies", () => {
    expect(contextFor("endpoint")).toEqual({ sourceIp: null, sourceVpce: VPCE_ID });
    expect(evaluate("endpoint", "sourceIp").allowed).toBe(false);
    expect(evaluate("endpoint", "sourceVpce")).toMatchObject({
      allowed: true,
      matched: "sourceVpce",
    });
  });

  it("an OR of both keys works for both roads", () => {
    expect(evaluate("internet", "both").allowed).toBe(true);
    expect(evaluate("endpoint", "both").allowed).toBe(true);
  });

  it("public VIF and NAT gateway arrive from other public IPs", () => {
    expect(evaluate("publicVif", "sourceIp").allowed).toBe(false);
    expect(evaluate("nat", "both").allowed).toBe(false);
    expect(contextFor("publicVif").sourceVpce).toBeNull();
  });
});
