import { test, expect } from "@playwright/test";

test("repeated Classic gallery selections keep the newest details first", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Hyperedges", exact: true }).click();
  const response = await page.request.get("/api/hyperedges_paginated?page=0&page_size=12");
  const { items } = await response.json();
  for (const index of [0, 1, 0, 1, 0, 1]) {
    await page.locator(".grid.grid-cols-1 > .group").nth(index).click();
    await expect(page.locator(".space-y-3 > .group.relative").first()).toContainText(items[index].data.label);
  }
  await expect(page.locator(".space-y-3 > .group.relative")).toHaveCount(6);
});

test("style switching preserves sample, selected ID, details and enclosure membership", async ({
  page,
}) => {
  const errors: string[] = [],
    samples: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/data") samples.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Classic", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await page.getByRole("button", { name: "Workbench", exact: true }).click();
  const wb = page.getByRole("region", { name: "Hypergraph workbench" });
  await expect(wb).toBeVisible();
  await expect(wb.locator("[data-entity-id]")).toHaveCount(11);
  await expect(wb.locator("[data-hyperedge-id]")).toHaveCount(5);
  const originalIds = await wb
    .locator("[data-entity-id]")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-entity-id")).sort());
  const mentorship = wb.getByRole("button", {
    name: "Hyperedge Mentorship, 2 members",
    exact: true,
  });
  await mentorship.click();
  const selectedId = await mentorship.getAttribute("data-hyperedge-id");
  await expect(mentorship).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".onto-sidebar")).toContainText("Synthetic example");
  const countBeforeSwitch = samples.length;
  await page.getByRole("button", { name: "Classic", exact: true }).click();
  await expect(page.locator(".hypergraph-view canvas").first()).toBeVisible();
  expect(await page.locator(".hypergraph-view canvas").first().evaluate(canvas => (canvas as HTMLCanvasElement).width)).toBe(1600);
  await page.getByRole("button", { name: "Workbench", exact: true }).click();
  await expect(wb.locator(`[data-hyperedge-id="${selectedId}"]`)).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  expect(
    await wb
      .locator("[data-entity-id]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-entity-id")).sort())
  ).toEqual(originalIds);
  expect(samples.length).toBe(countBeforeSwitch);
  await wb.getByRole("button", { name: "Enclosure", exact: true }).click();
  await expect(wb.locator("[data-entity-id]")).toHaveCount(2);
  await expect(wb.locator(".ow-boundary")).toBeVisible();
  await page.screenshot({ path: "../temp/workbench-enclosure.png", fullPage: true });
  await wb.getByRole("button", { name: "Overview", exact: true }).click();
  await wb.getByRole("button", { name: "Clear selection", exact: true }).click();
  await expect(wb.locator("[data-entity-id]")).toHaveCount(11);
  await page.screenshot({ path: "../temp/workbench-overview.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("search and chat highlights remain available across styles", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Workbench", exact: true }).click();
  await page.getByTitle("Search (Universal Intelligence)").click();
  await page.getByPlaceholder("What would you like to explore?").fill("Mentorship");
  await page.getByPlaceholder("What would you like to explore?").press("Enter");
  await expect(page.locator(".ow-hyperedge.is-hit")).toHaveCount(1);
  await page.getByRole("button", { name: "Classic", exact: true }).click();
  await page.getByRole("button", { name: "Workbench", exact: true }).click();
  await expect(page.locator(".ow-hyperedge.is-hit")).toHaveCount(1);
  await page.getByTitle("Chat Assistant (Deep Memory)").click();
  const input = page.locator("textarea");
  await input.fill("Ada");
  await input.press("Enter");
  await expect(
    page.getByText("Local demo: these are synthetic collaborations, not a model answer.", {
      exact: true,
    })
  ).toBeVisible();
  await expect(page.locator('.ow-entity[data-entity-id="ada"]')).toHaveClass(/is-hit/);
});

test("hover restores selection and dragging or reset never changes memberships", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Workbench", exact: true }).click();
  const wb = page.getByRole("region", { name: "Hypergraph workbench" });
  const node = wb.locator('[data-entity-id="ada"]');
  await node.focus();
  await page.keyboard.press("Enter");
  await expect(node).toHaveAttribute("aria-pressed", "true");
  const edge = wb.getByRole("button", { name: "Hyperedge Mentorship, 2 members", exact: true });
  await edge.hover();
  await page.getByRole("heading", { name: "Read the relationships" }).hover();
  await expect(node).toHaveAttribute("aria-pressed", "true");
  const count = await wb.locator(".ow-incidence").count();
  const transform = await node.getAttribute("transform");
  const bounds = await node.boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + bounds!.width / 2 + 40, bounds!.y + bounds!.height / 2 + 30, {
    steps: 5,
  });
  await page.mouse.up();
  await expect(node).not.toHaveAttribute("transform", transform!);
  await wb.getByRole("button", { name: "Reset layout", exact: true }).click();
  await expect(node).toHaveAttribute("transform", transform!);
  expect(await wb.locator(".ow-incidence").count()).toBe(count);
});

test("narrow screens retain switching and a readable scrollable canvas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Workbench", exact: true }).click();
  const wb = page.getByRole("region", { name: "Hypergraph workbench" });
  await expect(wb).toBeVisible();
  await expect(wb.getByRole("button", { name: "Enclosure", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const canvas = wb.locator(".ow-canvas");
  expect(await canvas.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await page.screenshot({ path: "../temp/workbench-mobile.png", fullPage: true });
});
