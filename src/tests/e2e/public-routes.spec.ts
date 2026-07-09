import { expect, test } from "@playwright/test";

test("landing carrega com CTA principal", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "StudyPilot AI" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Importar cronograma/i })).toBeVisible();
});

test("login carrega com formulário", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entre na sua conta" })).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
});

test("cadastro acadêmico local conclui onboarding", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nome").fill("Marina Lima");
  await page.getByLabel("E-mail").fill(`marina-${Date.now()}@studypilot.test`);
  await page.getByLabel("Senha").fill("senha12345");
  await page.getByRole("button", { name: /Criar conta/i }).click();

  await expect(page.getByRole("heading", { name: "Bem-vindo" })).toBeVisible();
  await page.getByRole("button", { name: /Continuar/i }).click();
  await page.getByLabel("Como você quer ser chamado?").fill("Marina");
  await page.getByRole("button", { name: /Continuar/i }).click();
  await page.getByLabel("Faculdade").fill("Universidade Federal");
  await page.getByRole("button", { name: /Continuar/i }).click();
  await page.getByLabel("Curso").fill("Engenharia de Software");
  await page.getByRole("button", { name: /Continuar/i }).click();
  await page.getByLabel("Ano letivo").fill("2026");
  await page.getByRole("button", { name: /Continuar/i }).click();
  await page.getByRole("button", { name: /Concluir/i }).click();

  await expect(page.getByRole("heading", { name: "Olá, Marina" })).toBeVisible();
  await expect(page.getByText("Engenharia de Software")).toBeVisible();
});
