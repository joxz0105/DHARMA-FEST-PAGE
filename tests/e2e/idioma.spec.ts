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
  // Se comprueba en el pie, que es lo unico visible en escritorio y en movil:
  // la navegacion de la cabecera se oculta por debajo de lg.
  await page.goto("/");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Privacidad" })).toBeVisible();
  await page.goto("/en");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Privacy" })).toBeVisible();
});

test("el selector marca el idioma activo", async ({ page }) => {
  // exact: true porque el boton de las Dev Tools de Next se llama
  // "Open Next.js Dev Tools" y contiene "EN" como subcadena.
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "ES", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await page.goto("/en");
  await expect(
    page.getByRole("button", { name: "EN", exact: true }),
  ).toHaveAttribute("aria-current", "true");
});
