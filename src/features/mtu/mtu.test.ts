import { MTU_PATH, MTU_PATHS, classify, mssOf, overheadOf, pathMtu } from "./mtu";

describe("MTU table (docs/12, docs/02, docs/03)", () => {
  it("matches the documented MTU and MSS pairs", () => {
    expect([MTU_PATH.vpnGcm.mtu, mssOf(MTU_PATH.vpnGcm)]).toEqual([1446, 1406]);
    expect([MTU_PATH.vpnCbc.mtu, mssOf(MTU_PATH.vpnCbc)]).toEqual([1406, 1366]);
    expect(MTU_PATH.internet.mtu).toBe(1500);
    expect(MTU_PATH.privateVif.mtu).toBe(9001);
    expect(MTU_PATH.transitVif.mtu).toBe(8500);
    expect(MTU_PATH.connect.mtu).toBe(1476);
    expect(MTU_PATH.privatelink.mtu).toBe(8500);
  });

  it("wrappers account for exactly the bytes lost to encapsulation", () => {
    for (const p of MTU_PATHS) {
      if (p.outer === undefined) expect(overheadOf(p)).toBe(0);
      else expect(p.mtu + overheadOf(p)).toBe(p.outer);
    }
    expect(overheadOf(MTU_PATH.connect)).toBe(24);
  });
});

describe("classify", () => {
  it("lets packets at or under the MTU through", () => {
    expect(classify(MTU_PATH.vpnGcm, 1446)).toBe("fits");
    expect(classify(MTU_PATH.internet, 576)).toBe("fits");
  });

  it("black-holes oversize packets where there is no PMTUD", () => {
    expect(classify(MTU_PATH.vpnGcm, 1447)).toBe("blackhole");
    expect(classify(MTU_PATH.transitVif, 9001)).toBe("blackhole");
    expect(classify(MTU_PATH.privatelink, 8501)).toBe("blackhole");
  });

  it("uses PMTUD where AWS documents it", () => {
    expect(classify(MTU_PATH.internet, 1501)).toBe("pmtud");
    expect(classify(MTU_PATH.connect, 1500)).toBe("pmtud");
  });

  it("does not claim behavior AWS does not document", () => {
    expect(classify(MTU_PATH.privateVif, 9002)).toBe("unknown");
  });
});

describe("pathMtu", () => {
  it("is the smallest segment: a 9001 instance behind a TGW gets 8500", () => {
    expect(pathMtu([9001, 8500, 8500])).toBe(8500);
    expect(pathMtu([9001, 1446])).toBe(1446);
    expect(pathMtu([])).toBe(0);
  });
});
