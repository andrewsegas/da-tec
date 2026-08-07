import { test, expect } from "@playwright/test";

test("visitar o perfil de um autor pelo feed", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("E-mail").fill("aluno@unisanta.br");
  await page.getByLabel("Senha").fill("senha123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/perfil");

  await page.goto("/comunidade", { waitUntil: "domcontentloaded" });

  // O nome do autor de um post leva ao perfil público.
  await page.locator('a[href^="/alunos/"]').first().click();
  await page.waitForURL(/\/alunos\/.+/);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Perfis semeados têm GitHub, então o link da rede aparece.
  await expect(page.locator('a[href*="github.com"]').first()).toBeVisible();
});
