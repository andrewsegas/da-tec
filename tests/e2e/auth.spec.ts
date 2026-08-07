import { test, expect } from "@playwright/test";

test("cadastro institucional leva ao onboarding e cria o perfil", async ({
  page,
}) => {
  const email = `e2e_${Date.now()}@unisanta.br`;

  await page.goto("/cadastro", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Nome completo").fill("Estudante E2E");
  await page.getByLabel("E-mail institucional").fill(email);
  await page.getByLabel("Senha").fill("senha1234");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await page.waitForURL("**/onboarding");
  await page.getByLabel("Curso").selectOption("Jogos Digitais");
  await page.getByLabel("Período").selectOption("2");
  await page.getByRole("button", { name: /concluir/i }).click();

  await page.waitForURL("**/perfil");
  await expect(
    page.getByRole("heading", { name: "Estudante E2E" }),
  ).toBeVisible();
});

test("cadastro com e-mail externo sem convite é bloqueado", async ({
  page,
}) => {
  await page.goto("/cadastro", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Nome completo").fill("Pessoa Externa");
  await page.getByLabel("E-mail institucional").fill(`ext_${Date.now()}@gmail.com`);
  await page.getByLabel("Senha").fill("senha1234");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page.getByText(/cadastro restrito/i)).toBeVisible();
});
