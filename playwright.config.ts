import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

// Runs against the production build on the same base path as GitHub Pages.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // Full-page axe scans and lab walkthroughs are heavy; give a loaded runner
  // room instead of failing on time.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}/on-ramp/`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1400, height: 900 } },
    },
    {
      name: "phone",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/on-ramp/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
