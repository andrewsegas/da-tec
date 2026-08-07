import { test, expect } from "@playwright/test";

test("a home carrega e apresenta a plataforma", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { level: 1 }),
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: /repositório/i }),
  ).toBeVisible();
});

test("o seletor de tema está disponível", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("button", { name: /tema/i }),
  ).toBeVisible();
});
