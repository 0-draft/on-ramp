import { reach, type Client, type Target } from "./reach";

const CLIENTS: Client[] = ["onprem", "sameVpc", "otherVpc"];
const TARGETS: Target[] = [
  "gateway",
  "interface",
  "s3Inbound",
  "publicVif",
  "latticeAssoc",
  "latticeEndpoint",
];

describe("reach", () => {
  it("gateway endpoints work only inside their own VPC", () => {
    expect(reach("sameVpc", "gateway").result).toBe("yes");
    expect(reach("onprem", "gateway").result).toBe("no");
    expect(reach("otherVpc", "gateway").result).toBe("no");
  });

  it("interface endpoints are reachable from on-prem, with a DNS catch", () => {
    expect(reach("onprem", "interface").result).toBe("partial");
    expect(reach("onprem", "interface").why.en).toMatch(/inbound endpoint/);
    expect(reach("sameVpc", "interface").result).toBe("yes");
  });

  it("S3 'private DNS only for inbound endpoint' serves both sides", () => {
    expect(reach("onprem", "s3Inbound").result).toBe("yes");
    expect(reach("sameVpc", "s3Inbound").why.en).toMatch(/gateway endpoint/);
  });

  it("Lattice VPC associations are link-local; service network endpoints are not", () => {
    expect(reach("onprem", "latticeAssoc").result).toBe("no");
    expect(reach("onprem", "latticeAssoc").why.en).toMatch(/169\.254\.171\.0\/24/);
    expect(reach("sameVpc", "latticeAssoc").result).toBe("yes");
    for (const c of CLIENTS) expect(reach(c, "latticeEndpoint").result).toBe("yes");
  });

  it("a public VIF only applies to on-prem", () => {
    expect(reach("onprem", "publicVif").result).toBe("partial");
    expect(reach("sameVpc", "publicVif").result).toBe("na");
  });

  it("explains every combination in both languages", () => {
    for (const c of CLIENTS)
      for (const t of TARGETS) {
        const v = reach(c, t);
        expect(v.why.en.length).toBeGreaterThan(20);
        expect(v.why.ja.length).toBeGreaterThan(10);
      }
  });
});
