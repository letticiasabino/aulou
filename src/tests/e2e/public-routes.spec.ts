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

test("responde com headers de segurança e página 404 acessível", async ({ page }) => {
  const response = await page.goto("/pricing");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  expect(response?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  await page.goto("/rota-que-nao-existe");
  await expect(page.locator("body")).toContainText("rota ainda");
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

  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Contexto acadêmico" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Faculdade" })).toHaveValue(
    "Universidade Federal",
  );

  await page.goto("/teachers");
  await page.getByLabel("Professor").fill("Prof. Ana Ribeiro");
  await page.getByLabel("E-mail").fill("ana@faculdade.edu");
  await page.getByRole("button", { name: /Adicionar professor/i }).click();
  await expect(page.getByRole("button", { name: "Editar Prof. Ana Ribeiro" })).toBeVisible();

  await page.goto("/subjects");
  await page.getByLabel("Disciplina").fill("Cálculo I");
  await page.getByLabel("Código").fill("mat101");
  await page.getByLabel("Horas/semana").fill("4");
  await page.getByLabel("Novo professor").fill("Prof. Bruno");
  await page.getByRole("button", { name: /Adicionar disciplina/i }).click();
  await expect(page.getByRole("button", { name: "Editar Cálculo I" })).toBeVisible();
  await expect(page.getByText("MAT101")).toBeVisible();
});
