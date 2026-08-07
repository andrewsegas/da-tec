import { test, expect } from "@playwright/test";

test("aluno publica, curte e comenta na comunidade", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("E-mail").fill("aluno@unisanta.br");
  await page.getByLabel("Senha").fill("senha123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/perfil");

  await page.goto("/comunidade", { waitUntil: "domcontentloaded" });

  const unique = `Post de teste ${Date.now()}`;
  await page.getByPlaceholder(/o que está rolando/i).fill(unique);
  await page.getByRole("button", { name: "Publicar" }).click();

  const card = page.locator("li", { hasText: unique });
  await expect(card).toBeVisible();

  // Curtir o post.
  await card.getByRole("button", { name: "Curtir" }).click();
  await expect(card.getByRole("button", { name: "Descurtir" })).toBeVisible();

  // Abrir o post (link de comentários) e comentar.
  await card.locator('a[href^="/comunidade/"]').click();
  await page.waitForURL(/\/comunidade\/.+/);
  await page.getByPlaceholder(/escreva um comentário/i).fill("Comentário e2e");
  await page.getByRole("button", { name: "Comentar" }).click();
  await expect(page.getByText("Comentário e2e")).toBeVisible();
});
