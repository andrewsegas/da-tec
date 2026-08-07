import { test, expect } from "@playwright/test";

test("aluno vota em uma enquete e vê o resultado", async ({ page }) => {
  // Login com usuário semeado.
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("E-mail").fill("aluno@unisanta.br");
  await page.getByLabel("Senha").fill("senha123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/perfil");

  // Abre a enquete de exemplo.
  await page.goto("/enquetes", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("link", { name: /nome oficial da plataforma/i })
    .click();
  await page.waitForURL(/\/enquetes\/.+/);

  // Vota.
  await page.getByRole("radio", { name: "da-tec" }).check();
  await page.getByRole("button", { name: /votar|alterar voto/i }).click();

  // Resultado em tempo real fica visível.
  await expect(page.getByText(/atualiza em tempo real/i)).toBeVisible();
});
