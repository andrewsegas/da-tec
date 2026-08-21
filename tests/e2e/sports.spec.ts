import { expect, test } from "@playwright/test";

test("aluno consulta modalidade e se inscreve em uma peneira", async ({
  page,
}) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("E-mail").fill("aluno@unisanta.br");
  await page.getByLabel("Senha").fill("senha123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/perfil");

  await page.goto("/esportes/futsal", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Futsal" })).toBeVisible();
  await expect(page.getByText("Peneira para os Jogos Universitários")).toBeVisible();

  const cancelButton = page.getByRole("button", { name: "Cancelar inscrição" });
  if (await cancelButton.isVisible()) {
    await cancelButton.click();
  }

  const registerButton = page.getByRole("button", { name: "Inscrever-se" });
  await expect(registerButton).toBeVisible();
  await registerButton.click();
  await expect(page.getByText("Inscrito", { exact: true })).toBeVisible();
});

test("moderador cadastra uma nova modalidade", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByLabel("E-mail").fill("moderador@unisanta.br");
  await page.getByLabel("Senha").fill("senha123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/perfil");

  await page.goto("/moderacao/esportes", { waitUntil: "domcontentloaded" });
  const sportName = `Badminton E2E ${Date.now()}`;
  await page.locator("#sport-name").fill(sportName);
  await page.locator("#sport-description").fill("Modalidade criada pelo teste local.");
  await page.getByRole("button", { name: "Criar modalidade" }).click();

  await expect(page.getByText("Modalidade criada com sucesso.")).toBeVisible();
  await expect(page.getByText(sportName, { exact: true }).last()).toBeVisible();
});
