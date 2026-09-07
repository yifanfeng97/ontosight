import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  webServer: process.env.ONTOSIGHT_TEST_URL ? undefined : {
    command: "python ../examples/workbench_demo.py --port 8000 --no-open",
    url: "http://127.0.0.1:8000/api/health",
    reuseExistingServer: false,
  },
  use: {
    baseURL: process.env.ONTOSIGHT_TEST_URL || "http://127.0.0.1:8000",
    viewport: { width: 1600, height: 1000 },
    launchOptions: process.env.ONTOSIGHT_BROWSER
      ? { executablePath: process.env.ONTOSIGHT_BROWSER }
      : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
