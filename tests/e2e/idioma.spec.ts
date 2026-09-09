import { expect, test } from "@playwright/test";

test("el español vive en la raíz, sin prefijo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("el inglés vive bajo /en", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("el copy cambia con el idioma", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Inicio")).toBeVisible();
  await page.goto("/en");
  await expect(page.getByText("Home")).toBeVisible();
});
