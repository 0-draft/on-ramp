import { expect, test, type Page } from "@playwright/test";

const LANGS = ["en", "ja"] as const;

async function open(page: Page, lang: (typeof LANGS)[number]) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    // Google Fonts can be unreachable in CI; that is not a page bug.
    if (m.type() === "error" && !m.location().url.includes("fonts.g"))
      errors.push(m.text());
  });
  await page.goto(`./?lang=${lang}`);
  await expect(page.locator("h1")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return errors;
}

/** Every SVG text must sit inside its viewBox and inside the box it labels. */
function scanDiagrams(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    for (const svg of document.querySelectorAll<SVGSVGElement>("main svg")) {
      const vb = svg.viewBox.baseVal;
      if (!vb || !vb.width || !svg.getBoundingClientRect().width) continue;
      const boxes = [...svg.querySelectorAll("rect")]
        .filter(
          (r) =>
            r.getAttribute("fill") !== "transparent" && r.getAttribute("fill") !== "none",
        )
        .map((r) => {
          const b = r.getBBox();
          const m = r.getCTM();
          const s = svg.getCTM();
          // Map into the SVG's own coordinate space (rects can sit inside <g transform>).
          if (m && s) {
            const k = s.inverse().multiply(m);
            return new DOMRect(
              b.x * k.a + k.e,
              b.y * k.d + k.f,
              b.width * k.a,
              b.height * k.d,
            );
          }
          return b;
        })
        .filter((b) => b.width >= 30 && b.height >= 20 && b.width <= 400);
      for (const text of svg.querySelectorAll("text")) {
        if (text.getAttribute("transform")) continue;
        const raw = text.getBBox();
        if (!raw.width) continue;
        const m = text.getCTM();
        const s = svg.getCTM();
        const k = m && s ? s.inverse().multiply(m) : null;
        const b = k
          ? new DOMRect(
              raw.x * k.a + k.e,
              raw.y * k.d + k.f,
              raw.width * k.a,
              raw.height * k.d,
            )
          : raw;
        const where = `${svg.closest("section")?.id ?? "hero"}: ${text.textContent?.trim()}`;
        if (b.x < vb.x - 1 || b.x + b.width > vb.x + vb.width + 1)
          out.push(`viewBox ${where}`);
        const cx = b.x + b.width / 2;
        const cy = b.y + b.height / 2;
        for (const r of boxes) {
          const inside =
            cx > r.x && cx < r.x + r.width && cy > r.y && cy < r.y + r.height;
          if (inside && (b.x < r.x - 1 || b.x + b.width > r.x + r.width + 1))
            out.push(`box ${where}`);
        }
      }
    }
    return [...new Set(out)];
  });
}

for (const lang of LANGS) {
  test.describe(`layout (${lang})`, () => {
    test("renders without errors and never scrolls sideways", async ({ page }) => {
      const errors = await open(page, lang);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
      expect(errors).toEqual([]);
    });

    test("no diagram text is clipped or spills out of its box", async ({ page }) => {
      await open(page, lang);
      expect(await scanDiagrams(page)).toEqual([]);
      // Walk every route on the hero map: the longest labels appear on some.
      const routes = page.locator("header [role=radiogroup] [role=radio]");
      const n = await routes.count();
      for (let i = 0; i < n; i++) {
        await routes.nth(i).click();
        expect(await scanDiagrams(page), `route ${i}`).toEqual([]);
      }
    });
  });
}

test("every in-page link lands on exactly one section", async ({ page }) => {
  await open(page, "en");
  const hrefs = await page
    .locator("a[href^='#']")
    .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(15);
  for (const h of new Set(hrefs)) {
    if (!h || h === "#") continue;
    await expect(page.locator(h), h).toHaveCount(1);
  }
});

test("the language switch rewrites the page and the URL", async ({ page }) => {
  await open(page, "en");
  await page.getByRole("button", { name: "日本語" }).click();
  await expect(page).toHaveURL(/lang=ja/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(
    page.getByText("社内ネットワークから AWS に入る、すべての道"),
  ).toBeVisible();
});

test("the hero steps a packet along the chosen route", async ({ page }) => {
  await open(page, "en");
  const hero = page.locator("header").filter({ has: page.locator("h1") });
  await hero.getByRole("radio", { name: /Direct Connect/ }).click();
  await expect(hero.getByText("1 / 5")).toBeVisible();
  await hero.getByRole("button", { name: "Next" }).click();
  await expect(hero.getByText("2 / 5")).toBeVisible();
  await expect(hero.getByText(/carrier's circuit/)).toBeVisible();
});

test("the routing lab reveals why after a guess", async ({ page }) => {
  await open(page, "en");
  const lab = page.locator("section#routing");
  await lab.getByRole("button", { name: "Static VPN as backup" }).click();
  await lab.getByRole("button", { name: "Direct Connect", exact: true }).click();
  await expect(lab.getByText("Not quite. Here's why:")).toBeVisible();
  await expect(lab.getByText("Result: VPN 1")).toBeVisible();
});

test("diagram text stays legible on phones", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "phone-only check");
  for (const lang of LANGS) {
    await open(page, lang);
    const tiny = await page.evaluate(() => {
      const out: string[] = [];
      for (const svg of document.querySelectorAll<SVGSVGElement>("main svg")) {
        const vb = svg.viewBox.baseVal;
        const w = svg.getBoundingClientRect().width;
        if (!vb || !vb.width || !w) continue;
        const scale = w / vb.width;
        for (const text of svg.querySelectorAll("text")) {
          const size = parseFloat(getComputedStyle(text).fontSize) * scale;
          if (size < 10)
            out.push(
              `${svg.closest("section")?.id}: ${text.textContent?.trim()} ${size.toFixed(1)}px`,
            );
        }
      }
      return out;
    });
    expect(tiny, lang).toEqual([]);
  }
});
