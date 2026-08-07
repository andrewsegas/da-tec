import { test, expect } from "@playwright/test";

test("moderador publica notícia no mural", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("E-mail").fill("moderador@unisanta.br");
  await page.getByLabel("Senha").fill("senha123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/perfil");

  await page.goto("/mural", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Novo" }).first().click();
  await page.waitForURL("**/mural/noticias/nova");

  const title = `Notícia e2e ${Date.now()}`;
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("Conteúdo").fill("Conteúdo de teste do mural.");
  await page.getByRole("button", { name: "Publicar notícia" }).click();

  await page.waitForURL("**/mural");
  await expect(page.getByText(title)).toBeVisible();
});
