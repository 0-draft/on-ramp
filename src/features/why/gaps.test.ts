import { layerState, openGaps } from "./gaps";

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

describe("layerState", () => {
  const none = { encryption: false, dns: false, endpoint: false, location: false };
  it("marks layers with an open gap, and leaves gap-free layers alone", () => {
    expect(layerState(none, 1)).toBe("open");
    expect(layerState(none, 3)).toBeNull();
    expect(layerState(none, 5)).toBeNull();
  });
  it("closes the VPC layer only when both DNS and the endpoint are fixed", () => {
    expect(layerState({ ...none, dns: true }, 4)).toBe("open");
    expect(layerState({ ...none, dns: true, endpoint: true }, 4)).toBe("closed");
  });
});
