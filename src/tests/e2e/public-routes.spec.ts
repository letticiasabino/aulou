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
