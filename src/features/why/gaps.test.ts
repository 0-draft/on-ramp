import { openGaps } from "./gaps";

describe("openGaps", () => {
  const none = { encryption: false, dns: false, endpoint: false, location: false };
  it("starts with all four gaps open", () => {
    expect(openGaps(none)).toEqual(["encryption", "dns", "endpoint", "location"]);
  });
  it("closes only the gap that was fixed", () => {
    expect(openGaps({ ...none, dns: true })).toEqual([
      "encryption",
      "endpoint",
      "location",
    ]);
  });
  it("is fully closed only when every layer is fixed", () => {
    expect(
      openGaps({ encryption: true, dns: true, endpoint: true, location: true }),
    ).toEqual([]);
  });
});
