import { bill, dxBreakEvenGb, flatBreakEvenGb, internetDto, P } from "./cost";

const TEN_TB = 10_240;
const noTgw = { gb: TEN_TB, viaTgw: false, freeTier: false };
const tgw = { gb: TEN_TB, viaTgw: true, freeTier: false };

describe("worked example: 10 TB/month from Tokyo to on-prem (docs/12)", () => {
  it.each([
    ["internet", noTgw, 1167.36],
    ["internetNat", noTgw, 1847.5],
    ["vpn", noTgw, 1202.4],
    ["vpn", tgw, 1509.4],
    ["dx1g", noTgw, 627.89],
    ["dx1g", tgw, 934.89],
    ["hosted1g", noTgw, 649.06],
    ["hosted500m", noTgw, 558.54],
    ["hosted50m", noTgw, 441.01],
    ["flat10g", noTgw, 8000.8],
  ] as const)("%s (via TGW: %o) = $%d", (id, inputs, total) => {
    expect(bill(id, inputs).total).toBeCloseTo(total, 2);
  });

  it("splits the bill into hourly, transfer and processing like the doc's table", () => {
    expect(bill("internetNat", noTgw)).toMatchObject({
      hourly: 45.26,
      transfer: 1167.36,
      processing: 634.88,
    });
    expect(bill("vpn", tgw)).toMatchObject({
      hourly: 137.24,
      transfer: 1167.36,
      processing: 204.8,
    });
    expect(bill("dx1g", tgw)).toMatchObject({
      hourly: 310.25,
      transfer: 419.84,
      processing: 204.8,
    });
  });
});

describe("internetDto", () => {
  it("walks the tiers", () => {
    expect(internetDto(0)).toBe(0);
    expect(internetDto(10_240)).toBeCloseTo(1167.36, 2);
    expect(internetDto(10_240 + 1000)).toBeCloseTo(1167.36 + 89, 2);
    const all = 10_240 * 0.114 + 40_960 * 0.089 + 102_400 * 0.086 + 1000 * 0.084;
    expect(internetDto(10_240 + 40_960 + 102_400 + 1000)).toBeCloseTo(all, 2);
  });

  it("subtracts the 100 GB free tier when asked ($11.40 at the first tier)", () => {
    expect(internetDto(TEN_TB) - internetDto(TEN_TB, true)).toBeCloseTo(11.4, 2);
    expect(internetDto(50, true)).toBe(0);
  });
});

describe("break-even (docs/12)", () => {
  it("a 1 Gbps dedicated port pays for itself after about 2.8 TB/month", () => {
    expect(dxBreakEvenGb(P.dxDedicated1g) / 1024).toBeCloseTo(2.78, 1);
  });

  it("10G flat-rate beats pay-as-you-go after about 153 TB/month", () => {
    expect(flatBreakEvenGb()).toBeGreaterThan(156_000);
    expect(flatBreakEvenGb()).toBeLessThan(158_000);
    expect(Math.round(flatBreakEvenGb() / 1024)).toBe(153);
  });
});
